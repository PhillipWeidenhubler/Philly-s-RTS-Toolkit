import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
    FrontendToHostMessageSchema,
    HostToFrontendMessageSchema,
    frontendToHostSamples,
    hostToFrontendSamples
} from "./webviewMessages";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(thisDir, "..", "..", "..", "..");
const contractsDir = path.join(repoRoot, "shared", "contracts");
const schemaPath = path.join(contractsDir, "webview-messages.schema.json");
const samplesPath = path.join(contractsDir, "webview-envelope-samples.json");

describe("webview message contracts", () => {
    it("validates frontend → host sample envelopes", () => {
        frontendToHostSamples.forEach((sample) => {
            expect(() => FrontendToHostMessageSchema.parse(sample)).not.toThrow();
        });
    });

    it("validates host → frontend sample envelopes", () => {
        hostToFrontendSamples.forEach((sample) => {
            expect(() => HostToFrontendMessageSchema.parse(sample)).not.toThrow();
        });
    });

    it("keeps generated schema in sync", () => {
        const diskSchema = JSON.parse(readFileSync(schemaPath, "utf-8"));
        const currentSchema = {
            frontendToHost: zodToJsonSchema(FrontendToHostMessageSchema as any, "FrontendToHostMessage"),
            hostToFrontend: zodToJsonSchema(HostToFrontendMessageSchema as any, "HostToFrontendMessage")
        };
        expect(currentSchema).toEqual(diskSchema);
    });

    it("keeps generated sample envelopes in sync", () => {
        const diskSamples = JSON.parse(readFileSync(samplesPath, "utf-8"));
        expect(diskSamples.frontendToHost).toEqual(frontendToHostSamples);
        expect(diskSamples.hostToFrontend).toEqual(hostToFrontendSamples);
    });
});
