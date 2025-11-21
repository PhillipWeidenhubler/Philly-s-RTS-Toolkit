import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
    FrontendToHostMessageSchema,
    HostToFrontendMessageSchema,
    frontendToHostSamples,
    hostToFrontendSamples
} from "../src/contracts/webviewMessages";

const repoRoot = path.resolve(__dirname, "../..", "..");
const contractsDir = path.join(repoRoot, "shared", "contracts");
mkdirSync(contractsDir, { recursive: true });

const schemaOutput = {
    frontendToHost: zodToJsonSchema(FrontendToHostMessageSchema as any, "FrontendToHostMessage"),
    hostToFrontend: zodToJsonSchema(HostToFrontendMessageSchema as any, "HostToFrontendMessage")
};

const samplesOutput = {
    frontendToHost: frontendToHostSamples,
    hostToFrontend: hostToFrontendSamples
};

writeFileSync(path.join(contractsDir, "webview-messages.schema.json"), JSON.stringify(schemaOutput, null, 2));
writeFileSync(path.join(contractsDir, "webview-envelope-samples.json"), JSON.stringify(samplesOutput, null, 2));
