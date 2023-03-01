// data that is being observed
const observables = new WeakSet();
// Observable instanced stored by their .proxy
const observablesByProxy = new WeakMap();
// which observables will be notified on tick
const notify = new Set();

const tick = () => {
  notify.forEach(observable => {
    observable.observers.forEach( callback => callback() );
  });
  notify.clear();
  window.requestAnimationFrame(tick);
};

class Observable {

  constructor(data, root) {
    if(observables.has(data)) throw new Error('Can’t observe Observable.proxy');
    const self = this;
    const proxy = new Proxy(data, {
      get(target, key) {
        return target[key];
      },
      set(target, key, value) {
        if(target[key] !== value) {
          // self.proxy is assigned at the end of the Observable constructor,
          // so it is safe to use it to see if observers need to be notified
          if(self.proxy) {
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
    self.observers = new Set();
    observablesByProxy.set(self.proxy = proxy, self);
    observables.add(self.data = data);
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
    return observables.delete(this.data) && observablesByProxy.delete(this.proxy);
  }
  
}

export function observable(data) {
  return (Array.isArray(data) || (typeof data === 'object' && data instanceof Object)) && new Observable(data).proxy;
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
  return observable ? observable.destroy() : false;
}

tick();