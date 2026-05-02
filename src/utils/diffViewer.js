const diff = require("diff");
const chalk = require("chalk");

/**
 * Displays a color-coded diff of changes
 */
function showDiff(oldCode, newCode, filePath) {
  const changes = diff.diffLines(oldCode, newCode);
  
  if (oldCode === newCode) return;

  console.log(chalk.cyan(`📄 ${filePath}`));
  console.log(chalk.gray("────────────────────────────"));

  changes.forEach(part => {
    const color = part.added ? chalk.green : chalk.red;
    const prefix = part.added ? "+ " : "- ";

    if (part.added || part.removed) {
      const lines = part.value.split("\n");
      lines.forEach(line => {
        if (!line.trim()) return;
        console.log(color(`${prefix}${line}`));
      });
    }
  });

  console.log(""); // Spacing
}

module.exports = { showDiff };
