import "./styles/main.scss";
import { hostBridge } from "./lib/hostBridge";
import { UnitEditor } from "./modules/unitEditor";
import { FormationsPanel } from "./modules/formationsPanel";
import { NationsPanel } from "./modules/nationsPanel";
import { SettingsPanel } from "./modules/settingsPanel";
import { StatsPanel } from "./modules/statsPanel";
import { TemplatesPanel } from "./modules/templatesPanel";
import { unitService } from "./services/unitService";
import { formationService } from "./services/formationService";
import { nationService } from "./services/nationService";
import { settingsService } from "./services/settingsService";
import { applyTheme } from "./lib/theme";

type PanelDefinition = {
  key: string;
  label: string;
  description: string;
  group: "Editors" | "Insights" | "Settings";
  factory: (container: HTMLElement) => { init: () => void | Promise<void> };
};

const panels: PanelDefinition[] = [
  {
    key: "nations",
    label: "Nations",
    description: "Assign formations to nations",
    group: "Editors",
    factory: (container) => new NationsPanel(container),
  },
  {
    key: "formations",
    label: "Formations",
    description: "Structure categories per formation",
    group: "Editors",
    factory: (container) => new FormationsPanel(container),
  },
  {
    key: "units",
    label: "Units",
    description: "Edit and score tactical units",
    group: "Editors",
    factory: (container) => new UnitEditor(container),
  },
  {
    key: "templates",
    label: "Templates",
    description: "Manage weapon & ammo presets",
    group: "Editors",
    factory: (container) => new TemplatesPanel(container),
  },
  {
    key: "insights",
    label: "Insights",
    description: "Force readiness overview",
    group: "Insights",
    factory: (container) => new StatsPanel(container),
  },
  {
    key: "settings",
    label: "Settings",
    description: "Application preferences",
    group: "Settings",
    factory: (container) => new SettingsPanel(container),
  },
];

const root = document.querySelector<HTMLDivElement>("#app");

if (root) {
  root.innerHTML = `
    <div class="app-layout">
      <aside class="primary-nav">
        <div class="brand">
          <span class="eyebrow">Operations Toolbar</span>
          <h1>Philly's RTS Toolkit</h1>
        </div>
        <nav class="nav-sections" data-role="nav-container"></nav>
      </aside>
      <main class="view-host" data-role="view-host"></main>
    </div>
  `;

  const navContainer = root.querySelector<HTMLElement>('[data-role="nav-container"]')!;
  const host = root.querySelector<HTMLElement>('[data-role="view-host"]')!;
  const instances = new Map<string, { node: HTMLElement }>();
  const navBadges = new Map<string, HTMLElement>();
  const groupLists = new Map<string, HTMLElement>();

  panels.forEach((panel, index) => {
    let list = groupLists.get(panel.group);
    if (!list) {
      const section = document.createElement("div");
      section.className = "nav-section";
      const label = document.createElement("p");
      label.className = "section-label";
      label.textContent = panel.group;
      list = document.createElement("div");
      list.className = "nav-list";
      section.append(label, list);
      navContainer.appendChild(section);
      groupLists.set(panel.group, list);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nav-chip";
    button.dataset.panel = panel.key;
    button.innerHTML = `
      <div class="nav-chip-head">
        <span class="label">${panel.label}</span>
        <span class="badge" data-panel-count="${panel.key}">--</span>
      </div>
      <span class="meta">${panel.description}</span>
    `;
    list!.appendChild(button);
    const badge = button.querySelector<HTMLElement>(`[data-panel-count="${panel.key}"]`);
    if (badge) navBadges.set(panel.key, badge);

    const section = document.createElement("section");
    section.className = "view-panel";
    section.dataset.panel = panel.key;
    host.appendChild(section);

    const controller = panel.factory(section);
    Promise.resolve(controller.init()).catch((error) => {
      console.error(`Failed to init ${panel.key}`, error);
    });

    instances.set(panel.key, { node: section });

    if (index === 0) {
      button.classList.add("active");
      section.classList.add("active");
    }
  });

  navContainer.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".nav-chip");
    if (!button) return;
    const panelKey = button.dataset.panel;
    if (!panelKey) return;

    navContainer.querySelectorAll(".nav-chip").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");

    host.querySelectorAll(".view-panel").forEach((panel) => panel.classList.remove("active"));
    instances.get(panelKey)?.node.classList.add("active");
  });

  const updateBadge = (key: string, value: string) => {
    const el = navBadges.get(key);
    if (el) el.textContent = value;
  };

  unitService.subscribe((units) => updateBadge("units", `${units.length} units`));
  formationService.subscribe((formations) => updateBadge("formations", `${formations.length} groups`));
  nationService.subscribe((nations) => updateBadge("nations", `${nations.length} nations`));
  settingsService.subscribe((settings) => {
    updateBadge("settings", settings.theme ? settings.theme : "System");
    applyTheme(settings);
  });
  updateBadge("insights", "Live metrics");

  unitService.loadUnits().catch(() => undefined);
  formationService.loadFormations().catch(() => undefined);
  nationService.loadNations().catch(() => undefined);
  settingsService.loadSettings().catch(() => undefined);
}

if (hostBridge.isAvailable) {
  hostBridge.postMessage("host-info-request");
  hostBridge.waitFor<{ version?: string; mode?: string }>("host-info", 2000).then((info) => {
    console.info("[Host]", info);
  });
}
