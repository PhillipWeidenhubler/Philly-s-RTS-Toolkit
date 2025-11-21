export const TRAJECTORY_OPTIONS = [
    { label: "Direct (LOS)", value: "direct_los" },
    { label: "Direct (NLOS)", value: "direct_nlos" },
    { label: "Indirect (LOS)", value: "indirect_los" },
    { label: "Indirect (NLOS)", value: "indirect_nlos" },
];

export const WEAPON_TRAIT_GROUPS = [
    [
        { label: "Single Shot (Disposable)", value: "single_shot" },
        { label: "Suppressed", value: "suppressed" },
    ],
    [
        { label: "MOR", value: "mor" },
        { label: "GL", value: "gl" },
        { label: "AGL", value: "agl" },
        { label: "LAW", value: "law" },
        { label: "RR", value: "rr" },
        { label: "ATGM", value: "atgm" },
        { label: "MANPADS", value: "manpads" },
    ],
];

export const HEAVY_TRAIT_VALUES = new Set(["law", "rr", "atgm", "manpads"]);
