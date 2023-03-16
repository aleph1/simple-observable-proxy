type PlainObject = { [name: string]: any }

// data that is being observed
const observables = new Set();
// original data for each proxy
const observablesByProxy = new Map();
// observers for each proxy
const observersByProxy = new Map();
// observers to call on tick
const proxiesToNotify = new Set();

const objectConstructor = {}.constructor;
const canBeObservable = (data: any): data is PlainObject => !!data && (Array.isArray(data) || typeof data === 'object' && data.constructor === objectConstructor);

const tick = ():void => {
  proxiesToNotify.forEach(proxy => {
    observersByProxy.get(proxy).forEach(callback => callback());
  });
  proxiesToNotify.clear();
  window.requestAnimationFrame(tick);
};

const makeObservableProxy = (data: any, rootProxy?: any): PlainObject => {
  if(observables.has(data)) throw new Error('Can’t observe Object or Array again');
  if(observablesByProxy.has(data)) throw new Error('rootProxy isn’t an observable');
  let observers: Set<() => void>;
  const proxy = new Proxy(data, {
    get(target, key): any {
      return target[key];
    },
    set(target, key, value): boolean {
      if(target[key] !== value) {
        if(observers) {
          if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
          proxiesToNotify.add(rootProxy || proxy)
        }
        target[key] = value;
      }
      return true;
    },
    deleteProperty(target, key): boolean {
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
    if(/*#__INLINE__*/canBeObservable(value)) proxy[key] = makeObservableProxy(value, rootProxy || proxy);
  });
  observers = new Set();
  observables.add(data);
  observablesByProxy.set(proxy, data);
  observersByProxy.set(proxy, observers);
  return proxy as PlainObject;
};

export const observable = (data): PlainObject => {
  return /*#__INLINE__*/canBeObservable(data) && makeObservableProxy(data);
}

export const observe = (observableProxy, callback: () => void): boolean => {
  const observers = observersByProxy.get(observableProxy);
  return observers && typeof callback === 'function' ? observers.add(callback) : false;
}

export const unobserve = (observableProxy, callback: () => void): boolean => {
  const observers = observersByProxy.get(observableProxy);
  return observers && typeof callback === 'function' ? observers.delete(callback) : false;
}

export const destroy = (observableProxy): boolean => {
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