var K=Object.defineProperty;var Q=(l,t,e)=>t in l?K(l,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):l[t]=e;var r=(l,t,e)=>Q(l,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=e(i);fetch(i.href,a)}})();class Z{constructor(){r(this,"listeners",new Map);r(this,"isAvailable");var t,e,s;this.isAvailable=!!((t=window.chrome)!=null&&t.webview),this.isAvailable?(s=(e=window.chrome)==null?void 0:e.webview)==null||s.addEventListener("message",i=>this.handleEnvelope(i==null?void 0:i.data)):console.info("[HostBridge] Running without desktop host; messaging will be no-ops.")}handleEnvelope(t){!t||typeof t!="object"||!t.type||this.emit(t.type,t.payload)}postMessage(t,e){if(!this.isAvailable){console.warn(`[HostBridge] Skipping "${t}" message because WebView host is unavailable.`);return}window.chrome.webview.postMessage({type:t,payload:e})}request(t,e,s,i=5e3){if(!this.isAvailable)return Promise.reject(new Error("Host bridge is not available."));const a=s??t,o=this.waitFor(a,i);return this.postMessage(t,e),o}waitFor(t,e=5e3){return new Promise((s,i)=>{const a=c=>{this.off(t,a),clearTimeout(o),s(c)},o=window.setTimeout(()=>{this.off(t,a),i(new Error(`Timed out waiting for host payload "${t}"`))},e);this.on(t,a)})}on(t,e){const s=this.listeners.get(t)??new Set;return s.add(e),this.listeners.set(t,s),()=>this.off(t,e)}off(t,e){const s=this.listeners.get(t);s&&(s.delete(e),s.size||this.listeners.delete(t))}emit(t,e){const s=this.listeners.get(t);s&&s.forEach(i=>{try{i(e)}catch(a){console.error(`[HostBridge] Listener for "${t}" failed`,a)}})}}const b=new Z,F=l=>JSON.parse(JSON.stringify(l));class _{constructor(){r(this,"units",[]);r(this,"subscribers",new Set);b.on("units-data",t=>{this.units=Array.isArray(t==null?void 0:t.units)?t.units:[],this.publish()})}async loadUnits(){if(!b.isAvailable)return console.warn("[UnitService] Host is unavailable; returning cached units only."),this.units;const t=await b.request("get-units",void 0,"units-data");return this.units=Array.isArray(t==null?void 0:t.units)?t.units:[],this.publish(),this.units}async saveUnit(t){if(!b.isAvailable)throw new Error("Host is unavailable, cannot persist unit.");await b.request("save-unit",{unit:t},"units-data")}async deleteUnit(t){if(!b.isAvailable)throw new Error("Host is unavailable, cannot delete unit.");await b.request("delete-unit",{id:t},"units-data")}getUnits(){return this.units}subscribe(t){return this.subscribers.add(t),t(this.units.map(e=>({...e}))),()=>this.subscribers.delete(t)}publish(){const t=this.units.map(e=>({...e}));this.subscribers.forEach(e=>e(t))}}const N=new _;class X{constructor(){r(this,"formations",[]);r(this,"subscribers",new Set);b.on("formations-data",t=>{const e=t&&Array.isArray(t.formations)?t.formations:[];this.formations=e,this.publish()})}async loadFormations(){if(!b.isAvailable)return this.formations;const t=await b.request("get-formations",void 0,"formations-data");return this.formations=t&&Array.isArray(t.formations)?t.formations:[],this.publish(),this.formations}async saveFormations(t){if(!b.isAvailable)throw new Error("Host is unavailable, cannot persist formations.");await b.request("save-formations",{formations:t},"formations-data")}getFormations(){return this.formations}subscribe(t){return this.subscribers.add(t),t(this.formations.map(e=>({...e}))),()=>this.subscribers.delete(t)}publish(){const t=this.formations.map(e=>({...e}));this.subscribers.forEach(e=>e(t))}}const q=new X;class tt{constructor(){r(this,"nations",[]);r(this,"subscribers",new Set);b.on("nations-data",t=>{const e=t&&Array.isArray(t.nations)?t.nations:[];this.nations=e,this.publish()})}async loadNations(){if(!b.isAvailable)return this.nations;const t=await b.request("get-nations",void 0,"nations-data");return this.nations=t&&Array.isArray(t.nations)?t.nations:[],this.publish(),this.nations}async saveNations(t){if(!b.isAvailable)throw new Error("Host is unavailable, cannot persist nations.");await b.request("save-nations",{nations:t},"nations-data")}getNations(){return this.nations}subscribe(t){return this.subscribers.add(t),t(this.nations.map(e=>({...e}))),()=>this.subscribers.delete(t)}publish(){const t=this.nations.map(e=>({...e}));this.subscribers.forEach(e=>e(t))}}const A=new tt;class et{constructor(){r(this,"settings",{});r(this,"subscribers",new Set);b.on("settings-data",t=>{this.settings=t?{...t}:{},this.publish()})}async loadSettings(){if(!b.isAvailable)return this.getSettings();const t=await b.request("get-settings",void 0,"settings-data");return this.settings=t?{...t}:{},this.publish(),this.getSettings()}async saveSettings(t){if(!b.isAvailable)throw new Error("Host is unavailable, cannot persist settings.");await b.request("save-settings",t,"settings-data")}getSettings(){return{...this.settings}}subscribe(t){return this.subscribers.add(t),t(this.getSettings()),()=>this.subscribers.delete(t)}publish(){const t=this.getSettings();this.subscribers.forEach(e=>e(t))}}const T=new et,G=()=>({name:"",category:"",internalCategory:"",tier:"",price:"",description:"",image:"",stats:{},grenades:{},capabilities:{sprint:{}},guns:[],equipment:[]}),R=l=>l===!0||l==="true"?"true":l===!1||l==="false"?"false":"",D=l=>{if(l){if(l.toString()==="true")return!0;if(l.toString()==="false")return!1}};class st{constructor(t){r(this,"root");r(this,"units",[]);r(this,"form");r(this,"unitListEl");r(this,"gunListEl");r(this,"equipmentListEl");r(this,"statusEl");r(this,"summaryEl");r(this,"searchInput");r(this,"categoryFilter");r(this,"sortModeSelect");r(this,"workingCopy",G());r(this,"currentUnitId");r(this,"pendingName");r(this,"metaFormationsEl",null);r(this,"metaNationsEl",null);r(this,"metaThemeEl",null);r(this,"ammoTemplates",[]);r(this,"fireTemplates",[]);r(this,"ammoLibraryByCaliber",new Map);this.root=t}async init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),this.bindMetaFeeds(),N.subscribe(t=>{this.units=t,this.updateTemplateLibraries(t),this.renderUnitList(),this.syncSelection()}),await N.loadUnits().catch(t=>{const e=t instanceof Error?t.message:String(t);this.setStatus(`Failed to load units: ${e}`,"error")}),this.units.length||this.startNewUnit()}renderLayout(){this.root.innerHTML=`
      <div class="workspace">
        <aside class="sidebar">
          <header class="sidebar-header">
            <div>
              <p class="eyebrow">SQLite source</p>
              <h1>Unit Browser</h1>
              <p class="muted">Select an existing unit or start a fresh draft.</p>
            </div>
            <button type="button" class="ghost" data-action="refresh-units">Refresh</button>
          </header>
          <div class="sidebar-actions">
            <input type="search" placeholder="Search name or category" data-role="search" />
            <button type="button" class="primary" data-action="new-unit">+ New unit</button>
          </div>
          <div class="sidebar-actions">
            <select data-role="category-filter">
              <option value="">All categories</option>
              <option value="INF">Infantry</option>
              <option value="ARM">Armor</option>
              <option value="LOG">Logistics</option>
              <option value="AIR">Air</option>
            </select>
            <select data-role="sort-mode">
              <option value="name-asc">Name A â†’ Z</option>
              <option value="name-desc">Name Z â†’ A</option>
              <option value="price-asc">Price low â†’ high</option>
              <option value="price-desc">Price high â†’ low</option>
            </select>
          </div>
          <div class="unit-list" data-role="unit-list"></div>
        </aside>
        <section class="editor">
          <header class="editor-header">
            <div>
              <p class="eyebrow">Unit Editor</p>
              <h2>Combat Design Suite</h2>
              <p class="muted" data-role="unit-summary">Select a unit to begin.</p>
            </div>
            <div class="editor-actions">
              <button type="button" class="ghost" data-action="reset-unit">Reset</button>
              <button type="button" class="ghost danger" data-action="delete-unit">Delete</button>
              <button type="submit" class="primary" form="unitForm">Save unit</button>
            </div>
          </header>
          <form id="unitForm" data-role="unit-form" class="editor-form">
            <input type="hidden" name="unit-id" />
            <section class="panel grid-3">
              <div class="field">
                <label>Name</label>
                <input name="name" autocomplete="off" />
              </div>
              <div class="field">
                <label>Category</label>
                <input name="category" placeholder="INF, ARM, LOG" />
              </div>
              <div class="field">
                <label>Internal category</label>
                <input name="internalCategory" />
              </div>
              <div class="field">
                <label>Tier</label>
                <input name="tier" placeholder="Elite, Regular ..." />
              </div>
              <div class="field">
                <label>Price</label>
                <input name="price" type="number" step="1" min="0" />
              </div>
              <div class="field">
                <label>Image</label>
                <input name="image" placeholder="assets/units/pathfinder.png" />
              </div>
            </section>
            <section class="panel">
              <label>Description</label>
              <textarea name="description" rows="4" placeholder="Overview, strengths, doctrine..."></textarea>
            </section>
            <section class="panel">
              <div class="panel-title">Core stats</div>
              <div class="core-stats-grid">
                <div class="field"><label>Armor (mm)</label><input name="stats.armor" type="number" step="0.1" /></div>
                <div class="field"><label>Health (HP)</label><input name="stats.health" type="number" step="0.1" /></div>
                <div class="field"><label>Squad size (#)</label><input name="stats.squadSize" type="number" step="1" min="0" /></div>
                <div class="field"><label>Visual range (m)</label><input name="stats.visualRange" type="number" step="1" min="0" /></div>
                <div class="field"><label>Stealth (%)</label><input name="stats.stealth" type="number" step="1" min="0" /></div>
                <div class="field"><label>Speed (m/s)</label><input name="stats.speed" type="number" step="0.1" /></div>
                <div class="field"><label>Weight (kg)</label><input name="stats.weight" type="number" step="0.1" /></div>
              </div>
            </section>
            <section class="panel grid-4">
              <div class="panel-title">Capabilities</div>
              <div class="field">
                <label>Static line jump</label>
                <select name="cap.staticLineJump">
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div class="field">
                <label>HALO/HAHO</label>
                <select name="cap.haloHaho">
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div class="field">
                <label>Laser designator</label>
                <select name="cap.laserDesignator">
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div class="field">
                <label>Sprint distance (m)</label>
                <input name="cap.sprint.distance" type="number" step="1" min="0" />
              </div>
              <div class="field">
                <label>Sprint speed (m/s)</label>
                <input name="cap.sprint.speed" type="number" step="0.1" />
              </div>
              <div class="field">
                <label>Sprint cooldown (s)</label>
                <input name="cap.sprint.cooldown" type="number" step="0.1" min="0" />
              </div>
            </section>
            <section class="panel grid-5">
              <div class="panel-title">Grenades</div>
              <div class="field"><label>Smoke</label><input name="grenades.smoke" type="number" step="1" min="0" /></div>
              <div class="field"><label>Flash</label><input name="grenades.flash" type="number" step="1" min="0" /></div>
              <div class="field"><label>Thermite</label><input name="grenades.thermite" type="number" step="1" min="0" /></div>
              <div class="field"><label>Frag</label><input name="grenades.frag" type="number" step="1" min="0" /></div>
              <div class="field"><label>Total</label><input name="grenades.total" type="number" step="1" min="0" /></div>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Weapons</h3>
                <button type="button" class="ghost" data-action="add-gun">Add weapon</button>
              </div>
              <div class="repeatable-list" data-role="gun-list">
                <p class="empty">No weapons configured.</p>
              </div>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Equipment</h3>
                <button type="button" class="ghost" data-action="add-equipment">Add equipment</button>
              </div>
              <div class="repeatable-list" data-role="equipment-list">
                <p class="empty">No equipment entries yet.</p>
              </div>
            </section>
          </form>
          <div class="status-bar" data-role="status-bar">Ready.</div>
          <div class="meta-bar" data-role="meta-bar">
            <span>Formations: <strong data-role="meta-formations">0</strong></span>
            <span>Nations: <strong data-role="meta-nations">0</strong></span>
            <span>Theme: <strong data-role="meta-theme">System</strong></span>
          </div>
        </section>
      </div>
    `}cacheElements(){this.form=this.root.querySelector('[data-role="unit-form"]'),this.unitListEl=this.root.querySelector('[data-role="unit-list"]'),this.gunListEl=this.root.querySelector('[data-role="gun-list"]'),this.equipmentListEl=this.root.querySelector('[data-role="equipment-list"]'),this.statusEl=this.root.querySelector('[data-role="status-bar"]'),this.summaryEl=this.root.querySelector('[data-role="unit-summary"]'),this.searchInput=this.root.querySelector('[data-role="search"]'),this.categoryFilter=this.root.querySelector('[data-role="category-filter"]'),this.sortModeSelect=this.root.querySelector('[data-role="sort-mode"]'),this.metaFormationsEl=this.root.querySelector('[data-role="meta-formations"]'),this.metaNationsEl=this.root.querySelector('[data-role="meta-nations"]'),this.metaThemeEl=this.root.querySelector('[data-role="meta-theme"]')}bindEvents(){this.unitListEl.addEventListener("click",t=>this.handleUnitListClick(t)),this.form.addEventListener("submit",t=>this.handleSubmit(t)),this.root.addEventListener("click",t=>this.handleAction(t)),this.searchInput.addEventListener("input",()=>{this.renderUnitList()}),this.categoryFilter.addEventListener("change",()=>this.renderUnitList()),this.sortModeSelect.addEventListener("change",()=>this.renderUnitList())}bindMetaFeeds(){q.subscribe(t=>{this.metaFormationsEl&&(this.metaFormationsEl.textContent=t.length.toString())}),A.subscribe(t=>{this.metaNationsEl&&(this.metaNationsEl.textContent=t.length.toString())}),T.subscribe(t=>{this.metaThemeEl&&(this.metaThemeEl.textContent=t.theme||"System")}),q.loadFormations().catch(t=>{console.error("Failed to load formations",t)}),A.loadNations().catch(t=>{console.error("Failed to load nations",t)}),T.loadSettings().catch(t=>{console.error("Failed to load settings",t)})}handleUnitListClick(t){const e=t.target.closest(".unit-pill");if(!e)return;const s=Number(e.dataset.index),i=this.units[s];i&&this.loadUnit(i)}async handleSubmit(t){t.preventDefault();const e=this.collectFormData();if(!e.name){this.setStatus("Name is required.","error");return}try{e.id?this.currentUnitId=e.id:this.pendingName=e.name.toLowerCase(),this.setStatus("Saving unit...","default"),await N.saveUnit(e),this.setStatus("Unit saved.","success")}catch(s){const i=s instanceof Error?s.message:String(s);this.setStatus(`Failed to save unit: ${i}`,"error")}}handleAction(t){const e=t.target.closest("[data-action]");if(!e)return;const s=e.dataset.action;if(s)switch(t.preventDefault(),s){case"refresh-units":this.setStatus("Refreshing from host...","default"),N.loadUnits().catch(i=>{const a=i instanceof Error?i.message:String(i);this.setStatus(`Refresh failed: ${a}`,"error")});break;case"new-unit":this.startNewUnit();break;case"reset-unit":this.resetCurrentUnit();break;case"add-gun":this.appendGunRow();break;case"add-equipment":this.appendEquipmentRow();break;case"delete-unit":this.deleteCurrentUnit();break;case"remove-gun":{const i=e.closest(".repeatable-row");i==null||i.remove(),this.gunListEl.querySelector(".repeatable-row")||(this.gunListEl.innerHTML='<p class="empty">No weapons configured.</p>');break}case"remove-equipment":{const i=e.closest(".repeatable-row");i==null||i.remove(),this.equipmentListEl.querySelector(".repeatable-row")||(this.equipmentListEl.innerHTML='<p class="empty">No equipment entries yet.</p>');break}}}async deleteCurrentUnit(){if(!this.currentUnitId){this.setStatus("Select a saved unit before deleting.","error");return}if(window.confirm("Delete this unit permanently?"))try{this.setStatus("Deleting unit...","default"),await N.deleteUnit(this.currentUnitId),this.currentUnitId=void 0,this.startNewUnit(),this.setStatus("Unit removed.","success")}catch(e){const s=e instanceof Error?e.message:String(e);this.setStatus(`Failed to delete unit: ${s}`,"error")}}renderUnitList(){if(!this.unitListEl)return;this.unitListEl.innerHTML="";const t=this.searchInput.value.trim().toLowerCase(),e=this.categoryFilter.value,s=this.units.map((a,o)=>({unit:a,index:o})).filter(({unit:a})=>t?`${a.name??""} ${a.category??""}`.toLowerCase().includes(t):!0).filter(({unit:a})=>e?(a.category||"").toUpperCase()===e:!0),i=this.sortModeSelect.value;if(s.sort((a,o)=>{switch(i){case"name-desc":return(o.unit.name||"").localeCompare(a.unit.name||"");case"price-asc":return(Number(a.unit.price)||0)-(Number(o.unit.price)||0);case"price-desc":return(Number(o.unit.price)||0)-(Number(a.unit.price)||0);case"name-asc":default:return(a.unit.name||"").localeCompare(o.unit.name||"")}}),!s.length){this.unitListEl.innerHTML='<p class="empty">No units match the current search.</p>';return}s.forEach(({unit:a,index:o})=>{const c=document.createElement("button");c.type="button",c.className="unit-pill",c.dataset.index=o.toString(),this.currentUnitId&&a.id===this.currentUnitId&&c.classList.add("active"),c.innerHTML=`
        <span class="title">${a.name||"Unnamed unit"}</span>
        <span class="meta">${a.category||"?"} Â· ${a.tier||"Tier ?"} Â· ${a.price??"â€”"} pts</span>
      `,this.unitListEl.appendChild(c)})}loadUnit(t){this.workingCopy=F(t),this.currentUnitId=typeof t.id=="number"?t.id:void 0,this.pendingName=void 0,this.populateForm(this.workingCopy),this.setSummary(this.workingCopy.name?`Editing ${this.workingCopy.name}`:"Editing unit"),this.renderUnitList(),this.setStatus("Unit loaded.","default")}startNewUnit(){this.workingCopy=G(),this.currentUnitId=void 0,this.pendingName=void 0,this.populateForm(this.workingCopy),this.setSummary("New unit draft"),this.renderUnitList(),this.setStatus("Ready to capture a new unit.","default")}resetCurrentUnit(){if(this.currentUnitId){const t=this.units.find(e=>e.id===this.currentUnitId);if(t){this.loadUnit(t);return}}this.startNewUnit()}populateForm(t){var o,c,d;const e=(h,f)=>{const v=this.form.querySelector(`[name="${h}"]`);v&&(v.value=f==null?"":String(f))};e("unit-id",t.id),e("name",t.name??""),e("category",t.category??""),e("internalCategory",t.internalCategory??""),e("tier",t.tier??""),e("price",t.price??""),e("image",t.image??""),e("description",t.description??"");const s=t.stats??{};e("stats.armor",s.armor??""),e("stats.health",s.health??""),e("stats.squadSize",s.squadSize??""),e("stats.visualRange",s.visualRange??""),e("stats.stealth",s.stealth??""),e("stats.speed",s.speed??""),e("stats.weight",s.weight??"");const i=t.capabilities??{};e("cap.staticLineJump",R(i.staticLineJump)),e("cap.haloHaho",R(i.haloHaho)),e("cap.laserDesignator",R(i.laserDesignator)),e("cap.sprint.distance",((o=i.sprint)==null?void 0:o.distance)??""),e("cap.sprint.speed",((c=i.sprint)==null?void 0:c.speed)??""),e("cap.sprint.cooldown",((d=i.sprint)==null?void 0:d.cooldown)??"");const a=t.grenades??{};e("grenades.smoke",a.smoke??""),e("grenades.flash",a.flash??""),e("grenades.thermite",a.thermite??""),e("grenades.frag",a.frag??""),e("grenades.total",a.total??""),this.renderGunList(t.guns??[]),this.renderEquipmentList(t.equipment??[])}renderGunList(t){if(this.gunListEl){if(!t.length){this.gunListEl.innerHTML='<p class="empty">No weapons configured.</p>';return}this.gunListEl.innerHTML="",t.forEach(e=>this.appendGunRow(e))}}renderEquipmentList(t){if(this.equipmentListEl){if(!t.length){this.equipmentListEl.innerHTML='<p class="empty">No equipment entries yet.</p>';return}this.equipmentListEl.innerHTML="",t.forEach(e=>this.appendEquipmentRow(e))}}appendGunRow(t){if(!this.gunListEl)return;this.gunListEl.querySelector(".empty")&&(this.gunListEl.innerHTML="");const e=document.createElement("div");e.className="repeatable-row",e.innerHTML=`
      <div class="row-header">
        <strong data-role="row-title">${(t==null?void 0:t.name)||"New weapon"}</strong>
        <button type="button" class="ghost" data-action="remove-gun">Remove</button>
      </div>
      <div class="repeatable-grid">
        <label>Name<input data-field="name" value="${(t==null?void 0:t.name)??""}" /></label>
        <label>Category<input data-field="category" value="${(t==null?void 0:t.category)??""}" /></label>
        <label>Caliber<input data-field="caliber" value="${(t==null?void 0:t.caliber)??""}" /></label>
        <label>Barrel length<input data-field="barrelLength" type="number" step="0.1" value="${(t==null?void 0:t.barrelLength)??""}" /></label>
          <label>Range (m)<input data-field="range" type="number" step="1" value="${(t==null?void 0:t.range)??""}" /></label>
          <label>Dispersion (%)<input data-field="dispersion" type="number" step="0.01" value="${(t==null?void 0:t.dispersion)??""}" /></label>
        <label>Count<input data-field="count" type="number" step="1" min="0" value="${(t==null?void 0:t.count)??""}" /></label>
        <label>Ammo / soldier<input data-field="ammoPerSoldier" type="number" step="1" min="0" value="${(t==null?void 0:t.ammoPerSoldier)??""}" /></label>
        <label>Total ammo<input data-field="totalAmmo" type="number" step="1" min="0" value="${(t==null?void 0:t.totalAmmo)??""}" /></label>
        <label>Magazine size<input data-field="magazineSize" type="number" step="1" min="0" value="${(t==null?void 0:t.magazineSize)??""}" /></label>
        <label>Reload speed<input data-field="reloadSpeed" type="number" step="0.1" value="${(t==null?void 0:t.reloadSpeed)??""}" /></label>
        <label>Target acquisition<input data-field="targetAcquisition" type="number" step="0.1" value="${(t==null?void 0:t.targetAcquisition)??""}" /></label>
      </div>
    `;const s=e.querySelector('[data-field="name"]'),i=e.querySelector('[data-role="row-title"]');s==null||s.addEventListener("input",()=>{i&&(i.textContent=s.value||"New weapon")});const a=document.createElement("div");a.className="subpanel";const o=document.createElement("div");o.className="subpanel-heading",o.innerHTML="<strong>Ammo types</strong>";const c=document.createElement("div");c.className="header-actions";const d=document.createElement("select");d.className="ghost small";const h=()=>{d.innerHTML='<option value="">From library...</option>',this.ammoTemplates.forEach((n,p)=>{const y=document.createElement("option");y.value=p.toString(),y.textContent=n.name||`Template ${p+1}`,d.appendChild(y)})};h(),d.addEventListener("focus",h),d.addEventListener("change",()=>{if(!d.value)return;const n=this.ammoTemplates[Number(d.value)];n&&(w(F(n)),$()),d.value=""});const f=document.createElement("button");f.type="button",f.className="ghost small",f.textContent="Add ammo",c.append(d,f),o.appendChild(c);const v=document.createElement("div");v.className="subpanel-list ammo-list";const m=document.createElement("div");m.className="subpanel";const u=document.createElement("div");u.className="subpanel-heading",u.innerHTML="<strong>Fire modes</strong>";const g=document.createElement("div");g.className="header-actions";const E=document.createElement("select");E.className="ghost small";const S=()=>{E.innerHTML='<option value="">From library...</option>',this.fireTemplates.forEach((n,p)=>{const y=document.createElement("option");y.value=p.toString(),y.textContent=n.name||`Mode ${p+1}`,E.appendChild(y)})};S(),E.addEventListener("focus",S),E.addEventListener("change",()=>{if(!E.value)return;const n=this.fireTemplates[Number(E.value)];n&&(M(F(n)),$()),E.value=""});const C=document.createElement("button");C.type="button",C.className="ghost small",C.textContent="Add fire mode",g.append(E,C),u.appendChild(g);const L=document.createElement("div");L.className="subpanel-list fire-list";const w=n=>{var B,V;const p=document.createElement("div");p.className="ammo-row",p.innerHTML=`
        <div class="subgrid">
          <label>Name<input data-ammo-field="name" value="${(n==null?void 0:n.name)??""}" /></label>
          <label>Type<input data-ammo-field="ammoType" value="${(n==null?void 0:n.ammoType)??""}" /></label>
          <label>Caliber notes<input data-ammo-field="caliberDesc" value="${(n==null?void 0:n.caliberDesc)??""}" /></label>
          <label>Penetration (mm)<input type="number" step="0.1" data-ammo-field="penetration" value="${(n==null?void 0:n.penetration)??""}" /></label>
          <label>HE value<input type="number" step="0.1" data-ammo-field="heDeadliness" value="${(n==null?void 0:n.heDeadliness)??""}" /></label>
          <label>Dispersion (%)<input type="number" step="0.1" data-ammo-field="dispersion" value="${(n==null?void 0:n.dispersion)??""}" /></label>
          <label>Range delta (%)<input type="number" step="0.1" data-ammo-field="rangeMod" value="${(n==null?void 0:n.rangeMod)??""}" /></label>
          <label>Ammo/Soldier (#)<input type="number" step="1" min="0" data-ammo-field="ammoPerSoldier" value="${(n==null?void 0:n.ammoPerSoldier)??""}" /></label>
          <label>Grain (gr)<input type="number" step="0.1" data-ammo-field="grain" value="${(n==null?void 0:n.grain)??""}" /></label>
          <label>Muzzle velocity (fps)<input type="number" step="1" data-ammo-field="fps" value="${(n==null?void 0:n.fps)??""}" /></label>
          <label>Notes<input data-ammo-field="notes" value="${(n==null?void 0:n.notes)??""}" /></label>
          <label>Airburst
            <select data-ammo-field="airburst">
              <option value="" ${(n==null?void 0:n.airburst)===void 0?"selected":""}>None</option>
              <option value="yes" ${(n==null?void 0:n.airburst)===!0||(n==null?void 0:n.airburst)==="true"?"selected":""}>Yes</option>
              <option value="no" ${(n==null?void 0:n.airburst)===!1||(n==null?void 0:n.airburst)==="false"?"selected":""}>No</option>
            </select>
          </label>
          <label>Sub munitions (#)<input type="number" step="1" min="0" data-ammo-field="subCount" value="${(n==null?void 0:n.subCount)??""}" /></label>
          <label>Sub damage<input type="number" step="0.1" data-ammo-field="subDamage" value="${(n==null?void 0:n.subDamage)??""}" /></label>
          <label>Sub penetration (mm)<input type="number" step="0.1" data-ammo-field="subPenetration" value="${(n==null?void 0:n.subPenetration)??""}" /></label>
        </div>
        <div class="row-actions">
          <button type="button" class="ghost small" data-action="remove-ammo">Remove ammo</button>
        </div>
      `,(B=p.querySelector('[data-action="remove-ammo"]'))==null||B.addEventListener("click",()=>{p.remove(),$()}),v.appendChild(p);const y=p.querySelector('input[data-ammo-field="grain"]'),I=p.querySelector('input[data-ammo-field="fps"]'),H=()=>{var U;return parseFloat(((U=e.querySelector('[data-field="barrelLength"]'))==null?void 0:U.value)||"0")||0},x=()=>{if(!y||!I)return;const U=parseFloat(y.value||"0"),j=H();if(Number.isNaN(U)||Number.isNaN(j))return;const Y=Math.max(200,Math.round(700+j*30-U*1.5));I.value=Y.toString()};y==null||y.addEventListener("input",x),(V=e.querySelector('[data-field="barrelLength"]'))==null||V.addEventListener("input",x)},M=n=>{var y;const p=document.createElement("div");p.className="fire-row",p.innerHTML=`
        <div class="subgrid">
          <label>Name<input data-fire-field="name" value="${(n==null?void 0:n.name)??""}" /></label>
          <label>Rounds / burst (#)<input type="number" step="1" min="0" data-fire-field="rounds" value="${(n==null?void 0:n.rounds)??""}" /></label>
          <label>Burst duration (s)<input type="number" step="0.1" min="0" data-fire-field="burstDuration" value="${(n==null?void 0:n.burstDuration)??""}" /></label>
          <label>Cooldown (s)<input type="number" step="0.1" min="0" data-fire-field="cooldown" value="${(n==null?void 0:n.cooldown)??""}" /></label>
          <label>Ammo reference<select data-fire-field="ammoRef"></select></label>
        </div>
        <div class="row-actions">
          <button type="button" class="ghost small" data-action="remove-fire">Remove mode</button>
        </div>
      `,(y=p.querySelector('[data-action="remove-fire"]'))==null||y.addEventListener("click",()=>{p.remove()}),L.appendChild(p)},W=()=>Array.from(v.querySelectorAll('input[data-ammo-field="name"]')).map(n=>n.value.trim()).filter(Boolean),$=()=>{const n=W();L.querySelectorAll('select[data-fire-field="ammoRef"]').forEach(p=>{const y=p.value||p.dataset.prefill||"";p.innerHTML="";const I=document.createElement("option");I.value="",I.textContent="None",p.appendChild(I),n.forEach(H=>{const x=document.createElement("option");x.value=H,x.textContent=H,p.appendChild(x)}),n.includes(y)?p.value=y:(p.value="",y&&(p.dataset.prefill=y))})};f.addEventListener("click",()=>{w(),$()}),C.addEventListener("click",()=>{M(),$()}),(Array.isArray(t==null?void 0:t.ammoTypes)&&(t!=null&&t.ammoTypes.length)?t.ammoTypes:[void 0]).forEach(n=>w(n)),(Array.isArray(t==null?void 0:t.fireModes)&&(t!=null&&t.fireModes.length)?t.fireModes:[void 0]).forEach(n=>M(n)),v.addEventListener("input",n=>{n.target.matches('[data-ammo-field="name"]')&&$()}),a.append(o,v),m.append(u,L),e.append(m,a),this.gunListEl.appendChild(e),$()}appendEquipmentRow(t){if(!this.equipmentListEl)return;this.equipmentListEl.querySelector(".empty")&&(this.equipmentListEl.innerHTML="");const e=document.createElement("div");e.className="repeatable-row",e.innerHTML=`
      <div class="row-header">
        <strong data-role="row-title">${(t==null?void 0:t.name)||"New equipment"}</strong>
        <button type="button" class="ghost" data-action="remove-equipment">Remove</button>
      </div>
      <div class="repeatable-grid">
        <label>Name<input data-field="name" value="${(t==null?void 0:t.name)??""}" /></label>
        <label>Type<input data-field="type" value="${(t==null?void 0:t.type)??""}" /></label>
        <label>Description<input data-field="description" value="${(t==null?void 0:t.description)??""}" /></label>
        <label>Notes<input data-field="notes" value="${(t==null?void 0:t.notes)??""}" /></label>
        <label>Quantity<input data-field="count" type="number" step="1" min="0" value="${(t==null?void 0:t.count)??""}" /></label>
      </div>
    `;const s=e.querySelector('[data-field="name"]'),i=e.querySelector('[data-role="row-title"]');s==null||s.addEventListener("input",()=>{i&&(i.textContent=s.value||"New equipment")}),this.equipmentListEl.appendChild(e)}collectFormData(){var g;const t=new FormData(this.form),e={},s={},i={id:this.toInt(t.get("unit-id")),name:this.toStringValue(t.get("name"))??"",category:(g=this.toStringValue(t.get("category")))==null?void 0:g.toUpperCase(),internalCategory:this.toStringValue(t.get("internalCategory")),tier:this.toStringValue(t.get("tier")),price:this.toInt(t.get("price")),image:this.toStringValue(t.get("image")),description:this.toStringValue(t.get("description"))};["armor","health","squadSize","visualRange","stealth","speed","weight"].forEach(E=>{const S=this.toNumber(t.get(`stats.${E}`));S!==void 0&&(e[E]=S)}),Object.keys(e).length&&(i.stats=e),["smoke","flash","thermite","frag","total"].forEach(E=>{const S=this.toInt(t.get(`grenades.${E}`));S!==void 0&&(s[E]=S)}),Object.keys(s).length&&(i.grenades=s);const c={},d=D(t.get("cap.staticLineJump"));d!==void 0&&(c.staticLineJump=d);const h=D(t.get("cap.haloHaho"));h!==void 0&&(c.haloHaho=h);const f=D(t.get("cap.laserDesignator"));f!==void 0&&(c.laserDesignator=f);const v=this.toNumber(t.get("cap.sprint.distance")),m=this.toNumber(t.get("cap.sprint.speed")),u=this.toNumber(t.get("cap.sprint.cooldown"));return(v!==void 0||m!==void 0||u!==void 0)&&(c.sprint={distance:v,speed:m,cooldown:u}),Object.keys(c).length&&(i.capabilities=c),i.guns=this.collectGunRows(),i.equipment=this.collectEquipmentRows(),i}collectGunRows(){const t=Array.from(this.gunListEl.querySelectorAll(".repeatable-row")),e=[];return t.forEach(s=>{const i={},a=m=>{var u;return((u=s.querySelector(`[data-field="${m}"]`))==null?void 0:u.value.trim())??""},o=m=>this.parseNumberString(a(m)),c=m=>this.parseIntegerString(a(m));i.name=a("name")||void 0,i.category=a("category")||void 0,i.caliber=a("caliber")||void 0,i.barrelLength=o("barrelLength"),i.range=o("range"),i.dispersion=o("dispersion"),i.count=c("count"),i.ammoPerSoldier=c("ammoPerSoldier"),i.totalAmmo=c("totalAmmo"),!i.totalAmmo&&i.count&&i.ammoPerSoldier&&(i.totalAmmo=i.count*i.ammoPerSoldier),i.magazineSize=c("magazineSize"),i.reloadSpeed=o("reloadSpeed"),i.targetAcquisition=o("targetAcquisition");const h=Array.from(s.querySelectorAll(".ammo-row")).map(m=>{const u=w=>{var M;return((M=m.querySelector(`[data-ammo-field="${w}"]`))==null?void 0:M.value.trim())??""},g=w=>this.parseNumberString(u(w)),E=w=>this.parseIntegerString(u(w)),S={name:u("name")||void 0,ammoType:u("ammoType")||void 0,caliberDesc:u("caliberDesc")||void 0,ammoPerSoldier:E("ammoPerSoldier"),penetration:g("penetration"),heDeadliness:g("heDeadliness"),dispersion:g("dispersion"),rangeMod:g("rangeMod"),grain:g("grain"),notes:u("notes")||void 0,fps:g("fps"),subCount:E("subCount"),subDamage:g("subDamage"),subPenetration:g("subPenetration")},C=u("airburst");return C==="yes"?S.airburst=!0:C==="no"&&(S.airburst=!1),Object.values(S).some(w=>w!==void 0&&w!=="")?S:null}).filter(m=>!!m);h.length&&(i.ammoTypes=h);const v=Array.from(s.querySelectorAll(".fire-row")).map(m=>{const u=L=>{var w;return((w=m.querySelector(`[data-fire-field="${L}"]`))==null?void 0:w.value.trim())??""},g=L=>this.parseNumberString(u(L)),E=L=>this.parseIntegerString(u(L)),S={name:u("name")||void 0,rounds:E("rounds"),burstDuration:g("burstDuration"),cooldown:g("cooldown"),ammoRef:u("ammoRef")||void 0};return Object.values(S).some(L=>L!==void 0&&L!=="")?S:null}).filter(m=>!!m);v.length&&(i.fireModes=v),Object.values(i).some(m=>m!==void 0&&m!=="")&&e.push(i)}),e}collectEquipmentRows(){const t=Array.from(this.equipmentListEl.querySelectorAll(".repeatable-row")),e=[];return t.forEach(s=>{const i={},a=c=>{var d;return((d=s.querySelector(`[data-field="${c}"]`))==null?void 0:d.value.trim())??""},o=c=>this.parseIntegerString(a(c));i.name=a("name")||void 0,i.type=a("type")||void 0,i.description=a("description")||void 0,i.notes=a("notes")||void 0,i.count=o("count"),Object.values(i).some(c=>c!==void 0&&c!=="")&&e.push(i)}),e}syncSelection(){if(this.currentUnitId){const t=this.units.find(e=>e.id===this.currentUnitId);if(t){this.loadUnit(t);return}}if(this.pendingName){const t=this.units.find(e=>{var s;return((s=e.name)==null?void 0:s.toLowerCase())===this.pendingName});if(t){this.loadUnit(t);return}}}toNumber(t){if(t!==null)return this.parseNumberString(t.toString())}toInt(t){if(t!==null)return this.parseIntegerString(t.toString())}parseNumberString(t){const e=t.trim();if(!e)return;const s=Number(e);return Number.isNaN(s)?void 0:s}parseIntegerString(t){const e=t.trim();if(!e)return;const s=Number.parseInt(e,10);return Number.isNaN(s)?void 0:s}toStringValue(t){if(t===null)return;const e=t.toString().trim();return e.length?e:void 0}setStatus(t,e){this.statusEl&&(this.statusEl.textContent=t,this.statusEl.dataset.tone=e)}setSummary(t){this.summaryEl&&(this.summaryEl.textContent=t)}updateTemplateLibraries(t){const e=new Map,s=new Map,i=new Map;t.forEach(a=>{(a.guns||[]).forEach(o=>{(o.ammoTypes||[]).forEach((c,d)=>{var u;const h=`${(u=c.name||`Ammo${d}`)==null?void 0:u.toLowerCase()}-${c.ammoType||""}`;e.has(h)||e.set(h,F(c));const f=(o.caliber||"generic").toLowerCase(),v=i.get(f)??[];v.push(F(c)),i.set(f,v);const m=i.get("generic")??[];m.push(F(c)),i.set("generic",m)}),(o.fireModes||[]).forEach((c,d)=>{var f;const h=`${(f=c.name||`Mode${d}`)==null?void 0:f.toLowerCase()}`;s.has(h)||s.set(h,F(c))})})}),this.ammoTemplates=Array.from(e.values()),this.fireTemplates=Array.from(s.values()),this.ammoLibraryByCaliber=i}}const O=()=>({name:"New Formation",description:"",image:"",categories:[]});class it{constructor(t){r(this,"root");r(this,"listEl");r(this,"formEl");r(this,"statusEl");r(this,"categoryListEl");r(this,"unitsCountEl");r(this,"formations",[]);r(this,"unitOptions",[]);r(this,"subSelectEl");r(this,"formationOptions",[]);r(this,"selectedIndex",0);this.root=t}init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),q.subscribe(t=>{this.formations=t.length?t:[O()],this.formationOptions=t.map((e,s)=>({id:e.id??s+1,name:e.name||`Formation ${s+1}`})),this.renderList(),this.syncSelection()}),N.subscribe(t=>{this.unitOptions=t.map((e,s)=>({id:e.id??s,label:e.name||`Unit ${s+1}`})),this.renderCategories()}),q.loadFormations().catch(t=>{this.setStatus(t instanceof Error?t.message:String(t),"error")})}renderLayout(){this.root.innerHTML=`
      <div class="panel formations-panel">
        <div class="panel-heading">
          <h3>Formations</h3>
          <p class="muted">Capture compositions and assign unit categories.</p>
        </div>
        <div class="split-layout">
          <aside class="list-pane">
            <div class="list-actions">
              <button type="button" class="ghost" data-action="add-formation">+ Formation</button>
            </div>
            <div class="list-scroll" data-role="formation-list"></div>
          </aside>
          <section class="detail-pane">
            <form data-role="formation-form" class="grid-3">
              <div class="field">
                <label>Name</label>
                <input name="name" autocomplete="off" />
              </div>
              <div class="field">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
              </div>
              <div class="field">
                <label>Image</label>
                <input name="image" placeholder="formations/path.png" />
              </div>
              <div class="field full">
                <div class="panel-heading compact">
                  <label>Categories</label>
                  <button type="button" class="ghost" data-action="add-category">Add category</button>
                </div>
                <div class="category-editor" data-role="category-editor"></div>
              </div>
              <div class="field full">
                <label>Sub formations</label>
                <select data-role="sub-formations" multiple size="6"></select>
              </div>
              <div class="field full">
                <button type="submit" class="primary">Save formation</button>
              </div>
            </form>
            <div class="status-bar compact" data-role="formation-status">Select a formation.</div>
            <div class="helper-text">
              Unique units assigned: <strong data-role="formation-units-count">0</strong>
            </div>
          </section>
        </div>
      </div>
    `}cacheElements(){this.listEl=this.root.querySelector('[data-role="formation-list"]'),this.formEl=this.root.querySelector('[data-role="formation-form"]'),this.statusEl=this.root.querySelector('[data-role="formation-status"]'),this.categoryListEl=this.root.querySelector('[data-role="category-editor"]'),this.unitsCountEl=this.root.querySelector('[data-role="formation-units-count"]'),this.subSelectEl=this.root.querySelector('[data-role="sub-formations"]')}bindEvents(){this.listEl.addEventListener("click",t=>{const e=t.target.closest("[data-index]");e&&(this.selectedIndex=Number(e.dataset.index),this.syncSelection())}),this.formEl.addEventListener("submit",t=>{t.preventDefault(),this.saveFormation()}),this.root.addEventListener("click",t=>{var i;const e=t.target.closest("[data-action]");if(!e)return;const s=e.dataset.action;s==="add-formation"?this.addFormation():s==="add-category"?this.appendCategoryRow():s==="remove-category"&&((i=e.closest(".category-row"))==null||i.remove(),this.updateUnitsCount(this.collectCategoriesFromDom()))})}addFormation(){this.formations.push(O()),this.selectedIndex=this.formations.length-1,this.renderList(),this.syncSelection()}renderList(){if(!this.formations.length){this.listEl.innerHTML='<p class="empty">No formations found.</p>';return}this.listEl.innerHTML="",this.formations.forEach((t,e)=>{var i;const s=document.createElement("button");s.type="button",s.dataset.index=e.toString(),s.className=`list-pill${e===this.selectedIndex?" active":""}`,s.innerHTML=`
        <span class="title">${t.name||"Untitled formation"}</span>
        <span class="meta">${((i=t.categories)==null?void 0:i.length)??0} categories</span>
      `,this.listEl.appendChild(s)})}syncSelection(){this.formations.length||(this.formations=[O()]),(this.selectedIndex<0||this.selectedIndex>=this.formations.length)&&(this.selectedIndex=0);const t=this.formations[this.selectedIndex];this.formEl.elements.namedItem("name").value=t.name||"",this.formEl.elements.namedItem("description").value=t.description||"",this.formEl.elements.namedItem("image").value=t.image||"",this.renderList(),this.renderCategories(),this.setStatus(`Editing ${t.name||"formation"}.`,"default")}renderCategories(){this.categoryListEl.innerHTML="";const e=this.formations[this.selectedIndex].categories||[];if(e.length)e.forEach(s=>this.appendCategoryRow(s));else{const s=document.createElement("p");s.className="empty",s.textContent="No categories yet. Add one to assign units.",this.categoryListEl.appendChild(s)}this.updateUnitsCount(e)}appendCategoryRow(t){const e=document.createElement("div");e.className="category-row",e.innerHTML=`
      <div class="field">
        <label>Category name</label>
        <input data-field="name" value="${(t==null?void 0:t.name)||""}" />
      </div>
      <div class="field">
        <label>Assign units</label>
        <select data-field="units" multiple size="5"></select>
      </div>
      <div class="row-actions">
        <button type="button" class="ghost" data-action="remove-category">Remove</button>
      </div>
    `;const s=e.querySelector('select[data-field="units"]'),i=new Set(((t==null?void 0:t.units)||[]).map(a=>Number(a)));this.populateUnitOptions(s,i),this.categoryListEl.appendChild(e)}populateUnitOptions(t,e){if(t.innerHTML="",!this.unitOptions.length){const s=document.createElement("option");s.textContent="No units available",s.disabled=!0,t.appendChild(s);return}this.unitOptions.forEach(({id:s,label:i})=>{const a=document.createElement("option");a.value=s.toString(),a.textContent=i,e.has(s)&&(a.selected=!0),t.appendChild(a)})}collectCategoriesFromDom(){return Array.from(this.categoryListEl.querySelectorAll(".category-row")).map(e=>{const s=e.querySelector('input[data-field="name"]'),i=e.querySelector('select[data-field="units"]'),a=i?Array.from(i.selectedOptions).map(o=>Number(o.value)).filter(o=>!Number.isNaN(o)):[];return{name:((s==null?void 0:s.value)||"").trim(),units:a}})}updateUnitsCount(t){const e=new Set;t.forEach(s=>(s.units||[]).forEach(i=>e.add(i))),this.unitsCountEl.textContent=e.size.toString(),this.renderSubFormationOptions()}saveFormation(){if(!this.formations.length)return;const t={...this.formations[this.selectedIndex]};t.name=this.formEl.elements.namedItem("name").value.trim(),t.description=this.formEl.elements.namedItem("description").value.trim(),t.image=this.formEl.elements.namedItem("image").value.trim(),t.categories=this.collectCategoriesFromDom(),t.subFormations=Array.from(this.subSelectEl.selectedOptions).map(e=>Number(e.value)).filter(e=>!Number.isNaN(e)),this.updateUnitsCount(t.categories||[]),this.formations[this.selectedIndex]=t,q.saveFormations(this.formations).then(()=>this.setStatus("Formation saved.","success")).catch(e=>this.setStatus(e instanceof Error?e.message:String(e),"error"))}renderSubFormationOptions(){if(!this.subSelectEl)return;const t=this.formations[this.selectedIndex];this.subSelectEl.innerHTML="";const e=this.formationOptions.filter(s=>s.id&&s.id!==(t==null?void 0:t.id));if(!e.length){const s=document.createElement("option");s.disabled=!0,s.textContent="No other formations available",this.subSelectEl.appendChild(s);return}e.forEach(s=>{var a;const i=document.createElement("option");i.value=s.id.toString(),i.textContent=s.name,(a=t==null?void 0:t.subFormations)!=null&&a.includes(s.id)&&(i.selected=!0),this.subSelectEl.appendChild(i)})}setStatus(t,e){this.statusEl.textContent=t,this.statusEl.dataset.tone=e}}const P=()=>({name:"New Nation",description:"",image:"",formations:[]});class at{constructor(t){r(this,"root");r(this,"listEl");r(this,"formEl");r(this,"statusEl");r(this,"formationSelectEl");r(this,"nations",[]);r(this,"formationOptions",[]);r(this,"selectedIndex",0);this.root=t}init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),A.subscribe(t=>{this.nations=t.length?t:[P()],this.renderList(),this.syncSelection()}),q.subscribe(t=>{this.formationOptions=t.map((e,s)=>({id:e.id??s,name:e.name||`Formation ${s+1}`})),this.renderFormationSelect()}),A.loadNations().catch(t=>{this.setStatus(t instanceof Error?t.message:String(t),"error")})}renderLayout(){this.root.innerHTML=`
      <div class="panel nations-panel">
        <div class="panel-heading">
          <h3>Nations</h3>
          <p class="muted">Assign formations to a nation profile.</p>
        </div>
        <div class="split-layout">
          <aside class="list-pane">
            <div class="list-actions">
              <button type="button" class="ghost" data-action="add-nation">+ Nation</button>
            </div>
            <div class="list-scroll" data-role="nation-list"></div>
          </aside>
          <section class="detail-pane">
            <form data-role="nation-form" class="grid-3">
              <div class="field">
                <label>Name</label>
                <input name="name" autocomplete="off" />
              </div>
              <div class="field">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
              </div>
              <div class="field">
                <label>Image</label>
                <input name="image" placeholder="nations/emblem.png" />
              </div>
              <div class="field full">
                <div class="panel-heading compact">
                  <label>Assigned formations</label>
                  <span class="muted small">Ctrl/Cmd + Click to multi-select</span>
                </div>
                <select data-role="formation-select" multiple size="6"></select>
              </div>
              <div class="field full">
                <button type="submit" class="primary">Save nation</button>
              </div>
            </form>
            <div class="status-bar compact" data-role="nation-status">Select a nation.</div>
          </section>
        </div>
      </div>
    `}cacheElements(){this.listEl=this.root.querySelector('[data-role="nation-list"]'),this.formEl=this.root.querySelector('[data-role="nation-form"]'),this.statusEl=this.root.querySelector('[data-role="nation-status"]'),this.formationSelectEl=this.root.querySelector('[data-role="formation-select"]')}bindEvents(){this.listEl.addEventListener("click",t=>{const e=t.target.closest("[data-index]");e&&(this.selectedIndex=Number(e.dataset.index),this.syncSelection())}),this.formEl.addEventListener("submit",t=>{t.preventDefault(),this.saveNation()}),this.root.addEventListener("click",t=>{const e=t.target.closest("[data-action]");e&&e.dataset.action==="add-nation"&&this.addNation()})}addNation(){this.nations.push(P()),this.selectedIndex=this.nations.length-1,this.renderList(),this.syncSelection()}renderList(){if(!this.nations.length){this.listEl.innerHTML='<p class="empty">No nations defined.</p>';return}this.listEl.innerHTML="",this.nations.forEach((t,e)=>{var i;const s=document.createElement("button");s.type="button",s.dataset.index=e.toString(),s.className=`list-pill${e===this.selectedIndex?" active":""}`,s.innerHTML=`
        <span class="title">${t.name||"Unnamed nation"}</span>
        <span class="meta">${((i=t.formations)==null?void 0:i.length)??0} formations</span>
      `,this.listEl.appendChild(s)})}syncSelection(){this.nations.length||(this.nations=[P()]),(this.selectedIndex<0||this.selectedIndex>=this.nations.length)&&(this.selectedIndex=0);const t=this.nations[this.selectedIndex];this.formEl.elements.namedItem("name").value=t.name||"",this.formEl.elements.namedItem("description").value=t.description||"",this.formEl.elements.namedItem("image").value=t.image||"",this.renderList(),this.renderFormationSelect(),this.setStatus(`Editing ${t.name||"nation"}.`,"default")}renderFormationSelect(){if(!this.formationSelectEl)return;const t=this.nations[this.selectedIndex],e=new Set(((t==null?void 0:t.formations)||[]).map(s=>Number(s)));if(this.formationSelectEl.innerHTML="",!this.formationOptions.length){const s=document.createElement("option");s.disabled=!0,s.textContent="No formations available",this.formationSelectEl.appendChild(s);return}this.formationOptions.forEach(({id:s,name:i})=>{const a=document.createElement("option");a.value=s.toString(),a.textContent=i,e.has(s)&&(a.selected=!0),this.formationSelectEl.appendChild(a)})}saveNation(){if(!this.nations.length)return;const t={...this.nations[this.selectedIndex]};t.name=this.formEl.elements.namedItem("name").value.trim(),t.description=this.formEl.elements.namedItem("description").value.trim(),t.image=this.formEl.elements.namedItem("image").value.trim(),t.formations=Array.from(this.formationSelectEl.selectedOptions).map(e=>Number(e.value)).filter(e=>!Number.isNaN(e)),this.nations[this.selectedIndex]=t,A.saveNations(this.nations).then(()=>this.setStatus("Nation saved.","success")).catch(e=>this.setStatus(e instanceof Error?e.message:String(e),"error"))}setStatus(t,e){this.statusEl.textContent=t,this.statusEl.dataset.tone=e}}const nt="#6dd5fa",z=(l,t,e)=>Math.min(Math.max(l,t),e),ot=(l,t)=>{const e=l.replace("#","");if(!/^[0-9a-f]{6}$/i.test(e))return l;const s=parseInt(e,16),i=z((s>>16&255)+t*255,0,255),a=z((s>>8&255)+t*255,0,255),o=z((s&255)+t*255,0,255);return`#${((1<<24)+(Math.round(i)<<16)+(Math.round(a)<<8)+Math.round(o)).toString(16).slice(1)}`},J=l=>{const t=document.documentElement,e=l.theme||"";e?t.dataset.theme=e:t.removeAttribute("data-theme");const s=typeof l.accentColor=="string"&&l.accentColor?l.accentColor:nt;t.style.setProperty("--accent",s),t.style.setProperty("--accent-dark",ot(s,-.35))};class rt{constructor(t){r(this,"root");r(this,"formEl");r(this,"statusEl");r(this,"settings",{});this.root=t}init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),T.subscribe(t=>{this.settings=t,this.syncForm()}),T.loadSettings().catch(t=>{this.setStatus(t instanceof Error?t.message:String(t),"error")})}renderLayout(){this.root.innerHTML=`
      <div class="panel settings-panel">
        <div class="panel-heading">
          <h3>Application Settings</h3>
          <p class="muted">Customize theme, locale, and experimental flags.</p>
        </div>
        <form class="grid-3" data-role="settings-form">
          <div class="field">
            <label>Theme</label>
            <select name="theme">
              <option value="">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div class="field">
            <label>Locale</label>
            <input name="locale" placeholder="en-US" />
          </div>
          <div class="field">
            <label>Accent color</label>
            <input name="accentColor" type="color" value="#6dd5fa" />
          </div>
          <div class="field">
            <label>
              <input type="checkbox" name="enableExperimental" />
              Enable experimental modules
            </label>
          </div>
          <div class="field full">
            <button type="submit" class="primary">Save settings</button>
          </div>
        </form>
        <div class="status-bar compact" data-role="settings-status">Adjust settings and save.</div>
      </div>
    `}cacheElements(){this.formEl=this.root.querySelector('[data-role="settings-form"]'),this.statusEl=this.root.querySelector('[data-role="settings-status"]')}bindEvents(){this.formEl.addEventListener("submit",t=>{t.preventDefault(),this.persist()})}syncForm(){this.formEl.elements.namedItem("theme").value=this.settings.theme||"",this.formEl.elements.namedItem("locale").value=this.settings.locale||"",this.formEl.elements.namedItem("accentColor").value=typeof this.settings.accentColor=="string"&&this.settings.accentColor.startsWith("#")?this.settings.accentColor:"#6dd5fa",this.formEl.elements.namedItem("enableExperimental").checked=!!this.settings.enableExperimental}persist(){const t={theme:this.formEl.elements.namedItem("theme").value||void 0,locale:this.formEl.elements.namedItem("locale").value||void 0,accentColor:this.formEl.elements.namedItem("accentColor").value||void 0,enableExperimental:this.formEl.elements.namedItem("enableExperimental").checked};J(t),T.saveSettings(t).then(()=>this.setStatus("Settings saved.","success")).catch(e=>this.setStatus(e instanceof Error?e.message:String(e),"error"))}setStatus(t,e){this.statusEl.textContent=t,this.statusEl.dataset.tone=e}}class lt{constructor(t){r(this,"root");r(this,"unitCountEl");r(this,"formationCountEl");r(this,"nationCountEl");r(this,"favoriteCategoryEl");this.root=t}init(){this.renderLayout(),N.subscribe(t=>{this.unitCountEl.textContent=t.length.toString();const e=t.reduce((i,a)=>{const o=(a.category||"Unknown").toUpperCase();return i[o]=(i[o]||0)+1,i},{}),s=Object.entries(e).sort((i,a)=>a[1]-i[1])[0];this.favoriteCategoryEl.textContent=s?`${s[0]} (${s[1]})`:"—"}),q.subscribe(t=>{this.formationCountEl.textContent=t.length.toString()}),A.subscribe(t=>{this.nationCountEl.textContent=t.length.toString()})}renderLayout(){this.root.innerHTML=`
      <div class="panel stats-panel">
        <div class="panel-heading">
          <h3>Force Overview</h3>
          <p class="muted">Live metrics pulled from SQLite</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="label">Units</span>
            <strong data-role="stat-units">0</strong>
          </div>
          <div class="stat-card">
            <span class="label">Formations</span>
            <strong data-role="stat-formations">0</strong>
          </div>
          <div class="stat-card">
            <span class="label">Nations</span>
            <strong data-role="stat-nations">0</strong>
          </div>
          <div class="stat-card">
            <span class="label">Top category</span>
            <strong data-role="stat-category">—</strong>
          </div>
        </div>
        <p class="muted">Radar visualizations and legacy views will return here soon.</p>
      </div>
    `,this.unitCountEl=this.root.querySelector('[data-role="stat-units"]'),this.formationCountEl=this.root.querySelector('[data-role="stat-formations"]'),this.nationCountEl=this.root.querySelector('[data-role="stat-nations"]'),this.favoriteCategoryEl=this.root.querySelector('[data-role="stat-category"]')}}const ct=[{key:"units",label:"Units",description:"Edit and score tactical units",group:"Editors",factory:l=>new st(l)},{key:"formations",label:"Formations",description:"Structure categories per formation",group:"Editors",factory:l=>new it(l)},{key:"nations",label:"Nations",description:"Assign formations to nations",group:"Editors",factory:l=>new at(l)},{key:"settings",label:"Settings",description:"Application preferences",group:"Editors",factory:l=>new rt(l)},{key:"insights",label:"Insights",description:"Force readiness overview",group:"Insights",factory:l=>new lt(l)}],k=document.querySelector("#app");if(k){k.innerHTML=`
    <div class="app-layout">
      <aside class="primary-nav">
        <div class="brand">
          <span class="eyebrow">Philly's RTS Toolkit</span>
          <h1>Operations Console</h1>
        </div>
        <nav class="nav-sections" data-role="nav-container"></nav>
      </aside>
      <main class="view-host" data-role="view-host"></main>
    </div>
  `;const l=k.querySelector('[data-role="nav-container"]'),t=k.querySelector('[data-role="view-host"]'),e=new Map,s=new Map,i=new Map;ct.forEach((o,c)=>{let d=i.get(o.group);if(!d){const u=document.createElement("div");u.className="nav-section";const g=document.createElement("p");g.className="section-label",g.textContent=o.group,d=document.createElement("div"),d.className="nav-list",u.append(g,d),l.appendChild(u),i.set(o.group,d)}const h=document.createElement("button");h.type="button",h.className="nav-chip",h.dataset.panel=o.key,h.innerHTML=`
      <div class="nav-chip-head">
        <span class="label">${o.label}</span>
        <span class="badge" data-panel-count="${o.key}">--</span>
      </div>
      <span class="meta">${o.description}</span>
    `,d.appendChild(h);const f=h.querySelector(`[data-panel-count="${o.key}"]`);f&&s.set(o.key,f);const v=document.createElement("section");v.className="view-panel",v.dataset.panel=o.key,t.appendChild(v);const m=o.factory(v);Promise.resolve(m.init()).catch(u=>{console.error(`Failed to init ${o.key}`,u)}),e.set(o.key,{node:v}),c===0&&(h.classList.add("active"),v.classList.add("active"))}),l.addEventListener("click",o=>{var h;const c=o.target.closest(".nav-chip");if(!c)return;const d=c.dataset.panel;d&&(l.querySelectorAll(".nav-chip").forEach(f=>f.classList.remove("active")),c.classList.add("active"),t.querySelectorAll(".view-panel").forEach(f=>f.classList.remove("active")),(h=e.get(d))==null||h.node.classList.add("active"))});const a=(o,c)=>{const d=s.get(o);d&&(d.textContent=c)};N.subscribe(o=>a("units",`${o.length} units`)),q.subscribe(o=>a("formations",`${o.length} groups`)),A.subscribe(o=>a("nations",`${o.length} nations`)),T.subscribe(o=>{a("settings",o.theme?o.theme:"System"),J(o)}),a("insights","Live metrics"),N.loadUnits().catch(()=>{}),q.loadFormations().catch(()=>{}),A.loadNations().catch(()=>{}),T.loadSettings().catch(()=>{})}b.isAvailable&&(b.postMessage("host-info-request"),b.waitFor("host-info",2e3).then(l=>{console.info("[Host]",l)}));
//# sourceMappingURL=index-IqarBBzt.js.map
