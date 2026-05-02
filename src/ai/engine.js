const axios = require("axios");
const parser = require("@babel/parser");

/**
 * Call OpenRouter API
 */
async function callOpenRouter(model, apiKey, prompt) {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost",
        "X-Title": "Kmod"
      }
    }
  );
  return res.data.choices[0].message.content;
}

/**
 * AI Prompt Builder
 */
function buildPrompt(snippet) {
  return `
You are a high-precision migration engine for ethers.js v5 → v6.
Context: You are helping migrate a code snippet that safe rules skipped.

DECISION SYSTEM:
You MUST choose exactly one option:
1. APPLY: If the transformation is a valid ethers.js v6 migration (Assume integer for variables or numeric strings).
2. SKIP: ONLY if the transformation is DEFINITELY unsafe or invalid JS.

RULES:
- DEFAULT BIAS: Prefer "APPLY" for dynamic variables (e.g., BigNumber.from(value) → BigInt(value)).
- CHAINED CALLS: It is SAFE to transform calls even if they are part of a chain (e.g., .toString(), .mul(), etc.). Only transform the specific part matching the v5 pattern.
- NON-INTEGER LITERALS: If you see a decimal string like "1.5" inside BigNumber.from(), it is a common v5 pattern that should be migrated to ethers.parseEther("1.5") in v6. Proactively transform these to ethers.parseEther() rather than skipping.
- ONLY transform:
  - ethers.utils.parseEther(<value>) → ethers.parseEther(<value>)
  - ethers.BigNumber.from(<value>) → BigInt(<value>)

RETURN ONLY VALID JSON:
{
  "decision": "APPLY" | "SKIP",
  "transformed": "the full code snippet OR 'DO_NOT_CHANGE'",
  "confidence": 0.0 to 1.0,
  "reason": "brief technical rationale"
}

Code:
${JSON.stringify(snippet, null, 2)}
`;
}

/**
 * AI Output Validation
 */
function isValidSuggestion(output) {
  if (output.decision !== "APPLY") return false;
  if (output.confidence < 0.8) return false;
  
  try {
    parser.parse(output.transformed, { sourceType: "module", plugins: ["jsx"] });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  callOpenRouter,
  buildPrompt,
  isValidSuggestion
};
