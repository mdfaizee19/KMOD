// ===== IMPORT =====
import { ethers } from "ethers";

// ===== DETERMINISTIC (Safe Rules) =====
const a = ethers.parseEther("1");
const f = BigInt("1000");

// ===== DYNAMIC (AI Candidates) =====
const value = "3000";
const h = BigInt(value);
const g = ethers.parseEther(value).toString();

// ===== UNSAFE (Routing -> AI Reject) =====
const k = ethers.BigNumber.from("1.5");