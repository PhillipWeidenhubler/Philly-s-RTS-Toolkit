import { z } from "zod";

const numberLike = z.union([z.number(), z.string()]);
const nullableString = z.union([z.string(), z.null(), z.undefined()]);
const jsonValue: z.ZodType<unknown> = z.lazy(() =>
    z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined(), z.array(jsonValue), z.record(jsonValue)])
);

const gunAmmoSchema = z
    .object({
        name: nullableString,
        ammoType: nullableString,
        ammoPerSoldier: numberLike.optional(),
        penetration: numberLike.optional(),
        heDeadliness: numberLike.optional(),
        dispersion: numberLike.optional(),
        rangeMod: numberLike.optional(),
        grain: numberLike.optional(),
        notes: nullableString,
        airburst: z.union([z.boolean(), z.string()]).optional(),
        subCount: numberLike.optional(),
        subDamage: numberLike.optional(),
        subPenetration: numberLike.optional(),
        fps: numberLike.optional(),
    })
    .partial()
    .passthrough();

const gunFireModeSchema = z
    .object({
        name: nullableString,
        rounds: numberLike.optional(),
        minRange: numberLike.optional(),
        maxRange: numberLike.optional(),
        cooldown: numberLike.optional(),
        ammoRef: nullableString,
        notes: nullableString,
    })
    .partial()
    .passthrough();

const gunSchema = z
    .object({
        id: z.number().optional(),
        name: nullableString,
        category: nullableString,
        caliber: nullableString,
        barrelLength: numberLike.optional(),
        range: numberLike.optional(),
        dispersion: numberLike.optional(),
        count: numberLike.optional(),
        ammoPerSoldier: numberLike.optional(),
        totalAmmo: numberLike.optional(),
        magazineSize: numberLike.optional(),
        reloadSpeed: numberLike.optional(),
        targetAcquisition: numberLike.optional(),
        ammoTypes: z.array(gunAmmoSchema).optional(),
        fireModes: z.array(gunFireModeSchema).optional(),
    })
    .partial()
    .passthrough();

const equipmentSchema = z
    .object({
        name: nullableString,
        type: nullableString,
        description: nullableString,
        notes: nullableString,
        count: numberLike.optional(),
    })
    .partial()
    .passthrough();

const unitSchema = z
    .object({
        id: z.number().optional(),
        name: nullableString,
        price: numberLike.optional(),
        category: nullableString,
        internalCategory: nullableString,
        tier: nullableString,
        description: nullableString,
        image: nullableString,
        stats: z.record(jsonValue).optional(),
        capabilities: z.record(jsonValue).optional(),
        grenades: z.record(jsonValue).optional(),
        guns: z.array(gunSchema).optional(),
        equipment: z.array(equipmentSchema).optional(),
        symbol: z.record(jsonValue).optional(),
    })
    .partial()
    .passthrough();

const formationCategorySchema = z
    .object({
        id: z.number().optional(),
        name: nullableString,
        units: z.array(numberLike).optional(),
    })
    .partial()
    .passthrough();

const formationSchema = z
    .object({
        id: z.number().optional(),
        nationId: numberLike.optional(),
        name: nullableString,
        role: nullableString,
        hqLocation: nullableString,
        commander: nullableString,
        readiness: nullableString,
        strengthSummary: nullableString,
        supportAssets: nullableString,
        communications: nullableString,
        description: nullableString,
        image: nullableString,
        categories: z.array(formationCategorySchema).optional(),
        subFormations: z.array(numberLike).optional(),
        subFormationLinks: z.array(z.record(jsonValue)).optional(),
        symbol: z.record(jsonValue).optional(),
    })
    .partial()
    .passthrough();

const nationSchema = z
    .object({
        id: z.number().optional(),
        name: nullableString,
        description: nullableString,
        image: nullableString,
        formations: z.array(numberLike).optional(),
        symbol: z.record(jsonValue).optional(),
    })
    .partial()
    .passthrough();

const weaponTemplateSchema = z
    .object({
        id: z.number().optional(),
        name: nullableString,
        category: nullableString,
        caliber: nullableString,
        metadata: z.record(jsonValue).optional(),
        payload: z.record(jsonValue).optional(),
        fireModes: z.array(gunFireModeSchema).optional(),
        ammoTypes: z.array(gunAmmoSchema).optional(),
    })
    .partial()
    .passthrough();

const ammoTemplateSchema = gunAmmoSchema.extend({ id: z.number().optional() });
const fireModeTemplateSchema = gunFireModeSchema.extend({ id: z.number().optional() });

export const unitsEnvelopeSchema = z.object({ units: z.array(unitSchema).optional() });
export const formationsEnvelopeSchema = z.object({ formations: z.array(formationSchema).optional() });
export const nationsEnvelopeSchema = z.object({ nations: z.array(nationSchema).optional() });
export const weaponsEnvelopeSchema = z.object({ weapons: z.array(weaponTemplateSchema).optional() });
export const ammoEnvelopeSchema = z.object({ ammo: z.array(ammoTemplateSchema).optional() });
export const fireModesEnvelopeSchema = z.object({ fireModes: z.array(fireModeTemplateSchema).optional() });
export const weaponTagsSchema = z
    .object({
        categories: z.record(z.string()).optional().default({}),
        calibers: z.record(z.string()).optional().default({}),
    })
    .partial()
    .passthrough();
export const settingsSchema = z.record(jsonValue).default({});

export type UnitsEnvelope = z.infer<typeof unitsEnvelopeSchema>;
export type FormationsEnvelope = z.infer<typeof formationsEnvelopeSchema>;
export type NationsEnvelope = z.infer<typeof nationsEnvelopeSchema>;
export type WeaponsEnvelope = z.infer<typeof weaponsEnvelopeSchema>;
export type AmmoEnvelope = z.infer<typeof ammoEnvelopeSchema>;
export type FireModesEnvelope = z.infer<typeof fireModesEnvelopeSchema>;
export type WeaponTagsPayload = z.infer<typeof weaponTagsSchema>;
export type SettingsPayload = z.infer<typeof settingsSchema>;
