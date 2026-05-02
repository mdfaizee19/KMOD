const parser = require("@babel/parser");
const generator = require("@babel/generator").default;
const traverse = require("@babel/traverse").default;

/**
 * Validates that the provided code is syntactically correct.
 * @param {string} code 
 * @returns {boolean}
 */
function validateSyntax(code) {
  try {
    parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Performs a round-trip safety check: Parse -> Generate -> Parse.
 * @param {string} code 
 * @returns {boolean}
 */
function roundTripCheck(code) {
  try {
    const ast1 = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    });
    const generated = generator(ast1).code;
    parser.parse(generated, {
      sourceType: "module",
      plugins: ["jsx"],
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Validates an AI suggestion against safety rules.
 * @param {string} suggestion 
 * @param {string} originalCode 
 * @returns {{valid: boolean, reason: string|null}}
 */
function validateAISuggestion(suggestion, originalCode) {
  // 1. Syntax Check
  if (!validateSyntax(suggestion)) {
    return { valid: false, reason: "Syntax error in suggestion" };
  }

  // 2. Forbidden Patterns
  if (suggestion.includes("utils.")) {
    return { valid: false, reason: "Contains forbidden 'utils.' access" };
  }

  // 3. Heuristic: Length check (Shouldn't be massively larger than original)
  if (suggestion.length > originalCode.length * 5 && suggestion.length > 200) {
    return { valid: false, reason: "Suggestion too long (possible hallucination)" };
  }

  try {
    const suggAst = parser.parse(suggestion, {
      sourceType: "module",
      plugins: ["jsx"],
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    });
    const origAst = parser.parse(originalCode, {
      sourceType: "module",
      plugins: ["jsx"],
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    });

    let hasNewVariables = false;
    let structureChanged = false;

    // Check for new variable declarations (simplified)
    traverse(suggAst, {
      VariableDeclaration(path) {
        hasNewVariables = true;
      },
      FunctionDeclaration(path) {
        structureChanged = true;
      },
      ClassDeclaration(path) {
        structureChanged = true;
      }
    });

    if (hasNewVariables) {
      return { valid: false, reason: "Introduces new variables" };
    }
    if (structureChanged) {
      return { valid: false, reason: "Changes function/class structure" };
    }

  } catch (e) {
    // If we can't parse one of them for some reason during traversal
    return { valid: false, reason: "Validation parse error" };
  }

  return { valid: true, reason: null };
}

module.exports = {
  validateSyntax,
  roundTripCheck,
  validateAISuggestion
};
