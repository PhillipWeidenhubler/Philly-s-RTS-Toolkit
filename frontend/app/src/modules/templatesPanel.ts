import type { WeaponWorkbench } from "./weaponWorkbench";

export class TemplatesPanel {
	private root: HTMLElement;
	private workbench?: WeaponWorkbench;

	constructor(root: HTMLElement) {
		this.root = root;
	}

	async init(): Promise<void> {
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
		container.innerHTML = `<p class="muted small">Loading weapon workbench...</p>`;
		await this.mountWorkbench(container);
	}

	private async mountWorkbench(container: HTMLElement): Promise<void> {
		try {
			const module = await import("./weaponWorkbench");
			this.workbench = new module.WeaponWorkbench(container);
			await Promise.resolve(this.workbench.init());
		} catch (error) {
			container.innerHTML = `<p class="muted small">Failed to load weapon workbench. Check console.</p>`;
			console.error("Failed to load weapon workbench", error);
		}
	}
}

