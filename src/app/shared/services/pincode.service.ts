import { Injectable } from '@angular/core';
import pincodeData from '../../../assets/pincode-data.json';

const LOCAL_STORAGE_KEY = 'valora_custom_pincodes';

@Injectable({
  providedIn: 'root'
})
export class PincodeService {

  private staticData: any[] = [...pincodeData];
  private customData: any[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  /* ════════════════════════
     LOAD custom pincodes from localStorage on startup
  ════════════════════════ */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      this.customData = stored ? JSON.parse(stored) : [];
      console.log(`📦 [PincodeService] Loaded ${this.customData.length} custom pincodes from localStorage`);
    } catch (e) {
      console.warn('⚠️ [PincodeService] Failed to load from localStorage', e);
      this.customData = [];
    }
  }

  /* ════════════════════════
     MERGED DATA — custom entries override static
  ════════════════════════ */
  private get allData(): any[] {
    return [...this.staticData, ...this.customData];
  }

  /* ════════════════════════
     GET PINCODE — multi-level fuzzy matching
  ════════════════════════ */
  getPincode(village: string, taluka: string, district: string): string | null {

    const v = village.toLowerCase().trim();
    const t = taluka.toLowerCase().trim();
    const d = district.toLowerCase().trim();

    // Level 1 — exact match all three
    let result = this.allData.find(row =>
      row.village.toLowerCase() === v &&
      row.taluka.toLowerCase() === t &&
      row.district.toLowerCase() === d
    );
    if (result) return result.pincode;

    // Level 2 — village + district (taluka may differ)
    result = this.allData.find(row =>
      row.village.toLowerCase() === v &&
      row.district.toLowerCase() === d
    );
    if (result) return result.pincode;

    // Level 3 — partial village match + district
    result = this.allData.find(row =>
      (row.village.toLowerCase().includes(v) || v.includes(row.village.toLowerCase())) &&
      row.district.toLowerCase() === d
    );
    if (result) return result.pincode;

    // Level 4 — taluka + district fallback
    result = this.allData.find(row =>
      row.taluka.toLowerCase() === t &&
      row.district.toLowerCase() === d
    );
    if (result) return result.pincode;

    return null;
  }

  /* ════════════════════════
     SAVE NEW PINCODE — persists to localStorage
  ════════════════════════ */
  saveNewPincode(village: string, taluka: string, district: string, pincode: string): void {

    const v = village.trim();
    const t = taluka.trim();
    const d = district.trim();
    const p = pincode.trim();

    if (!v || !t || !d || p.length !== 6) return;

    // Check if already exists in custom data
    const existingCustom = this.customData.find(row =>
      row.village.toLowerCase() === v.toLowerCase() &&
      row.taluka.toLowerCase() === t.toLowerCase() &&
      row.district.toLowerCase() === d.toLowerCase()
    );

    if (existingCustom) {
      if (existingCustom.pincode === p) return; // no change needed
      existingCustom.pincode = p;
      console.log(`📝 [PincodeService] Updated: ${v}, ${t}, ${d} → ${p}`);
    } else {
      // Check if already exists in static data with same pincode — no need to duplicate
      const existingStatic = this.staticData.find(row =>
        row.village.toLowerCase() === v.toLowerCase() &&
        row.taluka.toLowerCase() === t.toLowerCase() &&
        row.district.toLowerCase() === d.toLowerCase() &&
        row.pincode === p
      );
      if (existingStatic) return;

      this.customData.push({ village: v, taluka: t, district: d, pincode: p });
      console.log(`✅ [PincodeService] New entry saved: ${v}, ${t}, ${d} → ${p}`);
    }

    // Persist to localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.customData));
      console.log(`💾 [PincodeService] localStorage updated. Total custom entries: ${this.customData.length}`);
    } catch (e) {
      console.warn('⚠️ [PincodeService] Failed to save to localStorage', e);
    }
  }

  /* ════════════════════════
     GET ALL CUSTOM ENTRIES — for debugging
  ════════════════════════ */
  getCustomEntries(): any[] {
    return [...this.customData];
  }

  /* ════════════════════════
     CLEAR CUSTOM ENTRIES — utility
  ════════════════════════ */
  clearCustomEntries(): void {
    this.customData = [];
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.log('🧹 [PincodeService] Custom pincodes cleared');
  }
}