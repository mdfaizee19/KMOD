// ===== IMPORT VARIANTS =====
import { ethers } from "ethers";
const { utils } = ethers;
const eth = ethers;

// ===== SAFE (RULE) =====
const a = ethers.parseEther("1");

// ===== ALIAS (should skip or behave safely) =====
const b = eth.utils.parseEther("2");

// ===== DESTRUCTURED (edge case) =====
const c = utils.parseEther("3");

// ===== DYNAMIC (AI candidate) =====
const value = "4000";
const d = ethers.BigNumber.from(value);

// ===== BAD DYNAMIC (AI must reject) =====
const bad = ethers.BigNumber.from("1.5");

// ===== CHAINED (must skip) =====
const e = ethers.utils.parseEther("5").toString();

// ===== NESTED COMPLEX =====
function test() {
  return someWrapper(ethers.parseEther("6"));
}

// ===== SHADOWED ETHERS =====
function fake() {
  const ethers = {};
  return ethers.utils.parseEther("7");
}

// ===== STRING =====
const f = "ethers.utils.parseEther('8')";

// ===== COMMENT =====
// ethers.utils.parseEther("9")

// ===== MULTI CASE IN ONE LINE =====
const g = ethers.parseEther("10") + ethers.parseEther("11");

// ===== PROVIDER =====
const provider = new ethers.JsonRpcProvider();

// ===== CONSTANT =====
const zero = ethers.ZeroAddress;