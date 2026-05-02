#!/usr/bin/env node
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { showBanner, checkGitStatus, startTimer } = require("../src/utils/utils");
const runMigration = require("../src/engine/migration");
const { rollback } = require("../src/core/checkpoint");
const { 
  showScanResults, 
  showSkipped, 
  showSkippedBreakdown,
  showAIResolution, 
  showReviewRequired,
  showChanges,
  showFinalSummary
} = require("../src/reporter/reporter");
const ora = require("ora");
const chalk = require("chalk");
const readline = require("readline-sync");

showBanner();

const args = process.argv.slice(2);
const command = args[0];
const targetPath = path.resolve(args.find((arg, i) => i > 0 && !arg.startsWith("--")) || ".");

(async () => {
  try {
    // --- FLAGS ---
    const isAuto = args.includes("--yes") || command === "apply";
    const isPreview = args.includes("--preview") || command === "preview";
    const isVerbose = args.includes("--verbose");

    // --- ROLLBACK COMMAND ---
    if (command === "rollback") {
      console.log(chalk.bold("\nrollback started"));
      const name = args.find(a => a.startsWith("--name="))?.split("=")[1] || null;
      const restored = rollback(targetPath, name);
      console.log(`restored ${restored.length} files`);
      process.exit(0);
    }

    // --- RUN / PREVIEW / APPLY COMMANDS ---
    if (command === "run" || command === "preview" || command === "apply") {
      // 🔒 1. GIT SAFETY CHECK
      if (!isAuto && !isPreview) {
        const isClean = await checkGitStatus(targetPath);
        if (!isClean) {
          console.log(chalk.yellow(`\nuncommitted changes detected`));
          if (!readline.keyInYNStrict("proceed anyway?")) {
            process.exit(0);
          }
        }
      }

      const timer = startTimer();

      let options = {
        isDryRun: !isAuto, 
        isApply: isAuto,
        isAIPreview: true, 
        isAIApply: isAuto,
        model1: "google/gemini-2.0-flash-001",
        model2: "meta-llama/llama-3.3-70b-instruct",
        judgeModel: "google/gemini-2.0-flash-001",
        apiKeyA: process.env.OPENROUTER_KEY_1,
        apiKeyB: process.env.OPENROUTER_KEY_2,
        doCheckpoint: true,
        silent: true
      };

      if (isPreview) {
        options.isApply = false;
        options.isAIApply = false;
        options.isDryRun = true;
      }

      // 1. SCAN & ANALYSIS
      console.log(chalk.bold.white(`kmod — safe code migrations (v1.0.0)`));
      console.log(chalk.gray("────────────────────────────────────"));

      let state = await runMigration(targetPath, options);
      const duration = timer.stop();
      
      showSkipped(state);
      
      if (isAuto || isPreview) {
        showChanges(state, "Deterministic Changes:", "det");
        showChanges(state, "AI Consensus Changes:", "ai");
        showFinalSummary(state, duration);
      } else {
        showChanges(state, "Deterministic Changes:", "det");
      }

      // 2. INTERACTIVE CONFIRMATION
      if (!isAuto && !isPreview) {
        const detApplied = state.logs.filter(l => l.type === "TRANSFORMED").length;
        const aiApplied = state.aiInsights ? state.aiInsights.filter(i => i.agreed && i.finalSuggestion && i.finalSuggestion !== "DO_NOT_CHANGE").length : 0;
        const totalApplied = detApplied + aiApplied;
        const affectedFiles = state.modifiedFiles.size || [...new Map(state.logs.filter(l => l.type === "TRANSFORMED" || l.type === "DETECTED").map(l => [l.file, true])).keys()].length;

        if (totalApplied > 0) {
          console.log(chalk.bold.white(`\nAI Resolution Required:`));
          
          if (readline.keyInYNStrict(`Apply AI consensus to the skipped cases?`)) {
            options.model1 = "google/gemini-2.0-flash-001";
            options.model2 = "meta-llama/llama-3.3-70b-instruct";
            options.isApply = true;
            options.isAIApply = true;
            options.isDryRun = false;
            
            const spinner = ora({
              text: chalk.cyan("Applying AI consensus transformations..."),
              spinner: "dots"
            }).start();
            
            state = await runMigration(targetPath, options, state);
            
            spinner.stop();
            console.log(chalk.green("AI transformations applied successfully.\n"));
            
            showChanges(state, "AI Consensus Changes:", "ai");
            showFinalSummary(state, duration);
          } else {
            console.log(chalk.yellow(`\napplication cancelled`));
          }
        }
      }

      process.exit(0);
    }

    // --- HELP / DEFAULT ---
    console.log(`
usage: kmod <command> [path] [options]

commands:
  run       start guided migration (interactive)
  preview   run analysis without writing to disk
  apply     auto-apply all safe changes
  rollback  restore files from last checkpoint

options:
  --verbose  show detailed AI analysis results
  --name=<name>  specify checkpoint name for rollback
    `);

  } catch (err) {
    console.error(chalk.red(`\nerror: ${err.message}`));
    process.exit(1);
  }
})();