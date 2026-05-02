/**
 * Safety: skip logic and risk detection
 */
function performSafetyChecks(file) {
  // Return true if safe to proceed
  return true;
}
function isUnsafe(path) {
  // Normalizing so it works whether the rule matched the MemberExpression or the CallExpression
  let callExprPath = path;
  if (path.node.type === "MemberExpression") {
    callExprPath = path.parentPath;
  }
  
  if (!callExprPath || callExprPath.node.type !== "CallExpression") {
    return { unsafe: false };
  }

  const grandParentPath = callExprPath.parentPath;

  // 🔴 Case 1: chained call (VERY IMPORTANT)
  if (
    grandParentPath &&
    grandParentPath.node.type === "MemberExpression" &&
    grandParentPath.node.object === callExprPath.node
  ) {
    return { unsafe: true, reason: "chained" };
  }

  // 🔴 Case 2: inside CallExpression argument (nested usage)
  if (
    grandParentPath &&
    grandParentPath.node.type === "CallExpression" &&
    grandParentPath.node.arguments.includes(callExprPath.node)
  ) {
    return { unsafe: false }; // still safe
  }

  // 🔴 Case 3: unknown/dynamic usage (future-proof)
  if (!path.node) {
    return { unsafe: true, reason: "unknown" };
  }

  return { unsafe: false };
}

module.exports = { isUnsafe };