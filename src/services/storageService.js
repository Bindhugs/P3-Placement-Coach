// Storage Service for P3 Placement Coach
// Follows strict privacy guidelines:
// - Stores only non-sensitive demo/session progress, claims, 7-day plan checks, and UI settings
// - NEVER permanently stores raw resume files or voice recordings
// - Provides a one-click "Clear My Data" purge utility

const STORAGE_KEYS = {
  SESSION: "p3_session_state",
  CLAIMS: "p3_claims_data",
  PLAN_PROGRESS: "p3_plan_progress",
  SETTINGS: "p3_user_settings",
  STATS: "p3_readiness_stats"
};

export const DEFAULT_SETTINGS = {
  aiMode: "offline", // "offline" (Offline Smart Mode) or "gemini" (Gemini API Mode)
  piiScrubbingEnabled: true,
  geminiApiKey: "", // User-provided optional key (client-side only for dev/testing)
  voiceEnabled: true,
  autoTTS: false // Read questions aloud using SpeechSynthesis
};

export const DEFAULT_STATS = {
  readinessScore: null,
  claimsAnalyzed: 0,
  sessionsCompleted: 0,
  highRiskCount: 0,
  mediumRiskCount: 0,
  lowRiskCount: 0,
  weakAreas: [],
  recommendedNextAction: ""
};

class StorageService {
  isAvailable() {
    try {
      const test = "__p3_test__";
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getSettings() {
    if (!this.isAvailable()) return DEFAULT_SETTINGS;
    try {
      const data = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings) {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn("P3: Failed to save settings to localStorage", e);
    }
  }

  getStats() {
    if (!this.isAvailable()) return DEFAULT_STATS;
    try {
      const data = window.localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  }

  saveStats(stats) {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn("P3: Failed to save stats to localStorage", e);
    }
  }

  getPlanProgress() {
    if (!this.isAvailable()) return {};
    try {
      const data = window.localStorage.getItem(STORAGE_KEYS.PLAN_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  savePlanProgress(progress) {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.PLAN_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn("P3: Failed to save plan progress", e);
    }
  }

  getRecentSessions() {
    if (!this.isAvailable()) return [];
    try {
      const data = window.localStorage.getItem(STORAGE_KEYS.SESSION);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addSessionRecord(record) {
    if (!this.isAvailable()) return;
    try {
      const sessions = this.getRecentSessions();
      // Keep last 10 sessions only (ephemeral and lightweight)
      const updated = [record, ...sessions.slice(0, 9)];
      window.localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updated));
    } catch (e) {
      console.warn("P3: Failed to save session record", e);
    }
  }

  clearRecentSessions() {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (e) {
      console.warn("P3: Failed to clear session history", e);
    }
  }

  // Clear My Data: Wipes all P3 keys and restores default state
  clearAllData() {
    if (!this.isAvailable()) return;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        window.localStorage.removeItem(key);
      });
      // Dispatch custom event for reactive UI reset
      window.dispatchEvent(new CustomEvent("p3_data_cleared"));
      return true;
    } catch (e) {
      console.error("P3: Failed to clear local data", e);
      return false;
    }
  }
}

export const storage = new StorageService();
