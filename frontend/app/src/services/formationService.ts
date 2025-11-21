import type { Formation } from "../types";
import { hostBridge } from "../lib/hostBridge";

type FormationEnvelope = {
  formations?: Formation[];
  error?: string;
  details?: string[];
};

class FormationService {
  private formations: Formation[] = [];
  private subscribers = new Set<(formations: Formation[]) => void>();

  constructor() {
    hostBridge.on<FormationEnvelope>("formations-data", (payload) => {
      const next = payload && Array.isArray(payload.formations) ? payload.formations : [];
      this.formations = next;
      this.publish();
    });
  }

  async loadFormations(): Promise<Formation[]> {
    if (!hostBridge.isAvailable) {
      return this.formations;
    }
    const payload = await hostBridge.request<undefined, FormationEnvelope>("get-formations", undefined, "formations-data");
    this.formations = payload && Array.isArray(payload.formations) ? payload.formations : [];
    this.publish();
    return this.formations;
  }

  async saveFormations(formations: Formation[]): Promise<void> {
    if (!hostBridge.isAvailable) {
      throw new Error("Host is unavailable, cannot persist formations.");
    }
    const response = await hostBridge.request<{ formations: Formation[] }, FormationEnvelope>(
      "save-formations",
      { formations },
      "formations-data"
    );
    if (response?.error) {
      const detail = Array.isArray(response.details) && response.details.length ? ` ${response.details.join(" ")}` : "";
      throw new Error(`${response.error}${detail}`.trim());
    }
  }

  getFormations(): Formation[] {
    return this.formations;
  }

  subscribe(callback: (formations: Formation[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.formations.map((formation) => ({ ...formation })));
    return () => this.subscribers.delete(callback);
  }

  private publish(): void {
    const snapshot = this.formations.map((formation) => ({ ...formation }));
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export const formationService = new FormationService();
