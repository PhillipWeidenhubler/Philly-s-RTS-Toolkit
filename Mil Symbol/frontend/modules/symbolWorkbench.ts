import type { MilitarySymbol, SpatialSymbolFields, SpatialSymbolStyle } from "../types";
import { getSymbolPreviewMarkup, sanitizeSidc } from "../services/symbolService";
import { SYMBOL_FUNCTION_LIBRARY, SYMBOL_MODIFIER_LIBRARY, type SymbolFunctionTemplate } from "../data/symbolLibrary";
import {
    DEFAULT_DIMENSION,
    DEFAULT_FUNCTION_CODE,
    SIDC_COUNTRY_HELP,
    SIDC_DIMENSION_HELP,
    SIDC_FUNCTION_HELP,
    SIDC_MODIFIER_HELP,
    SIDC_ORDER_HELP,
} from "../data/symbolBuilderOptions";

interface SymbolWorkbenchOptions {
    form: HTMLFormElement;
    mountSelector: string;
    entityLabel?: string;
}

interface SidcSegments {
    dimension: string;
    functionId: string;
    modifier1: string;
    modifier2: string;
    country: string;
    order: string;
}

const SIDC_PLACEHOLDER = "--------------------";

const FIELD_CONFIG: Array<{ key: keyof SpatialSymbolFields; label: string; placeholder?: string }> = [
    { key: "quantity", label: "Quantity" },
    { key: "reinforcedReduced", label: "Reinf / Red" },
    { key: "staffComments", label: "Staff comments" },
    { key: "additionalInformation", label: "Additional info" },
    { key: "evaluationRating", label: "Eval rating" },
    { key: "combatEffectiveness", label: "Combat effectiveness" },
    { key: "signatureEquipment", label: "Signature equipment" },
    { key: "uniqueDesignation", label: "Unique designation" },
    { key: "higherFormation", label: "Higher formation" },
    { key: "type", label: "Type" },
    { key: "dtg", label: "DTG" },
    { key: "altitudeDepth", label: "Altitude / depth" },
    { key: "location", label: "Location" },
    { key: "speed", label: "Speed" },
    { key: "specialDesignator", label: "Special designator" },
    { key: "engagementBar", label: "Engagement bar" },
    { key: "engagementType", label: "Engagement type" },
    { key: "guardedUnit", label: "Guarded unit" },
    { key: "sigint", label: "SIGINT" },
    { key: "iffSif", label: "IFF / SIF" },
    { key: "country", label: "Country override" },
    { key: "platformType", label: "Platform" },
    { key: "specialHeadquarters", label: "Special HQ" },
    { key: "installationComposition", label: "Installation" },
    { key: "auxiliaryEquipmentIndicator", label: "Aux equip" },
];

const STYLE_TOGGLES: Array<{ key: keyof SpatialSymbolStyle; label: string; type: "boolean" | "number"; min?: number; max?: number; step?: number }> = [
    { key: "frame", label: "Frame", type: "boolean" },
    { key: "icon", label: "Icon", type: "boolean" },
    { key: "fill", label: "Fill", type: "boolean" },
    { key: "infoFields", label: "Info bands", type: "boolean" },
    { key: "square", label: "Square", type: "boolean" },
    { key: "outlineWidth", label: "Outline", type: "number", min: 0, max: 20, step: 1 },
    { key: "strokeWidth", label: "Stroke", type: "number", min: 1, max: 12, step: 1 },
    { key: "infoSize", label: "Info size", type: "number", min: 20, max: 80, step: 1 },
    { key: "size", label: "Preview size", type: "number", min: 60, max: 200, step: 5 },
];

export class SymbolWorkbench {
    private mountEl?: HTMLElement | null;
    private previewEl?: HTMLElement | null;
    private sidcCodeEl?: HTMLElement | null;
    private sidcInput?: HTMLInputElement | null;
    private affiliationSelect?: HTMLSelectElement | null;
    private statusSelect?: HTMLSelectElement | null;
    private echelonInput?: HTMLSelectElement | null;
    private themeSelect?: HTMLSelectElement | null;
    private segmentInputs: Partial<Record<keyof SidcSegments, HTMLInputElement>> = {};
    private fieldInputs: Partial<Record<keyof SpatialSymbolFields, HTMLInputElement | HTMLTextAreaElement>> = {};
    private styleInputs: Partial<Record<keyof SpatialSymbolStyle, HTMLInputElement>> = {};
    private functionPalette?: HTMLElement | null;
    private modifierGuide?: HTMLElement | null;
    private functionSearchInput?: HTMLInputElement | null;
    private functionButtons: HTMLElement[] = [];

    constructor(private readonly options: SymbolWorkbenchOptions) { }

    init(): void {
        this.mountEl = this.options.form.querySelector<HTMLElement>(this.options.mountSelector);
        if (!this.mountEl) {
            console.warn("[SymbolWorkbench] Mount selector not found", this.options.mountSelector);
            return;
        }
        this.renderLayout();
        this.cacheElements();
        this.bindEvents();
        this.renderFunctionPalette();
        this.renderModifierGuide();
        this.bootstrapDefaultSymbol();
        this.updatePreview();
    }

    getValue(): MilitarySymbol | undefined {
        if (!this.sidcInput) return undefined;
        const sidc = sanitizeSidc(this.sidcInput.value);
        if (!sidc) return undefined;
        const fields: Partial<SpatialSymbolFields> = {};
        const style: Partial<SpatialSymbolStyle> = {};
        const symbol: MilitarySymbol = {
            sidc,
            affiliation: this.affiliationSelect?.value,
            status: this.statusSelect?.value,
            echelon: this.echelonInput?.value,
            colorMode: (this.themeSelect?.value as "dark" | "light") ?? "dark",
        };

        const fieldRecord = fields as Record<string, unknown>;
        Object.entries(this.fieldInputs).forEach(([key, input]) => {
            if (!input) return;
            const value = input.value.trim();
            if (!value.length) return;
            fieldRecord[key] = value;
        });

        const styleRecord = style as Record<string, unknown>;
        Object.entries(this.styleInputs).forEach(([key, input]) => {
            if (!input) return;
            if (input.type === "checkbox") {
                styleRecord[key] = input.checked;
            } else if (input.type === "range" || input.type === "number") {
                const numeric = Number(input.value);
                if (!Number.isNaN(numeric)) {
                    styleRecord[key] = numeric;
                }
            } else {
                const value = input.value.trim();
                if (value.length) {
                    styleRecord[key] = value;
                }
            }
        });

        if (Object.keys(fields).length) {
            symbol.fields = fields as SpatialSymbolFields;
        }

        if (Object.keys(style).length) {
            symbol.style = style as SpatialSymbolStyle;
        }

        return symbol;
    }

    setValue(symbol?: MilitarySymbol | null): void {
        if (!symbol) {
            this.reset();
            return;
        }
        if (this.sidcInput) this.sidcInput.value = sanitizeSidc(symbol.sidc);
        if (this.affiliationSelect) this.affiliationSelect.value = symbol.affiliation ?? "friendly";
        if (this.statusSelect) this.statusSelect.value = symbol.status ?? "present";
        if (this.echelonInput) this.echelonInput.value = symbol.echelon ?? "";
        if (this.themeSelect) this.themeSelect.value = symbol.colorMode ?? "dark";

        Object.entries(this.fieldInputs).forEach(([key, input]) => {
            if (!input) return;
            const value = symbol.fields?.[key as keyof SpatialSymbolFields];
            input.value = typeof value === "string" ? value : value?.toString() ?? "";
        });

        Object.entries(this.styleInputs).forEach(([key, input]) => {
            if (!input) return;
            const styleValue = symbol.style?.[key as keyof SpatialSymbolStyle];
            if (input.type === "checkbox") {
                input.checked = Boolean(styleValue ?? input.dataset.default === "true");
            } else if (input.type === "range" || input.type === "number") {
                if (typeof styleValue === "number") {
                    input.value = String(styleValue);
                }
            } else if (typeof styleValue === "string") {
                input.value = styleValue;
            }
        });

        this.syncBuilderFromSidc(symbol.sidc);
        this.updatePreview();
    }

    private reset(): void {
        if (this.sidcInput) this.sidcInput.value = SIDC_PLACEHOLDER;
        if (this.affiliationSelect) this.affiliationSelect.value = "friendly";
        if (this.statusSelect) this.statusSelect.value = "present";
        if (this.echelonInput) this.echelonInput.value = "";
        if (this.themeSelect) this.themeSelect.value = "dark";
        if (this.functionSearchInput) {
            this.functionSearchInput.value = "";
            this.filterFunctionPalette("");
        }
        Object.values(this.fieldInputs).forEach((input) => (input.value = ""));
        Object.entries(this.styleInputs).forEach(([key, input]) => {
            if (input.type === "checkbox") {
                input.checked = input.dataset.default === "true";
            } else if (input.type === "range" || input.type === "number") {
                input.value = input.dataset.default ?? "0";
            } else {
                input.value = input.dataset.default ?? "";
            }
        });
        this.syncBuilderFromSidc(SIDC_PLACEHOLDER);
        this.bootstrapDefaultSymbol();
        this.updatePreview();
    }

    private renderLayout(): void {
        const title = this.options.entityLabel ?? "Symbol";
        this.mountEl!.innerHTML = `
      <div class="symbol-workbench__grid">
        <div class="symbol-workbench__preview">
          <div class="symbol-preview" data-role="symbol-preview">
            <div class="symbol-preview__empty">No military symbol assigned</div>
          </div>
          <p class="sidc-label">SIDC: <span data-role="sidc-code">${SIDC_PLACEHOLDER}</span></p>
          <input type="text" name="symbol.sidc" data-role="sidc-input" placeholder="SIDC" maxlength="20" />
                    <div class="symbol-preview__actions">
                        <button type="button" class="ghost" data-action="reset-symbol">Reset symbol</button>
                    </div>
        </div>
        <div class="symbol-workbench__stack">
          <section class="panel">
            <div class="panel-title">${title} identity</div>
            <div class="grid-4 symbol-identity-grid">
              <label class="field">Affiliation
                <select data-role="symbol-affiliation">
                  <option value="friendly">Friendly</option>
                  <option value="hostile">Hostile</option>
                  <option value="neutral">Neutral</option>
                  <option value="unknown">Unknown</option>
                </select>
              </label>
              <label class="field">Status
                <select data-role="symbol-status">
                  <option value="present">Present</option>
                  <option value="anticipated">Anticipated</option>
                </select>
              </label>
              <label class="field">Echelon
                <select data-role="symbol-echelon">
                  <option value="">Unset</option>
                  <option value="Team">Team</option>
                  <option value="Squad">Squad</option>
                  <option value="Platoon">Platoon</option>
                  <option value="Company">Company</option>
                  <option value="Battalion">Battalion</option>
                  <option value="Regiment">Regiment</option>
                  <option value="Brigade">Brigade</option>
                  <option value="Division">Division</option>
                  <option value="Corps">Corps</option>
                  <option value="Army">Army</option>
                </select>
              </label>
              <label class="field">Theme
                <select data-role="symbol-theme">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </label>
            </div>
          </section>
          <section class="panel">
            <div class="panel-title">SIDC builder</div>
            <div class="sidc-builder">
              ${this.renderBuilderRow("dimension", "Dimension", SIDC_DIMENSION_HELP)}
              ${this.renderBuilderRow("functionId", "Function", SIDC_FUNCTION_HELP)}
              ${this.renderBuilderRow("modifier1", "Modifier 1", SIDC_MODIFIER_HELP)}
              ${this.renderBuilderRow("modifier2", "Modifier 2", SIDC_MODIFIER_HELP)}
              ${this.renderBuilderRow("country", "Country", SIDC_COUNTRY_HELP)}
              ${this.renderBuilderRow("order", "Order", SIDC_ORDER_HELP)}
            </div>
          </section>
          <section class="panel">
            <div class="panel-title">Spatial metadata</div>
            <div class="symbol-field-grid" data-role="symbol-field-grid"></div>
          </section>
          <section class="panel">
            <div class="panel-title">Styling</div>
            <div class="symbol-style-grid" data-role="symbol-style-grid"></div>
          </section>
          <section class="panel symbol-workbench__tools">
                        <div>
                            <div class="symbol-tools__head">
                                <p class="symbol-tools__title">Function palette</p>
                                <input type="search" data-role="symbol-function-search" placeholder="Search name or SIDC" />
                            </div>
                            <div class="symbol-palette" data-role="symbol-function-palette"></div>
            </div>
            <div>
              <p class="symbol-tools__title">Modifier guide</p>
              <div class="modifier-guide" data-role="symbol-modifier-guide"></div>
            </div>
          </section>
        </div>
      </div>
    `;

        const fieldGrid = this.mountEl!.querySelector<HTMLElement>("[data-role='symbol-field-grid']");
        if (fieldGrid) {
            FIELD_CONFIG.forEach((field) => {
                const wrapper = document.createElement("label");
                wrapper.className = "field";
                wrapper.textContent = field.label;
                const input = document.createElement(field.key === "staffComments" || field.key === "additionalInformation" ? "textarea" : "input");
                input.setAttribute("data-symbol-field", field.key);
                input.placeholder = field.placeholder ?? field.label;
                if (input instanceof HTMLTextAreaElement) {
                    input.rows = 2;
                }
                wrapper.appendChild(input);
                fieldGrid.appendChild(wrapper);
            });
        }

        const styleGrid = this.mountEl!.querySelector<HTMLElement>("[data-role='symbol-style-grid']");
        if (styleGrid) {
            STYLE_TOGGLES.forEach((toggle) => {
                const wrapper = document.createElement("label");
                wrapper.className = "field";
                wrapper.textContent = toggle.label;
                if (toggle.type === "boolean") {
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.dataset.symbolStyle = toggle.key;
                    checkbox.dataset.default = toggle.key === "frame" || toggle.key === "icon" || toggle.key === "fill" || toggle.key === "infoFields" ? "true" : "false";
                    checkbox.checked = checkbox.dataset.default === "true";
                    wrapper.appendChild(checkbox);
                } else {
                    const slider = document.createElement("input");
                    slider.type = "range";
                    slider.min = String(toggle.min ?? 0);
                    slider.max = String(toggle.max ?? 100);
                    slider.step = String(toggle.step ?? 1);
                    slider.value = String(toggle.min ?? 0);
                    slider.dataset.symbolStyle = toggle.key;
                    slider.dataset.default = slider.value;
                    const valueLabel = document.createElement("span");
                    valueLabel.className = "style-value";
                    valueLabel.textContent = slider.value;
                    slider.addEventListener("input", () => (valueLabel.textContent = slider.value));
                    wrapper.appendChild(slider);
                    wrapper.appendChild(valueLabel);
                }
                styleGrid.appendChild(wrapper);
            });
        }
    }

    private renderBuilderRow(field: keyof SidcSegments, label: string, hint: string): string {
        const type = field === "functionId" ? "text" : "text";
        const maxLength = field === "functionId" ? 6 : field === "order" ? 4 : 2;
        if (field === "dimension") {
            return `
        <label class="field">${label}
          <input type="text" maxlength="1" data-segment="${field}" placeholder="${DEFAULT_DIMENSION}" />
          <small>${hint}</small>
        </label>`;
        }
        return `
      <label class="field">${label}
        <input type="${type}" maxlength="${maxLength}" data-segment="${field}" placeholder="--" />
        <small>${hint}</small>
      </label>`;
    }

    private cacheElements(): void {
        this.previewEl = this.mountEl?.querySelector("[data-role='symbol-preview']");
        this.sidcCodeEl = this.mountEl?.querySelector("[data-role='sidc-code']");
        this.sidcInput = this.mountEl?.querySelector<HTMLInputElement>("[data-role='sidc-input']") ?? null;
        this.affiliationSelect = this.mountEl?.querySelector<HTMLSelectElement>("[data-role='symbol-affiliation']") ?? null;
        this.statusSelect = this.mountEl?.querySelector<HTMLSelectElement>("[data-role='symbol-status']") ?? null;
        this.echelonInput = this.mountEl?.querySelector<HTMLSelectElement>("[data-role='symbol-echelon']") ?? null;
        this.themeSelect = this.mountEl?.querySelector<HTMLSelectElement>("[data-role='symbol-theme']") ?? null;
        this.functionPalette = this.mountEl?.querySelector("[data-role='symbol-function-palette']");
        this.modifierGuide = this.mountEl?.querySelector("[data-role='symbol-modifier-guide']");
        this.functionSearchInput = this.mountEl?.querySelector<HTMLInputElement>("[data-role='symbol-function-search']") ?? null;

        this.mountEl?.querySelectorAll<HTMLInputElement>("[data-segment]").forEach((input) => {
            const segment = input.dataset.segment as keyof SidcSegments;
            this.segmentInputs[segment] = input;
        });

        this.mountEl?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-symbol-field]").forEach((input) => {
            const key = input.dataset.symbolField as keyof SpatialSymbolFields;
            this.fieldInputs[key] = input;
        });

        this.mountEl?.querySelectorAll<HTMLInputElement>("[data-symbol-style]").forEach((input) => {
            const key = input.dataset.symbolStyle as keyof SpatialSymbolStyle;
            this.styleInputs[key] = input;
        });
    }

    private bindEvents(): void {
        this.sidcInput?.addEventListener("input", () => {
            this.sidcInput!.value = sanitizeSidc(this.sidcInput!.value);
            this.syncBuilderFromSidc(this.sidcInput!.value);
            this.updatePreview();
        });

        this.affiliationSelect?.addEventListener("change", () => this.updatePreview());
        this.statusSelect?.addEventListener("change", () => this.updatePreview());
        this.echelonInput?.addEventListener("change", () => this.updatePreview());
        this.themeSelect?.addEventListener("change", () => this.updatePreview());

        Object.values(this.segmentInputs).forEach((input) =>
            input?.addEventListener("input", () => this.handleSidcBuilderChange())
        );

        Object.values(this.fieldInputs).forEach((input) =>
            input?.addEventListener("input", () => this.updatePreview())
        );

        Object.values(this.styleInputs).forEach((input) =>
            input?.addEventListener("input", () => this.updatePreview())
        );

        this.functionSearchInput?.addEventListener("input", () => {
            this.filterFunctionPalette(this.functionSearchInput!.value);
        });

        this.mountEl?.addEventListener("click", (event) => {
            const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action='reset-symbol']");
            if (button) {
                event.preventDefault();
                this.reset();
            }
        });
    }

    private renderFunctionPalette(): void {
        if (!this.functionPalette) return;
        this.functionPalette.innerHTML = "";
        this.functionButtons = [];
        SYMBOL_FUNCTION_LIBRARY.forEach((template) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "symbol-card";
            button.dataset.templateId = template.id;
            button.dataset.sidc = template.sidc;
            button.dataset.functionId = template.functionId;
            button.dataset.dimension = template.dimension;
            button.innerHTML = `
        <div class="symbol-card__preview">${getSymbolPreviewMarkup({ sidc: template.sidc })}</div>
        <div class="symbol-card__meta">
          <strong>${template.label}</strong>
          <p>${template.description}</p>
        </div>`;
            button.addEventListener("click", () => this.applyFunctionTemplate(template));
            this.functionPalette?.appendChild(button);
            this.functionButtons.push(button);
        });
    }

    private renderModifierGuide(): void {
        if (!this.modifierGuide) return;
        this.modifierGuide.innerHTML = "";
        SYMBOL_MODIFIER_LIBRARY.forEach((info) => {
            const row = document.createElement("div");
            row.className = "modifier-card";
            row.innerHTML = `
        <div class="modifier-card__code">${info.code}</div>
        <div class="modifier-card__meta">
          <strong>${info.name}</strong>
          <p>${info.description}</p>
        </div>`;
            this.modifierGuide?.appendChild(row);
        });
    }

    private applyFunctionTemplate(template: SymbolFunctionTemplate): void {
        this.segmentInputs.dimension && (this.segmentInputs.dimension.value = template.dimension);
        this.segmentInputs.functionId && (this.segmentInputs.functionId.value = template.functionId);
        if (template.modifier1 && this.segmentInputs.modifier1) this.segmentInputs.modifier1.value = template.modifier1;
        if (template.modifier2 && this.segmentInputs.modifier2) this.segmentInputs.modifier2.value = template.modifier2;
        this.handleSidcBuilderChange();
    }

    private bootstrapDefaultSymbol(): void {
        if (this.sidcInput?.value && this.sidcInput.value !== SIDC_PLACEHOLDER) {
            this.syncBuilderFromSidc(this.sidcInput.value);
            return;
        }
        const defaultTemplate = SYMBOL_FUNCTION_LIBRARY[0];
        if (defaultTemplate) {
            this.applyFunctionTemplate(defaultTemplate);
        } else {
            this.handleSidcBuilderChange();
        }
    }

    private handleSidcBuilderChange(): void {
        const segments = this.composeSegments();
        const sidc = this.composeSidcFromSegments(segments);
        if (this.sidcInput) this.sidcInput.value = sidc;
        this.sidcCodeEl && (this.sidcCodeEl.textContent = sidc);
        this.updateFunctionPaletteState();
        this.updatePreview();
    }

    private composeSegments(): SidcSegments {
        return {
            dimension: (this.segmentInputs.dimension?.value || DEFAULT_DIMENSION).toUpperCase(),
            functionId: this.normalizeSegment(this.segmentInputs.functionId?.value, DEFAULT_FUNCTION_CODE, 6),
            modifier1: this.normalizeSegment(this.segmentInputs.modifier1?.value, "--", 2),
            modifier2: this.normalizeSegment(this.segmentInputs.modifier2?.value, "--", 2),
            country: this.normalizeSegment(this.segmentInputs.country?.value, "US", 2),
            order: this.normalizeSegment(this.segmentInputs.order?.value, "----", 4),
        };
    }

    private normalizeSegment(value: string | undefined | null, fallback: string, length: number): string {
        if (!value) return fallback;
        const normalized = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
        if (!normalized.length) return fallback;
        return normalized.padEnd(length, "-").slice(0, length);
    }

    private composeSidcFromSegments(segments: SidcSegments): string {
        const scheme = "S";
        const identity = this.affiliationSelect?.value?.charAt(0).toUpperCase() ?? "F";
        const status = this.statusSelect?.value === "anticipated" ? "A" : "P";
        return `${scheme}${identity}${segments.dimension}${status}${segments.functionId}${segments.modifier1}${segments.modifier2}${segments.country}${segments.order}`;
    }

    private syncBuilderFromSidc(rawSidc?: string): void {
        const padded = (rawSidc || SIDC_PLACEHOLDER).toUpperCase().padEnd(20, "-");
        if (this.segmentInputs.dimension) this.segmentInputs.dimension.value = padded.charAt(2) || DEFAULT_DIMENSION;
        if (this.segmentInputs.functionId) this.segmentInputs.functionId.value = padded.slice(4, 10);
        if (this.segmentInputs.modifier1) this.segmentInputs.modifier1.value = padded.slice(10, 12);
        if (this.segmentInputs.modifier2) this.segmentInputs.modifier2.value = padded.slice(12, 14);
        if (this.segmentInputs.country) this.segmentInputs.country.value = padded.slice(14, 16);
        if (this.segmentInputs.order) this.segmentInputs.order.value = padded.slice(16, 20);
        this.sidcCodeEl && (this.sidcCodeEl.textContent = padded);
        this.updateFunctionPaletteState();
    }

    private updateFunctionPaletteState(): void {
        if (!this.segmentInputs.functionId || !this.segmentInputs.dimension) return;
        const dimension = this.segmentInputs.dimension.value.toUpperCase();
        const functionId = this.segmentInputs.functionId.value.toUpperCase();
        this.functionButtons.forEach((button) => {
            const matches =
                button.dataset.dimension?.toUpperCase() === dimension &&
                button.dataset.functionId?.toUpperCase() === functionId;
            button.classList.toggle("active", matches);
        });
    }

    private filterFunctionPalette(query: string): void {
        if (!this.functionButtons.length) return;
        const normalized = query.trim().toLowerCase();
        this.functionButtons.forEach((button) => {
            if (!normalized) {
                button.hidden = false;
                return;
            }
            const text = button.textContent?.toLowerCase() ?? "";
            const sidc = button.dataset.sidc?.toLowerCase() ?? "";
            button.hidden = !(text.includes(normalized) || sidc.includes(normalized));
        });
    }

    private updatePreview(): void {
        if (!this.previewEl) return;
        const value = this.getValue();
        this.previewEl.innerHTML = getSymbolPreviewMarkup(value, {
            size: Number(this.styleInputs.size?.value ?? 140),
            theme: this.themeSelect?.value === "light" ? "light" : "dark",
        });
    }
}

export const renderSymbolChip = (symbol?: MilitarySymbol): string => {
    const svg = getSymbolPreviewMarkup(symbol, { size: 44 });
    if (svg) return `<span class="symbol-chip">${svg}</span>`;
    return '<span class="symbol-chip symbol-chip--empty">◻</span>';
};
