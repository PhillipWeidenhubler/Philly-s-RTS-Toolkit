import { hostBridge } from "../lib/hostBridge";
import type { ServerDiagnostics, ServerLogEntry, ServerMetadata } from "../types";

type MetadataListener = (metadata?: ServerMetadata) => void;
type LogListener = (entries: ServerLogEntry[]) => void;
type DiagnosticsListener = (diagnostics?: ServerDiagnostics) => void;

type HostInfoPayload = {
    server?: Partial<ServerMetadata> | Record<string, unknown>;
    Server?: Partial<ServerMetadata> | Record<string, unknown>;
};

type ServerLogEnvelope = {
    entries?: unknown;
};

class ServerService {
    private metadata?: ServerMetadata;
    private logs: ServerLogEntry[] = [];
    private diagnostics?: ServerDiagnostics;
    private readonly metadataListeners = new Set<MetadataListener>();
    private readonly logListeners = new Set<LogListener>();
    private readonly diagnosticsListeners = new Set<DiagnosticsListener>();
    private requestedInitialDiagnostics = false;

    public readonly isSupported: boolean = hostBridge.isAvailable;

    constructor() {
        if (!this.isSupported) {
            return;
        }

        hostBridge.on("host-info", (payload) => this.handleHostInfo(payload as HostInfoPayload));
        hostBridge.on("server-logs", (payload) => this.applyLogSnapshot(payload as ServerLogEnvelope));
        hostBridge.on("server-log-event", (payload) => this.appendLog(payload as Partial<ServerLogEntry>));
    }

    init(): void {
        if (!this.isSupported) {
            return;
        }
        hostBridge.postMessage("host-info-request");
        hostBridge.postMessage("get-server-logs");
    }

    subscribeToMetadata(listener: MetadataListener): () => void {
        this.metadataListeners.add(listener);
        listener(this.metadata);
        return () => this.metadataListeners.delete(listener);
    }

    subscribeToLogs(listener: LogListener): () => void {
        this.logListeners.add(listener);
        listener(this.logs.slice());
        return () => this.logListeners.delete(listener);
    }

    subscribeToDiagnostics(listener: DiagnosticsListener): () => void {
        this.diagnosticsListeners.add(listener);
        listener(this.diagnostics);
        return () => this.diagnosticsListeners.delete(listener);
    }

    refreshLogs(): void {
        if (!this.isSupported) {
            return;
        }
        hostBridge.postMessage("get-server-logs");
    }

    async fetchDiagnostics(): Promise<ServerDiagnostics> {
        if (!this.isSupported) {
            throw new Error("Local server is not available in this environment.");
        }
        if (!this.metadata?.baseUrl) {
            throw new Error("Server metadata is not yet available.");
        }

        const response = await fetch(`${this.metadata.baseUrl}/api/diagnostics`, {
            headers: this.buildHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Diagnostics request failed (${response.status})`);
        }

        const payload = (await response.json()) as ServerDiagnostics;
        this.diagnostics = payload;
        this.notifyDiagnostics();
        return payload;
    }

    getMetadata(): ServerMetadata | undefined {
        return this.metadata;
    }

    getLogs(): ServerLogEntry[] {
        return this.logs.slice();
    }

    private buildHeaders(): HeadersInit {
        const headers: Record<string, string> = {
            Accept: "application/json",
        };
        if (this.metadata?.token) {
            headers["X-Server-Token"] = this.metadata.token;
        }
        return headers;
    }

    private handleHostInfo(payload?: HostInfoPayload): void {
        if (!payload) return;
        const raw = payload.server ?? payload.Server;
        if (!raw) return;
        const bag = raw as Record<string, unknown>;
        const pickString = (...keys: string[]) => {
            for (const key of keys) {
                const value = bag[key];
                if (typeof value === "string") {
                    return value;
                }
            }
            return undefined;
        };
        const pickNumber = (...keys: string[]) => {
            for (const key of keys) {
                const value = bag[key];
                if (typeof value === "number") {
                    return value;
                }
            }
            return undefined;
        };

        this.metadata = {
            baseUrl: pickString("baseUrl", "BaseUrl"),
            port: pickNumber("port", "Port"),
            token: pickString("token", "Token"),
            startedAt: pickString("startedAt", "StartedAt"),
        };

        this.notifyMetadata();
        this.primeDiagnostics();
    }

    private applyLogSnapshot(payload?: ServerLogEnvelope): void {
        if (!payload) {
            this.logs = [];
            this.notifyLogs();
            return;
        }

        const entries = Array.isArray(payload.entries) ? payload.entries : [];
        this.logs = entries.map((entry) => this.normalizeLog(entry as Partial<ServerLogEntry>));
        this.notifyLogs();
    }

    private appendLog(payload?: Partial<ServerLogEntry>): void {
        if (!payload) return;
        const entry = this.normalizeLog(payload);
        this.logs = [...this.logs.slice(-499), entry];
        this.notifyLogs();
    }

    private normalizeLog(entry: Partial<ServerLogEntry>): ServerLogEntry {
        const timestamp = typeof entry.timestamp === "string" ? entry.timestamp : new Date().toISOString();
        return {
            timestamp,
            level: entry.level ?? "Information",
            category: entry.category ?? "server",
            message: entry.message ?? "(no message provided)",
            exception: entry.exception ?? null,
            statusCode: typeof entry.statusCode === "number" ? entry.statusCode : null,
            durationMs: typeof entry.durationMs === "number" ? entry.durationMs : null,
        };
    }

    private notifyMetadata(): void {
        this.metadataListeners.forEach((listener) => {
            try {
                listener(this.metadata);
            } catch (error) {
                console.error("[serverService] Metadata listener failed", error);
            }
        });
    }

    private notifyLogs(): void {
        const snapshot = this.logs.slice();
        this.logListeners.forEach((listener) => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error("[serverService] Log listener failed", error);
            }
        });
    }

    private notifyDiagnostics(): void {
        this.diagnosticsListeners.forEach((listener) => {
            try {
                listener(this.diagnostics);
            } catch (error) {
                console.error("[serverService] Diagnostics listener failed", error);
            }
        });
    }

    private primeDiagnostics(): void {
        if (this.requestedInitialDiagnostics) return;
        if (!this.metadata?.baseUrl) return;
        this.requestedInitialDiagnostics = true;
        this.fetchDiagnostics().catch((error) => {
            this.requestedInitialDiagnostics = false;
            console.warn("[serverService] Initial diagnostics fetch failed", error);
        });
    }
}

export const serverService = new ServerService();