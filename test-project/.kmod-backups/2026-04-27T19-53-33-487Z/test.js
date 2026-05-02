// ===== IMPORT =====
import { ethers } from "ethers";

// ===== DETERMINISTIC (Safe Rules) =====
const a = ethers.utils.parseEther("1");
const f = ethers.BigNumber.from("1000");

// ===== DYNAMIC (AI Candidates) =====
const value = "3000";
const h = ethers.BigNumber.from(value);
const g = ethers.utils.parseEther(value).toString();

// ===== UNSAFE (Routing -> AI Reject) =====
const k = ethers.BigNumber.from("1.5");