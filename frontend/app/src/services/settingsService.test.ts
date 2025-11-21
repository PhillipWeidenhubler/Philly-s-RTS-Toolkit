import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppSettings } from "../types";

type ListenerMap = Map<string, Set<(payload: unknown) => void>>;

afterEach(() => {
    vi.clearAllMocks();
});

const setupSettingsService = async () => {
    vi.resetModules();
    const listeners: ListenerMap = new Map();
    const hostBridgeMock = {
        isAvailable: true,
        on: vi.fn((type: string, handler: (payload: unknown) => void) => {
            const bucket = listeners.get(type) ?? new Set();
            bucket.add(handler);
            listeners.set(type, bucket);
            return () => bucket.delete(handler);
        }),
        request: vi.fn(),
        postMessage: vi.fn(),
    };

    vi.doMock("../lib/hostBridge", () => ({ hostBridge: hostBridgeMock }));
    const module = await import("./settingsService");

    return {
        settingsService: module.settingsService,
        hostBridgeMock,
        emit: (type: string, payload: unknown) => {
            const bucket = listeners.get(type);
            bucket?.forEach((handler) => handler(payload));
        },
    };
};

describe("settingsService", () => {
    it("updates cache when host pushes payloads", async () => {
        const { settingsService, emit } = await setupSettingsService();
        const updates: AppSettings[] = [];
        settingsService.subscribe((settings) => updates.push(settings));

        emit("settings-data", { theme: "dark" });

        expect(updates).toHaveLength(2);
        expect(updates[1]).toEqual({ theme: "dark" });
        expect(updates[1]).not.toBe(updates[0]);
    });

    it("loads settings via host when available", async () => {
        const { settingsService, hostBridgeMock } = await setupSettingsService();
        hostBridgeMock.request.mockResolvedValue({ locale: "en" });

        const settings = await settingsService.loadSettings();

        expect(hostBridgeMock.request).toHaveBeenCalledWith("get-settings", undefined, "settings-data");
        expect(settings).toEqual({ locale: "en" });
    });

    it("falls back to cached settings when host is unavailable", async () => {
        const { settingsService, hostBridgeMock } = await setupSettingsService();
        hostBridgeMock.isAvailable = false;

        const settings = await settingsService.loadSettings();

        expect(settings).toEqual({});
        expect(hostBridgeMock.request).not.toHaveBeenCalled();
    });

    it("throws when attempting to save offline", async () => {
        const { settingsService, hostBridgeMock } = await setupSettingsService();
        hostBridgeMock.isAvailable = false;

        await expect(settingsService.saveSettings({ theme: "light" })).rejects.toThrow(/Host is unavailable/i);
    });
});
