const t = require("@babel/types");

module.exports = {
  name: "parseEther",

  match(path, state) {
    if (!state?.context?.[state?.currentFile]?.isEthersImported) return false;

    // Relaxed check to support require()
    const node = path.node;
    return (
      t.isMemberExpression(node.object) &&
      t.isIdentifier(node.object.object, { name: "ethers" }) &&
      t.isIdentifier(node.object.property, { name: "utils" }) &&
      t.isIdentifier(node.property, { name: "parseEther" })
    );
  },

  transform(path, state) {
    const node = path.node;
    path.replaceWith(
      t.memberExpression(t.identifier("ethers"), t.identifier("parseEther"))
    );
  }
};