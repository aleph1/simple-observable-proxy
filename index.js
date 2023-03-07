// data that is being observed
const observables = new Set();
// original data for each proxy
const observablesByProxy = new Map();
// observers for each proxy
const observersByProxy = new Map();
// observers to call on tick
const proxiesToNotify = new Set();

const tick = () => {
  proxiesToNotify.forEach(proxy => {
    observersByProxy.get(proxy).forEach(callback => callback());
  });
  proxiesToNotify.clear();
  window.requestAnimationFrame(tick);
};

const makeObservableProxy = (data, rootProxy) => {
  if(observables.has(data)) throw new Error('Can’t observe Object or Array again');
  const proxy = new Proxy(data, {
    get(target, key) {
      return target[key];
    },
    set(target, key, value) {
      if(target[key] !== value) {
        // self.proxy is assigned at the end of the Observable constructor,
        if(observers) {
          if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
          proxiesToNotify.add(rootProxy || proxy)
        }
        target[key] = value;
      }
      return true;
    },
    deleteProperty(target, key) {
      if (key in target) {
        delete target[key];
        proxiesToNotify.add(rootProxy || proxy);
        return true;
      }
      return false;
    }
  });
  (Array.isArray(data) ? [...Array(data.length).keys()] : Object.keys(data)).forEach(key => {
    const value = data[key];
    if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
    if(Array.isArray(value) || (typeof value === 'object' && value instanceof Object)) proxy[key] = makeObservableProxy(value, rootProxy || proxy);
  });
  const observers = new Set();
  observables.add(data);
  observablesByProxy.set(proxy, data);
  observersByProxy.set(proxy, observers);
  return proxy;
};

export const observable = (data) => {
  return (Array.isArray(data) || (typeof data === 'object' && data instanceof Object)) && makeObservableProxy(data);
}

export const observe = (observableProxy, callback) => {
  const observers = observersByProxy.get(observableProxy);
  return observers && typeof callback === 'function' ? observers.add(callback) : false;
}

export const unobserve = (observableProxy, callback) => {
  const observers = observersByProxy.get(observableProxy);
  return observers && typeof callback === 'function' ? observers.delete(callback) : false;
}

export const destroy = (observableProxy) => {
  const observers = observersByProxy.get(observableProxy);
  if(observers) {
    observers.clear();
    observables.delete(observablesByProxy.get(observableProxy));
    observablesByProxy.delete(observableProxy);
    observersByProxy.delete(observableProxy);
    proxiesToNotify.delete(observableProxy);
    return true;
  }
  return false;
}

tick();