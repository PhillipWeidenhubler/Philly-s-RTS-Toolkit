import type { Nation } from "../types";
import { hostBridge } from "../lib/hostBridge";

type NationEnvelope = {
  nations?: Nation[];
};

class NationService {
  private nations: Nation[] = [];
  private subscribers = new Set<(nations: Nation[]) => void>();

  constructor() {
    hostBridge.on<NationEnvelope>("nations-data", (payload) => {
      const next = payload && Array.isArray(payload.nations) ? payload.nations : [];
      this.nations = next;
      this.publish();
    });
  }

  async loadNations(): Promise<Nation[]> {
    if (!hostBridge.isAvailable) {
      return this.nations;
    }
    const payload = await hostBridge.request<undefined, NationEnvelope>("get-nations", undefined, "nations-data");
    this.nations = payload && Array.isArray(payload.nations) ? payload.nations : [];
    this.publish();
    return this.nations;
  }

  async saveNations(nations: Nation[]): Promise<void> {
    if (!hostBridge.isAvailable) {
      throw new Error("Host is unavailable, cannot persist nations.");
    }
    await hostBridge.request<{ nations: Nation[] }, NationEnvelope>(
      "save-nations",
      { nations },
      "nations-data"
    );
  }

  getNations(): Nation[] {
    return this.nations;
  }

  subscribe(callback: (nations: Nation[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.nations.map((nation) => ({ ...nation })));
    return () => this.subscribers.delete(callback);
  }

  private publish(): void {
    const snapshot = this.nations.map((nation) => ({ ...nation }));
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export const nationService = new NationService();
