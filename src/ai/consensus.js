/**
 * Consensus Logic for AI Suggestions
 */
function normalize(code) {
  if (!code) return "";
  return code
    .trim()
    .replace(/;+$/, "") // remove trailing semicolons
    .replace(/\s+/g, " "); // collapse whitespace
}

const SAFE_PATTERNS = [
  "BigInt(value)",
  "ethers.parseEther",
  "ethers.formatEther",
  "ethers.parseUnits",
  "ethers.formatUnits"
];

function getConsensus(listA, listB, skippedLogs = []) {
  const results = [];
  for (let i = 0; i < Math.min(listA.length, listB.length); i++) {
    const a = listA[i] || {};
    const b = listB[i] || {};
    const log = skippedLogs[i] || {};

    const normA = normalize(a.transformed);
    const normB = normalize(b.transformed);

    const isSafe = (code) => SAFE_PATTERNS.some(p => code && code.includes(p));

    // 🏆 DECISION CONVERGENCE
    let agreed = false;
    let finalSuggestion = null;

    // 1. Both agree to SKIP
    if (a.decision === "SKIP" && b.decision === "SKIP") {
      agreed = true;
      finalSuggestion = null; // No change proposed
    }
    // 2. Both agree to APPLY and strings match
    else if (a.decision === "APPLY" && b.decision === "APPLY" && normA === normB) {
      agreed = true;
      finalSuggestion = a.transformed;
    } 
    // 3. High-Confidence Override: B is safe pattern
    else if (b.decision === "APPLY" && b.confidence >= 0.85 && isSafe(b.transformed)) {
      agreed = true;
      finalSuggestion = b.transformed;
      console.log(`[OVERRIDE] Applying safe pattern "${b.transformed}" via high-confidence Model B.`);
    }
    // 4. Reverse Override: A is safe pattern
    else if (a.decision === "APPLY" && a.confidence >= 0.85 && isSafe(a.transformed)) {
      agreed = true;
      finalSuggestion = a.transformed;
      console.log(`[OVERRIDE] Applying safe pattern "${a.transformed}" via high-confidence Model A.`);
    }
    // 5. Unsure Override: B is very sure, A is unsure
    else if (b.decision === "APPLY" && b.confidence >= 0.9 && a.decision === "SKIP" && a.confidence <= 0.6) {
      agreed = true;
      finalSuggestion = b.transformed;
      console.log(`[OVERRIDE] High confidence APPLY from Model B accepted over Model A skepticism.`);
    }

    results.push({
      decisionA: a.decision,
      decisionB: b.decision,
      suggestionA: a.transformed,
      suggestionB: b.transformed,
      confidenceA: a.confidence,
      confidenceB: b.confidence,
      finalSuggestion,
      agreed,
      file: log.file,
      line: log.line,
      start: log.start,
      end: log.end,
      code: log.code,
      lineText: log.lineText
    });
  }
  return results;
}

module.exports = getConsensus;
