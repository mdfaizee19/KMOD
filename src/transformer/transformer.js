const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const loadRules = require("./loadRules");
const {
  isUnsafe
} = require("../safety/safety");
const { initRule } = require("../utils/utils");
const { validateSyntax, roundTripCheck } = require("../validator/syntaxValidator");
const { showDiff } = require("../utils/diffViewer");
const rules = loadRules();
function applyTransforms(filePath, state, options = {}) {
  const code = fs.readFileSync(filePath, "utf-8");
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"]
    });
  } catch (err) {
    state.errors.push({
      file: filePath,
      error: "Parse error"
    });
    return;
  }
  state.currentFile = filePath;
  traverse(ast, {
    enter(path) {
      rules.forEach(rule => {
        try {
          if (rule.match(path, state)) {
            initRule(state, rule.name);
            const line = path.node.loc?.start.line || 0;
            const lines = code.split("\n");
            const originalLineText = lines[line - 1] || "";
            const safety = isUnsafe(path);

            if (safety.unsafe) {
              state.rules[rule.name].skipped++;
              state.totalSkipped++;

              state.logs.push({
                type: "SKIPPED",
                rule: rule.name,
                file: filePath,
                line: line,
                start: path.node.start,
                end: path.node.end,
                reason: safety.reason || "unknown",
                code: code.substring(path.node.start, path.node.end),
                lineText: originalLineText
              });

              return;
            }
            const start = path.node.start;
            const end = path.node.end;
            const result = rule.transform(path, state);

            // 🔴 Handle rule-level skip
            if (result?.skipped) {
              state.rules[rule.name].skipped++;
              state.totalSkipped++;

              state.logs.push({
                type: "SKIPPED",
                rule: rule.name,
                file: filePath,
                line: line,
                start: start,
                end: end,
                reason: result.reason || "unknown",
                code: code.substring(start, end),
                lineText: originalLineText
              });

              return;
            }

            if (options.isDryRun || options.isApply) {
              const oldSnippet = code.substring(start, end);
              const newSnippet = generator(path.node).code;

              if (oldSnippet !== newSnippet) {
                state.rules[rule.name].transformed++;
                state.totalTransformed++;
                state.logs.push({
                  type: "TRANSFORMED",
                  rule: rule.name,
                  file: filePath,
                  line: line,
                  oldCode: oldSnippet,
                  newCode: newSnippet,
                  reason: null,
                  lineText: originalLineText
                });
              }
            }
          }
        } catch (err) {
          state.errors.push({
            file: filePath,
            error: err.message
          });
        }
      });
    }
  });
  const output = generator(ast, {
    retainLines: true,
    compact: false
  }, code);

  // 🛡️ VALIDATION LAYER
  if (!validateSyntax(output.code)) {
    state.logs.push({
      type: "VALIDATION FAILED",
      file: filePath,
      reason: "Syntax error after transformation",
      code: "Generated code failed parsing"
    });
    state.errors.push({ file: filePath, error: "Validation failed: Syntax Error" });
    return;
  }

  if (!roundTripCheck(output.code)) {
    state.logs.push({
      type: "VALIDATION FAILED",
      file: filePath,
      reason: "Round-trip safety check failed",
      code: "Generated code mismatch after re-parse"
    });
    state.errors.push({ file: filePath, error: "Validation failed: Round-trip Error" });
    return;
  }

  if (options.isApply || options.isAIApply) {
    if (code !== output.code) {
      fs.writeFileSync(filePath, output.code);
      state.modifiedFiles.add(filePath);
    }
  }
}


module.exports = applyTransforms;