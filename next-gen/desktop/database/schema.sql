PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_info (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER NOT NULL,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Domain tables (seed for future normalized model)
CREATE TABLE IF NOT EXISTS nations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS formations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nation_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  role TEXT,
  hq_location TEXT,
  commander TEXT,
  readiness TEXT,
  strength_summary TEXT,
  support_assets TEXT,
  communications TEXT,
  image TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nation_id) REFERENCES nations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS formation_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  formation_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS formation_category_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  unit_id INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES formation_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS formation_children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL,
  child_id INTEGER NOT NULL,
  assignment TEXT,
  strength TEXT,
  notes TEXT,
  readiness TEXT,
  FOREIGN KEY (parent_id) REFERENCES formations(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES formations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price INTEGER,
  category TEXT,
  internal_category TEXT,
  tier TEXT,
  description TEXT,
  image TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unit_stats (
  unit_id INTEGER PRIMARY KEY,
  armor REAL,
  health REAL,
  squad_size REAL,
  visual_range REAL,
  stealth REAL,
  speed REAL,
  weight REAL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unit_capabilities (
  unit_id INTEGER PRIMARY KEY,
  static_line_jump INTEGER,
  halo_haho INTEGER,
  sprint_distance REAL,
  sprint_speed REAL,
  sprint_cooldown REAL,
  laser_designator INTEGER,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unit_grenades (
  unit_id INTEGER PRIMARY KEY,
  smoke INTEGER,
  flash INTEGER,
  thermite INTEGER,
  frag INTEGER,
  total INTEGER,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unit_guns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  caliber TEXT,
  barrel_length REAL,
  range REAL,
  dispersion REAL,
  count INTEGER,
  ammo_per_soldier INTEGER,
  total_ammo INTEGER,
  magazine_size INTEGER,
  reload_speed REAL,
  target_acquisition REAL,
  trajectories TEXT,
  traits TEXT,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unit_gun_ammo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gun_id INTEGER NOT NULL,
  name TEXT,
  ammo_type TEXT,
  ammo_per_soldier INTEGER,
  penetration REAL,
  he_deadliness REAL,
  dispersion REAL,
  range_mod REAL,
  grain REAL,
  notes TEXT,
  airburst INTEGER,
  sub_count INTEGER,
  sub_damage REAL,
  sub_penetration REAL,
  fps REAL,
  FOREIGN KEY (gun_id) REFERENCES unit_guns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unit_gun_fire_modes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gun_id INTEGER NOT NULL,
  name TEXT,
  rounds INTEGER,
  min_range REAL,
  max_range REAL,
  cooldown REAL,
  ammo_ref TEXT,
  FOREIGN KEY (gun_id) REFERENCES unit_guns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS unit_equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  notes TEXT,
  quantity INTEGER,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weapons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  caliber TEXT,
  range REAL,
  muzzle_velocity REAL,
  dispersion REAL,
  barrel_length REAL,
  reload_speed REAL,
  ammo_per_soldier REAL,
  weapon_count REAL,
  magazine_size REAL,
  total_ammo REAL,
  target_acquisition REAL,
  metadata TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ammo_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  caliber TEXT NOT NULL,
  caliber_desc TEXT,
  ammo_type TEXT,
  ammo_per_soldier REAL,
  penetration REAL,
  he_deadliness REAL,
  dispersion REAL,
  range_mod REAL,
  grain REAL,
  notes TEXT,
  airburst INTEGER,
  metadata TEXT,
  sub_count REAL,
  sub_damage REAL,
  sub_penetration REAL,
  fps REAL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, caliber)
);

CREATE TABLE IF NOT EXISTS fire_mode_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rounds REAL,
  min_range REAL,
  max_range REAL,
  cooldown REAL,
  ammo_ref TEXT,
  notes TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS weapon_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(scope, name)
);

INSERT OR IGNORE INTO schema_info (id, version) VALUES (1, 1);
