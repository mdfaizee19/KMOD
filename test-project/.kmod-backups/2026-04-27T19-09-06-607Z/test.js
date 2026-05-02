// ===== IMPORT =====
import { ethers } from "ethers";

// ===== SAFE CASES =====
const a = ethers.utils.parseEther("1");
const f = ethers.BigNumber.from("1000");

// ===== DYNAMIC (AI candidate) =====
const value = "3000";
const h = ethers.BigNumber.from(value);

// ===== UNSAFE (Routing skip) =====
const g = ethers.utils.parseEther("2").toString();
const k = ethers.BigNumber.from("1.5");