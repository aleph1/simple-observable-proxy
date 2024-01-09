export type ObservableArray = {[name: string]: any;};
export type ObservableObject = {[name: string]: any;};
export type ObservableMap = {[name: string]: any;};
export type Observable = ObservableArray | ObservableObject| ObservableMap;// | ObservableSet;
export type ObservableCallback = (proxy: Observable) => void;
export const observableEvents = {
    change: 'change',
    destroy: 'destroy',
} as const;
type ObservableEventKey = keyof typeof observableEvents;
export type ObservableEvent = typeof observableEvents[ObservableEventKey];

type ObservableCallbackObject = {
  change: Set<ObservableCallback>,
  destroy: Set<ObservableCallback>
};
type ObservableCallbackMap = Map<Observable, ObservableCallbackObject>;

// data that is being observed
const observables = new Set();
// original data for each proxy
const observablesByProxy = new Map();
// observers for each proxy
const observersByProxy: ObservableCallbackMap = new Map();
// collections to call on tick
const changedProxies: Set<Observable> = new Set();
const destroyedProxies: Set<Observable> = new Set();

const plainObjectConstructor = {}.constructor;
export const isPlainObject = (data: {[name: string]: any;}): boolean => !!data && typeof data === 'object' && data.constructor === plainObjectConstructor;

const tick = (): void => {
  changedProxies.forEach(proxy => {
    const observers = observersByProxy.get(proxy);
    if(observers) observers.change.forEach((callback: ObservableCallback) => callback(proxy));
  });
  changedProxies.clear();
  destroyedProxies.forEach(proxy => {
    const observers = observersByProxy.get(proxy);
    if(observers) {
      observers.destroy.forEach((callback: ObservableCallback) => callback(proxy));
      observers.change.clear();
      observers.destroy.clear();
      observablesByProxy.delete(proxy);
      observersByProxy.delete(proxy);
    }
  });
  destroyedProxies.clear();
  if(BROWSER) window.requestAnimationFrame(tick);
  else setTimeout(tick, 16);
};

const makeObservableArrayOrObject = (data: ObservableArray | ObservableObject, rootProxy?: Observable): Observable => {
  if(observables.has(data) || observablesByProxy.has(data)) throw new Error('data is already an observable');
  let observers: ObservableCallbackObject;
  const proxy = new Proxy(data, {
    get(target, prop): any {
      return target[prop as string];
    },
    set(target, prop, value): boolean {
      if(target[prop as string] !== value) {
        if(observers) {
          if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
          changedProxies.add(rootProxy || proxy)
        }
        target[prop as string] = value;
      }
      return true;
    },
    deleteProperty(target, prop): boolean {
      if (prop in target) {
        delete target[prop as string];
        changedProxies.add(rootProxy || proxy);
      }
      return true;
    }
  });
  observables.add(data);
  observablesByProxy.set(proxy, data);
  (Array.isArray(data) ? [...Array(data.length).keys()] : Object.keys(data)).forEach(key => {
    const value = data[key as string];
    if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
    if(Array.isArray(value) || isPlainObject(value)) proxy[key] = makeObservableArrayOrObject(value, rootProxy || proxy);
    else if(value instanceof Map) proxy[key] = makeObservableMap(value, rootProxy || proxy);
  });
  observersByProxy.set(proxy, observers = {
    change: new Set(),
    destroy: new Set()
  });
  return proxy;
};

const makeObservableMap = (data: ObservableMap, rootProxy?: Observable): Observable => {
  if(observables.has(data) || observablesByProxy.has(data)) throw new Error('data is already an observable');
  let observers: ObservableCallbackObject;
  const proxy = new Proxy(data, {
    get(target, prop){
      const reflectedValue = target[prop as string];
      if(typeof reflectedValue === 'function') {
        if(prop === 'set') {
          return (key: any, value: any) => {
            if(observers) {
              if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
              const has = target.has(key);
              if(!has || (has && target.get(key) !== value)) changedProxies.add(rootProxy || proxy);
            }
            return target[prop](key, value);
          };
        } else if(prop === 'clear') {
          return () => {
            if(target.size) changedProxies.add(rootProxy || proxy);
            return target[prop]();
          };
        } else if(prop === 'delete') {
          return (key: any) => {
            if(target.has(key)) changedProxies.add(rootProxy || proxy);
            return target[prop](key);
          };
        }
        return reflectedValue.bind(target);
      }
      return reflectedValue;
    }
  });
  observables.add(data);
  observablesByProxy.set(proxy, data);
  data.forEach((value: any, key: any) => {
    if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
    if(Array.isArray(value) || isPlainObject(value)) proxy.set(key, makeObservableArrayOrObject(value, rootProxy || proxy));
    else if(value instanceof Map) proxy.set(key, makeObservableMap(value, rootProxy || proxy));
  });
  observersByProxy.set(proxy, observers = {
    change: new Set(),
    destroy: new Set()
  });
  return proxy;
};

export const observable = (data: Observable): Observable => {
  if(Array.isArray(data)) return makeObservableArrayOrObject(data) as ObservableObject;
  if(isPlainObject(data)) return makeObservableArrayOrObject(data) as ObservableObject;
  if(data instanceof Map) return makeObservableMap(data) as ObservableMap;
  throw new Error('data must be plain Object, Array, or Map');
};

export const isObservable = (observableProxy: Observable): boolean => observablesByProxy.has(observableProxy);

export const observableObject = (data: ObservableObject): ObservableObject => {
  if(isPlainObject(data)) return makeObservableArrayOrObject(data) as ObservableObject;
  else throw new Error('data must be a plain Object');
};

export const observableArray = (data: ObservableObject): ObservableArray => {
  if(Array.isArray(data)) return makeObservableArrayOrObject(data) as ObservableArray;
  else throw new Error('data must be an Array');
};

export const observableMap = (data: ObservableMap): ObservableMap => {
  if(data instanceof Map) return makeObservableMap(data) as ObservableMap;
  else throw new Error('data must be a Map');
};

export const on = (observableProxy: Observable, eventType: ObservableEventKey, callback: ObservableCallback ): boolean => {
  const observers = observersByProxy.get(observableProxy);
  if(observers && observers[eventType] && typeof callback === 'function' && !observers[eventType].has(callback)) {
    observers[eventType].add(callback);
    return true;
  }
  return false;
}

export const off = (observableProxy: Observable, eventType: ObservableEventKey, callback: ObservableCallback ): boolean => {
  const observers = observersByProxy.get(observableProxy);
  return (observers && observers[eventType] && typeof callback === 'function') ? observers[eventType].delete(callback) : false;
}

export const destroy = (observableProxy: Observable): boolean => {
  const observers = observersByProxy.get(observableProxy);
  if(observers) {
    destroyedProxies.add(observableProxy);
    observables.delete(observablesByProxy.get(observableProxy));
    return true;
  }
  return false;
}

tick();