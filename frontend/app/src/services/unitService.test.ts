import { afterEach, describe, expect, it, vi } from "vitest";
import type { Unit } from "../types";

type ListenerMap = Map<string, Set<(payload: unknown) => void>>;

afterEach(() => {
    vi.clearAllMocks();
});

const setupUnitService = async () => {
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
    const module = await import("./unitService");

    return {
        unitService: module.unitService,
        hostBridgeMock,
        emit: (type: string, payload: unknown) => {
            const bucket = listeners.get(type);
            bucket?.forEach((handler) => handler(payload));
        },
    };
};

describe("unitService", () => {
    it("shares host payloads with subscribers", async () => {
        const { unitService, emit } = await setupUnitService();
        const updates: Unit[][] = [];
        unitService.subscribe((units) => updates.push(units));

        const payload: Unit[] = [{ id: 1, name: "Atlas" }];
        emit("units-data", { units: payload });

        expect(updates).toHaveLength(2);
        expect(updates[1]).toEqual(payload);
        expect(updates[1][0]).not.toBe(payload[0]);
    });

    it("loads units via host bridge when available", async () => {
        const { unitService, hostBridgeMock } = await setupUnitService();
        const payload: Unit[] = [{ id: 2, name: "Borealis" }];
        hostBridgeMock.request.mockResolvedValue({ units: payload });

        const result = await unitService.loadUnits();

        expect(hostBridgeMock.request).toHaveBeenCalledWith("get-units", undefined, "units-data");
        expect(result).toEqual(payload);
    });

    it("returns cached units when host is unavailable", async () => {
        const { unitService, hostBridgeMock } = await setupUnitService();
        hostBridgeMock.isAvailable = false;

        const result = await unitService.loadUnits();

        expect(result).toEqual([]);
        expect(hostBridgeMock.request).not.toHaveBeenCalled();
    });

    it("throws when attempting to persist while host is offline", async () => {
        const { unitService, hostBridgeMock } = await setupUnitService();
        hostBridgeMock.isAvailable = false;

        await expect(unitService.saveUnit({ id: 3, name: "Crusader" })).rejects.toThrow(/Host is unavailable/i);
    });
});
