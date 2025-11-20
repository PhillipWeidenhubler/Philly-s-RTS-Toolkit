export interface UnitStats {
  armor?: number | string;
  health?: number | string;
  squadSize?: number | string;
  visualRange?: number | string;
  stealth?: number | string;
  speed?: number | string;
  weight?: number | string;
}

export interface UnitCapabilities {
  staticLineJump?: boolean | string;
  haloHaho?: boolean | string;
  sprint?: {
    distance?: number | string;
    speed?: number | string;
    cooldown?: number | string;
  };
  laserDesignator?: boolean | string;
}

export interface UnitGrenades {
  smoke?: number | string;
  flash?: number | string;
  thermite?: number | string;
  frag?: number | string;
  total?: number | string;
}

export type SymbolAffiliation = "friendly" | "hostile" | "neutral" | "unknown" | string;
export type SymbolStatus = "present" | "anticipated" | string;
export type SymbolColorMode = "light" | "dark";

export interface SpatialSymbolFields {
  quantity?: string;
  reinforcedReduced?: string;
  staffComments?: string;
  additionalInformation?: string;
  evaluationRating?: string;
  combatEffectiveness?: string;
  signatureEquipment?: string;
  higherFormation?: string;
  hostile?: string;
  iffSif?: string;
  direction?: number | string;
  sigint?: string;
  uniqueDesignation?: string;
  type?: string;
  dtg?: string;
  altitudeDepth?: string;
  location?: string;
  speed?: string;
  speedLeader?: number | string;
  specialHeadquarters?: string;
  country?: string;
  platformType?: string;
  equipmentTeardownTime?: string;
  commonIdentifier?: string;
  auxiliaryEquipmentIndicator?: string;
  headquartersElement?: string;
  installationComposition?: string;
  engagementBar?: string;
  engagementType?: string;
  guardedUnit?: string;
  specialDesignator?: string;
}

export interface SpatialSymbolStyle {
  alternateMedal?: boolean;
  civilianColor?: boolean;
  colorMode?: "Light" | "Dark" | "Frame" | "Medium" | "Black" | "White";
  fill?: boolean;
  fillColor?: string;
  fillOpacity?: number;
  fontfamily?: string;
  frame?: boolean;
  frameColor?: string;
  hqStaffLength?: number;
  icon?: boolean;
  iconColor?: string;
  infoBackground?: string;
  infoBackgroundFrame?: string;
  infoColor?: string;
  infoFields?: boolean;
  infoOutlineColor?: string;
  infoOutlineWidth?: number | boolean;
  infoSize?: number;
  monoColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  padding?: number;
  simpleStatusModifier?: boolean;
  size?: number;
  square?: boolean;
  standard?: string;
  strokeWidth?: number;
}

export interface MilitarySymbol {
  sidc: string;
  affiliation?: SymbolAffiliation;
  status?: SymbolStatus;
  echelon?: string;
  uniqueDesignation?: string;
  higherFormation?: string;
  colorMode?: SymbolColorMode;
  modifiers?: Record<string, string>;
  fields?: SpatialSymbolFields;
  style?: SpatialSymbolStyle;
}

export interface Gun {
  name?: string;
  category?: string;
  caliber?: string;
  barrelLength?: number | string;
  range?: number | string;
  dispersion?: number | string;
  count?: number | string;
  ammoPerSoldier?: number | string;
  totalAmmo?: number | string;
  magazineSize?: number | string;
  reloadSpeed?: number | string;
  targetAcquisition?: number | string;
  muzzleVelocity?: number | string;
  heDeadliness?: number | string;
  trajectories?: string[];
  traits?: string[];
  ammoTypes?: GunAmmo[];
  fireModes?: GunFireMode[];
}

export interface WeaponTemplate extends Gun {
  id?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface GunAmmo {
  caliber?: string;
  name?: string;
  ammoType?: string;
  ammoPerSoldier?: number | string;
  penetration?: number | string;
  heDeadliness?: number | string;
  dispersion?: number | string;
  rangeMod?: number | string;
  grain?: number | string;
  notes?: string;
  airburst?: boolean | string;
  subCount?: number | string;
  subDamage?: number | string;
  subPenetration?: number | string;
  fps?: number | string;
  caliberDesc?: string;
}

export interface AmmoTemplate extends GunAmmo {
  id?: number;
}

export interface GunFireMode {
  name?: string;
  rounds?: number | string;
  minRange?: number | string;
  maxRange?: number | string;
  cooldown?: number | string;
  ammoRef?: string;
  notes?: string;
}

export interface FireModeTemplate extends GunFireMode {
  id?: number;
}

export interface Equipment {
  name?: string;
  type?: string;
  description?: string;
  notes?: string;
  count?: number | string;
}

export interface Unit {
  id?: number;
  name?: string;
  price?: number | string;
  category?: string;
  internalCategory?: string;
  tier?: string;
  description?: string;
  image?: string;
  stats?: UnitStats;
  capabilities?: UnitCapabilities;
  grenades?: UnitGrenades;
  guns?: Gun[];
  equipment?: Equipment[];
  symbol?: MilitarySymbol;
}

export interface FormationCategory {
  name?: string;
  units?: number[];
}

export interface SubFormationAttachment {
  formationId?: number;
  assignment?: string;
  strength?: string;
  readiness?: string;
  notes?: string;
}

export interface Formation {
  id?: number;
  name?: string;
  role?: string;
  hqLocation?: string;
  commander?: string;
  readiness?: string;
  strengthSummary?: string;
  supportAssets?: string;
  communications?: string;
  description?: string;
  image?: string;
  categories?: FormationCategory[];
  subFormations?: number[];
  subFormationLinks?: SubFormationAttachment[];
  symbol?: MilitarySymbol;
}

export interface Nation {
  id?: number;
  name?: string;
  description?: string;
  image?: string;
  formations?: number[];
  symbol?: MilitarySymbol;
}

export interface AppSettings {
  theme?: string;
  locale?: string;
  accentColor?: string;
  enableExperimental?: boolean;
  [key: string]: unknown;
}

export interface WeaponTagMap {
  categories?: Record<string, string>;
  calibers?: Record<string, string>;
}

export interface Payload {
  data: {
    units?: Unit[];
    formations?: Formation[];
    nations?: Nation[];
  };
  weapons?: WeaponTemplate[] | Record<string, unknown>;
  ammo?: AmmoTemplate[] | Record<string, unknown>;
  fireModes?: FireModeTemplate[] | Record<string, unknown>;
  weaponTags?: WeaponTagMap;
  settings?: AppSettings;
}
