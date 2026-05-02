// ===== IMPORT =====
import { ethers } from "ethers";

// ===== SAFE CASES =====
const a = ethers.parseEther("1");
const b = ethers.formatEther("1000000000000000000");
const c = ethers.parseUnits("10", 18);
const d = ethers.formatUnits("1000000000000000000", 18);
const e = ethers.getAddress("0xabc123");
const f = BigInt("1000");
const provider = new ethers.JsonRpcProvider();
const zero = ethers.ZeroAddress;

// ===== CHAINED (must skip AI) =====
const g = ethers.utils.parseEther("2").toString();

// ===== DYNAMIC (AI candidate) =====
const value = "3000";
const h = BigInt(value);

// ===== NESTED SAFE =====
const i = someFn(ethers.parseEther("5"));

// ===== FAKE ETHERS (must skip) =====
function fakeScope() {
  const ethers = {};
  return ethers.utils.parseEther("10");
}

// ===== STRING (ignore) =====
const j = "ethers.utils.parseEther('3')";

// ===== COMMENT (ignore) =====
// ethers.utils.parseEther("999");

// ===== BAD AI CASE (must skip AI) =====
const k = ethers.BigNumber.from("1.5");