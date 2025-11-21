import type { FireModeTemplate } from "../types";
import { hostBridge } from "../lib/hostBridge";
import { deepClone } from "../lib/helpers";

type FireModeEnvelope = {
    fireModes?: FireModeTemplate[];
};

class FireModeTemplateService {
    private templates: FireModeTemplate[] = [];
    private readonly subscribers = new Set<(templates: FireModeTemplate[]) => void>();

    constructor() {
        hostBridge.on<FireModeEnvelope>("fire-modes-data", (payload) => {
            this.templates = Array.isArray(payload?.fireModes) ? deepClone(payload!.fireModes!) : [];
            this.publish();
        });
    }

    async loadTemplates(): Promise<FireModeTemplate[]> {
        if (!hostBridge.isAvailable) {
            return this.getTemplates();
        }
        const payload = await hostBridge.request<undefined, FireModeEnvelope>(
            "get-fire-modes",
            undefined,
            "fire-modes-data"
        );
        this.templates = Array.isArray(payload?.fireModes) ? deepClone(payload!.fireModes!) : [];
        this.publish();
        return this.getTemplates();
    }

    async saveTemplates(templates: FireModeTemplate[]): Promise<void> {
        if (!hostBridge.isAvailable) {
            throw new Error("Host is unavailable, cannot persist fire mode templates.");
        }
        await hostBridge.request<{ fireModes: FireModeTemplate[] }, FireModeEnvelope>(
            "save-fire-modes",
            { fireModes: templates },
            "fire-modes-data"
        );
    }

    getTemplates(): FireModeTemplate[] {
        return deepClone(this.templates);
    }

    subscribe(callback: (templates: FireModeTemplate[]) => void): () => void {
        this.subscribers.add(callback);
        callback(this.getTemplates());
        return () => this.subscribers.delete(callback);
    }

    private publish(): void {
        const snapshot = this.getTemplates();
        this.subscribers.forEach((subscriber) => subscriber(snapshot));
    }
}

export const fireModeTemplateService = new FireModeTemplateService();
