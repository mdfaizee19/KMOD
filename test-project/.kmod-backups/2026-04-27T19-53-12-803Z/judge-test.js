// ===== IMPORT =====
import { ethers } from "ethers";

// Case that might trigger disagreement
// Model A might be skeptical of complex expressions
// Model B might try to wrap it in BigInt()
const complexValue = someFn() + 100;
const h = BigInt(complexValue);

// Chained call (Direct to manual)
const g = ethers.utils.parseEther("2").toString();