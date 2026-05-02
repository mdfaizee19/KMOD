import { ethers } from "ethers";

// ===== CASE 1: STATIC (RULE SHOULD HANDLE) =====
const a = ethers.parseEther("1");

// EXPECT:
// ✅ transformed by rule
// ❌ AI should NOT run

// ===== CASE 2: DYNAMIC BIG NUMBER (AI SHOULD HELP) =====
const value = getValue();
const b = ethers.BigNumber.from(value);

// EXPECT:
// 🤖 Model A: BigInt(value)
// 🤖 Model B: BigInt(value)
// ✔ consensus → ask user

// ===== CASE 3: STATIC BIG NUMBER (RULE SHOULD HANDLE) =====
const c = BigInt("1000");

// EXPECT:
// ✅ BigInt("1000")
// ❌ AI not triggered

// ===== CASE 4: CHAINED (AI MUST REJECT) =====
const d = ethers.utils.parseEther("2").toString();

// EXPECT:
// 🤖 both models → safe: false
// ❌ no suggestion
// ⚠️ manual check

// ===== CASE 5: CONDITIONAL (AI SHOULD HANDLE CAREFULLY) =====
const e = condition ? ethers.BigNumber.from(value) : null;

// EXPECT:
// 🤖 BigInt(value)
// ✔ consensus → ask user

// ===== CASE 6: ALIAS (AI MAY TRY, TEST CONSENSUS) =====
const eth = ethers;
const f = eth.utils.parseEther("3");

// EXPECT:
// 🤖 Model A: ethers.parseEther("3")
// 🤖 Model B: UNSAFE or same
// → depends → test disagreement logic

// ===== CASE 7: NESTED SAFE (RULE SHOULD HANDLE) =====
const g = someFn(ethers.parseUnits("10", 18));

// EXPECT:
// ✅ transformed
// ❌ AI not triggered

// ===== CASE 8: OPTIONAL CHAINING (AI SHOULD REJECT) =====
const h = ethers?.utils?.parseEther("4");

// EXPECT:
// 🤖 safe: false
// ⚠️ manual check

// ===== CASE 9: STRING (IGNORE) =====
const i = "ethers.utils.parseEther('5')";

// ===== CASE 10: COMPLEX MIXED =====
const j = wrapper(ethers.parseEther("6"),
// safe
ethers.BigNumber.from(value),
// dynamic → AI
ethers.utils.parseEther("7").toString() // chained → reject
);