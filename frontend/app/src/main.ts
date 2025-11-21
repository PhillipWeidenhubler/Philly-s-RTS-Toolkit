import "./styles/.generated/main.css";
import { hostBridge } from "./lib/hostBridge";
import { UnitEditor } from "./modules/unitEditor";
import { FormationsPanel } from "./modules/formationsPanel";
import { NationsPanel } from "./modules/nationsPanel";
import { SettingsPanel } from "./modules/settingsPanel";
import { TemplatesPanel } from "./modules/templatesPanel";
import { DiagnosticsPanel } from "./modules/diagnosticsPanel";
import { unitService } from "./services/unitService";
import { formationService } from "./services/formationService";
import { nationService } from "./services/nationService";
import { settingsService } from "./services/settingsService";
import { serverService } from "./services/serverService";
import { applyTheme } from "./lib/theme";

type PanelController = {
  init: () => void | Promise<void>;
};

type PanelDefinition = {
  key: string;
  label: string;
  description: string;
  group: "Editors" | "Insights" | "Settings";
  factory: (container: HTMLElement) => PanelController | Promise<PanelController>;
};

type PanelInstance = {
  node: HTMLElement;
  controller?: PanelController;
  initialized: boolean;
  loading?: Promise<void>;
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
    factory: (container) => import("./modules/statsPanel").then(({ StatsPanel }) => new StatsPanel(container)),
  },
  {
    key: "diagnostics",
    label: "Diagnostics",
    description: "Local host status",
    group: "Insights",
    factory: (container) => new DiagnosticsPanel(container),
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
  const panelRegistry = new Map<string, PanelDefinition>();
  const panelInstances = new Map<string, PanelInstance>();
  const navBadges = new Map<string, HTMLElement>();
  const navButtons = new Map<string, HTMLButtonElement>();
  const groupLists = new Map<string, HTMLElement>();

  const setPanelPlaceholder = (node: HTMLElement, message: string) => {
    node.innerHTML = `<div class="panel-placeholder"><p class="muted small">${message}</p></div>`;
  };

  panels.forEach((panel) => {
    panelRegistry.set(panel.key, panel);
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
    navButtons.set(panel.key, button);
    const badge = button.querySelector<HTMLElement>(`[data-panel-count="${panel.key}"]`);
    if (badge) navBadges.set(panel.key, badge);

    const section = document.createElement("section");
    section.className = "view-panel";
    section.dataset.panel = panel.key;
    section.hidden = true;
    host.appendChild(section);

    panelInstances.set(panel.key, { node: section, initialized: false });
  });

  const ensurePanelInitialized = async (panelKey: string) => {
    const instance = panelInstances.get(panelKey);
    const definition = panelRegistry.get(panelKey);
    if (!instance || !definition) return;
    if (instance.initialized) return;
    if (instance.loading) return instance.loading;

    setPanelPlaceholder(instance.node, "Loading module...");

    const loadPromise = Promise.resolve()
      .then(() => definition.factory(instance.node))
      .then((controller) => {
        instance.controller = controller;
        return controller.init();
      })
      .then(() => {
        instance.initialized = true;
      })
      .catch((error) => {
        console.error(`Failed to init ${definition.key}`, error);
        setPanelPlaceholder(instance.node, "Failed to load panel. Check console for details.");
      })
      .finally(() => {
        instance.loading = undefined;
      });

    instance.loading = loadPromise;
    return loadPromise;
  };

  const activatePanel = (panelKey: string | undefined) => {
    if (!panelKey) return;
    navButtons.forEach((button, key) => {
      const isActive = key === panelKey;
      button.classList.toggle("active", isActive);
    });
    panelInstances.forEach((instance, key) => {
      const isActive = key === panelKey;
      instance.node.classList.toggle("active", isActive);
      instance.node.hidden = !isActive;
    });
    ensurePanelInitialized(panelKey).catch(() => undefined);
  };

  navContainer.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".nav-chip");
    if (!button) return;
    const panelKey = button.dataset.panel;
    if (!panelKey) return;
    activatePanel(panelKey);
  });

  activatePanel(panels[0]?.key);

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
  updateBadge("diagnostics", serverService.isSupported ? "Host monitor" : "Unavailable");

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

serverService.init();
