import type { WeaponTemplate } from "../types";
import { hostBridge } from "../lib/hostBridge";
import { deepClone } from "../lib/helpers";

type WeaponEnvelope = {
  weapons?: WeaponTemplate[];
};

class WeaponLibraryService {
  private weapons: WeaponTemplate[] = [];
  private readonly subscribers = new Set<(weapons: WeaponTemplate[]) => void>();

  constructor() {
    hostBridge.on<WeaponEnvelope>("weapons-data", (payload) => {
      this.weapons = Array.isArray(payload?.weapons) ? deepClone(payload!.weapons!) : [];
      this.publish();
    });
  }

  async loadWeapons(): Promise<WeaponTemplate[]> {
    if (!hostBridge.isAvailable) {
      return this.getWeapons();
    }
    const payload = await hostBridge.request<undefined, WeaponEnvelope>("get-weapons", undefined, "weapons-data");
    this.weapons = Array.isArray(payload?.weapons) ? deepClone(payload!.weapons!) : [];
    this.publish();
    return this.getWeapons();
  }

  async saveWeapons(weapons: WeaponTemplate[]): Promise<void> {
    if (!hostBridge.isAvailable) {
      throw new Error("Host is unavailable, cannot persist weapons.");
    }
    await hostBridge.request<{ weapons: WeaponTemplate[] }, WeaponEnvelope>(
      "save-weapons",
      { weapons },
      "weapons-data"
    );
  }

  getWeapons(): WeaponTemplate[] {
    return deepClone(this.weapons);
  }

  subscribe(callback: (weapons: WeaponTemplate[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getWeapons());
    return () => this.subscribers.delete(callback);
  }

  private publish(): void {
    const snapshot = this.getWeapons();
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export const weaponLibraryService = new WeaponLibraryService();
