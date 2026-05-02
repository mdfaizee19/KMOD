const { scanFiles, detectPatterns } = require("../scanner/scanner");
const { execSync } = require("child_process");
const applyTransforms = require("../transformer/transformer");
const loadRules = require("../transformer/loadRules");
const createState = require("../core/state");
const { createLoader, initRule } = require("../utils/utils");
const { createCheckpoint } = require("../core/checkpoint");

const { analyzeSkippedDual, judgeDisagreement } = require("../ai/processor");
const getConsensus = require("../ai/consensus");
const { applyAISuggestions } = require("../ai/interaction");
const { isValidSuggestion } = require("../ai/engine");
const { validateAISuggestion } = require("../validator/syntaxValidator");

async function runMigration(targetPath, options = {}, existingState = null) {
  const files = scanFiles(targetPath);
  const rules = loadRules();
  const state = existingState || createState();
  if (!state.manualChecks) state.manualChecks = [];

  // 🔹 PHASE 1 & 2 — SCAN & TRANSFORM
  // Only scan if we don't have a state yet
  if (!existingState || (options.isApply && !state.totalDetected)) {
    const scanLoader = options.silent ? null : createLoader("scanning project...");
    if (scanLoader) scanLoader.start();
    files.forEach(file => {
      detectPatterns(file, state, rules, initRule);
    });
    if (scanLoader) scanLoader.succeed(`scan complete`);
  }

  // 🔹 PHASE 2 — TRANSFORM (Deterministic)
  if (options.isApply || options.isDryRun) {
    const transformLoader = options.silent ? null : createLoader(options.isApply ? "applying transformations..." : "checking transformations...");
    if (transformLoader) transformLoader.start();

    // Checkpoint before applying
    if (options.isApply && !state.checkpointCreated) {
      const affectedFiles = [...new Set(state.logs.filter(l => l.type === "DETECTED").map(l => l.file))];
      if (affectedFiles.length > 0) {
        const { createLoader } = require("../utils/utils");
        const cpLoader = createLoader("creating safety checkpoint...");
        cpLoader.start();
        createCheckpoint(affectedFiles, targetPath, options.checkpointName);
        state.checkpointCreated = true;
        cpLoader.succeed("safety checkpoint created");
      }
    }

    files.forEach(file => {
      applyTransforms(file, state, options);
    });
    if (transformLoader) transformLoader.succeed(options.isApply ? "transform complete" : "analysis complete");
  }

  // 🔹 PHASE 3 — AI ANALYSIS
  const skippedLogs = state.logs.filter(log => log.type === "SKIPPED");
  
  if ((options.isAIPreview || options.isAIApply) && skippedLogs.length > 0) {
    // If we already have AI insights and we are just applying, don't re-run analysis
    if (state.aiInsights && options.isAIApply) {
      applyAISuggestions(state.aiInsights, state, options);
    } else if (!state.aiInsights) {
      const aiLoader = options.silent ? null : createLoader(`analyzing ${skippedLogs.length} cases...`);
      if (aiLoader) aiLoader.start();

      const dual = await analyzeSkippedDual(skippedLogs, {
        modelA: options.model1,
        modelB: options.model2,
        apiKeyA: options.apiKeyA,
        apiKeyB: options.apiKeyB
      });

      if (aiLoader) aiLoader.succeed("analysis complete");

      const consensus = getConsensus(dual.resA, dual.resB, skippedLogs);
      
      // Arbitration
      const judgeModel = options.judgeModel || "google/gemini-2.0-flash-001";
      for (const item of consensus) {
        if (!item.agreed) {
          const optionA = `SKIP: ${item.suggestionA || "DO_NOT_CHANGE"}`;
          const optionB = `APPLY: ${item.suggestionB || "Migration"}`;
          const verdict = await judgeDisagreement(optionA, optionB, item.code, options.apiKeyA, judgeModel);
          
          item.arbitration = {
            selection: verdict.safe_option,
            confidence: verdict.confidence,
            reason: verdict.reason
          };

          if (verdict.safe_option === "B" && verdict.confidence >= 0.7) {
            const syntaxValidation = validateAISuggestion(item.suggestionB, item.code);
            const logicValidation = isValidSuggestion({ decision: "APPLY", transformed: item.suggestionB, confidence: 1.0 });

            if (syntaxValidation.valid && logicValidation) {
              item.agreed = true;
              item.finalSuggestion = item.suggestionB;
            }
          }
        }
      }

      state.aiInsights = consensus;
      applyAISuggestions(consensus, state, options);
    }
  }

  // 🔹 PHASE 4 — BUILD HOOK
  if (options.validateBuild && options.isApply) {
    const buildLoader = options.silent ? null : createLoader("running build validation...");
    if (buildLoader) buildLoader.start();
    try {
      execSync("npm run build", { stdio: "ignore", cwd: targetPath });
      if (buildLoader) buildLoader.succeed("build passed");
    } catch (err) {
      if (buildLoader) buildLoader.warn("build failed");
    }
  }

  return state;
}


module.exports = runMigration;