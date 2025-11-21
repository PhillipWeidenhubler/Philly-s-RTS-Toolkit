var _e=Object.defineProperty;var Je=(o,e,t)=>e in o?_e(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var r=(o,e,t)=>Je(o,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function t(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=t(i);fetch(i.href,a)}})();const Ye="modulepreload",Qe=function(o,e){return new URL(o,e).href},Fe={},Ue=function(e,t,s){let i=Promise.resolve();if(t&&t.length>0){const c=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),h=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));i=Promise.allSettled(t.map(g=>{if(g=Qe(g,s),g in Fe)return;Fe[g]=!0;const v=g.endsWith(".css"),d=v?'[rel="stylesheet"]':"";if(!!s)for(let m=c.length-1;m>=0;m--){const E=c[m];if(E.href===g&&(!v||E.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${g}"]${d}`))return;const b=document.createElement("link");if(b.rel=v?"stylesheet":Ye,v||(b.as="script"),b.crossOrigin="",b.href=g,h&&b.setAttribute("nonce",h),document.head.appendChild(b),v)return new Promise((m,E)=>{b.addEventListener("load",m),b.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${g}`)))})}))}function a(c){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=c,window.dispatchEvent(l),!l.defaultPrevented)throw c}return i.then(c=>{for(const l of c||[])l.status==="rejected"&&a(l.reason);return e().catch(a)})};class Ze{constructor(){r(this,"listeners",new Map);r(this,"isAvailable");var e,t,s;this.isAvailable=!!((e=window.chrome)!=null&&e.webview),this.isAvailable?(s=(t=window.chrome)==null?void 0:t.webview)==null||s.addEventListener("message",i=>this.handleEnvelope(i==null?void 0:i.data)):console.info("[HostBridge] Running without desktop host; messaging will be no-ops.")}handleEnvelope(e){!e||typeof e!="object"||!e.type||this.emit(e.type,e.payload)}postMessage(e,t){if(!this.isAvailable){console.warn(`[HostBridge] Skipping "${e}" message because WebView host is unavailable.`);return}window.chrome.webview.postMessage({type:e,payload:t})}request(e,t,s,i=1e4){if(!this.isAvailable)return Promise.reject(new Error("Host bridge is not available."));const a=s??e,c=this.waitFor(a,i);return this.postMessage(e,t),c}waitFor(e,t=1e4){return new Promise((s,i)=>{const a=l=>{this.off(e,a),clearTimeout(c),s(l)},c=window.setTimeout(()=>{this.off(e,a),i(new Error(`Timed out waiting for host payload "${e}"`))},t);this.on(e,a)})}on(e,t){const s=this.listeners.get(e)??new Set;return s.add(t),this.listeners.set(e,s),()=>this.off(e,t)}off(e,t){const s=this.listeners.get(e);s&&(s.delete(t),s.size||this.listeners.delete(e))}emit(e,t){const s=this.listeners.get(e);s&&s.forEach(i=>{try{i(t)}catch(a){console.error(`[HostBridge] Listener for "${e}" failed`,a)}})}}const p=new Ze,qe=o=>o==null||o===""?"N/A":String(o),D=o=>{if(typeof o=="number")return o;if(typeof o=="string"){const e=o.match(/-?\d+(\.\d+)?/);return e?parseFloat(e[0]):0}return 0},Xe=o=>{const e=typeof o=="string"?o.toLowerCase():"";return!e&&typeof o!="number"?5:e.includes("era")||e.includes("composite")||e.includes("heavy")?40:e.includes("kevlar")||e.includes("lvl")||e.includes("iii")?25:e.includes("light")?15:Math.max(5,Math.min(35,D(o)*2))},L=o=>Math.max(0,Math.min(100,Math.round(o))),T=o=>JSON.parse(JSON.stringify(o)),z=o=>{if(typeof o=="number"&&Number.isFinite(o))return o;if(typeof o=="string"){const e=o.trim();if(!e)return;const t=Number(e);return Number.isFinite(t)?t:void 0}},we=o=>{const e=new Map;return o.forEach(t=>{if(!t)return;const s=z(t.id);s!==void 0&&e.set(s,t)}),e},Ke=(o,e,t)=>{const s=z(o);if(s!==void 0){if(t.has(s))return t.get(s);if(s>=0&&s<e.length)return e[s]}},Re=(o,e,t)=>{const s=z(o);if(s===void 0)return;if(t.has(s))return t.get(s);if(s>=0&&s<e.length)return e[s];const i=s-1;if(i>=0&&i<e.length)return e[i]},et=o=>{const e=new Set;return(o.subFormations||[]).forEach(t=>{const s=z(t);s!==void 0&&e.add(s)}),(o.subFormationLinks||[]).forEach(t=>{if(!t||typeof t!="object")return;const s=t,i=z(s.formationId)??z(s.id)??z(s.childId);i!==void 0&&e.add(i)}),Array.from(e)},tt=(o,e,t,s,i)=>{const a=[],c=new Set,l=new Set,h=g=>{!g||l.has(g)||(l.add(g),(g.categories||[]).forEach(v=>{(v.units||[]).forEach(d=>{const f=Ke(d,e,t);f&&!c.has(f)&&(c.add(f),a.push(f))})}),et(g).forEach(v=>{const d=Re(v,s,i);d&&h(d)}))};return h(o),a},st=o=>{var N;if(!o)return null;const e=Array.isArray(o.guns)?o.guns:[],t=o.capabilities||{},s=o.stats||{},i=o.grenades||{},a=L(e.reduce((A,x)=>A+D(x.totalAmmo||x.ammoPerSoldier)*.4,0)+D(i.total)*2),c=L(Xe(s.armor)+D(s.health)*.5),l=L(80-D(s.weight)*5-D(o.price)*.001),h=L(D(s.speed)*6+D((N=t==null?void 0:t.sprint)==null?void 0:N.speed)*2),g=L(e.length*6),v=L(D(s.stealth)),d=L(D(s.speed)*10),f=L(50+D(s.health)*.2+D(o.tier)*4),b=L(D(o.tier)*10),m=L(D(i.frag)*6),E=L(e.reduce((A,x)=>{var q;return A+((q=x.category)!=null&&q.includes("Launcher")?15:0)},0)),w=L(e.reduce((A,x)=>{var q;return A+((q=x.category)!=null&&q.includes("AA")?20:0)},0));return{metrics:{lethality:a,survivability:c,sustainability:l,mobility:h,versatility:g,stealth:v,speed:d,morale:f,training:b,antiInfantry:m,antiTank:E,antiAir:w}}},it=(o,e,t=[])=>{if(!o)return null;const s=we(e),i=we(t),a=tt(o,e,s,t,i);if(!a.length)return null;const c=a.map(h=>st(h)).filter(Boolean);if(!c.length)return null;const l=h=>c.reduce((g,v)=>g+(v.metrics[h]||0),0)/c.length;return{metrics:{recon:L(l("stealth")+l("speed")*.5),support:L(l("sustainability")+l("versatility")*.5),armor:L(l("survivability")),infantry:L(l("lethality")),logistics:L(l("sustainability")),air:L(l("antiAir")),sustaiment:L(l("sustainability")),speed:L(l("speed")),supplyEfficiency:L(90-l("mobility")*.3+l("sustainability")*.2),aoSize:L(a.length*5),versatility:L(l("versatility"))}}},At=(o,e,t)=>{if(!o)return null;const s=o.formations||[];if(!s.length)return null;const i=we(e),a=s.map(l=>Re(l,e,i)).map(l=>it(l,t,e)).filter(Boolean);if(!a.length)return null;const c=l=>a.reduce((h,g)=>h+(g.metrics[l]||0),0)/a.length;return{metrics:{strategicMomentum:L(c("versatility")+c("speed")*.5+c("armor")*.3),supplyEfficiency:L(c("supplyEfficiency")+c("logistics")*.5),aoSize:L(a.length*10),maneuverSpeed:L(c("speed"))}}};class at{constructor(){r(this,"units",[]);r(this,"subscribers",new Set);p.on("units-data",e=>{this.units=Array.isArray(e==null?void 0:e.units)?e.units:[],this.publish()})}async loadUnits(){if(!p.isAvailable)return console.warn("[UnitService] Host is unavailable; returning cached units only."),this.units;const e=await p.request("get-units",void 0,"units-data");return this.units=Array.isArray(e==null?void 0:e.units)?e.units:[],this.publish(),this.units}async saveUnit(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot persist unit.");await p.request("save-unit",{unit:e},"units-data")}async deleteUnit(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot delete unit.");await p.request("delete-unit",{id:e},"units-data")}getUnits(){return this.units}subscribe(e){return this.subscribers.add(e),e(this.units.map(t=>({...t}))),()=>this.subscribers.delete(e)}publish(){const e=this.units.map(t=>({...t}));this.subscribers.forEach(t=>t(e))}}const B=new at;class nt{constructor(){r(this,"formations",[]);r(this,"subscribers",new Set);p.on("formations-data",e=>{const t=e&&Array.isArray(e.formations)?e.formations:[];this.formations=t,this.publish()})}async loadFormations(){if(!p.isAvailable)return this.formations;const e=await p.request("get-formations",void 0,"formations-data");return this.formations=e&&Array.isArray(e.formations)?e.formations:[],this.publish(),this.formations}async saveFormations(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot persist formations.");const t=await p.request("save-formations",{formations:e},"formations-data");if(t!=null&&t.error){const s=Array.isArray(t.details)&&t.details.length?` ${t.details.join(" ")}`:"";throw new Error(`${t.error}${s}`.trim())}}getFormations(){return this.formations}subscribe(e){return this.subscribers.add(e),e(this.formations.map(t=>({...t}))),()=>this.subscribers.delete(e)}publish(){const e=this.formations.map(t=>({...t}));this.subscribers.forEach(t=>t(e))}}const U=new nt;class rt{constructor(){r(this,"nations",[]);r(this,"subscribers",new Set);p.on("nations-data",e=>{const t=e&&Array.isArray(e.nations)?e.nations:[];this.nations=t,this.publish()})}async loadNations(){if(!p.isAvailable)return this.nations;const e=await p.request("get-nations",void 0,"nations-data");return this.nations=e&&Array.isArray(e.nations)?e.nations:[],this.publish(),this.nations}async saveNations(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot persist nations.");const t=await p.request("save-nations",{nations:e},"nations-data");if(t!=null&&t.error){const s=Array.isArray(t.details)&&t.details.length?` ${t.details.join(" ")}`:"";throw new Error(`${t.error}${s}`.trim())}}getNations(){return this.nations}subscribe(e){return this.subscribers.add(e),e(this.nations.map(t=>({...t}))),()=>this.subscribers.delete(e)}publish(){const e=this.nations.map(t=>({...t}));this.subscribers.forEach(t=>t(e))}}const O=new rt;class ot{constructor(){r(this,"settings",{});r(this,"subscribers",new Set);p.on("settings-data",e=>{this.settings=e?{...e}:{},this.publish()})}async loadSettings(){if(!p.isAvailable)return this.getSettings();const e=await p.request("get-settings",void 0,"settings-data");return this.settings=e?{...e}:{},this.publish(),this.getSettings()}async saveSettings(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot persist settings.");await p.request("save-settings",e,"settings-data")}getSettings(){return{...this.settings}}subscribe(e){return this.subscribers.add(e),e(this.getSettings()),()=>this.subscribers.delete(e)}publish(){const e=this.getSettings();this.subscribers.forEach(t=>t(e))}}const j=new ot;class lt{constructor(){r(this,"weapons",[]);r(this,"subscribers",new Set);p.on("weapons-data",e=>{this.weapons=Array.isArray(e==null?void 0:e.weapons)?T(e.weapons):[],this.publish()})}async loadWeapons(){if(!p.isAvailable)return this.getWeapons();const e=await p.request("get-weapons",void 0,"weapons-data");return this.weapons=Array.isArray(e==null?void 0:e.weapons)?T(e.weapons):[],this.publish(),this.getWeapons()}async saveWeapons(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot persist weapons.");await p.request("save-weapons",{weapons:e},"weapons-data")}getWeapons(){return T(this.weapons)}subscribe(e){return this.subscribers.add(e),e(this.getWeapons()),()=>this.subscribers.delete(e)}publish(){const e=this.getWeapons();this.subscribers.forEach(t=>t(e))}}const Ie=new lt;class ct{constructor(){r(this,"templates",[]);r(this,"subscribers",new Set);p.on("ammo-data",e=>{this.templates=Array.isArray(e==null?void 0:e.ammo)?T(e.ammo):[],this.publish()})}async loadTemplates(){if(!p.isAvailable)return this.getTemplates();const e=await p.request("get-ammo",void 0,"ammo-data");return this.templates=Array.isArray(e==null?void 0:e.ammo)?T(e.ammo):[],this.publish(),this.getTemplates()}async saveTemplates(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot persist ammo templates.");await p.request("save-ammo",{ammo:e},"ammo-data")}getTemplates(){return T(this.templates)}subscribe(e){return this.subscribers.add(e),e(this.getTemplates()),()=>this.subscribers.delete(e)}publish(){const e=this.getTemplates();this.subscribers.forEach(t=>t(e))}}const Me=new ct;class dt{constructor(){r(this,"templates",[]);r(this,"subscribers",new Set);p.on("fire-modes-data",e=>{this.templates=Array.isArray(e==null?void 0:e.fireModes)?T(e.fireModes):[],this.publish()})}async loadTemplates(){if(!p.isAvailable)return this.getTemplates();const e=await p.request("get-fire-modes",void 0,"fire-modes-data");return this.templates=Array.isArray(e==null?void 0:e.fireModes)?T(e.fireModes):[],this.publish(),this.getTemplates()}async saveTemplates(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot persist fire mode templates.");await p.request("save-fire-modes",{fireModes:e},"fire-modes-data")}getTemplates(){return T(this.templates)}subscribe(e){return this.subscribers.add(e),e(this.getTemplates()),()=>this.subscribers.delete(e)}publish(){const e=this.getTemplates();this.subscribers.forEach(t=>t(e))}}const xe=new dt,ve=()=>({categories:{},calibers:{}});class ut{constructor(){r(this,"tags",ve());r(this,"subscribers",new Set);p.on("weapon-tags-data",e=>{this.tags=e?T(e):ve(),this.publish()})}async loadTags(){if(!p.isAvailable)return this.getTags();const e=await p.request("get-weapon-tags",void 0,"weapon-tags-data");return this.tags=e?T(e):ve(),this.publish(),this.getTags()}async saveTags(e){if(!p.isAvailable)throw new Error("Host is unavailable, cannot persist weapon tags.");await p.request("save-weapon-tags",e,"weapon-tags-data")}getTags(){return T(this.tags)}subscribe(e){return this.subscribers.add(e),e(this.getTags()),()=>this.subscribers.delete(e)}publish(){const e=this.getTags();this.subscribers.forEach(t=>t(e))}}const $e=new ut,ht=[{label:"Direct (LOS)",value:"direct_los"},{label:"Direct (NLOS)",value:"direct_nlos"},{label:"Indirect (LOS)",value:"indirect_los"},{label:"Indirect (NLOS)",value:"indirect_nlos"}],pt=[[{label:"Single Shot (Disposable)",value:"single_shot"},{label:"Suppressed",value:"suppressed"}],[{label:"MOR",value:"mor"},{label:"GL",value:"gl"},{label:"AGL",value:"agl"},{label:"LAW",value:"law"},{label:"RR",value:"rr"},{label:"ATGM",value:"atgm"},{label:"MANPADS",value:"manpads"}]],mt=new Set(["law","rr","atgm","manpads"]),De=()=>({name:"",category:"",internalCategory:"",tier:"",price:"",description:"",image:"",stats:{},grenades:{},capabilities:{sprint:{}},guns:[],equipment:[]}),ye=o=>o===!0||o==="true"?"true":o===!1||o==="false"?"false":"",Ee=o=>{if(o){if(o.toString()==="true")return!0;if(o.toString()==="false")return!1}};class ft{constructor(e){r(this,"root");r(this,"units",[]);r(this,"form");r(this,"unitListEl");r(this,"gunListEl");r(this,"equipmentListEl");r(this,"statusEl");r(this,"summaryEl");r(this,"speedInputEl");r(this,"speedHintEl");r(this,"sprintSpeedInputEl");r(this,"sprintSpeedHintEl");r(this,"grenadeInputs",[]);r(this,"grenadeTotalInput");r(this,"searchInput");r(this,"categoryFilter");r(this,"sortModeSelect");r(this,"workingCopy",De());r(this,"currentUnitId");r(this,"pendingName");r(this,"metaFormationsEl",null);r(this,"metaNationsEl",null);r(this,"metaThemeEl",null);r(this,"unitCategoryTagListEl",null);r(this,"unitCaliberTagListEl",null);r(this,"ammoTemplates",[]);r(this,"fireTemplates",[]);r(this,"ammoLibraryByCaliber",new Map);r(this,"weaponTemplates",[]);r(this,"hostAmmoTemplates",[]);r(this,"hostFireTemplates",[]);r(this,"fireLibraryTemplates",[]);r(this,"weaponTags",{categories:{},calibers:{}});r(this,"weaponTemplateImportSelect",null);this.root=e}async init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),this.bindMetaFeeds(),Ie.subscribe(e=>{this.weaponTemplates=T(e),this.hostFireTemplates=this.weaponTemplates.flatMap(t=>t.fireModes||[]),this.updateTemplateLibraries(this.units),this.populateWeaponTemplateImport()}),Ie.loadWeapons().catch(()=>{}),Me.subscribe(e=>{this.hostAmmoTemplates=T(e),this.updateTemplateLibraries(this.units)}),Me.loadTemplates().catch(()=>{}),xe.subscribe(e=>{this.fireLibraryTemplates=T(e),this.updateTemplateLibraries(this.units)}),xe.loadTemplates().catch(()=>{}),$e.subscribe(e=>{this.weaponTags=e,this.renderWeaponTagDatalists()}),$e.loadTags().catch(()=>{}),B.subscribe(e=>{this.units=e,this.updateTemplateLibraries(e),this.renderUnitList(),this.syncSelection()}),await B.loadUnits().catch(e=>{const t=e instanceof Error?e.message:String(e);this.setStatus(`Failed to load units: ${t}`,"error")}),this.units.length||this.startNewUnit()}renderLayout(){this.root.innerHTML=`
      <div class="workspace">
        <aside class="sidebar">
          <header class="sidebar-header">
            <div>
              <p class="eyebrow">SQLite source</p>
              <h1>Unit Browser</h1>
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
              <option value="name-asc">Name A &rarr; Z</option>
              <option value="name-desc">Name Z &rarr; A</option>
              <option value="price-asc">Price low &rarr; high</option>
              <option value="price-desc">Price high &rarr; low</option>
            </select>
          </div>
          <div class="unit-list" data-role="unit-list"></div>
        </aside>
        <section class="editor">
          <header class="editor-header">
            <div>
              <p class="eyebrow">Unit Editor</p>
              <h2>Unit Designer</h2>
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
            <datalist id="unit-category-tags" data-role="unit-category-tags"></datalist>
            <datalist id="unit-caliber-tags" data-role="unit-caliber-tags"></datalist>
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
                <div class="field"><label>Armor (rating)</label><input name="stats.armor" type="number" step="0.1" /></div>
                <div class="field"><label>Health (HP)</label><input name="stats.health" type="number" step="0.1" /></div>
                <div class="field"><label>Squad size (#)</label><input name="stats.squadSize" type="number" step="1" min="0" /></div>
                <div class="field"><label>Visual range (m)</label><input name="stats.visualRange" type="number" step="1" min="0" /></div>
                <div class="field"><label>Stealth (%)</label><input name="stats.stealth" type="number" step="1" min="0" /></div>
                <div class="field speed-field">
                  <label>Speed (m/s)</label>
                  <div class="input-with-hint">
                    <input name="stats.speed" type="number" step="0.1" data-role="speed-input" />
                    <span class="unit-hint" data-role="speed-kph">~ -- kp/h</span>
                  </div>
                </div>
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
                <div class="input-with-hint">
                  <input name="cap.sprint.speed" type="number" step="0.1" data-role="sprint-speed-input" />
                  <span class="unit-hint" data-role="sprint-speed-kph">~ -- kp/h</span>
                </div>
              </div>
              <div class="field">
                <label>Sprint cooldown (s)</label>
                <input name="cap.sprint.cooldown" type="number" step="0.1" min="0" />
              </div>
            </section>
            <section class="panel grid-5">
              <div class="panel-title">Grenades</div>
              <div class="field"><label>Smoke (qty)</label><input name="grenades.smoke" type="number" step="1" min="0" data-role="grenade-input" /></div>
              <div class="field"><label>Flash (qty)</label><input name="grenades.flash" type="number" step="1" min="0" data-role="grenade-input" /></div>
              <div class="field"><label>Thermite (qty)</label><input name="grenades.thermite" type="number" step="1" min="0" data-role="grenade-input" /></div>
              <div class="field"><label>Frag (qty)</label><input name="grenades.frag" type="number" step="1" min="0" data-role="grenade-input" /></div>
              <div class="field grenade-total-field">
                <label>Total grenades</label>
                <input name="grenades.total" type="number" step="1" min="0" data-role="grenade-total" readonly tabindex="-1" />
              </div>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Weapons</h3>
                <div class="header-actions compact">
                  <select data-role="weapon-template-import" class="ghost small">
                    <option value="">From templates...</option>
                  </select>
                  <button type="button" class="ghost" data-action="add-gun">Add weapon</button>
                </div>
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
    `}cacheElements(){this.form=this.root.querySelector('[data-role="unit-form"]'),this.unitListEl=this.root.querySelector('[data-role="unit-list"]'),this.gunListEl=this.root.querySelector('[data-role="gun-list"]'),this.equipmentListEl=this.root.querySelector('[data-role="equipment-list"]'),this.statusEl=this.root.querySelector('[data-role="status-bar"]'),this.summaryEl=this.root.querySelector('[data-role="unit-summary"]'),this.speedInputEl=this.root.querySelector('[data-role="speed-input"]'),this.speedHintEl=this.root.querySelector('[data-role="speed-kph"]'),this.sprintSpeedInputEl=this.root.querySelector('[data-role="sprint-speed-input"]'),this.sprintSpeedHintEl=this.root.querySelector('[data-role="sprint-speed-kph"]'),this.grenadeInputs=Array.from(this.root.querySelectorAll('[data-role="grenade-input"]')),this.grenadeTotalInput=this.root.querySelector('[data-role="grenade-total"]'),this.searchInput=this.root.querySelector('[data-role="search"]'),this.categoryFilter=this.root.querySelector('[data-role="category-filter"]'),this.sortModeSelect=this.root.querySelector('[data-role="sort-mode"]'),this.metaFormationsEl=this.root.querySelector('[data-role="meta-formations"]'),this.metaNationsEl=this.root.querySelector('[data-role="meta-nations"]'),this.metaThemeEl=this.root.querySelector('[data-role="meta-theme"]'),this.unitCategoryTagListEl=this.root.querySelector('[data-role="unit-category-tags"]'),this.unitCaliberTagListEl=this.root.querySelector('[data-role="unit-caliber-tags"]'),this.weaponTemplateImportSelect=this.root.querySelector('[data-role="weapon-template-import"]'),this.populateWeaponTemplateImport()}bindEvents(){var e,t,s;this.unitListEl.addEventListener("click",i=>this.handleUnitListClick(i)),this.form.addEventListener("submit",i=>this.handleSubmit(i)),this.root.addEventListener("click",i=>this.handleAction(i)),this.searchInput.addEventListener("input",()=>{this.renderUnitList()}),this.categoryFilter.addEventListener("change",()=>this.renderUnitList()),this.sortModeSelect.addEventListener("change",()=>this.renderUnitList()),(e=this.speedInputEl)==null||e.addEventListener("input",()=>this.updateSpeedHint()),this.updateSpeedHint(),(t=this.sprintSpeedInputEl)==null||t.addEventListener("input",()=>this.updateSprintSpeedHint()),this.updateSprintSpeedHint(),this.grenadeInputs.forEach(i=>i.addEventListener("input",()=>this.updateGrenadeTotal())),this.updateGrenadeTotal(),(s=this.weaponTemplateImportSelect)==null||s.addEventListener("change",()=>{if(!this.weaponTemplateImportSelect)return;const i=Number(this.weaponTemplateImportSelect.value);if(!Number.isNaN(i)){const a=this.weaponTemplates[i];a&&this.appendGunRow(T(a))}this.weaponTemplateImportSelect.value=""})}bindMetaFeeds(){U.subscribe(e=>{this.metaFormationsEl&&(this.metaFormationsEl.textContent=e.length.toString())}),O.subscribe(e=>{this.metaNationsEl&&(this.metaNationsEl.textContent=e.length.toString())}),j.subscribe(e=>{this.metaThemeEl&&(this.metaThemeEl.textContent=e.theme||"System")}),U.loadFormations().catch(e=>{console.error("Failed to load formations",e)}),O.loadNations().catch(e=>{console.error("Failed to load nations",e)}),j.loadSettings().catch(e=>{console.error("Failed to load settings",e)})}handleUnitListClick(e){const t=e.target.closest(".unit-pill");if(!t)return;const s=Number(t.dataset.index),i=this.units[s];i&&this.loadUnit(i)}async handleSubmit(e){e.preventDefault();const t=this.collectFormData();if(!t.name){this.setStatus("Name is required.","error");return}try{t.id?this.currentUnitId=t.id:this.pendingName=t.name.toLowerCase(),this.setStatus("Saving unit...","default"),await B.saveUnit(t),this.setStatus("Unit saved.","success")}catch(s){const i=s instanceof Error?s.message:String(s);this.setStatus(`Failed to save unit: ${i}`,"error")}}handleAction(e){const t=e.target.closest("[data-action]");if(!t)return;const s=t.dataset.action;if(s)switch(e.preventDefault(),s){case"refresh-units":this.setStatus("Refreshing from host...","default"),B.loadUnits().catch(i=>{const a=i instanceof Error?i.message:String(i);this.setStatus(`Refresh failed: ${a}`,"error")});break;case"new-unit":this.startNewUnit();break;case"reset-unit":this.resetCurrentUnit();break;case"add-gun":this.appendGunRow();break;case"add-equipment":this.appendEquipmentRow();break;case"delete-unit":this.deleteCurrentUnit();break;case"remove-gun":{const i=t.closest(".repeatable-row");i==null||i.remove(),this.gunListEl.querySelector(".repeatable-row")||(this.gunListEl.innerHTML='<p class="empty">No weapons configured.</p>');break}case"remove-equipment":{const i=t.closest(".repeatable-row");i==null||i.remove(),this.equipmentListEl.querySelector(".repeatable-row")||(this.equipmentListEl.innerHTML='<p class="empty">No equipment entries yet.</p>');break}}}async deleteCurrentUnit(){if(!this.currentUnitId){this.setStatus("Select a saved unit before deleting.","error");return}if(window.confirm("Delete this unit permanently?"))try{this.setStatus("Deleting unit...","default"),await B.deleteUnit(this.currentUnitId),this.currentUnitId=void 0,this.startNewUnit(),this.setStatus("Unit removed.","success")}catch(t){const s=t instanceof Error?t.message:String(t);this.setStatus(`Failed to delete unit: ${s}`,"error")}}renderUnitList(){if(!this.unitListEl)return;this.unitListEl.innerHTML="";const e=this.searchInput.value.trim().toLowerCase(),t=this.categoryFilter.value,s=this.units.map((a,c)=>({unit:a,index:c})).filter(({unit:a})=>e?`${a.name??""} ${a.category??""}`.toLowerCase().includes(e):!0).filter(({unit:a})=>t?(a.category||"").toUpperCase()===t:!0),i=this.sortModeSelect.value;if(s.sort((a,c)=>{switch(i){case"name-desc":return(c.unit.name||"").localeCompare(a.unit.name||"");case"price-asc":return(Number(a.unit.price)||0)-(Number(c.unit.price)||0);case"price-desc":return(Number(c.unit.price)||0)-(Number(a.unit.price)||0);case"name-asc":default:return(a.unit.name||"").localeCompare(c.unit.name||"")}}),!s.length){this.unitListEl.innerHTML='<p class="empty">No units match the current search.</p>';return}s.forEach(({unit:a,index:c})=>{const l=document.createElement("button");l.type="button",l.className="unit-pill",l.dataset.index=c.toString(),this.currentUnitId&&a.id===this.currentUnitId&&l.classList.add("active"),l.innerHTML=`
        <span class="unit-pill-body">
          <span class="title">${a.name||"Unnamed unit"}</span>
          <span class="meta">${a.category||"?"} &middot; ${a.tier||"Tier ?"} &middot; ${a.price??"&mdash;"} pts</span>
        </span>
      `,this.unitListEl.appendChild(l)})}loadUnit(e){this.workingCopy=T(e),this.currentUnitId=typeof e.id=="number"?e.id:void 0,this.pendingName=void 0,this.populateForm(this.workingCopy),this.setSummary(this.workingCopy.name?`Editing ${this.workingCopy.name}`:"Editing unit"),this.renderUnitList(),this.setStatus("Unit loaded.","default")}startNewUnit(){this.workingCopy=De(),this.currentUnitId=void 0,this.pendingName=void 0,this.populateForm(this.workingCopy),this.setSummary("New unit draft"),this.renderUnitList(),this.setStatus("Ready to capture a new unit.","default")}resetCurrentUnit(){if(this.currentUnitId){const e=this.units.find(t=>t.id===this.currentUnitId);if(e){this.loadUnit(e);return}}this.startNewUnit()}populateForm(e){var c,l,h;const t=(g,v)=>{const d=this.form.querySelector(`[name="${g}"]`);d&&(d.value=v==null?"":String(v))};t("unit-id",e.id),t("name",e.name??""),t("category",e.category??""),t("internalCategory",e.internalCategory??""),t("tier",e.tier??""),t("price",e.price??""),t("image",e.image??""),t("description",e.description??"");const s=e.stats??{};t("stats.armor",s.armor??""),t("stats.health",s.health??""),t("stats.squadSize",s.squadSize??""),t("stats.visualRange",s.visualRange??""),t("stats.stealth",s.stealth??""),t("stats.speed",s.speed??""),t("stats.weight",s.weight??""),this.updateSpeedHint();const i=e.capabilities??{};t("cap.staticLineJump",ye(i.staticLineJump)),t("cap.haloHaho",ye(i.haloHaho)),t("cap.laserDesignator",ye(i.laserDesignator)),t("cap.sprint.distance",((c=i.sprint)==null?void 0:c.distance)??""),t("cap.sprint.speed",((l=i.sprint)==null?void 0:l.speed)??""),t("cap.sprint.cooldown",((h=i.sprint)==null?void 0:h.cooldown)??""),this.updateSprintSpeedHint();const a=e.grenades??{};t("grenades.smoke",a.smoke??""),t("grenades.flash",a.flash??""),t("grenades.thermite",a.thermite??""),t("grenades.frag",a.frag??""),this.grenadeTotalInput&&(this.grenadeTotalInput.value=a.total===void 0||a.total===null?"":String(a.total)),this.updateGrenadeTotal(),this.renderGunList(e.guns??[]),this.renderEquipmentList(e.equipment??[])}renderGunList(e){if(this.gunListEl){if(!e.length){this.gunListEl.innerHTML='<p class="empty">No weapons configured.</p>';return}this.gunListEl.innerHTML="",e.forEach(t=>this.appendGunRow(t))}}renderEquipmentList(e){if(this.equipmentListEl){if(!e.length){this.equipmentListEl.innerHTML='<p class="empty">No equipment entries yet.</p>';return}this.equipmentListEl.innerHTML="",e.forEach(t=>this.appendEquipmentRow(t))}}appendGunRow(e){if(!this.gunListEl)return;this.gunListEl.querySelector(".empty")&&(this.gunListEl.innerHTML="");const t=document.createElement("div");t.className="repeatable-row",t.innerHTML=`
      <div class="row-header">
        <strong data-role="row-title">${(e==null?void 0:e.name)||"New weapon"}</strong>
        <div class="row-controls">
          <button type="button" class="ghost small" data-action="toggle-gun">Collapse</button>
          <button type="button" class="ghost danger" data-action="remove-gun">Remove</button>
        </div>
      </div>
      <div class="row-body">
        <div class="repeatable-grid">
          <label>Name<input data-field="name" value="${(e==null?void 0:e.name)??""}" /></label>
          <label>Category<input data-field="category" list="unit-category-tags" value="${(e==null?void 0:e.category)??""}" /></label>
          <label>Caliber<input data-field="caliber" list="unit-caliber-tags" value="${(e==null?void 0:e.caliber)??""}" /></label>
          <label>Barrel length (cm)<input data-field="barrelLength" type="number" step="0.1" value="${(e==null?void 0:e.barrelLength)??""}" /></label>
          <label>Range (m)<input data-field="range" type="number" step="1" value="${(e==null?void 0:e.range)??""}" /></label>
          <label>Dispersion (%)<input data-field="dispersion" type="number" step="0.01" value="${(e==null?void 0:e.dispersion)??""}" /></label>
          <label>Amount of weapons (#)<input data-field="count" type="number" step="1" min="0" value="${(e==null?void 0:e.count)??""}" /></label>
          <label>Ammo / soldier (#)<input data-field="ammoPerSoldier" type="number" step="1" min="0" value="${(e==null?void 0:e.ammoPerSoldier)??""}" /></label>
          <label>Total ammo (rounds)<input data-field="totalAmmo" type="number" step="1" min="0" value="${(e==null?void 0:e.totalAmmo)??""}" readonly tabindex="-1" /></label>
          <label>Magazine size (rnds)<input data-field="magazineSize" type="number" step="1" min="0" value="${(e==null?void 0:e.magazineSize)??""}" /></label>
          <label>Reload speed (s)<input data-field="reloadSpeed" type="number" step="0.1" value="${(e==null?void 0:e.reloadSpeed)??""}" /></label>
          <label>Target acquisition (s)<input data-field="targetAcquisition" type="number" step="0.1" value="${(e==null?void 0:e.targetAcquisition)??""}" /></label>
        </div>
      </div>
    `;const s=t.querySelector('[data-field="name"]'),i=t.querySelector('[data-role="row-title"]'),a=t.querySelector(".row-body"),c=t.querySelector('[data-action="toggle-gun"]');if(s==null||s.addEventListener("input",()=>{i&&(i.textContent=s.value||"New weapon")}),c){const n=()=>{if(a.id)return a.id;const y=typeof crypto<"u"&&"randomUUID"in crypto?crypto.randomUUID():Math.random().toString(36).slice(2,10);return a.id=`gun-panel-${y}`,a.id},u=()=>{const y=!t.classList.contains("collapsed");c.textContent=y?"Collapse":"Expand",c.setAttribute("aria-expanded",y?"true":"false")};c.setAttribute("aria-controls",n()),u(),c.addEventListener("click",y=>{y.preventDefault(),t.classList.toggle("collapsed"),u()})}const l=t.querySelector('[data-field="count"]'),h=t.querySelector('[data-field="ammoPerSoldier"]'),g=t.querySelector('[data-field="totalAmmo"]'),v=t.querySelector('[data-field="caliber"]'),d=()=>{if(!g||!l||!h)return;const n=Number.parseInt(l.value||"0",10),u=Number.parseInt(h.value||"0",10),y=(Number.isFinite(n)?n:0)*(Number.isFinite(u)?u:0);g.value=y>0?y.toString():""};l==null||l.addEventListener("input",d),h==null||h.addEventListener("input",d),d();const f=[],b=[],m=()=>{b.forEach(n=>n())},E=()=>!f.some(n=>n.classList.contains("active")&&mt.has((n.dataset.value||"").toLowerCase())),w=document.createElement("div");w.className="chip-field-row";const N=document.createElement("div");N.className="chip-field";const A=document.createElement("span");A.className="label",A.textContent="Firing trajectories";const x=document.createElement("div");x.className="chip-wrap";const q=new Set(((e==null?void 0:e.trajectories)||[]).map(n=>n.toLowerCase()));ht.forEach(n=>{const u=document.createElement("button");u.type="button",u.className="chip-button",u.dataset.chipGroup="trajectory",u.dataset.value=n.value,u.textContent=n.label,q.has(n.value.toLowerCase())&&u.classList.add("active"),u.addEventListener("click",()=>{u.classList.toggle("active")}),x.appendChild(u)}),N.append(A,x);const M=document.createElement("div");M.className="chip-field";const V=document.createElement("span");V.className="label",V.textContent="Weapon traits";const K=document.createElement("div");K.className="chip-wrap trait-wrap";const Oe=new Set(((e==null?void 0:e.traits)||[]).map(n=>n.toLowerCase()));pt.forEach((n,u)=>{if(n.forEach(y=>{const S=document.createElement("button");S.type="button",S.className="chip-button",S.dataset.chipGroup="trait",S.dataset.value=y.value,S.textContent=y.label,Oe.has(y.value.toLowerCase())&&S.classList.add("active"),S.addEventListener("click",()=>{S.classList.toggle("active"),m()}),f.push(S),K.appendChild(S)}),u===0){const y=document.createElement("span");y.className="trait-separator",K.appendChild(y)}}),M.append(V,K),w.append(N,M),a.appendChild(w);const Pe=n=>typeof crypto<"u"&&"randomUUID"in crypto?`${n}-${crypto.randomUUID()}`:`${n}-${Math.random().toString(36).slice(2,10)}`,Le=(n,u,y)=>{const S=n.querySelector(".subpanel-body");if(!S)return;S.id||(S.id=Pe(y.replace(/\s+/g,"-")));const I=()=>{const C=!n.classList.contains("collapsed"),_=C?"Collapse":"Expand";u.textContent=_,u.setAttribute("aria-expanded",C?"true":"false"),u.setAttribute("aria-controls",S.id),u.setAttribute("aria-label",`${_} ${y}`)};u.addEventListener("click",C=>{C.preventDefault(),n.classList.toggle("collapsed"),I()}),I()},ee=document.createElement("div");ee.className="subpanel";const te=document.createElement("div");te.className="subpanel-heading",te.innerHTML="<strong>Ammo types</strong>";const ue=document.createElement("div");ue.className="header-actions compact";const H=document.createElement("select");H.className="ghost small";const Ce=()=>{H.innerHTML='<option value="">From library...</option>',this.ammoTemplates.forEach((n,u)=>{const y=document.createElement("option");y.value=u.toString(),y.textContent=n.name||`Template ${u+1}`,H.appendChild(y)})};Ce(),H.addEventListener("focus",Ce),H.addEventListener("change",()=>{if(!H.value)return;const n=this.ammoTemplates[Number(H.value)];n&&(fe(T(n)),P()),H.value=""});const J=document.createElement("button");J.type="button",J.className="ghost small",J.textContent="Add ammo";const Y=document.createElement("button");Y.type="button",Y.className="ghost small",Y.textContent="Collapse",ue.append(H,J,Y),te.appendChild(ue);const G=document.createElement("div");G.className="subpanel-list ammo-list";const he=document.createElement("div");he.className="subpanel-body",he.appendChild(G);const We=n=>{if(!n)return;const y=n.replace(",",".").match(/\d+(?:\.\d+)?/);if(!y)return;const S=Number.parseFloat(y[0]);return Number.isNaN(S)?void 0:S},ze=(n,u,y)=>{const I=n.replace(/\s+/g,"").match(/(\d{1,3})(?:[.,](\d{1,3}))?x(\d{1,3})/i);let C=We(n)??5.56;if(I){const X=I[2]??"";C=Number.parseFloat(X?`${I[1]}.${X}`:I[1])}const _=2e3,W=u*45,R=y*1.5,ge=(6-C)*15,re=_+W-R+ge;return Math.max(300,Math.round(re))},se=()=>(v==null?void 0:v.value.trim())||"",Te=()=>{const n=se();G.querySelectorAll('input[data-ammo-field="caliber"]').forEach(u=>{var I;const y=((I=u.dataset.initialCaliber)==null?void 0:I.trim())||"",S=n||y;u.value=S,u.placeholder=S||n,u.dataset.initialCaliber=S})};v==null||v.addEventListener("input",()=>{Te(),b.forEach(n=>n())});const ie=document.createElement("div");ie.className="subpanel";const ae=document.createElement("div");ae.className="subpanel-heading",ae.innerHTML="<strong>Fire modes</strong>";const pe=document.createElement("div");pe.className="header-actions compact";const k=document.createElement("select");k.className="ghost small";const Ne=()=>{k.innerHTML='<option value="">From library...</option>',this.fireTemplates.forEach((n,u)=>{const y=document.createElement("option");y.value=u.toString(),y.textContent=n.name||`Mode ${u+1}`,k.appendChild(y)})};Ne(),k.addEventListener("focus",Ne),k.addEventListener("change",()=>{if(!k.value)return;const n=this.fireTemplates[Number(k.value)];n&&(be(T(n)),P()),k.value=""});const Q=document.createElement("button");Q.type="button",Q.className="ghost small",Q.textContent="Add fire mode";const Z=document.createElement("button");Z.type="button",Z.className="ghost small",Z.textContent="Collapse",pe.append(k,Q,Z),ae.appendChild(pe);const ne=document.createElement("div");ne.className="subpanel-list fire-list";const me=document.createElement("div");me.className="subpanel-body",me.appendChild(ne);const fe=n=>{var X,Ae;const u=document.createElement("div");u.className="ammo-row";const y=(n==null?void 0:n.airburst)===!0||(n==null?void 0:n.airburst)==="true"?"yes":"no";u.innerHTML=`
        <div class="subgrid">
          <label>Name<input data-ammo-field="name" value="${(n==null?void 0:n.name)??""}" /></label>
          <label>Type<input data-ammo-field="ammoType" value="${(n==null?void 0:n.ammoType)??""}" /></label>
          <label>Caliber<input data-ammo-field="caliber" value="${(n==null?void 0:n.caliber)??""}" readonly tabindex="-1" /></label>
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
              <option value="yes" ${y==="yes"?"selected":""}>Yes</option>
              <option value="no" ${y==="no"?"selected":""}>No</option>
            </select>
          </label>
          <label>Sub munitions (#)<input type="number" step="1" min="0" data-ammo-field="subCount" data-airburst-dependent value="${(n==null?void 0:n.subCount)??""}" /></label>
          <label>Sub damage<input type="number" step="0.1" data-ammo-field="subDamage" data-airburst-dependent value="${(n==null?void 0:n.subDamage)??""}" /></label>
          <label>Sub penetration (mm)<input type="number" step="0.1" data-ammo-field="subPenetration" data-airburst-dependent value="${(n==null?void 0:n.subPenetration)??""}" /></label>
        </div>
        <div class="row-actions">
          <button type="button" class="ghost small" data-action="remove-ammo">Remove ammo</button>
        </div>
      `;const S=u.querySelector('input[data-ammo-field="grain"]'),I=u.querySelector('input[data-ammo-field="fps"]'),C=u.querySelector('input[data-ammo-field="caliber"]');if(C){C.readOnly=!0,C.tabIndex=-1,C.classList.add("readonly"),typeof(n==null?void 0:n.caliber)=="string"&&n.caliber.trim()&&(C.dataset.initialCaliber=n.caliber.trim());const $=se()||C.dataset.initialCaliber||"";C.value=$,C.placeholder=$||se(),C.dataset.initialCaliber=$}const _=()=>{var $;return parseFloat((($=t.querySelector('[data-field="barrelLength"]'))==null?void 0:$.value)||"0")||0},W=()=>{if(!E()||!S||!I)return;const $=parseFloat(S.value||"0"),oe=_(),Ve=se()||(C==null?void 0:C.dataset.initialCaliber)||"";if(Number.isNaN($)||Number.isNaN(oe))return;const Ge=ze(Ve,oe,$);I.value=Ge.toString()};(X=u.querySelector('[data-action="remove-ammo"]'))==null||X.addEventListener("click",()=>{u.remove();const $=b.indexOf(W);$>=0&&b.splice($,1),P()});const R=u.querySelector('select[data-ammo-field="airburst"]'),ge=u.querySelectorAll("[data-airburst-dependent]"),re=()=>{const $=(R==null?void 0:R.value)==="yes";ge.forEach(oe=>{oe.disabled=!$})};R==null||R.addEventListener("change",()=>{re()}),re(),G.appendChild(u),S==null||S.addEventListener("input",W),(Ae=t.querySelector('[data-field="barrelLength"]'))==null||Ae.addEventListener("input",W),b.push(W),Te(),W()},be=n=>{var y;const u=document.createElement("div");u.className="fire-row",u.innerHTML=`
        <div class="subgrid">
          <label>Name<input data-fire-field="name" value="${(n==null?void 0:n.name)??""}" /></label>
          <label>Rounds / burst (#)<input type="number" step="1" min="0" data-fire-field="rounds" value="${(n==null?void 0:n.rounds)??""}" /></label>
          <label>Min range (m)<input type="number" step="0.1" min="0" data-fire-field="minRange" value="${(n==null?void 0:n.minRange)??""}" /></label>
          <label>Max range (m)<input type="number" step="0.1" min="0" data-fire-field="maxRange" value="${(n==null?void 0:n.maxRange)??""}" /></label>
          <label>Cooldown (s)<input type="number" step="0.1" min="0" data-fire-field="cooldown" value="${(n==null?void 0:n.cooldown)??""}" /></label>
          <label>Ammo reference<select data-fire-field="ammoRef"></select></label>
        </div>
        <div class="row-actions">
          <button type="button" class="ghost small" data-action="remove-fire">Remove mode</button>
        </div>
      `,(y=u.querySelector('[data-action="remove-fire"]'))==null||y.addEventListener("click",()=>{u.remove()}),ne.appendChild(u)},je=()=>Array.from(G.querySelectorAll('input[data-ammo-field="name"]')).map(n=>n.value.trim()).filter(Boolean),P=()=>{const n=je();ne.querySelectorAll('select[data-fire-field="ammoRef"]').forEach(u=>{const y=u.value||u.dataset.prefill||"";u.innerHTML="";const S=document.createElement("option");S.value="",S.textContent="None",u.appendChild(S),n.forEach(I=>{const C=document.createElement("option");C.value=I,C.textContent=I,u.appendChild(C)}),n.includes(y)?u.value=y:(u.value="",y&&(u.dataset.prefill=y))})};J.addEventListener("click",()=>{fe(),P()}),Q.addEventListener("click",()=>{be(),P()}),(Array.isArray(e==null?void 0:e.ammoTypes)&&(e!=null&&e.ammoTypes.length)?e.ammoTypes:[void 0]).forEach(n=>fe(n)),(Array.isArray(e==null?void 0:e.fireModes)&&(e!=null&&e.fireModes.length)?e.fireModes:[void 0]).forEach(n=>be(n)),G.addEventListener("input",n=>{n.target.matches('[data-ammo-field="name"]')&&P()}),ee.append(te,he),ie.append(ae,me),Le(ee,Y,"weapon ammo types"),Le(ie,Z,"weapon fire modes"),a.append(ie,ee),this.gunListEl.appendChild(t),P()}appendEquipmentRow(e){if(!this.equipmentListEl)return;this.equipmentListEl.querySelector(".empty")&&(this.equipmentListEl.innerHTML="");const t=document.createElement("div");t.className="repeatable-row",t.innerHTML=`
      <div class="row-header">
        <strong data-role="row-title">${(e==null?void 0:e.name)||"New equipment"}</strong>
        <button type="button" class="ghost" data-action="remove-equipment">Remove</button>
      </div>
      <div class="repeatable-grid">
        <label>Name<input data-field="name" value="${(e==null?void 0:e.name)??""}" /></label>
        <label>Type<input data-field="type" value="${(e==null?void 0:e.type)??""}" /></label>
        <label>Description<input data-field="description" value="${(e==null?void 0:e.description)??""}" /></label>
        <label>Notes<input data-field="notes" value="${(e==null?void 0:e.notes)??""}" /></label>
        <label>Quantity<input data-field="count" type="number" step="1" min="0" value="${(e==null?void 0:e.count)??""}" /></label>
      </div>
    `;const s=t.querySelector('[data-field="name"]'),i=t.querySelector('[data-role="row-title"]');s==null||s.addEventListener("input",()=>{i&&(i.textContent=s.value||"New equipment")}),this.equipmentListEl.appendChild(t)}collectFormData(){var E;const e=new FormData(this.form),t={},s={},i={id:this.toInt(e.get("unit-id")),name:this.toStringValue(e.get("name"))??"",category:(E=this.toStringValue(e.get("category")))==null?void 0:E.toUpperCase(),internalCategory:this.toStringValue(e.get("internalCategory")),tier:this.toStringValue(e.get("tier")),price:this.toInt(e.get("price")),image:this.toStringValue(e.get("image")),description:this.toStringValue(e.get("description"))};["armor","health","squadSize","visualRange","stealth","speed","weight"].forEach(w=>{const N=this.toNumber(e.get(`stats.${w}`));N!==void 0&&(t[w]=N)}),Object.keys(t).length&&(i.stats=t);const c=["smoke","flash","thermite","frag"];c.forEach(w=>{const N=this.toInt(e.get(`grenades.${w}`));N!==void 0&&(s[w]=N)});const l=c.reduce((w,N)=>{const A=s[N];return w+(typeof A=="number"?A:0)},0);l>0&&(s.total=l),Object.keys(s).length&&(i.grenades=s);const h={},g=Ee(e.get("cap.staticLineJump"));g!==void 0&&(h.staticLineJump=g);const v=Ee(e.get("cap.haloHaho"));v!==void 0&&(h.haloHaho=v);const d=Ee(e.get("cap.laserDesignator"));d!==void 0&&(h.laserDesignator=d);const f=this.toNumber(e.get("cap.sprint.distance")),b=this.toNumber(e.get("cap.sprint.speed")),m=this.toNumber(e.get("cap.sprint.cooldown"));return(f!==void 0||b!==void 0||m!==void 0)&&(h.sprint={distance:f,speed:b,cooldown:m}),Object.keys(h).length&&(i.capabilities=h),i.guns=this.collectGunRows(),i.equipment=this.collectEquipmentRows(),this.workingCopy.symbol?i.symbol=T(this.workingCopy.symbol):delete i.symbol,i}collectGunRows(){const e=Array.from(this.gunListEl.querySelectorAll(".repeatable-row")),t=[];return e.forEach(s=>{const i={},a=m=>{var E;return((E=s.querySelector(`[data-field="${m}"]`))==null?void 0:E.value.trim())??""},c=m=>this.parseNumberString(a(m)),l=m=>this.parseIntegerString(a(m));i.name=a("name")||void 0,i.category=a("category")||void 0,i.caliber=a("caliber")||void 0,i.barrelLength=c("barrelLength"),i.range=c("range"),i.dispersion=c("dispersion"),i.count=l("count"),i.ammoPerSoldier=l("ammoPerSoldier"),i.totalAmmo=l("totalAmmo"),!i.totalAmmo&&i.count&&i.ammoPerSoldier&&(i.totalAmmo=i.count*i.ammoPerSoldier),i.magazineSize=l("magazineSize"),i.reloadSpeed=c("reloadSpeed"),i.targetAcquisition=c("targetAcquisition");const g=Array.from(s.querySelectorAll(".ammo-row")).map(m=>{const E=M=>{var V;return((V=m.querySelector(`[data-ammo-field="${M}"]`))==null?void 0:V.value.trim())??""},w=M=>this.parseNumberString(E(M)),N=M=>this.parseIntegerString(E(M)),A={name:E("name")||void 0,ammoType:E("ammoType")||void 0,caliber:E("caliber")||void 0,caliberDesc:E("caliberDesc")||void 0,ammoPerSoldier:N("ammoPerSoldier"),penetration:w("penetration"),heDeadliness:w("heDeadliness"),dispersion:w("dispersion"),rangeMod:w("rangeMod"),grain:w("grain"),notes:E("notes")||void 0,fps:w("fps"),subCount:N("subCount"),subDamage:w("subDamage"),subPenetration:w("subPenetration")},x=E("airburst");return x==="yes"?A.airburst=!0:x==="no"&&(A.airburst=!1),Object.values(A).some(M=>M!==void 0&&M!=="")?A:null}).filter(m=>!!m);g.length&&(i.ammoTypes=g);const d=Array.from(s.querySelectorAll(".fire-row")).map(m=>{const E=q=>{var M;return((M=m.querySelector(`[data-fire-field="${q}"]`))==null?void 0:M.value.trim())??""},w=q=>this.parseNumberString(E(q)),N=q=>this.parseIntegerString(E(q)),A={name:E("name")||void 0,rounds:N("rounds"),minRange:w("minRange"),maxRange:w("maxRange"),cooldown:w("cooldown"),ammoRef:E("ammoRef")||void 0};return Object.values(A).some(q=>q!==void 0&&q!=="")?A:null}).filter(m=>!!m);d.length&&(i.fireModes=d);const f=Array.from(s.querySelectorAll('[data-chip-group="trajectory"]')).filter(m=>m.classList.contains("active")).map(m=>m.dataset.value||"").filter(Boolean);f.length&&(i.trajectories=f);const b=Array.from(s.querySelectorAll('[data-chip-group="trait"]')).filter(m=>m.classList.contains("active")).map(m=>m.dataset.value||"").filter(Boolean);b.length&&(i.traits=b),Object.values(i).some(m=>m!==void 0&&m!=="")&&t.push(i)}),t}collectEquipmentRows(){const e=Array.from(this.equipmentListEl.querySelectorAll(".repeatable-row")),t=[];return e.forEach(s=>{const i={},a=l=>{var h;return((h=s.querySelector(`[data-field="${l}"]`))==null?void 0:h.value.trim())??""},c=l=>this.parseIntegerString(a(l));i.name=a("name")||void 0,i.type=a("type")||void 0,i.description=a("description")||void 0,i.notes=a("notes")||void 0,i.count=c("count"),Object.values(i).some(l=>l!==void 0&&l!=="")&&t.push(i)}),t}syncSelection(){if(this.currentUnitId){const e=this.units.find(t=>t.id===this.currentUnitId);if(e){this.loadUnit(e);return}}if(this.pendingName){const e=this.units.find(t=>{var s;return((s=t.name)==null?void 0:s.toLowerCase())===this.pendingName});if(e){this.loadUnit(e);return}}}toNumber(e){if(e!==null)return this.parseNumberString(e.toString())}toInt(e){if(e!==null)return this.parseIntegerString(e.toString())}parseNumberString(e){const t=e.trim();if(!t)return;const s=Number(t);return Number.isNaN(s)?void 0:s}parseIntegerString(e){const t=e.trim();if(!t)return;const s=Number.parseInt(t,10);return Number.isNaN(s)?void 0:s}toStringValue(e){if(e===null)return;const t=e.toString().trim();return t.length?t:void 0}renderWeaponTagDatalists(){this.unitCategoryTagListEl&&(this.unitCategoryTagListEl.innerHTML=this.buildTagOptionMarkup(Object.keys(this.weaponTags.categories||{}))),this.unitCaliberTagListEl&&(this.unitCaliberTagListEl.innerHTML=this.buildTagOptionMarkup(Object.keys(this.weaponTags.calibers||{})))}buildTagOptionMarkup(e){return!e||!e.length?"":[...e].sort((t,s)=>t.localeCompare(s)).map(t=>`<option value="${t}"></option>`).join("")}setStatus(e,t){this.statusEl&&(this.statusEl.textContent=e,this.statusEl.dataset.tone=t)}setSummary(e){this.summaryEl&&(this.summaryEl.textContent=e)}updateSpeedHint(){if(!this.speedHintEl||!this.speedInputEl)return;const e=Number.parseFloat(this.speedInputEl.value);if(!Number.isFinite(e)){this.speedHintEl.textContent="~ -- kp/h";return}const t=e*3.6;this.speedHintEl.textContent=`~ ${t.toFixed(1)} kp/h`}updateSprintSpeedHint(){if(!this.sprintSpeedHintEl||!this.sprintSpeedInputEl)return;const e=Number.parseFloat(this.sprintSpeedInputEl.value);if(!Number.isFinite(e)){this.sprintSpeedHintEl.textContent="~ -- kp/h";return}const t=e*3.6;this.sprintSpeedHintEl.textContent=`~ ${t.toFixed(1)} kp/h`}populateWeaponTemplateImport(){if(!this.weaponTemplateImportSelect)return;const e=this.weaponTemplateImportSelect,t='<option value="">From templates...</option>';if(!this.weaponTemplates.length){e.innerHTML=`${t}<option value="" disabled>No templates available</option>`,e.disabled=!0;return}e.disabled=!1;const s=this.weaponTemplates.map((i,a)=>`<option value="${a}">${i.name||`Weapon ${a+1}`}</option>`).join("");e.innerHTML=`${t}${s}`}updateGrenadeTotal(){if(!this.grenadeTotalInput)return;const e=this.grenadeInputs.reduce((t,s)=>{const i=Number.parseInt(s.value,10);return t+(Number.isFinite(i)?i:0)},0);this.grenadeTotalInput.value=e>0?e.toString():""}updateTemplateLibraries(e){const t=new Map,s=new Map,i=new Map,a=(l,h,g)=>{const d=`${(l.name??h).toString().toLowerCase()}-${l.ammoType||""}`;t.has(d)||t.set(d,T(l));const b=(g??(typeof l.caliber=="string"?l.caliber:void 0)??"generic").toString().toLowerCase(),m=i.get(b)??[];m.push(T(l)),i.set(b,m);const E=i.get("generic")??[];E.push(T(l)),i.set("generic",E)},c=(l,h)=>{const g=(l.name??h).toString().toLowerCase();s.has(g)||s.set(g,T(l))};this.hostAmmoTemplates.forEach((l,h)=>{a(l,`hostAmmo${h}`,typeof l.caliber=="string"?l.caliber:void 0)}),this.hostFireTemplates.forEach((l,h)=>{c(l,`hostMode${h}`)}),this.fireLibraryTemplates.forEach((l,h)=>{c(l,`libraryMode${h}`)}),e.forEach(l=>{(l.guns||[]).forEach(h=>{(h.ammoTypes||[]).forEach((g,v)=>{a(g,`unitAmmo${v}`,h.caliber)}),(h.fireModes||[]).forEach((g,v)=>{c(g,`unitMode${v}`)})})}),this.ammoTemplates=Array.from(t.values()),this.fireTemplates=Array.from(s.values()),this.ammoLibraryByCaliber=i}}const le=()=>({name:"New Formation",role:"",hqLocation:"",commander:"",readiness:"",strengthSummary:"",supportAssets:"",communications:"",description:"",image:"",categories:[],subFormationLinks:[]});class bt{constructor(e){r(this,"root");r(this,"listEl");r(this,"formEl");r(this,"statusEl");r(this,"warningBannerEl");r(this,"loadErrorEl");r(this,"loadErrorTextEl");r(this,"categoryListEl");r(this,"unitsCountEl");r(this,"subFormationListEl");r(this,"formationCountEl",null);r(this,"formations",[]);r(this,"unitOptions",[]);r(this,"formationOptions",[]);r(this,"selectedIndex",0);r(this,"warningMessages",{});r(this,"unitIdGate",!1);r(this,"formationAttachmentGate",!1);this.root=e}init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),U.subscribe(e=>{const t=e.length;this.formations=t?e:[le()],this.rebuildFormationOptions(),this.formationCountEl&&(this.formationCountEl.textContent=t.toString()),this.renderList(),this.syncSelection()}),B.subscribe(e=>{const t=this.collectCategoriesFromDom();this.formations[this.selectedIndex]&&(this.formations[this.selectedIndex].categories=t);const s=e.filter(a=>typeof a.id=="number"&&Number.isFinite(a.id)),i=e.length-s.length;this.unitOptions=s.map(a=>{const c=a.id;return{id:c,label:a.name||`Unit ${c}`}}),this.unitIdGate=e.length>0&&s.length===0,this.warningMessages.units=i?`${i} unit${i===1?"":"s"} lack IDs and cannot be assigned. Request IDs from the host.`:void 0,this.updateWarningBanner(),this.renderCategories()}),this.reloadFormations()}renderLayout(){this.root.innerHTML=`
      <div class="workspace">
        <aside class="sidebar">
          <header class="sidebar-header">
            <div>
              <p class="eyebrow">Force structure</p>
              <h1>Formations Browser</h1>
            </div>
            <button type="button" class="ghost" data-action="add-formation">+ Formation</button>
          </header>
          <div class="unit-list" data-role="formation-list"></div>
          <div class="meta-bar compact">
            <span>Formations: <strong data-role="formation-count">0</strong></span>
            <span>Unique units: <strong data-role="formation-units-count">0</strong></span>
          </div>
        </aside>
        <section class="editor">
          <header class="editor-header">
            <div>
              <p class="eyebrow">Formation Editor</p>
              <h2>Formation Editor</h2>
              <p class="muted">Capture HQ posture, leadership, and subordinate attachments.</p>
            </div>
          </header>
          <div class="inline-warning hidden" data-role="formation-warning"></div>
          <div class="inline-error hidden" data-role="formation-load-error">
            <span data-role="formation-load-error-text"></span>
            <button type="button" class="ghost" data-action="retry-formations">Retry load</button>
          </div>
          <form data-role="formation-form" class="editor-form">
            <section class="panel grid-3">
              <div class="field">
                <label>Name</label>
                <input name="name" autocomplete="off" />
              </div>
              <div class="field">
                <label>Role / mission</label>
                <input name="role" />
              </div>
              <div class="field">
                <label>Headquarters location</label>
                <input name="hqLocation" />
              </div>
            </section>
            <section class="panel grid-3">
              <div class="field">
                <label>Commander</label>
                <input name="commander" />
              </div>
              <div class="field">
                <label>Readiness posture</label>
                <input name="readiness" placeholder="90% / 48h stand-up" />
              </div>
              <div class="field">
                <label>Strength summary</label>
                <input name="strengthSummary" placeholder="1,240 personnel / 220 vehicles" />
              </div>
            </section>
            <section class="panel grid-3">
              <div class="field">
                <label>Support assets</label>
                <input name="supportAssets" placeholder="Fires, sustainment, aviation" />
              </div>
              <div class="field">
                <label>Communications plan</label>
                <input name="communications" placeholder="FM 30-41 / SAT 2.5 GHz" />
              </div>
              <div class="field">
                <label>Image</label>
                <input name="image" placeholder="formations/path.png" />
              </div>
            </section>
            <section class="panel">
              <label>Description</label>
              <textarea name="description" rows="4" placeholder="Doctrine, employment concept, and sustainment notes."></textarea>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Categories</h3>
                <button type="button" class="ghost" data-action="add-category">Add category</button>
              </div>
              <div class="category-editor" data-role="category-editor"></div>
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Sub formations</h3>
                <button type="button" class="ghost" data-action="add-sub-formation">Attach formation</button>
              </div>
              <div class="sub-formation-list" data-role="sub-formation-list">
                <p class="empty">No attached formations.</p>
              </div>
            </section>
            <div class="form-actions">
              <button type="button" class="ghost danger" data-action="delete-formation">Delete formation</button>
              <button type="submit" class="primary">Save formation</button>
            </div>
          </form>
          <div class="status-bar" data-role="formation-status">Select a formation.</div>
        </section>
      </div>
    `}cacheElements(){this.listEl=this.root.querySelector('[data-role="formation-list"]'),this.formEl=this.root.querySelector('[data-role="formation-form"]'),this.statusEl=this.root.querySelector('[data-role="formation-status"]'),this.warningBannerEl=this.root.querySelector('[data-role="formation-warning"]'),this.loadErrorEl=this.root.querySelector('[data-role="formation-load-error"]'),this.loadErrorTextEl=this.loadErrorEl.querySelector('[data-role="formation-load-error-text"]'),this.categoryListEl=this.root.querySelector('[data-role="category-editor"]'),this.unitsCountEl=this.root.querySelector('[data-role="formation-units-count"]'),this.subFormationListEl=this.root.querySelector('[data-role="sub-formation-list"]'),this.formationCountEl=this.root.querySelector('[data-role="formation-count"]')}bindEvents(){this.listEl.addEventListener("click",e=>{const t=e.target.closest("[data-index]");t&&(this.selectedIndex=Number(t.dataset.index),this.syncSelection())}),this.formEl.addEventListener("submit",e=>{e.preventDefault(),this.saveFormation()}),this.root.addEventListener("click",e=>{var i;const t=e.target.closest("[data-action]");if(!t)return;const s=t.dataset.action;if(s==="add-formation")this.addFormation();else if(s==="add-category")this.appendCategoryRow();else if(s==="remove-category")(i=t.closest(".category-row"))==null||i.remove(),this.updateUnitsCount(this.collectCategoriesFromDom());else if(s==="add-sub-formation")this.appendSubFormationRow(),this.refreshSubFormationSelects();else if(s==="remove-sub-formation"){const a=t.closest(".sub-formation-row");a==null||a.remove(),this.subFormationListEl&&!this.subFormationListEl.querySelector(".sub-formation-row")&&(this.subFormationListEl.innerHTML='<p class="empty">No attached formations.</p>')}else s==="retry-formations"?this.reloadFormations():s==="delete-formation"&&this.deleteFormation()})}addFormation(){this.formations.push(le()),this.selectedIndex=this.formations.length-1,this.rebuildFormationOptions(),this.renderList(),this.syncSelection()}renderList(){if(!this.formations.length){this.listEl.innerHTML='<p class="empty">No formations found.</p>';return}this.listEl.innerHTML="",this.formations.forEach((e,t)=>{var i;const s=document.createElement("button");s.type="button",s.dataset.index=t.toString(),s.className=`unit-pill${t===this.selectedIndex?" active":""}`,s.innerHTML=`
        <span class="unit-pill-body">
          <span class="title">${e.name||"Untitled formation"}</span>
          <span class="meta">${((i=e.categories)==null?void 0:i.length)??0} categories</span>
        </span>
      `,this.listEl.appendChild(s)})}deleteFormation(){if(!this.formations.length)return;this.formations.splice(this.selectedIndex,1);const e=this.formations.slice();this.selectedIndex=Math.max(0,this.selectedIndex-1),this.formations.length||(this.formations=[le()],this.selectedIndex=0),this.formationCountEl&&(this.formationCountEl.textContent=e.length.toString()),this.rebuildFormationOptions(),this.syncSelection(),U.saveFormations(e).then(()=>{delete this.warningMessages.host,this.updateWarningBanner(),this.setStatus("Formation deleted.","success")}).catch(t=>{const s=t instanceof Error?t.message:String(t);this.warningMessages.host=s,this.updateWarningBanner(),this.setStatus(s,"error")})}syncSelection(){this.formations.length||(this.formations=[le()]),(this.selectedIndex<0||this.selectedIndex>=this.formations.length)&&(this.selectedIndex=0);const e=this.formations[this.selectedIndex],t=(s,i)=>{const a=this.formEl.elements.namedItem(s);a&&(a.value=i??"")};t("name",e.name),t("role",e.role),t("hqLocation",e.hqLocation),t("commander",e.commander),t("readiness",e.readiness),t("strengthSummary",e.strengthSummary),t("supportAssets",e.supportAssets),t("communications",e.communications),t("description",e.description),t("image",e.image),this.renderList(),this.renderCategories(),this.renderSubFormationRows(),this.setStatus(`Editing ${e.name||"formation"}.`,"default")}renderCategories(){this.categoryListEl.innerHTML="";const t=this.formations[this.selectedIndex].categories||[];if(t.length)t.forEach(s=>this.appendCategoryRow(s));else{const s=document.createElement("p");s.className="empty",s.textContent="No categories yet. Add one to assign units.",this.categoryListEl.appendChild(s)}this.updateUnitsCount(t)}renderSubFormationRows(){if(!this.subFormationListEl)return;this.subFormationListEl.innerHTML="";const e=this.formations[this.selectedIndex],t=this.normalizeSubFormationLinks(e);if(!t.length){this.subFormationListEl.innerHTML='<p class="empty">No attached formations.</p>';return}t.forEach(s=>this.appendSubFormationRow(s)),this.refreshSubFormationSelects()}normalizeSubFormationLinks(e){const t=[];return Array.isArray(e.subFormationLinks)&&e.subFormationLinks.length?(e.subFormationLinks.forEach(s=>{const i=typeof s.formationId=="string"?Number(s.formationId):s.formationId;typeof i=="number"&&!Number.isNaN(i)&&t.push({...s,formationId:i})}),t):(Array.isArray(e.subFormations)&&e.subFormations.length&&e.subFormations.forEach(s=>{typeof s=="number"&&!Number.isNaN(s)&&t.push({formationId:s})}),t)}appendSubFormationRow(e){if(!this.subFormationListEl)return;this.subFormationListEl.querySelector(".empty")&&(this.subFormationListEl.innerHTML="");const t=document.createElement("div");t.className="sub-formation-row",t.innerHTML=`
      <div class="field">
        <label>Formation</label>
        <select data-field="formation"></select>
      </div>
      <div class="field">
        <label>Assignment</label>
        <input data-field="assignment" value="${(e==null?void 0:e.assignment)??""}" />
      </div>
      <div class="field">
        <label>Strength</label>
        <input data-field="strength" value="${(e==null?void 0:e.strength)??""}" />
      </div>
      <div class="field">
        <label>Readiness</label>
        <input data-field="readiness" value="${(e==null?void 0:e.readiness)??""}" />
      </div>
      <div class="field full-row">
        <label>Notes</label>
        <input data-field="notes" value="${(e==null?void 0:e.notes)??""}" />
      </div>
      <div class="row-actions">
        <button type="button" class="ghost" data-action="remove-sub-formation">Remove</button>
      </div>
    `;const s=t.querySelector('select[data-field="formation"]');s&&this.populateSubFormationOptions(s,e==null?void 0:e.formationId),this.subFormationListEl.appendChild(t)}populateSubFormationOptions(e,t){const s=this.getCurrentFormationIdentity(),i=t??(e.value?Number(e.value):void 0);e.innerHTML="";const a=document.createElement("option");a.value="",a.textContent="Select formation",e.appendChild(a),this.formationOptions.filter(c=>s?c.id!==s:!0).forEach(c=>{const l=document.createElement("option");l.value=c.id.toString(),l.textContent=c.name,e.appendChild(l)}),i&&!Number.isNaN(i)?e.value=i.toString():e.value=""}refreshSubFormationSelects(){if(!this.subFormationListEl)return;Array.from(this.subFormationListEl.querySelectorAll('select[data-field="formation"]')).forEach(t=>{const s=t.value?Number(t.value):void 0;this.populateSubFormationOptions(t,s&&!Number.isNaN(s)?s:void 0)})}collectSubFormationLinks(){return this.subFormationListEl?Array.from(this.subFormationListEl.querySelectorAll(".sub-formation-row")).map(t=>{const s=t.querySelector('select[data-field="formation"]');if(!s||!s.value)return null;const i=Number(s.value);if(!Number.isFinite(i))return null;const a=l=>{var h;return((h=t.querySelector(`[data-field="${l}"]`))==null?void 0:h.value.trim())??""};return{formationId:i,assignment:a("assignment")||void 0,strength:a("strength")||void 0,readiness:a("readiness")||void 0,notes:a("notes")||void 0}}).filter(t=>!!t):[]}appendCategoryRow(e){const t=document.createElement("div");t.className="category-row",t.innerHTML=`
      <div class="field">
        <label>Category name</label>
        <input data-field="name" value="${(e==null?void 0:e.name)||""}" />
      </div>
      <div class="field">
        <label>Assign units</label>
        <select data-field="units" multiple size="5"></select>
      </div>
      <div class="row-actions">
        <button type="button" class="ghost" data-action="remove-category">Remove</button>
      </div>
    `;const s=t.querySelector('select[data-field="units"]'),i=new Set(((e==null?void 0:e.units)||[]).map(a=>Number(a)));this.populateUnitOptions(s,i),this.categoryListEl.appendChild(t)}populateUnitOptions(e,t){if(e.innerHTML="",!this.unitOptions.length){const s=document.createElement("option");s.textContent="No units available",s.disabled=!0,e.appendChild(s);return}this.unitOptions.forEach(({id:s,label:i})=>{const a=document.createElement("option");a.value=s.toString(),a.textContent=i,t.has(s)&&(a.selected=!0),e.appendChild(a)})}collectCategoriesFromDom(){return Array.from(this.categoryListEl.querySelectorAll(".category-row")).map(t=>{const s=t.querySelector('input[data-field="name"]'),i=t.querySelector('select[data-field="units"]'),a=i?Array.from(i.selectedOptions).map(c=>Number(c.value)).filter(c=>!Number.isNaN(c)):[];return{name:((s==null?void 0:s.value)||"").trim(),units:a}})}updateUnitsCount(e){const t=new Set;e.forEach(s=>(s.units||[]).forEach(i=>t.add(i))),this.unitsCountEl.textContent=t.size.toString()}rebuildFormationOptions(){const e=this.formations.filter(s=>typeof s.id=="number"&&Number.isFinite(s.id)),t=this.formations.length-e.length;this.formationOptions=e.map(s=>{const i=s.id;return{id:i,name:s.name||`Formation ${i}`}}),this.formationAttachmentGate=this.formations.length>0&&e.length===0,this.warningMessages.formations=t?`${t} formation${t===1?"":"s"} lack IDs and cannot be attached yet. Save them first.`:void 0,this.updateWarningBanner(),this.refreshSubFormationSelects()}getCurrentFormationIdentity(){const e=this.formations[this.selectedIndex];return e&&typeof e.id=="number"&&Number.isFinite(e.id)?e.id:void 0}saveFormation(){if(!this.formations.length)return;if(this.unitIdGate){this.setStatus("Cannot save while units are missing IDs. Request the host to assign IDs and try again.","error");return}const e={...this.formations[this.selectedIndex]},t=s=>{var i;return((i=this.formEl.elements.namedItem(s))==null?void 0:i.value.trim())??""};e.name=t("name"),e.role=t("role")||void 0,e.hqLocation=t("hqLocation")||void 0,e.commander=t("commander")||void 0,e.readiness=t("readiness")||void 0,e.strengthSummary=t("strengthSummary")||void 0,e.supportAssets=t("supportAssets")||void 0,e.communications=t("communications")||void 0,e.description=t("description")||void 0,e.image=t("image")||void 0,e.categories=this.collectCategoriesFromDom(),e.subFormationLinks=this.collectSubFormationLinks(),e.subFormations=(e.subFormationLinks||[]).map(s=>s.formationId).filter(s=>typeof s=="number"&&!Number.isNaN(s)),this.updateUnitsCount(e.categories||[]),this.formations[this.selectedIndex]=e,this.rebuildFormationOptions(),U.saveFormations(this.formations).then(()=>{delete this.warningMessages.host,this.updateWarningBanner(),this.setStatus("Formation saved.","success")}).catch(s=>{const i=s instanceof Error?s.message:String(s);this.warningMessages.host=i,this.updateWarningBanner(),this.setStatus(i,"error")})}updateWarningBanner(){if(!this.warningBannerEl)return;const e=Object.values(this.warningMessages).filter(t=>!!t);if(!e.length){this.warningBannerEl.classList.add("hidden"),this.warningBannerEl.textContent="",this.warningBannerEl.setAttribute("aria-hidden","true");return}this.warningBannerEl.classList.remove("hidden"),this.warningBannerEl.removeAttribute("aria-hidden"),this.warningBannerEl.innerHTML=e.map(t=>`<p>${t}</p>`).join("")}setLoadError(e){if(this.loadErrorEl){if(!e){this.loadErrorEl.classList.add("hidden"),this.loadErrorEl.setAttribute("aria-hidden","true"),this.loadErrorTextEl.textContent="";return}this.loadErrorEl.classList.remove("hidden"),this.loadErrorEl.removeAttribute("aria-hidden"),this.loadErrorTextEl.textContent=e}}async reloadFormations(){try{this.setLoadError(),await U.loadFormations()}catch(e){const t=e instanceof Error?e.message:String(e);this.setLoadError(`Failed to load formations: ${t}`),this.setStatus("Unable to load formations from host.","error")}}setStatus(e,t){this.statusEl.textContent=e,this.statusEl.dataset.tone=t}}const ce=()=>({name:"New Nation",description:"",image:"",formations:[]});class gt{constructor(e){r(this,"root");r(this,"listEl");r(this,"formEl");r(this,"statusEl");r(this,"warningEl");r(this,"loadErrorEl");r(this,"loadErrorTextEl");r(this,"formationSelectEl");r(this,"nationCountEl");r(this,"availableFormationCountEl");r(this,"nations",[]);r(this,"formationOptions",[]);r(this,"selectedIndex",0);r(this,"formationIdGate",!1);r(this,"formationWarning");r(this,"hostWarning");this.root=e}init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),O.subscribe(e=>{this.nations=e.length?e:[ce()],this.nationCountEl&&(this.nationCountEl.textContent=e.length.toString()),this.renderList(),this.syncSelection()}),U.subscribe(e=>{const t=e.filter(i=>typeof i.id=="number"&&Number.isFinite(i.id)),s=e.length-t.length;this.formationOptions=t.map(i=>{const a=i.id;return{id:a,name:i.name||`Formation ${a}`}}),this.formationIdGate=e.length>0&&t.length===0,this.formationWarning=s?`${s} formation${s===1?"":"s"} are missing IDs. Save formations before assigning them to nations.`:void 0,this.updateWarningBanner(),this.availableFormationCountEl&&(this.availableFormationCountEl.textContent=t.length.toString()),this.renderFormationSelect()}),this.reloadNations()}renderLayout(){this.root.innerHTML=`
      <div class="workspace">
        <aside class="sidebar">
          <header class="sidebar-header">
            <div>
              <p class="eyebrow">Doctrine profiles</p>
              <h1>Nation Builder</h1>
              <p class="muted">Bind formations to geopolitical blueprints.</p>
            </div>
            <button type="button" class="ghost" data-action="add-nation">+ Nation</button>
          </header>
          <div class="unit-list" data-role="nation-list"></div>
          <div class="meta-bar compact">
            <span>Nations: <strong data-role="nation-count">0</strong></span>
            <span>Formations ready: <strong data-role="nation-formation-count">0</strong></span>
          </div>
        </aside>
        <section class="editor">
          <header class="editor-header">
            <div>
              <p class="eyebrow">Nation Editor</p>
              <h2>Strategic Profiles</h2>
              <p class="muted">Track doctrine notes, emblems, and attached formations.</p>
            </div>
          </header>
          <div class="inline-warning hidden" data-role="nation-warning"></div>
          <div class="inline-error hidden" data-role="nation-load-error">
            <span data-role="nation-load-error-text"></span>
            <button type="button" class="ghost" data-action="retry-nations">Retry load</button>
          </div>
          <form data-role="nation-form" class="editor-form">
            <section class="panel grid-3">
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
            </section>
            <section class="panel">
              <div class="panel-heading">
                <h3>Assigned formations</h3>
                <span class="muted small">Ctrl/Cmd + click to multi-select</span>
              </div>
              <select data-role="formation-select" multiple size="6"></select>
            </section>
            <div class="form-actions">
              <button type="button" class="ghost danger" data-action="delete-nation">Delete nation</button>
              <button type="submit" class="primary">Save nation</button>
            </div>
          </form>
          <div class="status-bar" data-role="nation-status">Select a nation.</div>
        </section>
      </div>
    `}cacheElements(){this.listEl=this.root.querySelector('[data-role="nation-list"]'),this.formEl=this.root.querySelector('[data-role="nation-form"]'),this.statusEl=this.root.querySelector('[data-role="nation-status"]'),this.warningEl=this.root.querySelector('[data-role="nation-warning"]'),this.loadErrorEl=this.root.querySelector('[data-role="nation-load-error"]'),this.loadErrorTextEl=this.loadErrorEl.querySelector('[data-role="nation-load-error-text"]'),this.formationSelectEl=this.root.querySelector('[data-role="formation-select"]'),this.nationCountEl=this.root.querySelector('[data-role="nation-count"]')??void 0,this.availableFormationCountEl=this.root.querySelector('[data-role="nation-formation-count"]')??void 0}bindEvents(){this.listEl.addEventListener("click",e=>{const t=e.target.closest("[data-index]");if(!t)return;const s=Number(t.dataset.index);Number.isNaN(s)||(this.selectedIndex=s,this.syncSelection())}),this.formEl.addEventListener("submit",e=>{e.preventDefault(),this.saveNation()}),this.root.addEventListener("click",e=>{const t=e.target.closest("[data-action]");if(!t)return;const s=t.dataset.action;s==="add-nation"?this.addNation():s==="retry-nations"?this.reloadNations():s==="delete-nation"&&this.deleteNation()})}addNation(){this.nations.push(ce()),this.selectedIndex=this.nations.length-1,this.nationCountEl&&(this.nationCountEl.textContent=this.nations.length.toString()),this.renderList(),this.syncSelection(),this.setStatus("New nation ready for details.","success")}deleteNation(){if(!this.nations.length)return;this.nations.splice(this.selectedIndex,1);const e=this.nations.slice();this.selectedIndex=Math.max(0,this.selectedIndex-1),this.nations.length||(this.nations=[ce()],this.selectedIndex=0),this.nationCountEl&&(this.nationCountEl.textContent=e.length.toString()),this.syncSelection(),O.saveNations(e).then(()=>{this.hostWarning=void 0,this.updateWarningBanner(),this.setStatus("Nation deleted.","success")}).catch(t=>{const s=t instanceof Error?t.message:String(t);this.hostWarning=s,this.updateWarningBanner(),this.setStatus(s,"error")})}renderList(){if(!this.nations.length){this.listEl.innerHTML='<p class="empty">No nations defined.</p>';return}this.listEl.innerHTML="",this.nations.forEach((e,t)=>{var i;const s=document.createElement("button");s.type="button",s.dataset.index=t.toString(),s.className=`unit-pill${t===this.selectedIndex?" active":""}`,s.innerHTML=`
        <span class="title">${e.name||"Unnamed nation"}</span>
        <span class="meta">${((i=e.formations)==null?void 0:i.length)??0} formations</span>
      `,this.listEl.appendChild(s)})}syncSelection(){this.nations.length||(this.nations=[ce()]),(this.selectedIndex<0||this.selectedIndex>=this.nations.length)&&(this.selectedIndex=0);const e=this.nations[this.selectedIndex];this.formEl.elements.namedItem("name").value=e.name||"",this.formEl.elements.namedItem("description").value=e.description||"",this.formEl.elements.namedItem("image").value=e.image||"",this.renderList(),this.renderFormationSelect(),this.setStatus(`Editing ${e.name||"nation"}.`,"default")}renderFormationSelect(){if(!this.formationSelectEl)return;const e=this.nations[this.selectedIndex],t=new Set(((e==null?void 0:e.formations)||[]).map(s=>Number(s)));if(this.formationSelectEl.innerHTML="",!this.formationOptions.length){const s=document.createElement("option");s.disabled=!0,s.textContent=this.formationWarning||"No formations available",this.formationSelectEl.appendChild(s);return}this.formationOptions.forEach(({id:s,name:i})=>{const a=document.createElement("option");a.value=s.toString(),a.textContent=i,t.has(s)&&(a.selected=!0),this.formationSelectEl.appendChild(a)})}saveNation(){if(!this.nations.length)return;if(this.formationIdGate){this.setStatus("Cannot save nations while formations are missing IDs. Save formations first.","error");return}const e={...this.nations[this.selectedIndex]};e.name=this.formEl.elements.namedItem("name").value.trim(),e.description=this.formEl.elements.namedItem("description").value.trim(),e.image=this.formEl.elements.namedItem("image").value.trim(),e.formations=Array.from(this.formationSelectEl.selectedOptions).map(t=>Number(t.value)).filter(t=>!Number.isNaN(t)),this.nations[this.selectedIndex]=e,O.saveNations(this.nations).then(()=>{this.hostWarning=void 0,this.updateWarningBanner(),this.setStatus("Nation saved.","success")}).catch(t=>{const s=t instanceof Error?t.message:String(t);this.hostWarning=s,this.updateWarningBanner(),this.setStatus(s,"error")})}updateWarningBanner(){if(!this.warningEl)return;const e=[this.formationWarning,this.hostWarning].filter(t=>!!t);if(!e.length){this.warningEl.classList.add("hidden"),this.warningEl.textContent="",this.warningEl.setAttribute("aria-hidden","true");return}this.warningEl.classList.remove("hidden"),this.warningEl.removeAttribute("aria-hidden"),this.warningEl.innerHTML=e.map(t=>`<p>${t}</p>`).join("")}setNationLoadError(e){if(this.loadErrorEl){if(!e){this.loadErrorEl.classList.add("hidden"),this.loadErrorEl.setAttribute("aria-hidden","true"),this.loadErrorTextEl.textContent="";return}this.loadErrorEl.classList.remove("hidden"),this.loadErrorEl.removeAttribute("aria-hidden"),this.loadErrorTextEl.textContent=e}}async reloadNations(){try{this.setNationLoadError(),await O.loadNations()}catch(e){const t=e instanceof Error?e.message:String(e);this.setNationLoadError(`Failed to load nations: ${t}`),this.setStatus("Unable to load nations from host.","error")}}setStatus(e,t){this.statusEl.textContent=e,this.statusEl.dataset.tone=t}}const vt="#6dd5fa",Se=(o,e,t)=>Math.min(Math.max(o,e),t),yt=(o,e)=>{const t=o.replace("#","");if(!/^[0-9a-f]{6}$/i.test(t))return o;const s=parseInt(t,16),i=Se((s>>16&255)+e*255,0,255),a=Se((s>>8&255)+e*255,0,255),c=Se((s&255)+e*255,0,255);return`#${((1<<24)+(Math.round(i)<<16)+(Math.round(a)<<8)+Math.round(c)).toString(16).slice(1)}`},Be=o=>{const e=document.documentElement,t=o.theme||"";t?e.dataset.theme=t:e.removeAttribute("data-theme");const s=typeof o.accentColor=="string"&&o.accentColor?o.accentColor:vt;e.style.setProperty("--accent",s),e.style.setProperty("--accent-dark",yt(s,-.35))};class Et{constructor(){r(this,"metadata");r(this,"logs",[]);r(this,"diagnostics");r(this,"metadataListeners",new Set);r(this,"logListeners",new Set);r(this,"diagnosticsListeners",new Set);r(this,"requestedInitialDiagnostics",!1);r(this,"isSupported",p.isAvailable);this.isSupported&&(p.on("host-info",e=>this.handleHostInfo(e)),p.on("server-logs",e=>this.applyLogSnapshot(e)),p.on("server-log-event",e=>this.appendLog(e)))}init(){this.isSupported&&(p.postMessage("host-info-request"),p.postMessage("get-server-logs"))}subscribeToMetadata(e){return this.metadataListeners.add(e),e(this.metadata),()=>this.metadataListeners.delete(e)}subscribeToLogs(e){return this.logListeners.add(e),e(this.logs.slice()),()=>this.logListeners.delete(e)}subscribeToDiagnostics(e){return this.diagnosticsListeners.add(e),e(this.diagnostics),()=>this.diagnosticsListeners.delete(e)}refreshLogs(){this.isSupported&&p.postMessage("get-server-logs")}async fetchDiagnostics(){var s;if(!this.isSupported)throw new Error("Local server is not available in this environment.");if(!((s=this.metadata)!=null&&s.baseUrl))throw new Error("Server metadata is not yet available.");const e=await fetch(`${this.metadata.baseUrl}/api/diagnostics`,{headers:this.buildHeaders()});if(!e.ok)throw new Error(`Diagnostics request failed (${e.status})`);const t=await e.json();return this.diagnostics=t,this.notifyDiagnostics(),t}getMetadata(){return this.metadata}getLogs(){return this.logs.slice()}buildHeaders(){var t;const e={Accept:"application/json"};return(t=this.metadata)!=null&&t.token&&(e["X-Server-Token"]=this.metadata.token),e}handleHostInfo(e){if(!e)return;const t=e.server??e.Server;if(!t)return;const s=t,i=(...c)=>{for(const l of c){const h=s[l];if(typeof h=="string")return h}},a=(...c)=>{for(const l of c){const h=s[l];if(typeof h=="number")return h}};this.metadata={baseUrl:i("baseUrl","BaseUrl"),port:a("port","Port"),token:i("token","Token"),startedAt:i("startedAt","StartedAt")},this.notifyMetadata(),this.primeDiagnostics()}applyLogSnapshot(e){if(!e){this.logs=[],this.notifyLogs();return}const t=Array.isArray(e.entries)?e.entries:[];this.logs=t.map(s=>this.normalizeLog(s)),this.notifyLogs()}appendLog(e){if(!e)return;const t=this.normalizeLog(e);this.logs=[...this.logs.slice(-499),t],this.notifyLogs()}normalizeLog(e){return{timestamp:typeof e.timestamp=="string"?e.timestamp:new Date().toISOString(),level:e.level??"Information",category:e.category??"server",message:e.message??"(no message provided)",exception:e.exception??null,statusCode:typeof e.statusCode=="number"?e.statusCode:null,durationMs:typeof e.durationMs=="number"?e.durationMs:null}}notifyMetadata(){this.metadataListeners.forEach(e=>{try{e(this.metadata)}catch(t){console.error("[serverService] Metadata listener failed",t)}})}notifyLogs(){const e=this.logs.slice();this.logListeners.forEach(t=>{try{t(e)}catch(s){console.error("[serverService] Log listener failed",s)}})}notifyDiagnostics(){this.diagnosticsListeners.forEach(e=>{try{e(this.diagnostics)}catch(t){console.error("[serverService] Diagnostics listener failed",t)}})}primeDiagnostics(){var e;this.requestedInitialDiagnostics||(e=this.metadata)!=null&&e.baseUrl&&(this.requestedInitialDiagnostics=!0,this.fetchDiagnostics().catch(t=>{this.requestedInitialDiagnostics=!1,console.warn("[serverService] Initial diagnostics fetch failed",t)}))}}const F=new Et;class St{constructor(e){r(this,"root");r(this,"formEl");r(this,"statusEl");r(this,"settings",{});r(this,"serverConsoleEl");r(this,"serverStatusPill");r(this,"serverMetaEl");r(this,"serverLogView");r(this,"serverDiagOutputEl");r(this,"serverConsoleStatusEl");r(this,"serverRefreshBtn");r(this,"serverDiagBtn");r(this,"serverFilterInput");r(this,"serverAutoScrollToggle");r(this,"serverLogs",[]);r(this,"serverMetadata");r(this,"serverDiagnostics");r(this,"autoScroll",!0);r(this,"unsubscribers",[]);this.root=e}init(){this.renderLayout(),this.cacheElements(),this.bindEvents(),j.subscribe(e=>{this.settings=e,this.syncForm()}),j.loadSettings().catch(e=>{this.setStatus(e instanceof Error?e.message:String(e),"error")})}renderLayout(){this.root.innerHTML=`
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
              <option value="midnight">Midnight</option>
              <option value="aurora">Aurora</option>
              <option value="terminal">Terminal</option>
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
        <div class="panel server-console" data-role="server-console">
          <div class="panel-heading spaced">
            <div>
              <h3>Local Server Console</h3>
              <p class="muted">Inspect embedded API health, logs, and diagnostics output.</p>
            </div>
            <span class="pill" data-role="server-status-pill">Host offline</span>
          </div>
          <div class="server-console-actions">
            <button type="button" class="ghost" data-role="refresh-logs">Refresh logs</button>
            <button type="button" class="ghost" data-role="run-diagnostics">Run diagnostics</button>
            <label class="inline">
              <input type="checkbox" data-role="auto-scroll" checked />
              Autoscroll
            </label>
            <input type="search" placeholder="Filter logs" data-role="log-filter" />
          </div>
          <div class="server-meta" data-role="server-meta">Server details unavailable.</div>
          <div class="server-log-view" data-role="server-log-view">
            <p class="muted">No log entries yet.</p>
          </div>
          <pre class="server-diagnostics-output" data-role="server-diagnostics-output">Run diagnostics to capture database and payload summaries.</pre>
          <div class="status-bar compact" data-role="server-console-status">Server console idle.</div>
        </div>
      </div>
    `}cacheElements(){this.formEl=this.root.querySelector('[data-role="settings-form"]'),this.statusEl=this.root.querySelector('[data-role="settings-status"]'),this.serverConsoleEl=this.root.querySelector('[data-role="server-console"]'),this.serverStatusPill=this.root.querySelector('[data-role="server-status-pill"]'),this.serverMetaEl=this.root.querySelector('[data-role="server-meta"]'),this.serverLogView=this.root.querySelector('[data-role="server-log-view"]'),this.serverDiagOutputEl=this.root.querySelector('[data-role="server-diagnostics-output"]'),this.serverConsoleStatusEl=this.root.querySelector('[data-role="server-console-status"]'),this.serverRefreshBtn=this.root.querySelector('[data-role="refresh-logs"]')??void 0,this.serverDiagBtn=this.root.querySelector('[data-role="run-diagnostics"]')??void 0,this.serverFilterInput=this.root.querySelector('[data-role="log-filter"]')??void 0,this.serverAutoScrollToggle=this.root.querySelector('[data-role="auto-scroll"]')??void 0}bindEvents(){this.formEl.addEventListener("submit",e=>{e.preventDefault(),this.persist()}),this.bindServerConsoleEvents()}bindServerConsoleEvents(){var e,t,s;this.serverConsoleEl&&((e=this.serverRefreshBtn)==null||e.addEventListener("click",()=>F.refreshLogs()),(t=this.serverDiagBtn)==null||t.addEventListener("click",()=>{this.runDiagnostics()}),(s=this.serverFilterInput)==null||s.addEventListener("input",()=>this.renderServerLogs()),this.serverAutoScrollToggle&&(this.autoScroll=this.serverAutoScrollToggle.checked,this.serverAutoScrollToggle.addEventListener("change",i=>{this.autoScroll=i.target.checked})),this.wireServerConsole(),this.renderServerMeta(),this.renderServerLogs(),this.renderDiagnostics())}wireServerConsole(){var e,t;if(this.serverConsoleEl){if(!F.isSupported){this.serverConsoleEl.classList.add("is-disabled"),this.serverStatusPill.textContent="Host unavailable",(e=this.serverRefreshBtn)==null||e.setAttribute("disabled","true"),(t=this.serverDiagBtn)==null||t.setAttribute("disabled","true"),this.setServerConsoleStatus("Embedded server unavailable in browser preview.","error");return}this.unsubscribers.forEach(s=>s()),this.unsubscribers.length=0,this.unsubscribers.push(F.subscribeToMetadata(s=>{this.serverMetadata=s,this.renderServerMeta()})),this.unsubscribers.push(F.subscribeToLogs(s=>{this.serverLogs=s,this.renderServerLogs(),this.setServerConsoleStatus(`Received ${s.length} log entries.`,"default")})),this.unsubscribers.push(F.subscribeToDiagnostics(s=>{this.serverDiagnostics=s,this.renderDiagnostics()})),F.refreshLogs()}}syncForm(){this.formEl.elements.namedItem("theme").value=this.settings.theme||"",this.formEl.elements.namedItem("locale").value=this.settings.locale||"",this.formEl.elements.namedItem("accentColor").value=typeof this.settings.accentColor=="string"&&this.settings.accentColor.startsWith("#")?this.settings.accentColor:"#6dd5fa",this.formEl.elements.namedItem("enableExperimental").checked=!!this.settings.enableExperimental}persist(){const e={theme:this.formEl.elements.namedItem("theme").value||void 0,locale:this.formEl.elements.namedItem("locale").value||void 0,accentColor:this.formEl.elements.namedItem("accentColor").value||void 0,enableExperimental:this.formEl.elements.namedItem("enableExperimental").checked};Be(e),j.saveSettings(e).then(()=>this.setStatus("Settings saved.","success")).catch(t=>this.setStatus(t instanceof Error?t.message:String(t),"error"))}renderServerMeta(){var i,a;if(!this.serverMetaEl)return;if(!F.isSupported){this.serverMetaEl.innerHTML='<p class="muted">Server features are unavailable while running in the browser.</p>';return}if(!this.serverMetadata){this.serverMetaEl.innerHTML='<p class="muted">Awaiting handshake from the desktop host...</p>',this.serverStatusPill.textContent="Awaiting host";return}const e=this.serverMetadata.startedAt?new Date(this.serverMetadata.startedAt).toLocaleString():"Unknown",t=this.serverMetadata.baseUrl??"n/a",s=this.serverMetadata.port??0;this.serverStatusPill.textContent=`Online - Port ${s}`,this.serverMetaEl.innerHTML=`
      <dl class="server-meta-grid">
        <div><dt>Base URL</dt><dd>${t}</dd></div>
        <div><dt>Port</dt><dd>${s}</dd></div>
        <div><dt>Started</dt><dd>${e}</dd></div>
      </dl>
      <p class="muted">Auth token protected - bridge events stream live into the console.</p>
    `,(i=this.serverRefreshBtn)==null||i.removeAttribute("disabled"),(a=this.serverDiagBtn)==null||a.removeAttribute("disabled")}renderServerLogs(){var s,i;if(!this.serverLogView)return;if(!this.serverLogs.length){this.serverLogView.innerHTML='<p class="muted">No log entries yet.</p>';return}const e=(i=(s=this.serverFilterInput)==null?void 0:s.value)==null?void 0:i.trim().toLowerCase(),t=e?this.serverLogs.filter(a=>[a.level,a.category,a.message,a.exception??""].filter(Boolean).some(c=>String(c).toLowerCase().includes(e))):this.serverLogs;if(!t.length){this.serverLogView.innerHTML=`<p class="muted">No log entries match "${e}".</p>`;return}this.serverLogView.innerHTML=t.map(a=>{var v,d;const c=new Date(a.timestamp).toLocaleTimeString(),l=((d=(v=a.level)==null?void 0:v.toUpperCase)==null?void 0:d.call(v))??"INFO",h=[a.category,a.statusCode?`HTTP ${a.statusCode}`:void 0,a.durationMs?`${a.durationMs.toFixed(1)} ms`:void 0].filter(Boolean).join(" | "),g=a.exception?`<div class="log-exception">${a.exception}</div>`:"";return`
          <article class="log-entry" data-level="${l.toLowerCase()}">
            <header>
              <span class="log-time">${c}</span>
              <span class="log-level">${l}</span>
              ${h?`<span class="log-meta">${h}</span>`:""}
            </header>
            <p>${a.message}</p>
            ${g}
          </article>
        `}).join(""),this.autoScroll&&(this.serverLogView.scrollTop=this.serverLogView.scrollHeight)}renderDiagnostics(){if(!this.serverDiagOutputEl)return;if(!this.serverDiagnostics){this.serverDiagOutputEl.textContent="Run diagnostics to inspect database + backup metadata.";return}const{backupFiles:e,...t}=this.serverDiagnostics,s={...t,backupFiles:e};this.serverDiagOutputEl.textContent=JSON.stringify(s,null,2)}async runDiagnostics(){if(F.isSupported){this.serverDiagBtn&&(this.serverDiagBtn.disabled=!0,this.serverDiagBtn.textContent="Running...");try{const e=await F.fetchDiagnostics();this.serverDiagnostics=e,this.renderDiagnostics(),this.setServerConsoleStatus("Diagnostics snapshot captured.","success")}catch(e){const t=e instanceof Error?e.message:String(e);this.serverDiagOutputEl.textContent=`Diagnostics failed: ${t}`,this.setServerConsoleStatus(t,"error")}finally{this.serverDiagBtn&&(this.serverDiagBtn.disabled=!1,this.serverDiagBtn.textContent="Run diagnostics")}}}setServerConsoleStatus(e,t){this.serverConsoleStatusEl&&(this.serverConsoleStatusEl.textContent=e,this.serverConsoleStatusEl.dataset.tone=t)}setStatus(e,t){this.statusEl.textContent=e,this.statusEl.dataset.tone=t}}class wt{constructor(e){r(this,"root");r(this,"workbench");this.root=e}async init(){this.root.innerHTML=`
			<div class="panel weapon-panel">
				<div class="panel-heading">
					<h3>Weapon Templates</h3>
					<p class="muted small">Manage reusable weapons, ammo, and fire modes</p>
				</div>
				<div data-role="weapon-workbench"></div>
			</div>
		`;const e=this.root.querySelector('[data-role="weapon-workbench"]');if(!e)throw new Error("Failed to initialize weapon workbench container");e.innerHTML='<p class="muted small">Loading weapon workbench...</p>',await this.mountWorkbench(e)}async mountWorkbench(e){try{const t=await Ue(()=>import("./weaponWorkbench-CRqludlR.js"),[],import.meta.url);this.workbench=new t.WeaponWorkbench(e),await Promise.resolve(this.workbench.init())}catch(t){e.innerHTML='<p class="muted small">Failed to load weapon workbench. Check console.</p>',console.error("Failed to load weapon workbench",t)}}}class Lt{constructor(e){r(this,"root");r(this,"statusEl");r(this,"summaryEl");r(this,"logsEl");r(this,"filesEl");this.root=e}init(){var e,t;this.root.innerHTML=`
      <div class="diagnostics-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Runtime Diagnostics</p>
            <h2>Host Health Monitor</h2>
            <p class="muted">Inspect WebView host, local API server, and storage consistency.</p>
          </div>
          <div class="header-actions">
            <button type="button" class="ghost" data-role="refresh-logs">Refresh logs</button>
            <button type="button" class="primary" data-role="refresh-diagnostics">Refresh diagnostics</button>
          </div>
        </div>
        <div class="diagnostics-grid">
          <section class="diagnostic-card">
            <header>
              <span class="label">Server status</span>
              <span class="badge" data-role="status-indicator">Pending...</span>
            </header>
            <dl data-role="metadata"></dl>
          </section>
          <section class="diagnostic-card" data-role="summary">
            <header>
              <span class="label">Database snapshot</span>
            </header>
            <div class="grid-2" data-role="summary-body"></div>
          </section>
        </div>
        <section class="diagnostic-card">
          <header>
            <span class="label">JSON backups</span>
          </header>
          <div class="file-grid" data-role="files"></div>
        </section>
        <section class="diagnostic-card">
          <header>
            <span class="label">Server log tail</span>
          </header>
          <div class="log-table" data-role="logs"></div>
        </section>
      </div>
    `,this.statusEl=this.root.querySelector("[data-role='status-indicator']")??void 0,this.summaryEl=this.root.querySelector("[data-role='summary-body']")??void 0,this.logsEl=this.root.querySelector("[data-role='logs']")??void 0,this.filesEl=this.root.querySelector("[data-role='files']")??void 0,(e=this.root.querySelector("[data-role='refresh-diagnostics']"))==null||e.addEventListener("click",()=>{this.setStatus("Refreshing..."),F.fetchDiagnostics().then(()=>this.setStatus("Healthy")).catch(s=>{console.error("Failed to refresh diagnostics",s),this.setStatus("Error")})}),(t=this.root.querySelector("[data-role='refresh-logs']"))==null||t.addEventListener("click",()=>{F.refreshLogs()}),F.subscribeToMetadata(s=>this.renderMetadata(s)),F.subscribeToDiagnostics(s=>this.renderDiagnostics(s)),F.subscribeToLogs(s=>this.renderLogs(s)),F.isSupported?F.fetchDiagnostics().catch(()=>{}):this.setStatus("Unavailable")}setStatus(e){this.statusEl&&(this.statusEl.textContent=e)}renderMetadata(e){var i;const t=this.root.querySelector("[data-role='metadata']");if(!t)return;if(t.innerHTML="",!e){const a=document.createElement("p");a.className="muted",a.textContent="Waiting for host handshake...",t.appendChild(a),this.setStatus("Pending");return}[["Base URL",e.baseUrl],["Port",e.port],["Started",e.startedAt],["Token",(i=e.token)!=null&&i.slice(0,6)?`${e.token.slice(0,6)}…`:void 0]].forEach(([a,c])=>{const l=document.createElement("div");l.className="meta-row",l.innerHTML=`<span>${a}</span><strong>${qe(c)}</strong>`,t.appendChild(l)}),this.setStatus("Connected")}renderDiagnostics(e){if(!this.summaryEl||!e){this.summaryEl&&(this.summaryEl.innerHTML="<p class='muted'>No diagnostics yet.</p>"),this.filesEl&&(this.filesEl.innerHTML="");return}const t=[{label:"Database",value:e.databasePath},{label:"Schema",value:e.schemaPath},{label:"JSON root",value:e.jsonBackupDirectory},{label:"App state",value:e.appStateUpdatedAtUtc??"Unknown"},{label:"DB Size",value:e.databaseSizeBytes?`${e.databaseSizeBytes.toLocaleString()} bytes`:"Unknown"},{label:"Pending logs",value:String(e.pendingLogEntries??0)}];this.summaryEl.innerHTML=t.map(s=>`<div><span class="label">${s.label}</span><strong>${qe(s.value)}</strong></div>`).join(""),this.filesEl&&(this.filesEl.innerHTML=e.backupFiles.map(s=>{const i=s.exists?"ok":"miss",a=s.sizeBytes?`${s.sizeBytes.toLocaleString()} B`:"--",c=s.lastWriteTimeUtc??"--";return`
            <article class="file-card ${i}">
              <header>
                <span>${s.name}</span>
                <span class="tag">${s.exists?"Present":"Missing"}</span>
              </header>
              <p class="path">${s.path}</p>
              <footer>
                <span>${a}</span>
                <span>${c}</span>
              </footer>
            </article>
          `}).join(""))}renderLogs(e){if(!this.logsEl)return;if(!e.length){this.logsEl.innerHTML="<p class='muted'>No recent log entries.</p>";return}const t=e.slice(-50).reverse();this.logsEl.innerHTML=t.map(s=>{var a;return`
          <article class="log-row ${((a=s.level)==null?void 0:a.toLowerCase())??"info"}">
            <div>
              <span class="timestamp">${s.timestamp}</span>
              <strong>${s.category??"server"}</strong>
              <span>${s.level}</span>
            </div>
            <p>${s.message}</p>
          </article>
        `}).join("")}}const He=[{key:"nations",label:"Nations",description:"Assign formations to nations",group:"Editors",factory:o=>new gt(o)},{key:"formations",label:"Formations",description:"Structure categories per formation",group:"Editors",factory:o=>new bt(o)},{key:"units",label:"Units",description:"Edit and score tactical units",group:"Editors",factory:o=>new ft(o)},{key:"templates",label:"Templates",description:"Manage weapon & ammo presets",group:"Editors",factory:o=>new wt(o)},{key:"insights",label:"Insights",description:"Force readiness overview",group:"Insights",factory:o=>Ue(async()=>{const{StatsPanel:e}=await import("./statsPanel-CkrGHCHy.js");return{StatsPanel:e}},[],import.meta.url).then(({StatsPanel:e})=>new e(o))},{key:"diagnostics",label:"Diagnostics",description:"Local host status",group:"Insights",factory:o=>new Lt(o)},{key:"settings",label:"Settings",description:"Application preferences",group:"Settings",factory:o=>new St(o)}],de=document.querySelector("#app");var ke;if(de){de.innerHTML=`
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
  `;const o=de.querySelector('[data-role="nav-container"]'),e=de.querySelector('[data-role="view-host"]'),t=new Map,s=new Map,i=new Map,a=new Map,c=new Map,l=(d,f)=>{d.innerHTML=`<div class="panel-placeholder"><p class="muted small">${f}</p></div>`};He.forEach(d=>{t.set(d.key,d);let f=c.get(d.group);if(!f){const w=document.createElement("div");w.className="nav-section";const N=document.createElement("p");N.className="section-label",N.textContent=d.group,f=document.createElement("div"),f.className="nav-list",w.append(N,f),o.appendChild(w),c.set(d.group,f)}const b=document.createElement("button");b.type="button",b.className="nav-chip",b.dataset.panel=d.key,b.innerHTML=`
      <div class="nav-chip-head">
        <span class="label">${d.label}</span>
        <span class="badge" data-panel-count="${d.key}">--</span>
      </div>
      <span class="meta">${d.description}</span>
    `,f.appendChild(b),a.set(d.key,b);const m=b.querySelector(`[data-panel-count="${d.key}"]`);m&&i.set(d.key,m);const E=document.createElement("section");E.className="view-panel",E.dataset.panel=d.key,E.hidden=!0,e.appendChild(E),s.set(d.key,{node:E,initialized:!1})});const h=async d=>{const f=s.get(d),b=t.get(d);if(!f||!b||f.initialized)return;if(f.loading)return f.loading;l(f.node,"Loading module...");const m=Promise.resolve().then(()=>b.factory(f.node)).then(E=>(f.controller=E,E.init())).then(()=>{f.initialized=!0}).catch(E=>{console.error(`Failed to init ${b.key}`,E),l(f.node,"Failed to load panel. Check console for details.")}).finally(()=>{f.loading=void 0});return f.loading=m,m},g=d=>{d&&(a.forEach((f,b)=>{const m=b===d;f.classList.toggle("active",m)}),s.forEach((f,b)=>{const m=b===d;f.node.classList.toggle("active",m),f.node.hidden=!m}),h(d).catch(()=>{}))};o.addEventListener("click",d=>{const f=d.target.closest(".nav-chip");if(!f)return;const b=f.dataset.panel;b&&g(b)}),g((ke=He[0])==null?void 0:ke.key);const v=(d,f)=>{const b=i.get(d);b&&(b.textContent=f)};B.subscribe(d=>v("units",`${d.length} units`)),U.subscribe(d=>v("formations",`${d.length} groups`)),O.subscribe(d=>v("nations",`${d.length} nations`)),j.subscribe(d=>{v("settings",d.theme?d.theme:"System"),Be(d)}),v("insights","Live metrics"),v("diagnostics",F.isSupported?"Host monitor":"Unavailable"),B.loadUnits().catch(()=>{}),U.loadFormations().catch(()=>{}),O.loadNations().catch(()=>{}),j.loadSettings().catch(()=>{})}p.isAvailable&&(p.postMessage("host-info-request"),p.waitFor("host-info",2e3).then(o=>{console.info("[Host]",o)}));F.init();export{ht as T,pt as W,At as a,Me as b,$e as c,T as d,xe as e,U as f,O as n,it as s,B as u,Ie as w};
//# sourceMappingURL=index-CSKnxx71.js.map
