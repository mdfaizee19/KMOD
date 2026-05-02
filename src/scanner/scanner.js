const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");

/**
 * Scan project for files
 */
function scanFiles(targetPath) {
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return [path.resolve(targetPath)];
  }
  const normalizedPath = targetPath.replace(/\\/g, "/");
  const files = glob.sync(`${normalizedPath}/**/*.{js,ts}`, {
    ignore: ["**/node_modules/**"]
  });
  return files.map(file => path.resolve(file));
}

/**
 * Pattern detection engine
 */
function detectPatterns(filePath, state, rules, initRule) {
  const code = fs.readFileSync(filePath, "utf-8");
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"]
    });
  } catch {
    state.errors.push({ file: filePath, error: "Parse error" });
    return;
  }
  state.filesScanned++;

  let isEthersImported = false;
  traverse(ast, {
    ImportDeclaration(p) {
      if (p.node.source.value === "ethers") isEthersImported = true;
    },
    VariableDeclarator(p) {
      if (
        t.isCallExpression(p.node.init) &&
        t.isIdentifier(p.node.init.callee, { name: "require" }) &&
        p.node.init.arguments.length > 0 &&
        t.isStringLiteral(p.node.init.arguments[0], { value: "ethers" })
      ) {
        isEthersImported = true;
      }
    }
  });

  if (!state.context) state.context = {};
  state.context[filePath] = { isEthersImported };
  state.currentFile = filePath;

  traverse(ast, {
    enter(p) {
      rules.forEach(rule => {
        try {
          if (rule.match(p, state)) {
            initRule(state, rule.name);
            state.rules[rule.name].detected++;
            state.totalDetected++;
            state.logs.push({
              type: "DETECTED",
              rule: rule.name,
              file: filePath,
              line: p.node.loc?.start.line,
              reason: null
            });
          }
        } catch {}
      });
    }
  });
}

module.exports = {
  scanFiles,
  detectPatterns
};
