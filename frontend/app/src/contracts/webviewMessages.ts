import { z } from "zod";

const unitSchema = z
    .object({
        id: z.number().int().optional(),
        name: z.string().optional(),
        tags: z.array(z.string()).optional()
    })
    .passthrough();

const formationSchema = z
    .object({
        id: z.number().int().optional(),
        name: z.string().optional(),
        nationId: z.number().int().optional()
    })
    .passthrough();

const nationSchema = z
    .object({
        id: z.number().int().optional(),
        name: z.string().optional()
    })
    .passthrough();

const weaponSchema = z
    .object({
        id: z.number().int().optional(),
        name: z.string().optional(),
        ammoId: z.string().optional()
    })
    .passthrough();

const ammoSchema = z
    .object({
        id: z.number().int().optional(),
        name: z.string().optional()
    })
    .passthrough();

const fireModeSchema = z
    .object({
        id: z.number().int().optional(),
        name: z.string().optional()
    })
    .passthrough();

const weaponTagsSchema = z.record(z.string(), z.any());
const settingsSchema = z.record(z.string(), z.unknown());

const dataSectionSchema = z
    .object({
        units: z.array(unitSchema).optional(),
        formations: z.array(formationSchema).optional(),
        nations: z.array(nationSchema).optional()
    })
    .passthrough();

const payloadSchema = z
    .object({
        data: dataSectionSchema.optional(),
        weapons: z.array(weaponSchema).optional(),
        ammo: z.array(ammoSchema).optional(),
        fireModes: z.array(fireModeSchema).optional(),
        weaponTags: weaponTagsSchema.optional(),
        settings: settingsSchema.optional()
    })
    .passthrough();

const serverLogEntrySchema = z.object({
    timestamp: z.string().optional(),
    level: z.string().optional(),
    category: z.string().optional(),
    message: z.string(),
    exception: z.string().nullable().optional(),
    statusCode: z.number().int().nullable().optional(),
    durationMs: z.number().nullable().optional()
});

const hostInfoSchema = z.object({
    version: z.string(),
    databasePath: z.string(),
    dataDirectory: z.string(),
    mode: z.string(),
    server: z
        .object({
            baseUrl: z.string().optional(),
            port: z.number().optional(),
            token: z.string().optional(),
            startedAt: z.string().optional()
        })
        .passthrough()
        .optional()
});

const emptyObject = z.object({}).passthrough();

const voidMessage = (type: string) =>
    z.object({
        type: z.literal(type)
    });

const dataWrapped = <T extends z.ZodTypeAny>(type: string, property: string, schema: T) =>
    z.object({
        type: z.literal(type),
        payload: z.object({ [property]: z.array(schema).optional() }).passthrough()
    });

const passThroughPayload = <T extends z.ZodTypeAny>(type: string, schema: T | typeof emptyObject = emptyObject) =>
    z.object({
        type: z.literal(type),
        payload: schema as T
    });

export const FrontendToHostMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("save"),
        payload: payloadSchema
    }),
    voidMessage("request-load"),
    voidMessage("host-info-request"),
    voidMessage("get-units"),
    z.object({
        type: z.literal("save-unit"),
        payload: z.object({ unit: unitSchema })
    }),
    z.object({
        type: z.literal("delete-unit"),
        payload: z.object({ id: z.number().int() })
    }),
    voidMessage("get-formations"),
    z.object({
        type: z.literal("save-formations"),
        payload: z.object({ formations: z.array(formationSchema) })
    }),
    voidMessage("get-nations"),
    z.object({
        type: z.literal("save-nations"),
        payload: z.object({ nations: z.array(nationSchema) })
    }),
    voidMessage("get-settings"),
    z.object({
        type: z.literal("save-settings"),
        payload: settingsSchema
    }),
    voidMessage("get-weapons"),
    z.object({
        type: z.literal("save-weapons"),
        payload: z.object({ weapons: z.array(weaponSchema) })
    }),
    voidMessage("get-ammo"),
    z.object({
        type: z.literal("save-ammo"),
        payload: z.object({ ammo: z.array(ammoSchema) })
    }),
    voidMessage("get-fire-modes"),
    z.object({
        type: z.literal("save-fire-modes"),
        payload: z.object({ fireModes: z.array(fireModeSchema) })
    }),
    voidMessage("get-weapon-tags"),
    z.object({
        type: z.literal("save-weapon-tags"),
        payload: weaponTagsSchema
    }),
    voidMessage("get-server-logs")
]);

export const HostToFrontendMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("load"),
        payload: payloadSchema
    }),
    dataWrapped("units-data", "units", unitSchema),
    dataWrapped("formations-data", "formations", formationSchema),
    dataWrapped("nations-data", "nations", nationSchema),
    passThroughPayload("settings-data", settingsSchema),
    dataWrapped("weapons-data", "weapons", weaponSchema),
    dataWrapped("ammo-data", "ammo", ammoSchema),
    dataWrapped("fire-modes-data", "fireModes", fireModeSchema),
    passThroughPayload("weapon-tags-data", weaponTagsSchema),
    passThroughPayload("host-info", hostInfoSchema),
    passThroughPayload("server-logs", z.object({ entries: z.array(serverLogEntrySchema) })),
    passThroughPayload("server-log-event", serverLogEntrySchema)
]);

export type FrontendToHostMessage = z.infer<typeof FrontendToHostMessageSchema>;
export type HostToFrontendMessage = z.infer<typeof HostToFrontendMessageSchema>;

export const frontendToHostSamples: FrontendToHostMessage[] = [
    { type: "save", payload: { data: { units: [] }, weapons: [], ammo: [], fireModes: [], weaponTags: {}, settings: {} } },
    { type: "request-load" },
    { type: "host-info-request" },
    { type: "get-units" },
    { type: "save-unit", payload: { unit: { id: 1, name: "Infantry" } } },
    { type: "delete-unit", payload: { id: 1 } },
    { type: "get-nations" },
    { type: "save-nations", payload: { nations: [{ id: 1, name: "Allied" }] } },
    { type: "get-formations" },
    { type: "save-formations", payload: { formations: [{ id: 1, name: "Line", nationId: 1 }] } },
    { type: "get-settings" },
    { type: "save-settings", payload: { theme: "dark" } },
    { type: "get-weapons" },
    { type: "save-weapons", payload: { weapons: [{ id: 1, name: "Rifle" }] } },
    { type: "get-ammo" },
    { type: "save-ammo", payload: { ammo: [{ id: 1, name: "5.56mm" }] } },
    { type: "get-fire-modes" },
    { type: "save-fire-modes", payload: { fireModes: [{ id: 1, name: "Burst" }] } },
    { type: "get-weapon-tags" },
    { type: "save-weapon-tags", payload: { automatic: true } },
    { type: "get-server-logs" }
];

export const hostToFrontendSamples: HostToFrontendMessage[] = [
    { type: "load", payload: { data: { units: [] }, weapons: [], ammo: [], fireModes: [], weaponTags: {}, settings: {} } },
    { type: "units-data", payload: { units: [{ id: 1, name: "Infantry" }] } },
    { type: "formations-data", payload: { formations: [{ id: 1, name: "Line" }] } },
    { type: "nations-data", payload: { nations: [{ id: 1, name: "Allied" }] } },
    { type: "settings-data", payload: { theme: "dark" } },
    { type: "weapons-data", payload: { weapons: [{ id: 1, name: "Rifle" }] } },
    { type: "ammo-data", payload: { ammo: [{ id: 1, name: "5.56mm" }] } },
    { type: "fire-modes-data", payload: { fireModes: [{ id: 1, name: "Burst" }] } },
    { type: "weapon-tags-data", payload: { automatic: true } },
    {
        type: "host-info",
        payload: { version: "1.0.0", databasePath: "db", dataDirectory: "data", mode: "dist" }
    },
    { type: "server-logs", payload: { entries: [{ message: "boot complete" }] } },
    { type: "server-log-event", payload: { message: "boot complete" } }
];
