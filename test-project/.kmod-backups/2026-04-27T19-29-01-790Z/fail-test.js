// ===== IMPORT =====
import { ethers } from "ethers";

// ===== FAIL TEST CASE =====
// This should be routed to manual directly (non-integer literal)
const result = ethers.BigNumber.from("1.5");

// Chained call (should be routed to manual directly)
const g = ethers.utils.parseEther("2").toString();