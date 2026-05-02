const { callOpenRouter, buildPrompt } = require("./engine");

/**
 * Orchestrate dual-AI validation for skipped logs
 */
async function analyzeSkippedDual(skippedLogs, options) {
  const { modelA, modelB, apiKeyA, apiKeyB } = options;
  const resA = [];
  const resB = [];

  for (const log of skippedLogs) {
    const snippet = {
      code: log.code,
      type: log.reason,
      rule: log.rule
    };

    const prompt = buildPrompt(snippet);
    const [rawA, rawB] = await Promise.all([
      callOpenRouter(modelA, apiKeyA, prompt),
      callOpenRouter(modelB, apiKeyB, prompt)
    ]);

    const parseLog = (raw) => {
      try {
        const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(clean);
      } catch {
        return { safe: false, suggestion: null, reason: "Parse error" };
      }
    };

    if (process.argv.includes("--debug")) {
      console.log(`\n[DEBUG] Raw A: ${rawA}`);
      console.log(`\n[DEBUG] Raw B: ${rawB}`);
    }

    resA.push(parseLog(rawA));
    resB.push(parseLog(rawB));
  }

  return { resA, resB };
}

/**
 * Strict Arbitration Pass: Judge evaluates safety of A vs B
 * Bias: A (Keep Original) is preferred unless B is 100% standard and safe.
 */
async function judgeDisagreement(optionA, optionB, originalCode, apiKey, model = "google/gemini-2.0-flash-001") {
  const prompt = `
You are a senior auditor for ethers.js v5 → v6 migrations.
Your role is to resolve a disagreement between two automated models.

Original Snippet: "${originalCode}"

Option A: "${optionA}" (Keep Original/SKIP)
Option B: "${optionB}" (Proposed Transformation)

RULES:
1. MIGRATION FIRST: Prefer Option B if it represents a standard, safe ethers.js v6 migration (e.g., BigInt(x) for BigNumber.from(x)).
2. PREFER VALID UPGRADES: If Option B is syntactically correct and semantically standard for v6, select B.
3. ONLY SKIP IF: Option B is definitely incorrect, introduces non-v6 patterns, or creates syntax errors.

TASK:
Identify if Option B is a correct and standard v6 migration. If yes, choose B. Otherwise, choose A.

RETURN ONLY VALID JSON:
{
  "safe_option": "A" | "B" | "NONE",
  "confidence": 0.0 to 1.0,
  "reason": "short technical reason"
}
`;

  const res = await callOpenRouter(model, apiKey, prompt);
  if (process.argv.includes("--debug")) {
    console.log(`[DEBUG] Raw Judge: ${res}`);
  }
  try {
    const clean = res.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { safe_option: "NONE", confidence: 0, reason: "Parse error in arbitration" };
  }
}

module.exports = {
  analyzeSkippedDual,
  judgeDisagreement
};
