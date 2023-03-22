export type Observable = {[name: string]: any;};
export type ObservableCallback = () => void;
export const ObservableEvents = {
    change: 'change',
    destroy: 'destroy',
} as const;
type ObservableEventKey = keyof typeof ObservableEvents;
export type ObservableEvent = typeof ObservableEvents[ObservableEventKey];

type ObservableCallbackObject = {
  change: Set<ObservableCallback>,
  destroy: Set<ObservableCallback>
};
export type ObservableCallbackMap = Map<Observable, ObservableCallbackObject>;

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
const isPlainObject = (data: Observable): boolean => !!data && typeof data === 'object' && data.constructor === plainObjectConstructor;
const canBeObservable = (data: Observable): boolean => Array.isArray(data) || /*#__INLINE__*/isPlainObject(data);

const tick = (): void => {
  changedProxies.forEach(proxy => {
    const observers = observersByProxy.get(proxy);
    if(observers) observers.change.forEach((callback: ObservableCallback) => callback());
  });
  changedProxies.clear();
  destroyedProxies.forEach(proxy => {
    const observers = observersByProxy.get(proxy);
    if(observers) observers.destroy.forEach((callback: ObservableCallback) => callback());
  });
  destroyedProxies.clear();
  if(typeof window !== 'undefined' && window.requestAnimationFrame) window.requestAnimationFrame(tick);
  else setTimeout(tick, 16);
};

const makeObservableProxy = (data: Observable, rootProxy?: Observable): Observable => {
  if(observables.has(data)) throw new Error('data is alreaby an observable');
  if(rootProxy && !observablesByProxy.has(rootProxy)) throw new Error('rootProxy isn’t an observable');
  let observers: ObservableCallbackObject;
  const proxy = new Proxy(data, {
    get(target, key): any {
      return target[key as string];
    },
    set(target, key, value): boolean {
      if(target[key as string] !== value) {
        if(observers) {
          if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
          changedProxies.add(rootProxy || proxy)
        }
        target[key as string] = value;
      }
      return true;
    },
    deleteProperty(target, key): boolean {
      if (key in target) {
        delete target[key as string];
        changedProxies.add(rootProxy || proxy);
        return true;
      }
      return false;
    }
  });
  (Array.isArray(data) ? [...Array(data.length).keys()] : Object.keys(data)).forEach(key => {
    const value = data[key as string];
    if(observablesByProxy.has(value)) throw new Error('Can’t nest observables');
    if(/*#__INLINE__*/canBeObservable(value)) proxy[key] = makeObservableProxy(value, rootProxy || proxy);
  });
  observables.add(data);
  observablesByProxy.set(proxy, data);
  observersByProxy.set(proxy, observers = {
    change: new Set(),
    destroy: new Set()
  });
  return proxy;
};

export const observable = (data: Observable): Observable => {
  if(/*#__INLINE__*/canBeObservable(data)) return makeObservableProxy(data);
  else throw new Error('Only Arrays and plain Objects are observable');
}

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
  if(observers && observers[eventType] && typeof callback === 'function') return observers[eventType].delete(callback);
  return false;
}

// deprecated and to be removed in 3.0
export const observe = (observableProxy: Observable, callback: ObservableCallback): boolean => on(observableProxy, ObservableEvents.change, callback);
export const unobserve = (observableProxy: Observable, callback: ObservableCallback): boolean => off(observableProxy, ObservableEvents.change, callback);

export const destroy = (observableProxy: Observable): boolean => {
  const observers = observersByProxy.get(observableProxy);
  if(observers) {
    observers.change.clear();
    observers.destroy.clear();
    observables.delete(observablesByProxy.get(observableProxy));
    observablesByProxy.delete(observableProxy);
    observersByProxy.delete(observableProxy);
    changedProxies.delete(observableProxy);
    return true;
  }
  return false;
}

tick();