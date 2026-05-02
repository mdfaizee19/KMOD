// ===== IMPORT =====
import { ethers } from "ethers";

// ===== SAFE CASES =====
const a = ethers.utils.parseEther("1");
const b = ethers.utils.formatEther("1000000000000000000");
const c = ethers.utils.parseUnits("10", 18);
const d = ethers.utils.formatUnits("1000000000000000000", 18);
const e = ethers.utils.getAddress("0xabc123");
const f = ethers.BigNumber.from("1000");
const provider = new ethers.providers.JsonRpcProvider();
const zero = ethers.constants.AddressZero;

// ===== CHAINED (must skip) =====
const g = ethers.utils.parseEther("2").toString();

// ===== DYNAMIC (AI target) =====
const value = "3000";
const h = ethers.BigNumber.from(value);

// ===== NESTED SAFE =====
const i = someFn(ethers.utils.parseEther("5"));

// ===== FAKE ETHERS (must skip) =====
function fakeScope() {
  const ethers = {};
  return ethers.utils.parseEther("10");
}

// ===== STRING (ignore) =====
const j = "ethers.utils.parseEther('3')";

// ===== COMMENT (ignore) =====
// ethers.utils.parseEther("999");

// ===== BAD AI CASE (should be rejected) =====
const k = ethers.BigNumber.from("1.5");