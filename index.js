// sources that are being observed
const sources = new WeakSet();
const observablesByProxy = new WeakMap();
// which observables will be notified on tick
const notify = new Set();

export class Observable {

  constructor(data, root) {
    if(sources.has(data)) throw new Error('Observable of data again');
    let complete = false;
    const self = this;
    const proxy = new Proxy(data, {
      get(target, key) {
        return target[key];
      },
      set(target, key, value) {
        if(target[key] !== value) {
          if(complete) {
            if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
            notify.add(root || self)
          }
          target[key] = value;
        }
        return true;
      },
      deleteProperty(target, key) {
        if (key in target) {
          delete target[key];
          notify.add(root || self);
          return true;
        }
        return false;
      }
    });
    // Object.keys on array only includes keys that are specifically set
    (Array.isArray(data) ? [...Array(data.length).keys()] : Object.keys(data)).forEach( key => {
      const value = data[key];
      if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
      if(Array.isArray(value) || (typeof value === 'object' && value instanceof Object)) proxy[key] = new Observable(value, self).proxy;
    });
    this.observers = new Set();
    observablesByProxy.set(this.proxy = proxy, this);
    sources.add(this.data = data);
    complete = true;
  }

  observe(callback) {
    return this.observers.add(callback);
  }

  unobserve(callback) {
    return this.observers.delete(callback);
  }

  destroy() {
    this.observers.clear();
    this.observers = null;
    sources.delete(this.data);
    observablesByProxy.delete(this.proxy);
  }
  
}

export function observable(data) {
  return new Observable(data).proxy;
}

export function observe(observableProxy, callback) {
  const observable = observablesByProxy.get(observableProxy);
  return observable && typeof callback === 'function' ? observable.observe(callback) : false;
}

export function unobserve(observableProxy, callback) {
  const observable = observablesByProxy.get(observableProxy);
  return observable && typeof callback === 'function' ? observable.unobserve(callback) : false;
}

export function destroy(observableProxy) {
  const observable = observablesByProxy.get(observableProxy);
  if(!observable) throw new Error('observableProxy not observable');
  return observable.destroy();
}

function tick() {
  notify.forEach(observable => {
    observable.observers.forEach( callback => callback() );
  });
  notify.clear();
  window.requestAnimationFrame(tick);
}

tick();