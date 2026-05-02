const t = require("@babel/types");

module.exports = {
  name: "isAddress",

  match(path) {
    const node = path.node;

    return (
      t.isMemberExpression(node.object) &&
      node.object.object?.name === "ethers" &&
      node.object.property?.name === "utils" &&
      node.property?.name === "isAddress"
    );
  },

  transform(path, state) {
    path.replaceWith(
      t.memberExpression(
        t.identifier("ethers"),
        t.identifier("isAddress")
      )
    );
  }
};
