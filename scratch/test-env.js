require("dotenv").config();
const axios = require("axios");

async function testKeys() {
  const keys = [process.env.OPENROUTER_KEY_1, process.env.OPENROUTER_KEY_2];
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!key) {
      console.log(`❌ KEY_${i+1} is MISSING`);
      continue;
    }
    
    try {
      // Small request to check key validity
      const res = await axios.get("https://openrouter.ai/api/v1/auth/key", {
        headers: { Authorization: `Bearer ${key}` }
      });
      console.log(`✅ KEY_${i+1} is ACTIVE (Limit: ${res.data.data.limit || 'none'})`);
    } catch (err) {
      console.log(`❌ KEY_${i+1} FAILED: ${err.response?.data?.error?.message || err.message}`);
    }
  }
}

testKeys();
