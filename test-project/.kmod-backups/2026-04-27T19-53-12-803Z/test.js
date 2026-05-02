// ===== IMPORT =====
import { ethers } from "ethers";

// ===== SAFE CASES =====
const a = ethers.parseEther("1");
const f = BigInt("1000");

// ===== DYNAMIC (AI candidate) =====
const value = "3000";
const h = BigInt(value);

// ===== UNSAFE (Routing skip) =====
const g = ethers.utils.parseEther("2").toString();
const k = ethers.BigNumber.from("1.5");