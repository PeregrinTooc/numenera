import{i as M,B as X}from"./i18n-CoYSN1KR.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function i(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(e){if(e.ep)return;e.ep=!0;const r=i(e);fetch(e.href,r)}})();const O=globalThis,B=a=>a,L=O.trustedTypes,K=L?L.createPolicy("lit-html",{createHTML:a=>a}):void 0,z="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,G="?"+$,tt=`<${G}>`,b=document,w=()=>b.createComment(""),N=a=>a===null||typeof a!="object"&&typeof a!="function",R=Array.isArray,et=a=>R(a)||typeof a?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,A=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,q=/-->/g,j=/>/g,v=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,U=/"/g,Y=/^(?:script|style|textarea|title)$/i,st=a=>(t,...i)=>({_$litType$:a,strings:t,values:i}),p=st(1),C=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),V=new WeakMap,y=b.createTreeWalker(b,129);function Z(a,t){if(!R(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return K!==void 0?K.createHTML(t):t}const it=(a,t)=>{const i=a.length-1,s=[];let e,r=t===2?"<svg>":t===3?"<math>":"",n=A;for(let m=0;m<i;m++){const o=a[m];let l,u,c=-1,g=0;for(;g<o.length&&(n.lastIndex=g,u=n.exec(o),u!==null);)g=n.lastIndex,n===A?u[1]==="!--"?n=q:u[1]!==void 0?n=j:u[2]!==void 0?(Y.test(u[2])&&(e=RegExp("</"+u[2],"g")),n=v):u[3]!==void 0&&(n=v):n===v?u[0]===">"?(n=e??A,c=-1):u[1]===void 0?c=-2:(c=n.lastIndex-u[2].length,l=u[1],n=u[3]===void 0?v:u[3]==='"'?U:D):n===U||n===D?n=v:n===q||n===j?n=A:(n=v,e=void 0);const f=n===v&&a[m+1].startsWith("/>")?" ":"";r+=n===A?o+tt:c>=0?(s.push(l),o.slice(0,c)+z+o.slice(c)+$+f):o+$+(c===-2?m:f)}return[Z(a,r+(a[i]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class H{constructor({strings:t,_$litType$:i},s){let e;this.parts=[];let r=0,n=0;const m=t.length-1,o=this.parts,[l,u]=it(t,i);if(this.el=H.createElement(l,s),y.currentNode=this.el.content,i===2||i===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(e=y.nextNode())!==null&&o.length<m;){if(e.nodeType===1){if(e.hasAttributes())for(const c of e.getAttributeNames())if(c.endsWith(z)){const g=u[n++],f=e.getAttribute(c).split($),E=/([.?@])?(.*)/.exec(g);o.push({type:1,index:r,name:E[2],strings:f,ctor:E[1]==="."?rt:E[1]==="?"?nt:E[1]==="@"?ot:T}),e.removeAttribute(c)}else c.startsWith($)&&(o.push({type:6,index:r}),e.removeAttribute(c));if(Y.test(e.tagName)){const c=e.textContent.split($),g=c.length-1;if(g>0){e.textContent=L?L.emptyScript:"";for(let f=0;f<g;f++)e.append(c[f],w()),y.nextNode(),o.push({type:2,index:++r});e.append(c[g],w())}}}else if(e.nodeType===8)if(e.data===G)o.push({type:2,index:r});else{let c=-1;for(;(c=e.data.indexOf($,c+1))!==-1;)o.push({type:7,index:r}),c+=$.length-1}r++}}static createElement(t,i){const s=b.createElement("template");return s.innerHTML=t,s}}function x(a,t,i=a,s){if(t===C)return t;let e=s!==void 0?i._$Co?.[s]:i._$Cl;const r=N(t)?void 0:t._$litDirective$;return e?.constructor!==r&&(e?._$AO?.(!1),r===void 0?e=void 0:(e=new r(a),e._$AT(a,i,s)),s!==void 0?(i._$Co??=[])[s]=e:i._$Cl=e),e!==void 0&&(t=x(a,e._$AS(a,t.values),e,s)),t}class at{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??b).importNode(i,!0);y.currentNode=e;let r=y.nextNode(),n=0,m=0,o=s[0];for(;o!==void 0;){if(n===o.index){let l;o.type===2?l=new S(r,r.nextSibling,this,t):o.type===1?l=new o.ctor(r,o.name,o.strings,this,t):o.type===6&&(l=new dt(r,this,t)),this._$AV.push(l),o=s[++m]}n!==o?.index&&(r=y.nextNode(),n++)}return y.currentNode=b,e}p(t){let i=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++}}class S{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&t?.nodeType===11&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=x(this,t,i),N(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==C&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):et(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&N(this._$AH)?this._$AA.nextSibling.data=t:this.T(b.createTextNode(t)),this._$AH=t}$(t){const{values:i,_$litType$:s}=t,e=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=H.createElement(Z(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else{const r=new at(e,this),n=r.u(this.options);r.p(i),this.T(n),this._$AH=r}}_$AC(t){let i=V.get(t.strings);return i===void 0&&V.set(t.strings,i=new H(t)),i}k(t){R(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const r of t)e===i.length?i.push(s=new S(this.O(w()),this.O(w()),this,this.options)):s=i[e],s._$AI(r),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e)}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);t!==this._$AB;){const s=B(t).nextSibling;B(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class T{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,r){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=h}_$AI(t,i=this,s,e){const r=this.strings;let n=!1;if(r===void 0)t=x(this,t,i,0),n=!N(t)||t!==this._$AH&&t!==C,n&&(this._$AH=t);else{const m=t;let o,l;for(t=r[0],o=0;o<r.length-1;o++)l=x(this,m[s+o],i,o),l===C&&(l=this._$AH[o]),n||=!N(l)||l!==this._$AH[o],l===h?t=h:t!==h&&(t+=(l??"")+r[o+1]),this._$AH[o]=l}n&&!e&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class rt extends T{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}}class nt extends T{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}}class ot extends T{constructor(t,i,s,e,r){super(t,i,s,e,r),this.type=5}_$AI(t,i=this){if((t=x(this,t,i,0)??h)===C)return;const s=this._$AH,e=t===h&&s!==h||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==h&&(s===h||e);e&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class dt{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){x(this,t)}}const ct=O.litHtmlPolyfillSupport;ct?.(H,S),(O.litHtmlVersions??=[]).push("3.3.2");const lt=(a,t,i)=>{const s=t;let e=s._$litPart$;return e===void 0&&(s._$litPart$=e=new S(t.insertBefore(w(),null),null,void 0,{})),e._$AI(a),e},J="numenera-character-state";function ht(a){try{const t=JSON.stringify(a);localStorage.setItem(J,t)}catch(t){console.error("Failed to save character state:",t)}}function W(){try{const a=localStorage.getItem(J);return a?JSON.parse(a):null}catch(a){return console.error("Failed to load character state:",a),null}}const P={name:"Kael the Wanderer",tier:3,type:"Glaive",descriptor:"Strong",focus:"Bears a Halo of Fire",stats:{might:{pool:15,edge:2,current:12},speed:{pool:12,edge:1,current:12},intellect:{pool:10,edge:0,current:8}},cyphers:[{name:"Detonation (Cell)",level:"1d6+2",effect:"Explodes in an immediate radius"},{name:"Stim (Injector)",level:"1d6",effect:"Restores 1d6 + 2 points to one Pool"}],artifacts:[{name:"Lightning Rod",level:"6",effect:"Projects lightning bolt up to long range"}],oddities:["A glowing cube that hums when near water","A piece of transparent metal that's always cold"],textFields:{background:"Born in a remote village, discovered ancient ruins that changed everything",notes:"Currently investigating the mysterious disappearances in the nearby forest",equipment:"Medium armor, Broadsword, Explorer's pack, 50 feet of rope",abilities:"Trained in intimidation, Specialized in heavy weapons"}},Q={name:"Kael the Wanderer",tier:3,type:"Glaive",descriptor:"Strong",focus:"Bears a Halo of Fire",stats:{might:{pool:15,edge:2,current:12},speed:{pool:12,edge:1,current:12},intellect:{pool:10,edge:0,current:8}},cyphers:[],artifacts:[],oddities:[],textFields:{background:"",notes:"",equipment:"",abilities:""}},pt={title:"Numenera Character Sheet"},ut={load:"Load",clear:"Clear"},mt={name:"Name",tier:"Tier",type:"Type",descriptor:"Descriptor",focus:"Focus"},gt={heading:"Stats",might:"Might",speed:"Speed",intellect:"Intellect",pool:"Pool",edge:"Edge",current:"Current"},ft={heading:"Cyphers",name:"Name",level:"Level",effect:"Effect",empty:"No cyphers"},$t={heading:"Artifacts",name:"Name",level:"Level",depletion:"Depletion",effect:"Effect",empty:"No artifacts"},vt={heading:"Oddities",empty:"No oddities"},yt={heading:"Character Details",background:{label:"Background",empty:"No background"},notes:{label:"Notes",empty:"No notes"},equipment:{label:"Equipment",empty:"No equipment"},abilities:{label:"Abilities",empty:"No abilities"}},bt={app:pt,buttons:ut,character:mt,stats:gt,cyphers:ft,artifacts:$t,oddities:vt,textFields:yt},xt={title:"Numenera Charakterbogen"},At={load:"Laden",clear:"Löschen"},_t={name:"Name",tier:"Stufe",type:"Typ",descriptor:"Eigenschaft",focus:"Fokus"},wt={heading:"Attribute",might:"Macht",speed:"Geschwindigkeit",intellect:"Intellekt",pool:"Pool",edge:"Vorteil",current:"Aktuell"},Nt={heading:"Cypher",name:"Name",level:"Stufe",effect:"Effekt",empty:"Keine Cypher"},Ct={heading:"Artefakte",name:"Name",level:"Stufe",depletion:"Erschöpfung",effect:"Effekt",empty:"Keine Artefakte"},Ht={heading:"Kuriositäten",empty:"Keine Kuriositäten"},St={heading:"Charakterdetails",background:{label:"Hintergrund",empty:"Kein Hintergrund"},notes:{label:"Notizen",empty:"Keine Notizen"},equipment:{label:"Ausrüstung",empty:"Keine Ausrüstung"},abilities:{label:"Fähigkeiten",empty:"Keine Fähigkeiten"}},Et={app:xt,buttons:At,character:_t,stats:wt,cyphers:Nt,artifacts:Ct,oddities:Ht,textFields:St};async function kt(){await M.use(X).init({resources:{en:{translation:bt},de:{translation:Et}},fallbackLng:"en",debug:!1,interpolation:{escapeValue:!1},detection:{order:["querystring","localStorage","navigator"],caches:["localStorage"],lookupQuerystring:"lang"}})}const d=a=>M.t(a),Lt=a=>{M.on("languageChanged",a)};class Tt{constructor(t,i){this.onLoad=t,this.onClear=i}render(){return p`
      <div data-testid="character-header" class="flex justify-between items-center mb-6">
        <h1 data-testid="page-title" class="text-3xl font-bold">${d("app.title")}</h1>
        <div class="flex gap-2">
          <button
            data-testid="load-button"
            @click=${this.onLoad}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow transition-colors"
          >
            ${d("buttons.load")}
          </button>
          <button
            data-testid="clear-button"
            @click=${this.onClear}
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded shadow transition-colors"
          >
            ${d("buttons.clear")}
          </button>
        </div>
      </div>
    `}}class Ft{constructor(t){this.character=t}render(){return p`
      <div data-testid="basic-info" class="space-y-4">
        <div>
          <label data-testid="label-name" class="text-sm font-medium text-gray-700"
            >${d("character.name")}:</label
          >
          <div data-testid="character-name" class="text-xl font-semibold">
            ${this.character.name}
          </div>
        </div>

        <div>
          <label data-testid="label-tier" class="text-sm font-medium text-gray-700"
            >${d("character.tier")}:</label
          >
          <div data-testid="character-tier" class="text-lg">${this.character.tier}</div>
        </div>

        <div>
          <label data-testid="label-type" class="text-sm font-medium text-gray-700"
            >${d("character.type")}:</label
          >
          <div data-testid="character-type" class="text-lg">${this.character.type}</div>
        </div>

        <div>
          <label data-testid="label-descriptor" class="text-sm font-medium text-gray-700"
            >${d("character.descriptor")}:</label
          >
          <div data-testid="character-descriptor" class="text-lg">${this.character.descriptor}</div>
        </div>

        <div>
          <label data-testid="label-focus" class="text-sm font-medium text-gray-700"
            >${d("character.focus")}:</label
          >
          <div data-testid="character-focus" class="text-lg">${this.character.focus}</div>
        </div>
      </div>
    `}}class I{constructor(t,i,s,e){this.name=t,this.pool=i,this.edge=s,this.current=e}render(){const t=this.name.toLowerCase();return p`
      <div
        data-testid="stat-${t}"
        class="relative bg-gradient-to-b from-parchment-light to-parchment border-2 border-numenera-secondary rounded-lg p-6 shadow-lg"
      >
        <!-- Stat name - serif, bold, uppercase -->
        <h3
          data-testid="stat-${t}-label"
          class="text-center font-serif text-xl font-bold text-brown-900 mb-4 uppercase tracking-wider"
        >
          ${this.name}
        </h3>

        <!-- Pool value - VERY LARGE, handwritten font -->
        <div class="text-center mb-6 pb-4 border-b border-numenera-secondary/30">
          <div
            data-testid="stat-${t}-pool"
            class="text-7xl font-handwritten font-bold text-numenera-primary leading-none"
          >
            ${this.pool}
          </div>
          <div class="text-xs font-serif text-gray-600 uppercase tracking-wider mt-2">
            ${d("stats.pool")}
          </div>
        </div>

        <!-- Edge and Current - two columns with handwritten values -->
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-xs font-serif text-gray-600 uppercase tracking-wide mb-1">
              <label data-testid="label-${t}-edge">${d("stats.edge")}:</label>
            </div>
            <div
              data-testid="stat-${t}-edge"
              class="text-3xl font-handwritten font-semibold text-numenera-secondary"
            >
              ${this.edge}
            </div>
          </div>
          <div class="text-center">
            <div class="text-xs font-serif text-gray-600 uppercase tracking-wide mb-1">
              <label data-testid="label-${t}-current">${d("stats.current")}:</label>
            </div>
            <div
              data-testid="stat-${t}-current"
              class="text-3xl font-handwritten font-semibold text-numenera-secondary"
            >
              ${this.current}
            </div>
          </div>
        </div>
      </div>
    `}}class It{constructor(t){this.character=t}render(){const t=new I(d("stats.might"),this.character.stats.might.pool,this.character.stats.might.edge,this.character.stats.might.current),i=new I(d("stats.speed"),this.character.stats.speed.pool,this.character.stats.speed.edge,this.character.stats.speed.current),s=new I(d("stats.intellect"),this.character.stats.intellect.pool,this.character.stats.intellect.edge,this.character.stats.intellect.current);return p`
      <div data-testid="stats-section" class="mt-8">
        <h2
          data-testid="stats-heading"
          class="text-2xl font-serif font-bold text-brown-900 mb-6 uppercase tracking-wide"
        >
          ${d("stats.heading")}
        </h2>
        <!-- Three stat pools side-by-side on tablet/desktop -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${t.render()} ${i.render()} ${s.render()}
        </div>
      </div>
    `}}class Pt{constructor(t){this.cypher=t}render(){return p`
      <div data-testid="cypher-item" class="border rounded p-3">
        <div class="flex justify-between items-start">
          <div>
            <div data-testid="cypher-name-${this.cypher.name}" class="font-semibold">
              ${this.cypher.name}
            </div>
            <div class="text-sm text-gray-600">${this.cypher.effect}</div>
          </div>
          <div
            data-testid="cypher-level-${this.cypher.name}"
            class="text-sm font-medium bg-gray-100 px-2 py-1 rounded"
          >
            ${d("cyphers.level")}: ${this.cypher.level}
          </div>
        </div>
      </div>
    `}}class Mt{constructor(t){this.cyphers=t}render(){return p`
      <div data-testid="cyphers-section" class="mt-8">
        <h2 data-testid="cyphers-heading" class="text-2xl font-bold mb-4">
          ${d("cyphers.heading")}
        </h2>
        <div data-testid="cyphers-list" class="space-y-3">
          ${this.cyphers.length===0?p`<div data-testid="empty-cyphers" class="text-gray-500 italic p-3 border rounded">
                ${d("cyphers.empty")}
              </div>`:this.cyphers.map(t=>new Pt(t).render())}
        </div>
      </div>
    `}}class Ot{constructor(t){this.artifact=t}render(){return p`
      <div data-testid="artifact-item" class="border rounded p-3">
        <div class="flex justify-between items-start">
          <div>
            <div data-testid="artifact-name-${this.artifact.name}" class="font-semibold">
              ${this.artifact.name}
            </div>
            <div class="text-sm text-gray-600">${this.artifact.effect}</div>
          </div>
          <div
            data-testid="artifact-level-${this.artifact.name}"
            class="text-sm font-medium bg-gray-100 px-2 py-1 rounded"
          >
            ${d("artifacts.level")}: ${this.artifact.level}
          </div>
        </div>
      </div>
    `}}class Rt{constructor(t){this.artifacts=t}render(){return p`
      <div data-testid="artifacts-section" class="mt-8">
        <h2 data-testid="artifacts-heading" class="text-2xl font-bold mb-4">
          ${d("artifacts.heading")}
        </h2>
        <div data-testid="artifacts-list" class="space-y-3">
          ${this.artifacts.length===0?p`<div
                data-testid="empty-artifacts"
                class="text-gray-500 italic p-3 border rounded"
              >
                ${d("artifacts.empty")}
              </div>`:this.artifacts.map(t=>new Ot(t).render())}
        </div>
      </div>
    `}}class Bt{constructor(t){this.oddity=t}render(){return p`
      <div data-testid="oddity-item" class="border rounded p-3">
        <div data-testid="oddity-${this.oddity}" class="text-sm">${this.oddity}</div>
      </div>
    `}}class Kt{constructor(t){this.oddities=t}render(){return p`
      <div data-testid="oddities-section" class="mt-8">
        <h2 data-testid="oddities-heading" class="text-2xl font-bold mb-4">
          ${d("oddities.heading")}
        </h2>
        <div data-testid="oddities-list" class="space-y-2">
          ${this.oddities.length===0?p`<div
                data-testid="empty-oddities"
                class="text-gray-500 italic p-3 border rounded"
              >
                ${d("oddities.empty")}
              </div>`:this.oddities.map(t=>new Bt(t).render())}
        </div>
      </div>
    `}}class k{constructor(t,i){this.value=t,this.fieldName=i}render(){const t=this.value&&this.value.trim().length>0;return p`
      <div data-testid="${this.fieldName}-container">
        <label
          data-testid="label-${this.fieldName}"
          class="block text-sm font-medium text-gray-700 mb-1"
          >${d(`textFields.${this.fieldName}.label`)}</label
        >
        ${t?p`<div data-testid="text-${this.fieldName}" class="text-sm whitespace-pre-wrap">
              ${this.value}
            </div>`:p`<div data-testid="empty-${this.fieldName}" class="text-gray-500 italic text-sm">
              ${d(`textFields.${this.fieldName}.empty`)}
            </div>`}
      </div>
    `}}class qt{constructor(t){this.character=t}render(){const t=new k(this.character.textFields.background,"background"),i=new k(this.character.textFields.notes,"notes"),s=new k(this.character.textFields.equipment,"equipment"),e=new k(this.character.textFields.abilities,"abilities");return p`
      <div data-testid="text-fields-section" class="mt-8">
        <h2 data-testid="text-fields-heading" class="text-2xl font-bold mb-4">
          ${d("textFields.heading")}
        </h2>
        <div class="space-y-4">
          ${t.render()} ${i.render()} ${s.render()} ${e.render()}
        </div>
      </div>
    `}}class jt{constructor(t,i,s){this.character=t,this.onLoad=i,this.onClear=s}render(){const t=new Tt(this.onLoad,this.onClear),i=new Ft(this.character),s=new It(this.character),e=new Mt(this.character.cyphers),r=new Rt(this.character.artifacts),n=new Kt(this.character.oddities),m=new qt(this.character);return p`
      <div class="min-h-screen bg-gray-50 p-4">
        <div class="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
          ${t.render()} ${i.render()} ${s.render()} ${e.render()}
          ${r.render()} ${n.render()} ${m.render()}
        </div>
      </div>
    `}}function _(a){const t=document.getElementById("app");if(!t)return;const i=new jt(a,()=>_(P),()=>_(Q));lt(i.render(),t),ht(a)}document.addEventListener("DOMContentLoaded",async()=>{await kt(),Lt(()=>{const e=W();_(e||P)});const t=new URLSearchParams(window.location.search).get("empty")==="true",i=W();let s;t?s=Q:i?s=i:s=P,_(s)});
//# sourceMappingURL=index-Bl_F4eTk.js.map
