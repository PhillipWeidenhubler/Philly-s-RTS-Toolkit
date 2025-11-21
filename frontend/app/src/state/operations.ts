import type {
    AmmoTemplate,
    AppSettings,
    FireModeTemplate,
    Formation,
    Nation,
    Unit,
    WeaponTagMap,
    WeaponTemplate,
} from "../types";
import { invokeRequest } from "./apiClient";
import {
    ammoEnvelopeSchema,
    fireModesEnvelopeSchema,
    formationsEnvelopeSchema,
    nationsEnvelopeSchema,
    settingsSchema,
    unitsEnvelopeSchema,
    weaponTagsSchema,
    weaponsEnvelopeSchema,
} from "./schemas";
import type {
    AmmoEnvelope,
    FireModesEnvelope,
    FormationsEnvelope,
    NationsEnvelope,
    SettingsPayload,
    UnitsEnvelope,
    WeaponTagsPayload,
    WeaponsEnvelope,
} from "./schemas";
import { sandboxHandlers } from "./sandbox";

export async function fetchUnits(): Promise<Unit[]> {
    const envelope = await invokeRequest<undefined, UnitsEnvelope>({
        type: "get-units",
        responseType: "units-data",
        schema: unitsEnvelopeSchema,
        sandbox: sandboxHandlers.getUnits,
    });
    return (envelope.units ?? []) as Unit[];
}

export async function saveUnit(unit: Unit): Promise<Unit[]> {
    const envelope = await invokeRequest<{ unit: Unit }, UnitsEnvelope>({
        type: "save-unit",
        responseType: "units-data",
        payload: { unit },
        schema: unitsEnvelopeSchema,
        sandbox: () => sandboxHandlers.saveUnit(unit),
    });
    return (envelope.units ?? []) as Unit[];
}

export async function deleteUnit(unitId: number): Promise<Unit[]> {
    const envelope = await invokeRequest<{ id: number }, UnitsEnvelope>({
        type: "delete-unit",
        responseType: "units-data",
        payload: { id: unitId },
        schema: unitsEnvelopeSchema,
        sandbox: () => sandboxHandlers.deleteUnit(unitId),
    });
    return (envelope.units ?? []) as Unit[];
}

export async function fetchFormations(): Promise<Formation[]> {
    const envelope = await invokeRequest<undefined, FormationsEnvelope>({
        type: "get-formations",
        responseType: "formations-data",
        schema: formationsEnvelopeSchema,
        sandbox: sandboxHandlers.getFormations,
    });
    return (envelope.formations ?? []) as Formation[];
}

export async function saveFormations(formations: Formation[]): Promise<Formation[]> {
    const envelope = await invokeRequest<{ formations: Formation[] }, FormationsEnvelope>({
        type: "save-formations",
        responseType: "formations-data",
        payload: { formations },
        schema: formationsEnvelopeSchema,
        sandbox: () => sandboxHandlers.saveFormations(formations),
    });
    return (envelope.formations ?? []) as Formation[];
}

export async function fetchNations(): Promise<Nation[]> {
    const envelope = await invokeRequest<undefined, NationsEnvelope>({
        type: "get-nations",
        responseType: "nations-data",
        schema: nationsEnvelopeSchema,
        sandbox: sandboxHandlers.getNations,
    });
    return (envelope.nations ?? []) as Nation[];
}

export async function saveNations(nations: Nation[]): Promise<Nation[]> {
    const envelope = await invokeRequest<{ nations: Nation[] }, NationsEnvelope>({
        type: "save-nations",
        responseType: "nations-data",
        payload: { nations },
        schema: nationsEnvelopeSchema,
        sandbox: () => sandboxHandlers.saveNations(nations),
    });
    return (envelope.nations ?? []) as Nation[];
}

export async function fetchWeapons(): Promise<WeaponTemplate[]> {
    const envelope = await invokeRequest<undefined, WeaponsEnvelope>({
        type: "get-weapons",
        responseType: "weapons-data",
        schema: weaponsEnvelopeSchema,
        sandbox: sandboxHandlers.getWeapons,
    });
    return (envelope.weapons ?? []) as WeaponTemplate[];
}

export async function saveWeapons(weapons: WeaponTemplate[]): Promise<WeaponTemplate[]> {
    const envelope = await invokeRequest<{ weapons: WeaponTemplate[] }, WeaponsEnvelope>({
        type: "save-weapons",
        responseType: "weapons-data",
        payload: { weapons },
        schema: weaponsEnvelopeSchema,
        sandbox: () => sandboxHandlers.saveWeapons(weapons),
    });
    return (envelope.weapons ?? []) as WeaponTemplate[];
}

export async function fetchAmmo(): Promise<AmmoTemplate[]> {
    const envelope = await invokeRequest<undefined, AmmoEnvelope>({
        type: "get-ammo",
        responseType: "ammo-data",
        schema: ammoEnvelopeSchema,
        sandbox: sandboxHandlers.getAmmo,
    });
    return (envelope.ammo ?? []) as AmmoTemplate[];
}

export async function saveAmmo(ammo: AmmoTemplate[]): Promise<AmmoTemplate[]> {
    const envelope = await invokeRequest<{ ammo: AmmoTemplate[] }, AmmoEnvelope>({
        type: "save-ammo",
        responseType: "ammo-data",
        payload: { ammo },
        schema: ammoEnvelopeSchema,
        sandbox: () => sandboxHandlers.saveAmmo(ammo),
    });
    return (envelope.ammo ?? []) as AmmoTemplate[];
}

export async function fetchFireModes(): Promise<FireModeTemplate[]> {
    const envelope = await invokeRequest<undefined, FireModesEnvelope>({
        type: "get-fire-modes",
        responseType: "fire-modes-data",
        schema: fireModesEnvelopeSchema,
        sandbox: sandboxHandlers.getFireModes,
    });
    return (envelope.fireModes ?? []) as FireModeTemplate[];
}

export async function saveFireModes(fireModes: FireModeTemplate[]): Promise<FireModeTemplate[]> {
    const envelope = await invokeRequest<{ fireModes: FireModeTemplate[] }, FireModesEnvelope>({
        type: "save-fire-modes",
        responseType: "fire-modes-data",
        payload: { fireModes },
        schema: fireModesEnvelopeSchema,
        sandbox: () => sandboxHandlers.saveFireModes(fireModes),
    });
    return (envelope.fireModes ?? []) as FireModeTemplate[];
}

export async function fetchWeaponTags(): Promise<WeaponTagMap> {
    const payload = await invokeRequest<undefined, WeaponTagsPayload>({
        type: "get-weapon-tags",
        responseType: "weapon-tags-data",
        schema: weaponTagsSchema,
        sandbox: sandboxHandlers.getWeaponTags,
    });
    return (payload ?? { categories: {}, calibers: {} }) as WeaponTagMap;
}

export async function saveWeaponTags(tags: WeaponTagMap): Promise<WeaponTagMap> {
    const payload = await invokeRequest<WeaponTagMap, WeaponTagsPayload>({
        type: "save-weapon-tags",
        responseType: "weapon-tags-data",
        payload: tags,
        schema: weaponTagsSchema,
        sandbox: () => sandboxHandlers.saveWeaponTags(tags),
    });
    return (payload ?? { categories: {}, calibers: {} }) as WeaponTagMap;
}

export async function fetchSettings(): Promise<AppSettings> {
    const payload = await invokeRequest<undefined, SettingsPayload>({
        type: "get-settings",
        responseType: "settings-data",
        schema: settingsSchema,
        sandbox: sandboxHandlers.getSettings,
    });
    return (payload ?? {}) as AppSettings;
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
    const payload = await invokeRequest<AppSettings, SettingsPayload>({
        type: "save-settings",
        responseType: "settings-data",
        payload: settings,
        schema: settingsSchema,
        sandbox: () => sandboxHandlers.saveSettings(settings),
    });
    return (payload ?? {}) as AppSettings;
}
