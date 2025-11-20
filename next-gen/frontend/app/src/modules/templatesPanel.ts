import { WeaponWorkbench } from "./weaponWorkbench";

export class TemplatesPanel {
	private root: HTMLElement;
	private workbench?: WeaponWorkbench;

	constructor(root: HTMLElement) {
		this.root = root;
	}

	init(): void {
		this.root.innerHTML = `
			<div class="panel weapon-panel">
				<div class="panel-heading">
					<h3>Weapon Templates</h3>
					<p class="muted small">Manage reusable weapons, ammo, and fire modes</p>
				</div>
				<div data-role="weapon-workbench"></div>
			</div>
		`;
		const container = this.root.querySelector<HTMLElement>('[data-role="weapon-workbench"]');
		if (!container) {
			throw new Error("Failed to initialize weapon workbench container");
		}
		this.workbench = new WeaponWorkbench(container);
		this.workbench.init();
	}
}

