import { ethers } from "ethers";

// ===== CASE 1: DYNAMIC VALUE (AI SHOULD SUGGEST, BUT NOT AUTO APPLY) =====
const amount = getAmountFromAPI();
const a = ethers.parseEther(amount);

// Expected:
// ❌ Rule skips (dynamic)
// 🤖 AI suggests: ethers.parseEther(amount)
// 👤 Ask user approval

// ===== CASE 2: CHAINED CALL (AI SHOULD REJECT) =====
const b = ethers.utils.parseEther("1").toString();

// Expected:
// ❌ Rule skips
// 🤖 AI SHOULD NOT suggest transformation
// ⚠️ Manual check required

// ===== CASE 3: CONDITIONAL LOGIC (AI SHOULD BE CAREFUL) =====
const value = "1000";
const c = value ? ethers.BigNumber.from(value) : null;

// Expected:
// ❌ Rule skips (conditional + dynamic)
// 🤖 AI suggests: BigInt(value)
// 👤 Ask user approval

// ===== CASE 4: VARIABLE ALIAS (HARD CASE) =====
const eth = ethers;
const d = eth.utils.parseEther("2");

// Expected:
// ❌ Rule likely misses or skips
// 🤖 AI might suggest: ethers.parseEther("2")
// ⚠️ If models disagree → manual check

// ===== CASE 5: FUNCTION WRAPPER (AI SHOULD HANDLE) =====
function convert(val) {
  return ethers.parseUnits(val, 18);
}

// Expected:
// ❌ Rule skips (function scope)
// 🤖 AI suggests: ethers.parseUnits(val, 18)
// 👤 Ask user approval

// ===== CASE 6: NESTED OBJECT (AI SHOULD REJECT) =====
const obj = {
  val: ethers.parseEther("3")
};

// Expected:
// ❌ Rule skips (nested structure)
// 🤖 AI MAY suggest, but risky
// ⚠️ Prefer manual check

// ===== CASE 7: UNKNOWN PATTERN (AI SHOULD FAIL SAFELY) =====
const weird = ethers["utils"]["parseEther"]("4");

// Expected:
// ❌ Rule skips
// 🤖 AI likely confused
// ⚠️ MUST fallback to manual check

// ===== CASE 8: STRING (AI MUST IGNORE) =====
const fake = "ethers.utils.parseEther('5')";

// Expected:
// ❌ No detection at all

// ===== CASE 9: COMMENT (AI MUST IGNORE) =====
// ethers.utils.parseEther("6")

// ===== CASE 10: MIXED SAFE + UNSAFE =====
const mixed = someFn(ethers.parseEther("7"), ethers.parseEther(dynamicValue));

// Expected:
// First → transform
// Second → skip + AI