// ===== IMPORT =====
import { ethers } from "ethers";

// ===== JUDGE TEST CASE =====
// This should cause disagreement: SKIP vs APPLY
const value = "1000";
const result = ethers.BigNumber.from(value);
