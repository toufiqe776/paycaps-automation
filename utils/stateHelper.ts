// utils/stateHelper.ts
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.resolve(__dirname, '../test-data/.sessionState.json');

export class StateHelper {
  // Merchant create hone par uska naam save karein
  static saveCreatedMerchant(merchantName: string) {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = { createdMerchant: merchantName, timestamp: Date.now() };
    fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Routing test ke liye created merchant fetch karein
  static getCreatedMerchant(): string {
    if (fs.existsSync(STATE_FILE)) {
      try {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.createdMerchant) {
          return data.createdMerchant;
        }
      } catch (err) {
        console.warn('Could not read session state, using fallback merchant');
      }
    }
    return 'Super Merchant'; // Fallback agar test isolated run ho
  }
}