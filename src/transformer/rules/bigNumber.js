const t = require("@babel/types");

module.exports = {
  name: "BigNumber",

  match(path, state) {
    if (!state?.context?.[state?.currentFile]?.isEthersImported) return false;

    // Relaxed check to support require()
    const node = path.node;
    return (
      t.isMemberExpression(node.callee?.object) &&
      t.isIdentifier(node.callee.object.object, { name: "ethers" }) &&
      t.isIdentifier(node.callee.object.property, { name: "BigNumber" }) &&
      t.isIdentifier(node.callee.property, { name: "from" })
    );
  },

  transform(path, state) {
    const args = path.node.arguments;

    // ⚠️ Safety check: only allow simple literals and ensure integer for strings
    if (args.length !== 1) return { skipped: true, reason: "invalid arguments" };
    
    if (t.isStringLiteral(args[0])) {
      if (!/^\d+$/.test(args[0].value)) {
        return { skipped: true, reason: "non-integer literal" };
      }
    } else if (!t.isNumericLiteral(args[0])) {
      return { skipped: true, reason: "dynamic" };
    }

    path.replaceWith(
      t.callExpression(
        t.identifier("BigInt"),
        [args[0]]
      )
    );
  }
};
