import type { AmmoTemplate } from "../types";
import { hostBridge } from "../lib/hostBridge";
import { deepClone } from "../lib/helpers";

type AmmoEnvelope = {
  ammo?: AmmoTemplate[];
};

class AmmoLibraryService {
  private templates: AmmoTemplate[] = [];
  private readonly subscribers = new Set<(templates: AmmoTemplate[]) => void>();

  constructor() {
    hostBridge.on<AmmoEnvelope>("ammo-data", (payload) => {
      this.templates = Array.isArray(payload?.ammo) ? deepClone(payload!.ammo!) : [];
      this.publish();
    });
  }

  async loadTemplates(): Promise<AmmoTemplate[]> {
    if (!hostBridge.isAvailable) {
      return this.getTemplates();
    }
    const payload = await hostBridge.request<undefined, AmmoEnvelope>("get-ammo", undefined, "ammo-data");
    this.templates = Array.isArray(payload?.ammo) ? deepClone(payload!.ammo!) : [];
    this.publish();
    return this.getTemplates();
  }

  async saveTemplates(templates: AmmoTemplate[]): Promise<void> {
    if (!hostBridge.isAvailable) {
      throw new Error("Host is unavailable, cannot persist ammo templates.");
    }
    await hostBridge.request<{ ammo: AmmoTemplate[] }, AmmoEnvelope>("save-ammo", { ammo: templates }, "ammo-data");
  }

  getTemplates(): AmmoTemplate[] {
    return deepClone(this.templates);
  }

  subscribe(callback: (templates: AmmoTemplate[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getTemplates());
    return () => this.subscribers.delete(callback);
  }

  private publish(): void {
    const snapshot = this.getTemplates();
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export const ammoLibraryService = new AmmoLibraryService();
