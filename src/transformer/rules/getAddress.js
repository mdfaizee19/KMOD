const t = require("@babel/types");

module.exports = {
  name: "getAddress",

  match(path) {
    const node = path.node;

    return (
      t.isMemberExpression(node.object) &&
      node.object.object?.name === "ethers" &&
      node.object.property?.name === "utils" &&
      node.property?.name === "getAddress"
    );
  },

  transform(path, state) {
    const node = path.node;

    path.replaceWith(
      t.memberExpression(
        t.identifier("ethers"),
        t.identifier("getAddress")
      )
    );
  }
};
