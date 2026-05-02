import { ethers } from "ethers";
import * as E from "ethers";

// ===== BASIC SAFE =====
const a = ethers.parseEther("1");
const b = ethers.formatUnits("1000000000000000000", 18);

// ===== IMPORT VARIATION =====
import { utils } from "ethers";
const c = utils.parseEther("2");

// ===== DESTRUCTURED =====
const {
  parseEther,
  formatEther
} = ethers.utils;
const d = parseEther("3");
const e = formatEther("3000000000000000000");

// ===== ALIAS =====
const eth = ethers;
const f = eth.utils.parseUnits("10", 18);

// ===== NESTED =====
const g = someFn(ethers.parseEther("5"));

// ===== CHAINED (MUST SKIP) =====
const h = ethers.utils.parseEther("6").toString();

// ===== DYNAMIC (AI SHOULD HELP) =====
const value = getValue();
const i = ethers.BigNumber.from(value);

// ===== STATIC BIG NUMBER (SAFE) =====
const j = BigInt("1000");

// ===== CONDITIONAL =====
const k = condition ? ethers.parseEther("7") : null;

// ===== OPTIONAL CHAINING =====
const l = ethers?.utils?.parseEther("8");

// ===== STRING (IGNORE) =====
const m = "ethers.utils.parseEther('9')";

// ===== COMMENT (IGNORE) =====
// ethers.utils.parseEther("10")

// ===== FAKE SCOPE =====
function fake() {
  const ethers = {};
  return ethers.utils.parseEther("11");
}

// ===== MIXED COMPLEX =====
const n = wrapper(ethers.parseEther("12"), ethers.BigNumber.from(dynamicVal), ethers.utils.parseEther("13").toString());