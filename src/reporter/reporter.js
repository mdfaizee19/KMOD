const chalk = require("chalk");
const path = require("path");

/**
 * Shows detected issues during scan phase
 */
function showScanResults(state) {
  console.log(chalk.bold(`\nscan complete`));
  console.log(`${state.totalDetected} issues detected\n`);
}

/**
 * Shows cases that are skipped because they are already correct or safe as-is
 */
function showSkipped(state) {
  const skippedLogs = state.logs.filter(l => l.type === "SKIPPED");
  if (skippedLogs.length === 0) return;

  console.log(chalk.bold.white(`Skipped Cases:`));
  console.log(chalk.gray("────────────────────────────"));

  const cwd = process.cwd();
  
  // Group by file
  const fileMap = new Map();
  skippedLogs.forEach(l => {
    if (!fileMap.has(l.file)) fileMap.set(l.file, []);
    fileMap.get(l.file).push(l);
  });

  fileMap.forEach((logs, file) => {
    const relPath = path.relative(cwd, file);
    console.log(chalk.cyan(relPath));
    logs.forEach(log => {
      console.log(`${chalk.yellow("L" + log.line.toString().padEnd(4))} ${chalk.dim(log.reason)}`);
    });
    console.log("");
  });
}

/**
 * Aggregated skipped breakdown
 */
function showSkippedBreakdown(state) {
  const skippedLogs = state.logs.filter(l => l.type === "SKIPPED");
  if (skippedLogs.length === 0) return;

  const counts = {};
  skippedLogs.forEach(l => {
    counts[l.reason] = (counts[l.reason] || 0) + 1;
  });

  console.log(chalk.bold.white(`Skipped Breakdown:`));
  console.log(chalk.gray("────────────────────────────"));
  Object.entries(counts).forEach(([reason, count]) => {
    console.log(`${reason.padEnd(25)} ${chalk.bold(count)}`);
  });
  console.log("");
}

/**
 * Shows the code changes (diffs) grouped by file
 */
function showChanges(state, title = "Deterministic Changes:", typeFilter = null) {
  const transformedLogs = state.logs.filter(l => l.type === "TRANSFORMED");
  const aiLogs = (state.aiInsights || []).filter(i => i.agreed && i.finalSuggestion && i.finalSuggestion !== "DO_NOT_CHANGE");

  if (transformedLogs.length === 0 && aiLogs.length === 0) return;

  // Group logs by file
  const fileMap = new Map();

  if (!typeFilter || typeFilter === "det") {
    transformedLogs.forEach(l => {
      if (!fileMap.has(l.file)) fileMap.set(l.file, []);
      fileMap.get(l.file).push({ line: l.line, old: l.oldCode, new: l.newCode, type: "det" });
    });
  }

  if (!typeFilter || typeFilter === "ai") {
    aiLogs.forEach(i => {
      if (!fileMap.has(i.file)) fileMap.set(i.file, []);
      fileMap.get(i.file).push({ 
        line: i.line, 
        old: i.code, 
        new: i.finalSuggestion, 
        type: "ai",
        agreed: i.agreed,
        models: i.arbitration ? 3 : 2 // Assuming consensus between 2 or 3 models
      });
    });
  }

  if (fileMap.size === 0) return;

  console.log(chalk.bold.white(title));
  console.log(chalk.gray("────────────────────────────"));

  const cwd = process.cwd();
  
  fileMap.forEach((changes, file) => {
    const relPath = path.relative(cwd, file);
    console.log(`${chalk.cyan(relPath)} (${changes.length} change${changes.length > 1 ? 's' : ''})`);
    
    changes.forEach(c => {
      if (c.type === "ai") {
        const signal = c.agreed ? chalk.green("✔") : chalk.red("✖");
        const count = c.models || 2;
        console.log(`${chalk.yellow("L" + c.line)} ${signal} ${chalk.dim(`agreed by ${count}/${count} models`)}`);
      } else {
        console.log(chalk.yellow("L" + c.line + ":"));
      }
      console.log(chalk.green(`+ ${c.new.trim()}`));
      console.log(chalk.red(`- ${c.old.trim()}`));
      console.log("");
    });
  });
}

/**
 * Final migration summary
 */
function showFinalSummary(state, duration) {
  console.log(chalk.bold.white(`\nSUMMARY OF MIGRATION:`));
  console.log(chalk.gray("────────────────────────────────────"));
  
  const detApplied = state.logs.filter(l => l.type === "TRANSFORMED").length;
  const aiApplied = (state.aiInsights || []).filter(i => i.agreed && i.finalSuggestion && i.finalSuggestion !== "DO_NOT_CHANGE").length;
  
  const initialSkips = state.logs.filter(l => l.type === "SKIPPED").length;
  const finalSkipped = Math.max(0, initialSkips - aiApplied);
  const affectedFiles = state.modifiedFiles ? state.modifiedFiles.size : 0;

  const pad = (label, value, color = chalk.white) => {
    return `${label.padEnd(20)} ${color(chalk.bold(value))}`;
  };

  console.log(pad("Deterministic:", detApplied, chalk.green));
  console.log(pad("AI Consensus:", aiApplied, chalk.magenta));
  console.log(pad("Skipped Cases:", finalSkipped, chalk.yellow));
  console.log(pad("Files Modified:", affectedFiles, chalk.cyan));
  
  if (duration) {
    console.log(chalk.gray("────────────────────────────────────"));
    console.log(chalk.dim(`Analysis completed in ${duration}s`));
  }
  console.log(chalk.gray("────────────────────────────────────\n"));
}

module.exports = { 
  showScanResults, 
  showSkipped, 
  showSkippedBreakdown,
  showChanges,
  showFinalSummary 
};
