const { scanFiles } = require("./src/scanner/scanner");
const path = require("path");
console.log(scanFiles(path.resolve("test-project")));
