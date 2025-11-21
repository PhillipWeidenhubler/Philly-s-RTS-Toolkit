var A=Object.defineProperty;var W=(h,e,t)=>e in h?A(h,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):h[e]=t;var n=(h,e,t)=>W(h,typeof e!="symbol"?e+"":e,t);import{w as E,d as g,b as F,c as L,e as T,T as C,W as q}from"./index-CSKnxx71.js";const w=()=>({name:"Untitled Weapon",category:"",caliber:"",range:"",muzzleVelocity:"",dispersion:"",barrelLength:"",reloadSpeed:"",targetAcquisition:"",ammoTypes:[],fireModes:[],trajectories:[],traits:[],notes:""}),S=()=>({name:"New Template",caliber:"",caliberDesc:"",ammoType:"",penetration:"",heDeadliness:"",dispersion:"",rangeMod:"",grain:"",notes:"",airburst:!1,subCount:"",subDamage:"",subPenetration:"",fps:""}),y=()=>({name:"New Mode",rounds:"",minRange:"",maxRange:"",cooldown:"",ammoRef:"",notes:""});class ${constructor(e){n(this,"root");n(this,"weapons",[]);n(this,"ammo",[]);n(this,"fireTemplates",[]);n(this,"tags",{categories:{},calibers:{}});n(this,"tagDraft",{categories:[],calibers:[]});n(this,"selectedWeapon",0);n(this,"selectedAmmo",0);n(this,"selectedFire",0);n(this,"weaponSearchTerm","");n(this,"ammoSearchTerm","");n(this,"fireSearchTerm","");n(this,"weaponListEl");n(this,"weaponFormEl");n(this,"weaponStatusEl");n(this,"weaponSearchInput");n(this,"ammoListEl");n(this,"ammoFormEl");n(this,"ammoStatusEl");n(this,"ammoSearchInput");n(this,"fireListEl");n(this,"fireFormEl");n(this,"fireStatusEl");n(this,"fireSearchInput");n(this,"categoryTagListEl");n(this,"caliberTagListEl");n(this,"tagStatusEl");n(this,"weaponAmmoListEl");n(this,"weaponFireListEl");n(this,"weaponAmmoImportSelect");n(this,"weaponFireImportSelect");n(this,"weaponTrajectoryWrapEl");n(this,"weaponTraitWrapEl");n(this,"weaponCategoryTagListEl");n(this,"weaponCaliberTagListEl");n(this,"weaponAmmoBallisticUpdaters",[]);this.root=e}init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),E.subscribe(e=>{this.weapons=g(e),this.weapons.length||(this.weapons=[w()]),this.selectedWeapon>=this.weapons.length&&(this.selectedWeapon=Math.max(0,this.weapons.length-1)),this.renderWeaponList(),this.populateWeaponForm()}),F.subscribe(e=>{this.ammo=g(e),this.ammo.length||(this.ammo=[S()]),this.selectedAmmo>=this.ammo.length&&(this.selectedAmmo=Math.max(0,this.ammo.length-1)),this.renderAmmoList(),this.populateAmmoForm(),this.populateWeaponAmmoImport()}),L.subscribe(e=>{this.tags=e,this.tagDraft={categories:this.mapToEntries(e.categories),calibers:this.mapToEntries(e.calibers)},this.renderTagLists(),this.renderWeaponTagSuggestions()}),T.subscribe(e=>{this.fireTemplates=g(e),this.fireTemplates.length||(this.fireTemplates=[y()]),this.selectedFire>=this.fireTemplates.length&&(this.selectedFire=Math.max(0,this.fireTemplates.length-1)),this.renderFireList(),this.populateFireForm(),this.populateWeaponFireImport()}),E.loadWeapons().catch(e=>{this.setWeaponStatus(e instanceof Error?e.message:String(e),"error")}),F.loadTemplates().catch(e=>{this.setAmmoStatus(e instanceof Error?e.message:String(e),"error")}),T.loadTemplates().catch(e=>{this.setFireStatus(e instanceof Error?e.message:String(e),"error")}),L.loadTags().catch(e=>{this.setTagStatus(e instanceof Error?e.message:String(e),"error")})}renderLayout(){this.root.innerHTML=`
      <div class="weapon-workbench">
        <section class="panel collapsible collapsed" data-panel="weapon-panel" id="weapon-panel">
          <div class="panel-heading">
            <h3>Weapon Library</h3>
            <div class="header-actions">
              <button type="button" class="ghost small" data-action="toggle-panel" data-panel-target="weapon-panel">Expand</button>
              <button type="button" class="ghost" data-action="weapon-new">+ Weapon</button>
              <button type="button" class="primary" data-action="weapon-save-all">Save weapons</button>
            </div>
          </div>
          <div class="split-layout panel-collapse-target">
            <div class="list-pane">
              <div class="list-actions">
                <input type="search" placeholder="Search weapons" data-role="weapon-search" />
              </div>
              <div class="list-scroll" data-role="weapon-list"></div>
            </div>
            <form class="detail-pane weapon-form" data-role="weapon-form">
              <datalist id="weapon-category-tags" data-role="weapon-category-tags"></datalist>
              <datalist id="weapon-caliber-tags" data-role="weapon-caliber-tags"></datalist>
              <div class="grid-3">
                <div class="field">
                  <label>Name</label>
                  <input name="weapon-name" required />
                </div>
                <div class="field">
                  <label>Category</label>
                  <input name="weapon-category" list="weapon-category-tags" />
                </div>
                <div class="field">
                  <label>Caliber</label>
                  <input name="weapon-caliber" list="weapon-caliber-tags" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Range</label>
                  <input name="weapon-range" />
                </div>
                <div class="field">
                  <label>Muzzle velocity</label>
                  <input name="weapon-mv" />
                </div>
                <div class="field">
                  <label>Dispersion</label>
                  <input name="weapon-dispersion" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Barrel length</label>
                  <input name="weapon-barrel" />
                </div>
                <div class="field">
                  <label>Reload speed</label>
                  <input name="weapon-reload" />
                </div>
                <div class="field">
                  <label>Target acquisition</label>
                  <input name="weapon-acquisition" />
                </div>
              </div>
              <div class="chip-field-row">
                <div class="chip-field">
                  <span class="label">Firing trajectories</span>
                  <div class="chip-wrap" data-role="weapon-trajectories"></div>
                </div>
                <div class="chip-field">
                  <span class="label">Weapon traits</span>
                  <div class="chip-wrap trait-wrap" data-role="weapon-traits"></div>
                </div>
              </div>
              <div class="field">
                <label>Notes</label>
                <textarea name="weapon-notes" rows="3"></textarea>
              </div>
              <div class="subpanel collapsed" data-subpanel="weapon-ammo">
                <div class="subpanel-heading">
                  <strong>Ammo types</strong>
                  <div class="header-actions compact">
                    <select data-role="weapon-ammo-import" class="ghost small">
                      <option value="">From templates...</option>
                    </select>
                    <button type="button" class="ghost small" data-action="weapon-ammo-add">Add ammo</button>
                    <button type="button" class="ghost small" data-action="weapon-ammo-collapse">Expand</button>
                  </div>
                </div>
                <div class="subpanel-body">
                  <div class="subpanel-list" data-role="weapon-ammo-list"></div>
                </div>
              </div>
              <div class="subpanel collapsed" data-subpanel="weapon-fire">
                <div class="subpanel-heading">
                  <strong>Fire modes</strong>
                  <div class="header-actions compact">
                    <select data-role="weapon-fire-import" class="ghost small">
                      <option value="">From templates...</option>
                    </select>
                    <button type="button" class="ghost small" data-action="weapon-fire-add">Add fire mode</button>
                    <button type="button" class="ghost small" data-action="weapon-fire-collapse">Expand</button>
                  </div>
                </div>
                <div class="subpanel-body">
                  <div class="subpanel-list" data-role="weapon-fire-list"></div>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="ghost danger" data-action="weapon-delete">Delete</button>
                <button type="submit" class="primary">Apply changes</button>
              </div>
            </form>
          </div>
          <div class="status-bar panel-collapse-target" data-role="weapon-status">Load weapon data to begin.</div>
        </section>

        <section class="panel collapsible collapsed" data-panel="ammo-panel" id="ammo-panel">
          <div class="panel-heading">
            <h3>Ammo Templates</h3>
            <div class="header-actions">
              <button type="button" class="ghost small" data-action="toggle-panel" data-panel-target="ammo-panel">Expand</button>
              <button type="button" class="ghost" data-action="ammo-new">+ Template</button>
              <button type="button" class="primary" data-action="ammo-save-all">Save ammo</button>
            </div>
          </div>
          <div class="split-layout panel-collapse-target">
            <div class="list-pane">
              <div class="list-actions">
                <input type="search" placeholder="Search ammo" data-role="ammo-search" />
              </div>
              <div class="list-scroll" data-role="ammo-list"></div>
            </div>
            <form class="detail-pane" data-role="ammo-form">
              <div class="grid-3">
                <div class="field">
                  <label>Name</label>
                  <input name="ammo-name" required />
                </div>
                <div class="field">
                  <label>Caliber</label>
                  <input name="ammo-caliber" required />
                </div>
                <div class="field">
                  <label>Caliber desc</label>
                  <input name="ammo-caliber-desc" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Type</label>
                  <input name="ammo-type" />
                </div>
                <div class="field">
                  <label>Penetration</label>
                  <input name="ammo-pen" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>HE deadliness</label>
                  <input name="ammo-he" />
                </div>
                <div class="field">
                  <label>Dispersion</label>
                  <input name="ammo-dispersion" />
                </div>
                <div class="field">
                  <label>Range modifier</label>
                  <input name="ammo-range-mod" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Grain</label>
                  <input name="ammo-grain" />
                </div>
                <div class="field">
                  <label>FPS</label>
                  <input name="ammo-fps" />
                </div>
                <div class="field toggle-field">
                  <label>Airburst</label>
                  <label class="toggle-pill">
                    <input type="checkbox" name="ammo-airburst" />
                    <span class="toggle-track"></span>
                    <span class="toggle-label">Enabled</span>
                  </label>
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Sub munition count</label>
                  <input name="ammo-sub-count" />
                </div>
                <div class="field">
                  <label>Sub munition damage</label>
                  <input name="ammo-sub-damage" />
                </div>
                <div class="field">
                  <label>Sub munition penetration</label>
                  <input name="ammo-sub-pen" />
                </div>
              </div>
              <div class="field">
                <label>Notes</label>
                <textarea name="ammo-notes" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="ghost danger" data-action="ammo-delete">Delete</button>
                <button type="submit" class="primary">Apply changes</button>
              </div>
            </form>
          </div>
          <div class="status-bar panel-collapse-target" data-role="ammo-status">Synchronize ammo templates to edit.</div>
        </section>

        <section class="panel collapsible collapsed" data-panel="fire-panel" id="fire-panel">
          <div class="panel-heading">
            <h3>Fire Mode Templates</h3>
            <div class="header-actions">
              <button type="button" class="ghost small" data-action="toggle-panel" data-panel-target="fire-panel">Expand</button>
              <button type="button" class="ghost" data-action="fire-new">+ Mode</button>
              <button type="button" class="primary" data-action="fire-save-all">Save modes</button>
            </div>
          </div>
          <div class="split-layout panel-collapse-target">
            <div class="list-pane">
              <div class="list-actions">
                <input type="search" placeholder="Search fire modes" data-role="fire-search" />
              </div>
              <div class="list-scroll" data-role="fire-list"></div>
            </div>
            <form class="detail-pane" data-role="fire-form">
              <div class="grid-3">
                <div class="field">
                  <label>Name</label>
                  <input name="fire-name" required />
                </div>
                <div class="field">
                  <label>Rounds per burst</label>
                  <input name="fire-rounds" type="number" min="0" step="1" />
                </div>
                <div class="field">
                  <label>Min range (m)</label>
                  <input name="fire-min-range" type="number" min="0" step="0.1" />
                </div>
              </div>
              <div class="grid-3">
                <div class="field">
                  <label>Max range (m)</label>
                  <input name="fire-max-range" type="number" min="0" step="0.1" />
                </div>
                <div class="field">
                  <label>Cooldown (s)</label>
                  <input name="fire-cooldown" type="number" min="0" step="0.1" />
                </div>
                <div class="field">
                  <label>Ammo reference</label>
                  <input name="fire-ammo" />
                </div>
              </div>
              <div class="field">
                <label>Notes</label>
                <textarea name="fire-notes" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="ghost danger" data-action="fire-delete">Delete</button>
                <button type="submit" class="primary">Apply changes</button>
              </div>
            </form>
          </div>
          <div class="status-bar panel-collapse-target" data-role="fire-status">Draft firing solutions for reuse.</div>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <h3>Weapon Tags</h3>
            <div class="header-actions">
              <button type="button" class="primary" data-action="tags-save">Save tags</button>
            </div>
          </div>
          <div class="tag-grid">
            <div>
              <h4>Categories</h4>
              <div data-role="tag-categories"></div>
              <button type="button" class="ghost" data-action="add-tag" data-scope="categories">Add category tag</button>
            </div>
            <div>
              <h4>Calibers</h4>
              <div data-role="tag-calibers"></div>
              <button type="button" class="ghost" data-action="add-tag" data-scope="calibers">Add caliber tag</button>
            </div>
          </div>
          <div class="status-bar" data-role="tag-status">Define colors for quick filtering.</div>
        </section>
      </div>
    `,this.initializeAccessibilityState()}initializeAccessibilityState(){["weapon-panel","ammo-panel","fire-panel"].forEach(e=>this.syncPanelToggleState(e)),this.root.querySelectorAll('[data-action="weapon-ammo-collapse"], [data-action="weapon-fire-collapse"]').forEach(e=>this.syncSubpanelToggle(e))}cacheElements(){this.weaponListEl=this.root.querySelector('[data-role="weapon-list"]'),this.weaponFormEl=this.root.querySelector('[data-role="weapon-form"]'),this.weaponStatusEl=this.root.querySelector('[data-role="weapon-status"]'),this.weaponSearchInput=this.root.querySelector('[data-role="weapon-search"]'),this.ammoListEl=this.root.querySelector('[data-role="ammo-list"]'),this.ammoFormEl=this.root.querySelector('[data-role="ammo-form"]'),this.ammoStatusEl=this.root.querySelector('[data-role="ammo-status"]'),this.ammoSearchInput=this.root.querySelector('[data-role="ammo-search"]'),this.fireListEl=this.root.querySelector('[data-role="fire-list"]'),this.fireSearchInput=this.root.querySelector('[data-role="fire-search"]'),this.fireFormEl=this.root.querySelector('[data-role="fire-form"]'),this.fireStatusEl=this.root.querySelector('[data-role="fire-status"]'),this.categoryTagListEl=this.root.querySelector('[data-role="tag-categories"]'),this.caliberTagListEl=this.root.querySelector('[data-role="tag-calibers"]'),this.tagStatusEl=this.root.querySelector('[data-role="tag-status"]'),this.weaponAmmoListEl=this.root.querySelector('[data-role="weapon-ammo-list"]'),this.weaponFireListEl=this.root.querySelector('[data-role="weapon-fire-list"]'),this.weaponAmmoImportSelect=this.root.querySelector('[data-role="weapon-ammo-import"]'),this.weaponFireImportSelect=this.root.querySelector('[data-role="weapon-fire-import"]'),this.weaponTrajectoryWrapEl=this.root.querySelector('[data-role="weapon-trajectories"]'),this.weaponTraitWrapEl=this.root.querySelector('[data-role="weapon-traits"]'),this.weaponCategoryTagListEl=this.root.querySelector('[data-role="weapon-category-tags"]'),this.weaponCaliberTagListEl=this.root.querySelector('[data-role="weapon-caliber-tags"]'),this.populateWeaponAmmoImport(),this.populateWeaponFireImport()}bindEvents(){var e,t,a;this.weaponListEl.addEventListener("click",i=>{const s=i.target.closest("[data-index]");s&&(this.selectedWeapon=Number(s.dataset.index),this.populateWeaponForm(),this.renderWeaponList())}),this.weaponFormEl.addEventListener("submit",i=>{i.preventDefault(),this.applyWeaponChanges()}),this.ammoListEl.addEventListener("click",i=>{const s=i.target.closest("[data-index]");s&&(this.selectedAmmo=Number(s.dataset.index),this.populateAmmoForm(),this.renderAmmoList())}),this.ammoFormEl.addEventListener("submit",i=>{i.preventDefault(),this.applyAmmoChanges()}),(e=this.ammoFormEl.querySelector('[name="ammo-airburst"]'))==null||e.addEventListener("change",()=>{this.syncAmmoTemplateAirburstFields()}),this.fireListEl.addEventListener("click",i=>{const s=i.target.closest("[data-index]");s&&(this.selectedFire=Number(s.dataset.index),this.populateFireForm(),this.renderFireList())}),this.fireFormEl.addEventListener("submit",i=>{i.preventDefault(),this.applyFireChanges()}),this.root.addEventListener("click",i=>this.handleButtonActions(i)),this.root.addEventListener("input",i=>this.handleTagInput(i)),this.weaponSearchInput.addEventListener("input",i=>{this.weaponSearchTerm=i.target.value.trim().toLowerCase(),this.renderWeaponList()}),this.ammoSearchInput.addEventListener("input",i=>{this.ammoSearchTerm=i.target.value.trim().toLowerCase(),this.renderAmmoList()}),this.fireSearchInput.addEventListener("input",i=>{this.fireSearchTerm=i.target.value.trim().toLowerCase(),this.renderFireList()}),this.weaponAmmoImportSelect.addEventListener("change",()=>{const i=Number(this.weaponAmmoImportSelect.value);if(!Number.isNaN(i)){const s=this.ammo[i];s&&(this.appendWeaponAmmoRow(g(s)),this.refreshWeaponFireAmmoOptions())}this.weaponAmmoImportSelect.value=""}),this.weaponFireImportSelect.addEventListener("change",()=>{const i=Number(this.weaponFireImportSelect.value);if(!Number.isNaN(i)){const s=this.fireTemplates[i];s&&(this.appendWeaponFireRow(g(s)),this.refreshWeaponFireAmmoOptions())}this.weaponFireImportSelect.value=""}),(t=this.weaponFormEl.querySelector('[name="weapon-caliber"]'))==null||t.addEventListener("input",()=>{this.refreshWeaponAmmoCaliberAutoFill(),this.weaponAmmoBallisticUpdaters.forEach(i=>i())}),(a=this.weaponFormEl.querySelector('[name="weapon-barrel"]'))==null||a.addEventListener("input",()=>{this.weaponAmmoBallisticUpdaters.forEach(i=>i())})}handleButtonActions(e){const t=e.target.closest("[data-action]");if(!t)return;switch(t.dataset.action){case"weapon-new":this.weapons.push(w()),this.selectedWeapon=this.weapons.length-1,this.renderWeaponList(),this.populateWeaponForm();break;case"weapon-delete":this.weapons.length>1&&(this.weapons.splice(this.selectedWeapon,1),this.selectedWeapon=Math.max(0,this.selectedWeapon-1),this.renderWeaponList(),this.populateWeaponForm());break;case"weapon-save-all":this.applyWeaponChanges(),E.saveWeapons(this.weapons).then(()=>this.setWeaponStatus("Weapon library saved.","success")).catch(i=>this.setWeaponStatus(i instanceof Error?i.message:String(i),"error"));break;case"weapon-ammo-add":this.appendWeaponAmmoRow(),this.refreshWeaponFireAmmoOptions();break;case"weapon-ammo-collapse":this.toggleSubpanel(t);break;case"weapon-fire-add":this.appendWeaponFireRow(),this.refreshWeaponFireAmmoOptions();break;case"weapon-fire-collapse":this.toggleSubpanel(t);break;case"toggle-panel":this.togglePanel(t.dataset.panelTarget);break;case"ammo-new":this.ammo.push(S()),this.selectedAmmo=this.ammo.length-1,this.renderAmmoList(),this.populateAmmoForm();break;case"ammo-delete":this.ammo.length>1&&(this.ammo.splice(this.selectedAmmo,1),this.selectedAmmo=Math.max(0,this.selectedAmmo-1),this.renderAmmoList(),this.populateAmmoForm());break;case"ammo-save-all":this.applyAmmoChanges(),F.saveTemplates(this.ammo).then(()=>this.setAmmoStatus("Ammo templates saved.","success")).catch(i=>this.setAmmoStatus(i instanceof Error?i.message:String(i),"error"));break;case"fire-new":this.fireTemplates.push(y()),this.selectedFire=this.fireTemplates.length-1,this.renderFireList(),this.populateFireForm();break;case"fire-delete":this.fireTemplates.length>1&&(this.fireTemplates.splice(this.selectedFire,1),this.selectedFire=Math.max(0,this.selectedFire-1),this.renderFireList(),this.populateFireForm());break;case"fire-save-all":this.applyFireChanges(),T.saveTemplates(this.fireTemplates).then(()=>this.setFireStatus("Fire mode templates saved.","success")).catch(i=>this.setFireStatus(i instanceof Error?i.message:String(i),"error"));break;case"add-tag":{const i=t.dataset.scope||"categories";this.tagDraft[i].push({id:this.makeId(),name:"",color:"#5bc0ff"}),this.renderTagLists();break}case"remove-tag":{const i=t.dataset.scope||"categories",s=t.dataset.id;this.tagDraft[i]=this.tagDraft[i].filter(o=>o.id!==s),this.renderTagLists();break}case"tags-save":{const i=this.buildTagPayload();L.saveTags(i).then(()=>this.setTagStatus("Tags saved.","success")).catch(s=>this.setTagStatus(s instanceof Error?s.message:String(s),"error"));break}}}buildTagPayload(){const e=t=>t.reduce((a,i)=>{const s=i.name.trim();return s&&(a[s]=i.color||"#5bc0ff"),a},{});return{categories:e(this.tagDraft.categories),calibers:e(this.tagDraft.calibers)}}renderWeaponList(){this.weaponListEl.innerHTML="",this.weapons.forEach((e,t)=>{if(this.weaponSearchTerm&&!(e.name||"").toLowerCase().includes(this.weaponSearchTerm)&&!(e.category||"").toLowerCase().includes(this.weaponSearchTerm))return;const a=document.createElement("button");a.type="button",a.dataset.index=t.toString(),a.className=`list-pill${t===this.selectedWeapon?" active":""}`,a.innerHTML=`
        <span class="title">${e.name||"Untitled"}</span>
        <span class="meta">${e.category||"Unknown"}</span>
      `,this.weaponListEl.appendChild(a)})}populateWeaponForm(){var t,a,i,s,o,r;const e=this.weapons[this.selectedWeapon]??w();this.weaponFormEl.querySelector('[name="weapon-name"]').value=e.name||"",this.weaponFormEl.querySelector('[name="weapon-category"]').value=e.category||"",this.weaponFormEl.querySelector('[name="weapon-caliber"]').value=e.caliber||"",this.weaponFormEl.querySelector('[name="weapon-range"]').value=((t=e.range)==null?void 0:t.toString())||"",this.weaponFormEl.querySelector('[name="weapon-mv"]').value=((a=e.muzzleVelocity)==null?void 0:a.toString())||"",this.weaponFormEl.querySelector('[name="weapon-dispersion"]').value=((i=e.dispersion)==null?void 0:i.toString())||"",this.weaponFormEl.querySelector('[name="weapon-barrel"]').value=((s=e.barrelLength)==null?void 0:s.toString())||"",this.weaponFormEl.querySelector('[name="weapon-reload"]').value=((o=e.reloadSpeed)==null?void 0:o.toString())||"",this.weaponFormEl.querySelector('[name="weapon-acquisition"]').value=((r=e.targetAcquisition)==null?void 0:r.toString())||"",this.renderWeaponTrajectoryChips(e.trajectories||[]),this.renderWeaponTraitChips(e.traits||[]),this.weaponFormEl.querySelector('[name="weapon-notes"]').value=e.notes||"",this.renderWeaponAmmoRows(e.ammoTypes||[]),this.renderWeaponFireRows(e.fireModes||[])}applyWeaponChanges(){var a,i,s,o,r,l,p,d,u,m;const e=this.weapons[this.selectedWeapon]??w(),t=new FormData(this.weaponFormEl);e.name=(((a=t.get("weapon-name"))==null?void 0:a.toString().trim())||"Untitled Weapon").trim(),e.category=((i=t.get("weapon-category"))==null?void 0:i.toString().trim())||"",e.caliber=((s=t.get("weapon-caliber"))==null?void 0:s.toString().trim())||"",e.range=((o=t.get("weapon-range"))==null?void 0:o.toString().trim())||"",e.muzzleVelocity=((r=t.get("weapon-mv"))==null?void 0:r.toString().trim())||"",e.dispersion=((l=t.get("weapon-dispersion"))==null?void 0:l.toString().trim())||"",e.barrelLength=((p=t.get("weapon-barrel"))==null?void 0:p.toString().trim())||"",e.reloadSpeed=((d=t.get("weapon-reload"))==null?void 0:d.toString().trim())||"",e.targetAcquisition=((u=t.get("weapon-acquisition"))==null?void 0:u.toString().trim())||"",e.trajectories=this.collectChipSelections(this.weaponTrajectoryWrapEl),e.traits=this.collectChipSelections(this.weaponTraitWrapEl),e.notes=(m=t.get("weapon-notes"))==null?void 0:m.toString(),e.ammoTypes=this.collectWeaponAmmoRows(),e.fireModes=this.collectWeaponFireRows(),this.weapons[this.selectedWeapon]=e,this.renderWeaponList()}renderWeaponAmmoRows(e){if(!this.weaponAmmoListEl)return;this.weaponAmmoListEl.innerHTML="",this.weaponAmmoBallisticUpdaters=[],(e&&e.length?e:[void 0]).forEach(a=>this.appendWeaponAmmoRow(a)),this.refreshWeaponFireAmmoOptions()}renderWeaponFireRows(e){if(!this.weaponFireListEl)return;this.weaponFireListEl.innerHTML="",(e&&e.length?e:[void 0]).forEach(a=>this.appendWeaponFireRow(a)),this.refreshWeaponFireAmmoOptions()}syncPanelToggleState(e){var s,o;if(!e)return;const t=this.root.querySelector(`[data-panel="${e}"]`);if(!t)return;t.id||(t.id=e);const a=!t.classList.contains("collapsed"),i=((o=(s=t.querySelector("h3"))==null?void 0:s.textContent)==null?void 0:o.trim())||e;this.root.querySelectorAll(`[data-action="toggle-panel"][data-panel-target="${e}"]`).forEach(r=>{r.textContent=a?"Collapse":"Expand",r.setAttribute("aria-expanded",a?"true":"false"),r.setAttribute("aria-controls",t.id),r.setAttribute("aria-label",`${a?"Collapse":"Expand"} ${i}`)})}syncSubpanelToggle(e){var o,r;const t=e.closest(".subpanel");if(!t)return;const a=t.querySelector(".subpanel-body");if(!a)return;if(!a.id){const l=t.dataset.subpanel||`subpanel-${this.makeId()}`;a.id=`${l}-body`}const i=!t.classList.contains("collapsed"),s=((r=(o=t.querySelector("strong"))==null?void 0:o.textContent)==null?void 0:r.trim())||"section";e.textContent=i?"Collapse":"Expand",e.setAttribute("aria-expanded",i?"true":"false"),e.setAttribute("aria-controls",a.id),e.setAttribute("aria-label",`${i?"Collapse":"Expand"} ${s}`)}togglePanel(e){if(!e)return;const t=this.root.querySelector(`[data-panel="${e}"]`);t&&(t.classList.toggle("collapsed"),this.syncPanelToggleState(e))}toggleSubpanel(e){const t=e.closest(".subpanel");t&&(t.classList.toggle("collapsed"),this.syncSubpanelToggle(e))}collectChipSelections(e){return e?Array.from(e.querySelectorAll("[data-value]")).filter(t=>t.classList.contains("active")).map(t=>{var a;return((a=t.dataset.value)==null?void 0:a.trim())||""}).filter(Boolean):[]}renderWeaponTrajectoryChips(e){if(!this.weaponTrajectoryWrapEl)return;const t=new Set((e||[]).map(a=>a.toLowerCase()));this.weaponTrajectoryWrapEl.innerHTML="",C.forEach(a=>{const i=document.createElement("button");i.type="button",i.className="chip-button",i.dataset.chipGroup="trajectory",i.dataset.value=a.value,i.textContent=a.label,t.has(a.value.toLowerCase())&&i.classList.add("active"),i.addEventListener("click",()=>i.classList.toggle("active")),this.weaponTrajectoryWrapEl.appendChild(i)})}renderWeaponTraitChips(e){if(!this.weaponTraitWrapEl)return;const t=new Set((e||[]).map(a=>a.toLowerCase()));this.weaponTraitWrapEl.innerHTML="",q.forEach((a,i)=>{if(a.forEach(s=>{const o=document.createElement("button");o.type="button",o.className="chip-button",o.dataset.chipGroup="trait",o.dataset.value=s.value,o.textContent=s.label,t.has(s.value.toLowerCase())&&o.classList.add("active"),o.addEventListener("click",()=>o.classList.toggle("active")),this.weaponTraitWrapEl.appendChild(o)}),i===0){const s=document.createElement("span");s.className="trait-separator",this.weaponTraitWrapEl.appendChild(s)}})}appendWeaponAmmoRow(e){if(!this.weaponAmmoListEl)return;const t=c=>this.toInputValue(c),a=document.createElement("div");a.className="ammo-row",a.dataset.role="weapon-ammo-row";const i=(e==null?void 0:e.airburst)===!0||(e==null?void 0:e.airburst)==="true"?"yes":"no";a.innerHTML=`
      <div class="subgrid">
        <label>Name<input data-ammo-field="name" value="${t(e==null?void 0:e.name)}" /></label>
        <label>Type<input data-ammo-field="ammoType" value="${t(e==null?void 0:e.ammoType)}" /></label>
        <label>Caliber<input data-ammo-field="caliber" value="${t(e==null?void 0:e.caliber)}" readonly tabindex="-1" /></label>
        <label>Caliber notes<input data-ammo-field="caliberDesc" value="${t(e==null?void 0:e.caliberDesc)}" /></label>
        <label>Penetration (mm)<input data-ammo-field="penetration" type="number" step="0.1" value="${t(e==null?void 0:e.penetration)}" /></label>
        <label>HE value<input data-ammo-field="heDeadliness" type="number" step="0.1" value="${t(e==null?void 0:e.heDeadliness)}" /></label>
        <label>Dispersion (%)<input data-ammo-field="dispersion" type="number" step="0.1" value="${t(e==null?void 0:e.dispersion)}" /></label>
        <label>Range delta (%)<input data-ammo-field="rangeMod" type="number" step="0.1" value="${t(e==null?void 0:e.rangeMod)}" /></label>
        <label>Ammo/Soldier<input data-ammo-field="ammoPerSoldier" type="number" min="0" step="1" value="${t(e==null?void 0:e.ammoPerSoldier)}" /></label>
        <label>Grain<input data-ammo-field="grain" type="number" step="0.1" value="${t(e==null?void 0:e.grain)}" /></label>
        <label>Muzzle velocity (fps)<input data-ammo-field="fps" type="number" step="1" value="${t(e==null?void 0:e.fps)}" /></label>
        <label>Notes<input data-ammo-field="notes" value="${t(e==null?void 0:e.notes)}" /></label>
        <label>Airburst
          <select data-ammo-field="airburst">
            <option value="yes" ${i==="yes"?"selected":""}>Yes</option>
            <option value="no" ${i==="no"?"selected":""}>No</option>
          </select>
        </label>
        <label>Sub munitions (#)<input data-ammo-field="subCount" type="number" min="0" step="1" data-airburst-dependent value="${t(e==null?void 0:e.subCount)}" /></label>
        <label>Sub damage<input data-ammo-field="subDamage" type="number" step="0.1" data-airburst-dependent value="${t(e==null?void 0:e.subDamage)}" /></label>
        <label>Sub penetration (mm)<input data-ammo-field="subPenetration" type="number" step="0.1" data-airburst-dependent value="${t(e==null?void 0:e.subPenetration)}" /></label>
      </div>
      <div class="row-actions">
        <button type="button" class="ghost small" data-action="remove-weapon-ammo">Remove</button>
      </div>
    `;const s=a.querySelector('input[data-ammo-field="grain"]'),o=a.querySelector('input[data-ammo-field="fps"]'),r=a.querySelector('input[data-ammo-field="caliber"]');if(r){r.readOnly=!0,r.tabIndex=-1,r.classList.add("readonly"),typeof(e==null?void 0:e.caliber)=="string"&&e.caliber.trim()&&(r.dataset.initialCaliber=e.caliber.trim());const c=this.getWeaponFormCaliber()||r.dataset.initialCaliber||"";r.value=c,r.placeholder=c||this.getWeaponFormCaliber(),r.dataset.initialCaliber=c}const l=()=>{if(!s||!o)return;const c=Number.parseFloat(s.value||"0");if(Number.isNaN(c))return;const b=this.getWeaponFormBarrelLength(),f=this.getWeaponFormCaliber()||(r==null?void 0:r.dataset.initialCaliber)||"",v=this.computeAmmoFpsEstimate(f,b,c);o.value=v.toString()},p=a.querySelector('[data-action="remove-weapon-ammo"]');p==null||p.addEventListener("click",()=>{a.remove();const c=this.weaponAmmoBallisticUpdaters.indexOf(l);c>=0&&this.weaponAmmoBallisticUpdaters.splice(c,1),this.refreshWeaponFireAmmoOptions()});const d=a.querySelector('select[data-ammo-field="airburst"]'),u=a.querySelectorAll("[data-airburst-dependent]"),m=()=>{const c=(d==null?void 0:d.value)==="yes";u.forEach(b=>{b.disabled=!c})};d==null||d.addEventListener("change",m),m(),a.addEventListener("input",c=>{c.target.matches('[data-ammo-field="name"]')&&this.refreshWeaponFireAmmoOptions()}),s==null||s.addEventListener("input",l),this.weaponAmmoBallisticUpdaters.push(l),this.weaponAmmoListEl.appendChild(a),this.refreshWeaponAmmoCaliberAutoFill(),l()}appendWeaponFireRow(e){var s;if(!this.weaponFireListEl)return;const t=o=>this.toInputValue(o),a=document.createElement("div");a.className="fire-row",a.dataset.role="weapon-fire-row",a.innerHTML=`
      <div class="subgrid">
        <label>Name<input data-fire-field="name" value="${t(e==null?void 0:e.name)}" /></label>
        <label>Rounds / burst<input data-fire-field="rounds" type="number" min="0" step="1" value="${t(e==null?void 0:e.rounds)}" /></label>
        <label>Min range (m)<input data-fire-field="minRange" type="number" min="0" step="0.1" value="${t(e==null?void 0:e.minRange)}" /></label>
        <label>Max range (m)<input data-fire-field="maxRange" type="number" min="0" step="0.1" value="${t(e==null?void 0:e.maxRange)}" /></label>
        <label>Cooldown (s)<input data-fire-field="cooldown" type="number" min="0" step="0.1" value="${t(e==null?void 0:e.cooldown)}" /></label>
        <label>Ammo reference<select data-fire-field="ammoRef"></select></label>
        <label>Notes<input data-fire-field="notes" value="${t(e==null?void 0:e.notes)}" /></label>
      </div>
      <div class="row-actions">
        <button type="button" class="ghost small" data-action="remove-weapon-fire">Remove</button>
      </div>
    `,(s=a.querySelector('[data-action="remove-weapon-fire"]'))==null||s.addEventListener("click",()=>{a.remove(),this.refreshWeaponFireAmmoOptions()}),this.weaponFireListEl.appendChild(a);const i=a.querySelector('select[data-fire-field="ammoRef"]');i&&e!=null&&e.ammoRef&&(i.dataset.prefill=e.ammoRef)}collectWeaponAmmoRows(){return this.weaponAmmoListEl?Array.from(this.weaponAmmoListEl.querySelectorAll('[data-role="weapon-ammo-row"]')).map(t=>{const a=(o,r="input")=>{var l;return(((l=t.querySelector(`${r}[data-ammo-field="${o}"]`))==null?void 0:l.value)||"").trim()},i={name:a("name")||void 0,ammoType:a("ammoType")||void 0,caliber:a("caliber")||void 0,caliberDesc:a("caliberDesc")||void 0,penetration:a("penetration")||void 0,heDeadliness:a("heDeadliness")||void 0,dispersion:a("dispersion")||void 0,rangeMod:a("rangeMod")||void 0,ammoPerSoldier:a("ammoPerSoldier")||void 0,grain:a("grain")||void 0,fps:a("fps")||void 0,notes:a("notes")||void 0,subCount:a("subCount")||void 0,subDamage:a("subDamage")||void 0,subPenetration:a("subPenetration")||void 0},s=a("airburst","select");return s==="yes"||s==="true"?i.airburst=!0:s==="no"||s==="false"||s===""?i.airburst=!1:delete i.airburst,i}).filter(t=>Object.values(t).some(a=>a!==void 0&&a!=="")):[]}collectWeaponFireRows(){return this.weaponFireListEl?Array.from(this.weaponFireListEl.querySelectorAll('[data-role="weapon-fire-row"]')).map(t=>{const a=s=>{var o;return(((o=t.querySelector(`[data-fire-field="${s}"]`))==null?void 0:o.value)||"").trim()};return{name:a("name")||void 0,rounds:a("rounds")||void 0,minRange:a("minRange")||void 0,maxRange:a("maxRange")||void 0,cooldown:a("cooldown")||void 0,ammoRef:a("ammoRef")||void 0,notes:a("notes")||void 0}}).filter(t=>Object.values(t).some(a=>a!==void 0&&a!=="")):[]}refreshWeaponFireAmmoOptions(){if(!this.weaponFireListEl||!this.weaponAmmoListEl)return;const e=Array.from(this.weaponAmmoListEl.querySelectorAll('input[data-ammo-field="name"]')).map(t=>t.value.trim()).filter(Boolean);this.weaponFireListEl.querySelectorAll('select[data-fire-field="ammoRef"]').forEach(t=>{const a=t.value||t.dataset.prefill||"";t.innerHTML="";const i=document.createElement("option");i.value="",i.textContent="None",t.appendChild(i),e.forEach(s=>{const o=document.createElement("option");o.value=s,o.textContent=s,t.appendChild(o)}),a&&e.includes(a)?t.value=a:(t.value="",a&&(t.dataset.prefill=a))})}populateWeaponAmmoImport(){this.weaponAmmoImportSelect&&(this.weaponAmmoImportSelect.innerHTML='<option value="">From templates...</option>',this.ammo.forEach((e,t)=>{const a=document.createElement("option");a.value=t.toString(),a.textContent=`${e.name||"Template"} · ${e.caliber||"?"}`,this.weaponAmmoImportSelect.appendChild(a)}))}populateWeaponFireImport(){this.weaponFireImportSelect&&(this.weaponFireImportSelect.innerHTML='<option value="">From templates...</option>',this.fireTemplates.forEach((e,t)=>{const a=document.createElement("option");a.value=t.toString(),a.textContent=e.name||`Mode ${t+1}`,this.weaponFireImportSelect.appendChild(a)}))}renderAmmoList(){this.ammoListEl.innerHTML="";let e=0;const t=this.ammoSearchTerm;if(this.ammo.forEach((a,i)=>{if(t&&!(a.name||"").toLowerCase().includes(t)&&!(a.caliber||"").toLowerCase().includes(t))return;const s=document.createElement("button");s.type="button",s.dataset.index=i.toString(),s.className=`list-pill${i===this.selectedAmmo?" active":""}`,s.innerHTML=`
        <span class="title">${a.name||"Template"}</span>
        <span class="meta">${a.caliber||"Unknown"}</span>
      `,this.ammoListEl.appendChild(s),e+=1}),!e){const a=document.createElement("p");a.className="empty",a.textContent="No templates match the search.",this.ammoListEl.appendChild(a)}}populateAmmoForm(){var t,a,i,s,o,r,l,p,d;const e=this.ammo[this.selectedAmmo]??S();this.ammoFormEl.querySelector('[name="ammo-name"]').value=e.name||"",this.ammoFormEl.querySelector('[name="ammo-caliber"]').value=e.caliber||"",this.ammoFormEl.querySelector('[name="ammo-caliber-desc"]').value=e.caliberDesc||"",this.ammoFormEl.querySelector('[name="ammo-type"]').value=e.ammoType||"",this.ammoFormEl.querySelector('[name="ammo-pen"]').value=((t=e.penetration)==null?void 0:t.toString())||"",this.ammoFormEl.querySelector('[name="ammo-he"]').value=((a=e.heDeadliness)==null?void 0:a.toString())||"",this.ammoFormEl.querySelector('[name="ammo-dispersion"]').value=((i=e.dispersion)==null?void 0:i.toString())||"",this.ammoFormEl.querySelector('[name="ammo-range-mod"]').value=((s=e.rangeMod)==null?void 0:s.toString())||"",this.ammoFormEl.querySelector('[name="ammo-grain"]').value=((o=e.grain)==null?void 0:o.toString())||"",this.ammoFormEl.querySelector('[name="ammo-fps"]').value=((r=e.fps)==null?void 0:r.toString())||"",this.ammoFormEl.querySelector('[name="ammo-sub-count"]').value=((l=e.subCount)==null?void 0:l.toString())||"",this.ammoFormEl.querySelector('[name="ammo-sub-damage"]').value=((p=e.subDamage)==null?void 0:p.toString())||"",this.ammoFormEl.querySelector('[name="ammo-sub-pen"]').value=((d=e.subPenetration)==null?void 0:d.toString())||"",this.ammoFormEl.querySelector('[name="ammo-airburst"]').checked=!!e.airburst,this.ammoFormEl.querySelector('[name="ammo-notes"]').value=e.notes||"",this.syncAmmoTemplateAirburstFields()}applyAmmoChanges(){var a,i,s,o,r,l,p,d,u,m,c,b,f,v;const e=this.ammo[this.selectedAmmo]??S(),t=new FormData(this.ammoFormEl);e.name=((a=t.get("ammo-name"))==null?void 0:a.toString().trim())||"New Template",e.caliber=((i=t.get("ammo-caliber"))==null?void 0:i.toString().trim())||"",e.caliberDesc=((s=t.get("ammo-caliber-desc"))==null?void 0:s.toString().trim())||"",e.ammoType=((o=t.get("ammo-type"))==null?void 0:o.toString().trim())||"",delete e.ammoPerSoldier,e.penetration=((r=t.get("ammo-pen"))==null?void 0:r.toString().trim())||"",e.heDeadliness=((l=t.get("ammo-he"))==null?void 0:l.toString().trim())||"",e.dispersion=((p=t.get("ammo-dispersion"))==null?void 0:p.toString().trim())||"",e.rangeMod=((d=t.get("ammo-range-mod"))==null?void 0:d.toString().trim())||"",e.grain=((u=t.get("ammo-grain"))==null?void 0:u.toString().trim())||"",e.fps=((m=t.get("ammo-fps"))==null?void 0:m.toString().trim())||"",e.subCount=((c=t.get("ammo-sub-count"))==null?void 0:c.toString().trim())||"",e.subDamage=((b=t.get("ammo-sub-damage"))==null?void 0:b.toString().trim())||"",e.subPenetration=((f=t.get("ammo-sub-pen"))==null?void 0:f.toString().trim())||"",e.airburst=!!t.get("ammo-airburst"),e.notes=(v=t.get("ammo-notes"))==null?void 0:v.toString(),this.ammo[this.selectedAmmo]=e,this.renderAmmoList()}renderFireList(){this.fireListEl.innerHTML="",this.fireTemplates.forEach((e,t)=>{if(this.fireSearchTerm&&!(e.name||"").toLowerCase().includes(this.fireSearchTerm)&&!(e.ammoRef||"").toLowerCase().includes(this.fireSearchTerm))return;const a=document.createElement("button");a.type="button",a.dataset.index=t.toString(),a.className=`list-pill${t===this.selectedFire?" active":""}`,a.innerHTML=`
        <span class="title">${e.name||"Mode"}</span>
        <span class="meta">${e.rounds||"-"} rnd burst</span>
      `,this.fireListEl.appendChild(a)})}populateFireForm(){var t,a,i,s;const e=this.fireTemplates[this.selectedFire]??y();this.fireFormEl.querySelector('[name="fire-name"]').value=e.name||"",this.fireFormEl.querySelector('[name="fire-rounds"]').value=((t=e.rounds)==null?void 0:t.toString())||"",this.fireFormEl.querySelector('[name="fire-min-range"]').value=((a=e.minRange)==null?void 0:a.toString())||"",this.fireFormEl.querySelector('[name="fire-max-range"]').value=((i=e.maxRange)==null?void 0:i.toString())||"",this.fireFormEl.querySelector('[name="fire-cooldown"]').value=((s=e.cooldown)==null?void 0:s.toString())||"",this.fireFormEl.querySelector('[name="fire-ammo"]').value=e.ammoRef||"",this.fireFormEl.querySelector('[name="fire-notes"]').value=e.notes||""}applyFireChanges(){var a,i,s,o,r,l,p;const e=this.fireTemplates[this.selectedFire]??y(),t=new FormData(this.fireFormEl);e.name=((a=t.get("fire-name"))==null?void 0:a.toString().trim())||"New Mode",e.rounds=((i=t.get("fire-rounds"))==null?void 0:i.toString().trim())||"",e.minRange=((s=t.get("fire-min-range"))==null?void 0:s.toString().trim())||"",e.maxRange=((o=t.get("fire-max-range"))==null?void 0:o.toString().trim())||"",e.cooldown=((r=t.get("fire-cooldown"))==null?void 0:r.toString().trim())||"",e.ammoRef=((l=t.get("fire-ammo"))==null?void 0:l.toString().trim())||"",e.notes=((p=t.get("fire-notes"))==null?void 0:p.toString().trim())||"",this.fireTemplates[this.selectedFire]=e,this.renderFireList()}syncAmmoTemplateAirburstFields(){if(!this.ammoFormEl)return;const e=this.ammoFormEl.querySelector('[name="ammo-airburst"]'),t=!!(e!=null&&e.checked);["ammo-sub-count","ammo-sub-damage","ammo-sub-pen"].forEach(a=>{const i=this.ammoFormEl.querySelector(`[name="${a}"]`);i&&(i.disabled=!t)})}renderTagLists(){const e=(t,a)=>{const i=document.createElement("div");i.className="tag-row",i.innerHTML=`
        <input type="text" data-tag-field="name" data-scope="${a}" data-id="${t.id}" placeholder="Label" value="${t.name}" />
        <input type="color" data-tag-field="color" data-scope="${a}" data-id="${t.id}" value="${t.color}" />
        <button type="button" class="ghost" data-action="remove-tag" data-scope="${a}" data-id="${t.id}">Remove</button>
      `;const s=document.createElement("span");s.className="tag-chip-preview",i.prepend(s);const o=i.querySelector('input[data-tag-field="name"]'),r=i.querySelector('input[data-tag-field="color"]'),l=()=>{s.textContent=((o==null?void 0:o.value.trim())||"Untitled tag").substring(0,32);const p=(r==null?void 0:r.value)||"#5bc0ff";s.style.setProperty("--tag-chip-color",p)};return o==null||o.addEventListener("input",l),r==null||r.addEventListener("input",l),l(),i};this.categoryTagListEl.innerHTML="",this.tagDraft.categories.forEach(t=>{this.categoryTagListEl.appendChild(e(t,"categories"))}),this.caliberTagListEl.innerHTML="",this.tagDraft.calibers.forEach(t=>{this.caliberTagListEl.appendChild(e(t,"calibers"))})}getWeaponFormCaliber(){var e,t;return((t=(e=this.weaponFormEl)==null?void 0:e.querySelector('[name="weapon-caliber"]'))==null?void 0:t.value.trim())||""}getWeaponFormBarrelLength(){var a,i;const e=((i=(a=this.weaponFormEl)==null?void 0:a.querySelector('[name="weapon-barrel"]'))==null?void 0:i.value)||"",t=Number.parseFloat(e);return Number.isNaN(t)?0:t}parseCaliberMeasurement(e){if(!e)return;const a=e.replace(",",".").match(/\d+(?:\.\d+)?/);if(!a)return;const i=Number.parseFloat(a[0]);return Number.isNaN(i)?void 0:i}computeAmmoFpsEstimate(e,t,a){const s=e.replace(/\s+/g,"").match(/(\d{1,3})(?:[.,](\d{1,3}))?x(\d{1,3})/i);let o=this.parseCaliberMeasurement(e)??5.56;if(s){const m=s[2]??"";o=Number.parseFloat(m?`${s[1]}.${m}`:s[1])}const r=2e3,l=t*45,p=a*1.5,d=(6-o)*15,u=r+l-p+d;return Math.max(300,Math.round(u))}refreshWeaponAmmoCaliberAutoFill(){if(!this.weaponAmmoListEl)return;const e=this.getWeaponFormCaliber();this.weaponAmmoListEl.querySelectorAll('input[data-ammo-field="caliber"]').forEach(t=>{var s;const a=((s=t.dataset.initialCaliber)==null?void 0:s.trim())||"",i=e||a;t.value=i,t.placeholder=i||e,t.dataset.initialCaliber=i})}renderWeaponTagSuggestions(){this.weaponCategoryTagListEl&&(this.weaponCategoryTagListEl.innerHTML=this.buildTagOptionMarkup(Object.keys(this.tags.categories||{}))),this.weaponCaliberTagListEl&&(this.weaponCaliberTagListEl.innerHTML=this.buildTagOptionMarkup(Object.keys(this.tags.calibers||{})))}buildTagOptionMarkup(e){return!e||!e.length?"":[...e].sort((t,a)=>t.localeCompare(a)).map(t=>`<option value="${t}"></option>`).join("")}setWeaponStatus(e,t="info"){this.setStatus(this.weaponStatusEl,e,t)}setAmmoStatus(e,t="info"){this.setStatus(this.ammoStatusEl,e,t)}setFireStatus(e,t="info"){this.setStatus(this.fireStatusEl,e,t)}setTagStatus(e,t="info"){this.setStatus(this.tagStatusEl,e,t)}setStatus(e,t,a){e.textContent=t,a==="info"?delete e.dataset.tone:e.dataset.tone=a}toInputValue(e){return e==null?"":String(e)}handleTagInput(e){const t=e.target;if(!t||!t.dataset.tagField)return;const a=t.dataset.scope||"categories",i=t.dataset.id,s=this.tagDraft[a].find(o=>o.id===i);s&&(t.dataset.tagField==="name"?s.name=t.value:t.dataset.tagField==="color"&&(s.color=t.value))}mapToEntries(e){return e?Object.entries(e).map(([t,a])=>({id:this.makeId(),name:t,color:a})):[]}makeId(){return Math.random().toString(36).slice(2,9)}}export{$ as WeaponWorkbench};
//# sourceMappingURL=weaponWorkbench-CRqludlR.js.map
