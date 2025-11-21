# Messaging Contracts
Envelope: { type: string, payload?: any }

Lifecycle: load, save, request-load, host-info-request/host-info.

Domain:
Units: get-units, units-data, save-unit, delete-unit
Formations: get-formations, save-formations
Nations: get-nations, save-nations
Settings: get-settings, save-settings
Weapons: get-weapons, save-weapons
Ammo: get-ammo, save-ammo
Fire Modes: get-fire-modes, save-fire-modes
Weapon Tags: get-weapon-tags, save-weapon-tags

Add message: extend switch (CoreWebView2_WebMessageReceived) + new TS service + UI wiring.
