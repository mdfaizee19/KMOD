const t = require("@babel/types");

module.exports = {
  name: "HashZero",

  match(path) {
    const node = path.node;

    return (
      t.isMemberExpression(node.object) &&
      node.object.object?.name === "ethers" &&
      node.object.property?.name === "constants" &&
      node.property?.name === "HashZero"
    );
  },

  transform(path) {
    path.replaceWith(
      t.memberExpression(
        t.identifier("ethers"),
        t.identifier("ZeroHash")
      )
    );
  }
};
