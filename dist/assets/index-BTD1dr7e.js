(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}})();document.addEventListener("DOMContentLoaded",()=>{const r=document.getElementById("app");r&&(r.innerHTML=`
            <div class="min-h-screen flex items-center justify-center bg-gray-50">
                <div class="text-center">
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">
                        Numenera Character Sheet
                    </h1>
                    <p class="text-xl text-gray-600 mb-8">
                        Project Template Ready
                    </p>
                    <p class="text-gray-500">
                        Start by creating a feature file in tests/e2e/features/
                    </p>
                </div>
            </div>
        `)});
//# sourceMappingURL=index-BTD1dr7e.js.map
