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

export interface GunAmmo {
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

export interface GunFireMode {
  name?: string;
  rounds?: number | string;
  burstDuration?: number | string;
  cooldown?: number | string;
  ammoRef?: string;
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
}

export interface FormationCategory {
  name?: string;
  units?: number[];
}

export interface Formation {
  id?: number;
  name?: string;
  description?: string;
  image?: string;
  categories?: FormationCategory[];
  subFormations?: number[];
}

export interface Nation {
  id?: number;
  name?: string;
  description?: string;
  image?: string;
  formations?: number[];
}

export interface AppSettings {
  theme?: string;
  locale?: string;
  accentColor?: string;
  enableExperimental?: boolean;
  [key: string]: unknown;
}

export interface Payload {
  data: {
    units?: Unit[];
    formations?: Formation[];
    nations?: Nation[];
  };
  weapons?: Record<string, unknown>;
  ammo?: Record<string, unknown>;
  weaponTags?: {
    categories?: Record<string, string>;
    calibers?: Record<string, string>;
  };
  settings?: AppSettings;
}
