/*! simple observable proxy v2.0.0 | MIT License | © 2022 Aleph1 Technologies Inc */
const ObservableEvents = { change: "change", destroy: "destroy" },
  observables = new Set(),
  observablesByProxy = new Map(),
  observersByProxy = new Map(),
  changedProxies = new Set(),
  destroyedProxies = new Set(),
  plainObjectConstructor = {}.constructor,
  isPlainObject = (data) =>
    !!data &&
    "object" == typeof data &&
    data.constructor === plainObjectConstructor,
  tick = () => {
    changedProxies.forEach((proxy) => {
      const observers = observersByProxy.get(proxy);
      observers && observers.change.forEach((callback) => callback(proxy));
    }),
      changedProxies.clear(),
      destroyedProxies.forEach((proxy) => {
        const observers = observersByProxy.get(proxy);
        observers &&
          (observers.destroy.forEach((callback) => callback(proxy)),
          observers.change.clear(),
          observers.destroy.clear(),
          observablesByProxy.delete(proxy),
          observersByProxy.delete(proxy));
      }),
      destroyedProxies.clear(),
      setTimeout(tick, 16);
  },
  makeObservableArrayOrObject = (data, rootProxy) => {
    if (observables.has(data) || observablesByProxy.has(data))
      throw new Error("data is already an observable");
    let observers;
    const proxy = new Proxy(data, {
      get: (target, prop) => target[prop],
      set(target, prop, value) {
        if (target[prop] !== value) {
          if (observers) {
            if (observablesByProxy.has(value))
              throw new Error("Can’t nest observables");
            changedProxies.add(rootProxy || proxy);
          }
          target[prop] = value;
        }
        return !0;
      },
      deleteProperty: (target, prop) => (
        prop in target &&
          (delete target[prop], changedProxies.add(rootProxy || proxy)),
        !0
      ),
    });
    return (
      observables.add(data),
      observablesByProxy.set(proxy, data),
      (Array.isArray(data)
        ? [...Array(data.length).keys()]
        : Object.keys(data)
      ).forEach((key) => {
        const value = data[key];
        if (observablesByProxy.has(value))
          throw new Error("Can’t nest observables");
        Array.isArray(value) || isPlainObject(value)
          ? (proxy[key] = makeObservableArrayOrObject(
              value,
              rootProxy || proxy
            ))
          : value instanceof Map &&
            (proxy[key] = makeObservableMap(value, rootProxy || proxy));
      }),
      observersByProxy.set(
        proxy,
        (observers = { change: new Set(), destroy: new Set() })
      ),
      proxy
    );
  },
  makeObservableMap = (data, rootProxy) => {
    if (observables.has(data) || observablesByProxy.has(data))
      throw new Error("data is already an observable");
    let observers;
    const proxy = new Proxy(data, {
      get(target, prop) {
        const reflectedValue = target[prop];
        return "function" == typeof reflectedValue
          ? "set" === prop
            ? (key, value) => {
                if (observers) {
                  if (observablesByProxy.has(value))
                    throw new Error("Can’t nest observables");
                  const has = target.has(key);
                  (!has || (has && target.get(key) !== value)) &&
                    changedProxies.add(rootProxy || proxy);
                }
                return target[prop](key, value);
              }
            : "clear" === prop
            ? () => (
                target.size && changedProxies.add(rootProxy || proxy),
                target[prop]()
              )
            : "delete" === prop
            ? (key) => (
                target.has(key) && changedProxies.add(rootProxy || proxy),
                target[prop](key)
              )
            : reflectedValue.bind(target)
          : reflectedValue;
      },
    });
    return (
      observables.add(data),
      observablesByProxy.set(proxy, data),
      data.forEach((value, key) => {
        if (observablesByProxy.has(value))
          throw new Error("Can’t nest observables");
        Array.isArray(value) || isPlainObject(value)
          ? proxy.set(
              key,
              makeObservableArrayOrObject(value, rootProxy || proxy)
            )
          : value instanceof Map &&
            proxy.set(key, makeObservableMap(value, rootProxy || proxy));
      }),
      observersByProxy.set(
        proxy,
        (observers = { change: new Set(), destroy: new Set() })
      ),
      proxy
    );
  },
  observable = (data) => {
    if (Array.isArray(data)) return makeObservableArrayOrObject(data);
    if (isPlainObject(data)) return makeObservableArrayOrObject(data);
    if (data instanceof Map) return makeObservableMap(data);
    throw new Error("data must be plain Object, Array, or Map");
  },
  isObservable = (observableProxy) => observablesByProxy.has(observableProxy),
  observableObject = (data) => {
    if (isPlainObject(data)) return makeObservableArrayOrObject(data);
    throw new Error("data must be a plain Object");
  },
  observableArray = (data) => {
    if (Array.isArray(data)) return makeObservableArrayOrObject(data);
    throw new Error("data must be an Array");
  },
  observableMap = (data) => {
    if (data instanceof Map) return makeObservableMap(data);
    throw new Error("data must be a Map");
  },
  on = (observableProxy, eventType, callback) => {
    const observers = observersByProxy.get(observableProxy);
    return (
      !(
        !observers ||
        !observers[eventType] ||
        "function" != typeof callback ||
        observers[eventType].has(callback)
      ) && (observers[eventType].add(callback), !0)
    );
  },
  off = (observableProxy, eventType, callback) => {
    const observers = observersByProxy.get(observableProxy);
    return (
      !(!observers || !observers[eventType] || "function" != typeof callback) &&
      observers[eventType].delete(callback)
    );
  },
  destroy = (observableProxy) =>
    !!observersByProxy.get(observableProxy) &&
    (destroyedProxies.add(observableProxy),
    observables.delete(observablesByProxy.get(observableProxy)),
    !0);
tick();
export {
  ObservableEvents,
  destroy,
  isObservable,
  observable,
  observableArray,
  observableMap,
  observableObject,
  off,
  on,
};
