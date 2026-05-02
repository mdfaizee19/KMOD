const fs = require("fs");
const chalk = require("chalk");
const readline = require("readline-sync");
const { isValidSuggestion } = require("./engine");
const { validateAISuggestion } = require("../validator/syntaxValidator");

/**
 * Handle batch application of AI suggestions
 */
function applyAISuggestions(consensusList, state, options = {}) {
  if (!state.manualChecks) state.manualChecks = [];
  const approvedSuggestions = [];
  
  consensusList.forEach((item) => {
    const finalCode = item.finalSuggestion || item.suggestionA;
    const syntaxValidation = validateAISuggestion(finalCode, item.code);

    const isActualTransform = item.finalSuggestion && item.finalSuggestion !== "DO_NOT_CHANGE";

    if (item.agreed && isActualTransform && syntaxValidation.valid) {
      if (options.isAIApply) {
        approvedSuggestions.push(item);
      }
    } else {
      let reason = "AI disagreement or invalid suggestion";
      if (item.agreed && !isActualTransform) {
        reason = "AI consensus to SKIP (Safe)";
      } else if (!syntaxValidation.valid) {
        reason = `AI REJECTED: ${syntaxValidation.reason}`;
      }

      state.manualChecks.push({
        reason: reason,
        file: item.file,
        line: item.line,
        lineText: item.lineText
      });
    }
  });

  // BATCH APPLY
  if (approvedSuggestions.length > 0 && options.isAIApply) {
    const filesToModify = [...new Set(approvedSuggestions.map(s => s.file))];
    
    filesToModify.forEach(file => {
      let content = fs.readFileSync(file, "utf-8");
      const fileSuggestions = approvedSuggestions
        .filter(s => s.file === file)
        .sort((a, b) => b.start - a.start); // Apply bottom-up to maintain offsets

      fileSuggestions.forEach(s => {
        const originalSnippet = content.substring(s.start, s.end);
        const finalCode = s.finalSuggestion || s.suggestionA;
        
        if (originalSnippet === s.code) {
          content = content.slice(0, s.start) + finalCode + content.slice(s.end);
        } else {
          state.manualChecks.push({
            reason: "Conflict detected during batch apply",
            file: s.file,
            line: s.line,
            lineText: s.lineText
          });
        }
      });
      fs.writeFileSync(file, content);
      state.modifiedFiles.add(file);
    });
  }
}

module.exports = {
  applyAISuggestions
};

