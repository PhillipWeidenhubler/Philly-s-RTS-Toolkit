import type { Unit } from "../types";
import { hostBridge } from "../lib/hostBridge";

type UnitsEnvelope = {
  units?: Unit[];
};

class UnitService {
  private units: Unit[] = [];
  private subscribers = new Set<(units: Unit[]) => void>();

  constructor() {
    hostBridge.on<UnitsEnvelope>("units-data", (payload) => {
      this.units = Array.isArray(payload?.units) ? payload.units : [];
      this.publish();
    });
  }

  async loadUnits(): Promise<Unit[]> {
    if (!hostBridge.isAvailable) {
      console.warn("[UnitService] Host is unavailable; returning cached units only.");
      return this.units;
    }
    const payload = await hostBridge.request<undefined, UnitsEnvelope>("get-units", undefined, "units-data");
    this.units = Array.isArray(payload?.units) ? payload.units : [];
    this.publish();
    return this.units;
  }

  async saveUnit(unit: Unit): Promise<void> {
    if (!hostBridge.isAvailable) {
      throw new Error("Host is unavailable, cannot persist unit.");
    }
    await hostBridge.request<{ unit: Unit }, UnitsEnvelope>("save-unit", { unit }, "units-data");
  }

  async deleteUnit(id: number): Promise<void> {
    if (!hostBridge.isAvailable) {
      throw new Error("Host is unavailable, cannot delete unit.");
    }
    await hostBridge.request<{ id: number }, UnitsEnvelope>("delete-unit", { id }, "units-data");
  }

  getUnits(): Unit[] {
    return this.units;
  }

  subscribe(callback: (units: Unit[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.units.map((unit) => ({ ...unit })));
    return () => this.subscribers.delete(callback);
  }

  private publish(): void {
    const snapshot = this.units.map((unit) => ({ ...unit }));
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export const unitService = new UnitService();
