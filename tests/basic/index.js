import { ethers } from "ethers";

// ===== SAFE CASES (must transform) =====
const a = ethers.parseEther("1");
const b = ethers.formatEther("1000000000000000000");
const c = ethers.parseUnits("10", 18);
const d = ethers.formatUnits("1000000000000000000", 18);
const e = ethers.getAddress("0xabc123");
const f = BigInt("1000");
const provider = new ethers.JsonRpcProvider();
const zero = ethers.ZeroAddress;

// ===== CHAINED (must skip) =====
const g = ethers.utils.parseEther("2").toString();
const h = ethers.BigNumber.from("2000").toHexString();

// ===== DYNAMIC (must skip) =====
const value = "3000";
const i = ethers.BigNumber.from(value);

// ===== NESTED (must transform) =====
const j = someFn(ethers.parseEther("5"));

// ===== FAKE ETHERS (must NOT touch) =====
function fakeScope() {
  const ethers = {};
  return ethers.utils.parseEther("10");
}

// ===== STRING (must ignore) =====
const k = "ethers.utils.parseEther('3')";

// ===== COMMENT (must ignore) =====
// ethers.utils.parseEther("999");