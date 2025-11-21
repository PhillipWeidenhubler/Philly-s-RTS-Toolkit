# Data Model

## Units Tables
units, unit_stats, unit_capabilities, unit_grenades, unit_guns, unit_gun_ammo, unit_gun_fire_modes, unit_equipment.
Bulk rewrite today; single-unit upsert via save-unit.

## Formations
formations, formation_categories, formation_category_units, formation_children (hierarchy links + attachments metadata).

## Nations
nations with formations.nation_id foreign key (nullable).

## Armory
weapons (payload/metadata JSON snapshot), ammo_templates, fire_mode_templates, weapon_tags (scope: categories|calibers).

## Backups
JSON files in `database/json/`: `state.json` plus the decomposed arrays (`units.json`, `formations.json`, `nations.json`, `weapons.json`, `ammo.json`, `fireModes.json`, `weaponTags.json`).
