import type { AppSettings } from "../types";
import { hostBridge } from "../lib/hostBridge";

class SettingsService {
  private settings: AppSettings = {};
  private subscribers = new Set<(settings: AppSettings) => void>();

  constructor() {
    hostBridge.on<AppSettings | undefined>("settings-data", (payload) => {
      this.settings = payload ? { ...payload } : {};
      this.publish();
    });
  }

  async loadSettings(): Promise<AppSettings> {
    if (!hostBridge.isAvailable) {
      return this.getSettings();
    }
    const payload = await hostBridge.request<undefined, AppSettings | undefined>(
      "get-settings",
      undefined,
      "settings-data"
    );
    this.settings = payload ? { ...payload } : {};
    this.publish();
    return this.getSettings();
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!hostBridge.isAvailable) {
      throw new Error("Host is unavailable, cannot persist settings.");
    }
    await hostBridge.request<AppSettings, AppSettings | undefined>("save-settings", settings, "settings-data");
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  subscribe(callback: (settings: AppSettings) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getSettings());
    return () => this.subscribers.delete(callback);
  }

  private publish(): void {
    const snapshot = this.getSettings();
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export const settingsService = new SettingsService();
