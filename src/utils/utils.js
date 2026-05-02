const chalk = require("chalk");
const figlet = require("figlet");
const ora = require("ora");
const simpleGit = require("simple-git");

/**
 * CLI Banner - Clean, single-layer ASCII
 */
let bannerShown = false;
function showBanner() {
  if (bannerShown) return;
  bannerShown = true;

  const text = [
    "██╗  ██╗███╗   ███╗ ██████╗ ██████╗",
    "██║ ██╔╝████╗ ████║██╔═══██╗██╔══██╗",
    "█████╔╝ ██╔████╔██║██║   ██║██║  ██║",
    "██╔═██╗ ██║╚██╔╝██║██║   ██║██║  ██║",
    "██║  ██╗██║ ╚═╝ ██║╚██████╔╝██████╔╝",
    "╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝"
  ];

  text.forEach(line => console.log(chalk.greenBright(line)));

  console.log(chalk.gray("one stop tool for Safe code Migrations\n"));
}

/**
 * Progress Loader
 */
function createLoader(text) {
  return ora({ text, spinner: "dots" });
}

/**
 * Git Safety Check
 */
async function checkGitStatus(targetPath) {
  try {
    const git = simpleGit(targetPath);
    const status = await git.status();
    return status.files.length === 0;
  } catch (err) {
    return true; 
  }
}

/**
 * Execution Timer
 */
function startTimer() {
  const start = process.hrtime();
  return {
    stop: () => {
      const end = process.hrtime(start);
      return (end[0] + end[1] / 1e9).toFixed(2);
    }
  };
}

/**
 * Rule State Initializer
 */
function initRule(state, ruleName) {
  if (!state.rules[ruleName]) {
    state.rules[ruleName] = { detected: 0, transformed: 0, skipped: 0 };
  }
}

module.exports = {
  showBanner,
  createLoader,
  checkGitStatus,
  startTimer,
  initRule
};
