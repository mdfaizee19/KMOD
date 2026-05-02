const fs = require("fs");
const path = require("path");
function loadRules() {
  const rulesDir = path.join(__dirname, "rules");
  const files = fs.readdirSync(rulesDir);
  return files.map(file => require(path.join(rulesDir, file)));
}
module.exports = loadRules;