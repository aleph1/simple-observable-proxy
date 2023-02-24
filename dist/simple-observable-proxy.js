const e=new WeakSet,r=new WeakMap,t=new Set;export class Observable{constructor(s,o){if(e.has(s))throw new Error("Observable of data again");let n=!1;const a=this,i=new Proxy(s,{get:(e,r)=>e[r],set(e,s,i){if(e[s]!==i){if(n){if(r.has(i))throw new Error("Can’t nest observables");t.add(o||a)}e[s]=i}return!0},deleteProperty:(e,r)=>r in e&&(delete e[r],t.add(o||a),!0)});(Array.isArray(s)?[...Array(s.length).keys()]:Object.keys(s)).forEach((e=>{const t=s[e];if(r.has(t))throw new Error("Can’t nest observables");(Array.isArray(t)||"object"==typeof t&&t instanceof Object)&&(i[e]=new Observable(t,a).proxy)})),this.observers=new Set,r.set(this.proxy=i,this),e.add(this.data=s),n=!0}observe(e){return this.observers.add(e)}unobserve(e){return this.observers.delete(e)}destroy(){return this.observers.clear(),this.observers=null,e.delete(this.data)&&r.delete(this.proxy)}}export function observable(e){return new Observable(e).proxy}export function observe(e,t){const s=r.get(e);return!(!s||"function"!=typeof t)&&s.observe(t)}export function unobserve(e,t){const s=r.get(e);return!(!s||"function"!=typeof t)&&s.unobserve(t)}export function destroy(e){const t=r.get(e);return!!t&&t.destroy()}!function e(){t.forEach((e=>{e.observers.forEach((e=>e()))})),t.clear(),window.requestAnimationFrame(e)}();