// ===== IMPORT =====
import { ethers } from "ethers";

// ===== JUDGE TEST CASE =====
// This should trigger OVERRIDE: A=SKIP(0.8), B=APPLY(0.9)
const value = "1000";
const result = BigInt(value);