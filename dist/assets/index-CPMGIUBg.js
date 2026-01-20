import{i as l,B as h}from"./i18n-Dd5EwQCs.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function r(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(t){if(t.ep)return;t.ep=!0;const i=r(t);fetch(t.href,i)}})();const p={title:"Numenera Character Sheet",subtitle:"Manage your characters"},g={name:"Name",tier:"Tier",type:"Type",descriptor:"Descriptor",focus:"Focus",might:"Might",speed:"Speed",intellect:"Intellect",pool:"Pool",edge:"Edge",current:"Current",background:"Background",notes:"Notes",equipment:"Equipment",abilities:"Abilities",cyphers:"Cyphers",artifacts:"Artifacts",oddities:"Oddities"},f={save:"Save",cancel:"Cancel",delete:"Delete",export:"Export",import:"Import",edit:"Edit",add:"Add",remove:"Remove",uploadImage:"Upload Image",newCharacter:"New Character"},v={required:"This field is required",invalidNumber:"Please enter a valid number",minValue:"Value must be at least {{min}}",maxValue:"Value must be at most {{max}}"},y={saved:"Saved successfully",error:"An error occurred",confirmDelete:"Are you sure you want to delete this?",noCharacter:"No character found. Create one to get started!"},b={app:p,character:g,actions:f,validation:v,messages:y},x={title:"Numenera Charakterbogen",subtitle:"Verwalte deine Charaktere"},I={name:"Name",tier:"Stufe",type:"Typ",descriptor:"Deskriptor",focus:"Fokus",might:"Macht",speed:"Schnelligkeit",intellect:"Intellekt",pool:"Vorrat",edge:"Vorteil",current:"Aktuell",background:"Hintergrund",notes:"Notizen",equipment:"Ausrüstung",abilities:"Fähigkeiten",cyphers:"Cypher",artifacts:"Artefakte",oddities:"Kuriositäten"},E={save:"Speichern",cancel:"Abbrechen",delete:"Löschen",export:"Exportieren",import:"Importieren",edit:"Bearbeiten",add:"Hinzufügen",remove:"Entfernen",uploadImage:"Bild hochladen",newCharacter:"Neuer Charakter"},S={required:"Dieses Feld ist erforderlich",invalidNumber:"Bitte geben Sie eine gültige Zahl ein",minValue:"Der Wert muss mindestens {{min}} sein",maxValue:"Der Wert darf höchstens {{max}} sein"},$={saved:"Erfolgreich gespeichert",error:"Ein Fehler ist aufgetreten",confirmDelete:"Möchten Sie dies wirklich löschen?",noCharacter:"Kein Charakter gefunden. Erstelle einen, um zu beginnen!"},w={app:x,character:I,actions:E,validation:S,messages:$},N="en",C=["en","de"];async function k(){return await l.use(h).init({fallbackLng:N,supportedLngs:C,debug:!1,resources:{en:{translation:b},de:{translation:w}},interpolation:{escapeValue:!1},detection:{order:["localStorage","navigator"],caches:["localStorage"]}}),l}function a(c,e){return l.t(c,e)}const s="numenera_character";class L{save(e){try{e.lastModified=Date.now();const r=JSON.stringify(e);localStorage.setItem(s,r)}catch(r){throw console.error("Failed to save character to localStorage:",r),new Error("Failed to save character")}}load(){try{const e=localStorage.getItem(s);return e?JSON.parse(e):null}catch(e){return console.error("Failed to load character from localStorage:",e),null}}delete(){try{localStorage.removeItem(s)}catch(e){throw console.error("Failed to delete character from localStorage:",e),new Error("Failed to delete character")}}exportToJSON(e){return JSON.stringify(e,null,2)}importFromJSON(e){try{const r=JSON.parse(e);if(!r.id||!r.name)throw new Error("Invalid character data");return r}catch(r){throw console.error("Failed to import character from JSON:",r),new Error("Invalid JSON format")}}}const m=new L;function B(){return{id:globalThis.crypto.randomUUID(),name:"",tier:1,type:"",descriptor:"",focus:"",might:{pool:0,edge:0,current:0},speed:{pool:0,edge:0,current:0},intellect:{pool:0,edge:0,current:0},portrait:null,additionalImages:[],background:"",notes:"",equipment:"",abilities:"",cyphers:"",artifacts:"",oddities:"",lastModified:Date.now()}}class O{character;appElement;constructor(){this.appElement=document.getElementById("app"),this.character=m.load()||B()}mount(){if(!this.appElement){console.error("App element not found");return}this.render(),this.attachEventListeners()}render(){this.appElement&&(this.appElement.innerHTML=`
            <div class="min-h-screen bg-gray-50">
                <header class="bg-numenera-primary text-white py-4 px-4 shadow-md">
                    <h1 class="text-2xl font-bold">${a("app.title")}</h1>
                    <p class="text-sm opacity-90">${a("app.subtitle")}</p>
                </header>

                <main class="container mx-auto px-4 py-6 max-w-4xl">
                    <div class="card">
                        <h2 class="text-xl font-semibold mb-4">Character Information</h2>
                        
                        <!-- Basic Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    ${a("character.name")}
                                </label>
                                <input
                                    type="text"
                                    id="char-name"
                                    class="input-field"
                                    value="${this.character.name}"
                                    placeholder="${a("character.name")}"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    ${a("character.tier")}
                                </label>
                                <input
                                    type="number"
                                    id="char-tier"
                                    class="input-field"
                                    value="${this.character.tier}"
                                    min="1"
                                    max="6"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    ${a("character.type")}
                                </label>
                                <input
                                    type="text"
                                    id="char-type"
                                    class="input-field"
                                    value="${this.character.type}"
                                    placeholder="${a("character.type")}"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    ${a("character.descriptor")}
                                </label>
                                <input
                                    type="text"
                                    id="char-descriptor"
                                    class="input-field"
                                    value="${this.character.descriptor}"
                                    placeholder="${a("character.descriptor")}"
                                />
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    ${a("character.focus")}
                                </label>
                                <input
                                    type="text"
                                    id="char-focus"
                                    class="input-field"
                                    value="${this.character.focus}"
                                    placeholder="${a("character.focus")}"
                                />
                            </div>
                        </div>

                        <!-- Stats -->
                        <h3 class="text-lg font-semibold mb-3">${a("character.might")}</h3>
                        <div class="grid grid-cols-3 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    ${a("character.pool")}
                                </label>
                                <input
                                    type="number"
                                    id="might-pool"
                                    class="input-field"
                                    value="${this.character.might.pool}"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    ${a("character.edge")}
                                </label>
                                <input
                                    type="number"
                                    id="might-edge"
                                    class="input-field"
                                    value="${this.character.might.edge}"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    ${a("character.current")}
                                </label>
                                <input
                                    type="number"
                                    id="might-current"
                                    class="input-field"
                                    value="${this.character.might.current}"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div class="mt-4 text-sm text-gray-500">
                            Last saved: ${new Date(this.character.lastModified).toLocaleString()}
                        </div>
                    </div>
                </main>
            </div>
        `)}attachEventListeners(){this.appElement?.querySelectorAll("input")?.forEach(r=>{r.addEventListener("change",()=>this.saveCharacter()),r.addEventListener("blur",()=>this.saveCharacter())})}saveCharacter(){const e=document.getElementById("char-name"),r=document.getElementById("char-tier"),o=document.getElementById("char-type"),t=document.getElementById("char-descriptor"),i=document.getElementById("char-focus"),n=document.getElementById("might-pool"),d=document.getElementById("might-edge"),u=document.getElementById("might-current");e&&(this.character.name=e.value),r&&(this.character.tier=parseInt(r.value)||1),o&&(this.character.type=o.value),t&&(this.character.descriptor=t.value),i&&(this.character.focus=i.value),n&&(this.character.might.pool=parseInt(n.value)||0),d&&(this.character.might.edge=parseInt(d.value)||0),u&&(this.character.might.current=parseInt(u.value)||0),m.save(this.character)}}async function A(){try{await k(),new O().mount()}catch(c){console.error("Failed to initialize application:",c)}}A();
//# sourceMappingURL=index-CPMGIUBg.js.map
