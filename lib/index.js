/*! simple observable proxy v2.0.0 | MIT License | © 2022 Aleph1 Technologies Inc */
const ObservableEvents = { change: "change", destroy: "destroy" },
  observables = new Set(),
  observablesByProxy = new Map(),
  observersByProxy = new Map(),
  changedProxies = new Set(),
  destroyedProxies = new Set(),
  plainObjectConstructor = {}.constructor,
  tick = () => {
    changedProxies.forEach((proxy) => {
      const observers = observersByProxy.get(proxy);
      observers && observers.change.forEach((callback) => callback());
    }),
      changedProxies.clear(),
      destroyedProxies.forEach((proxy) => {
        const observers = observersByProxy.get(proxy);
        observers && observers.destroy.forEach((callback) => callback());
      }),
      destroyedProxies.clear(),
      setTimeout(tick, 16);
  },
  makeObservableProxy = (data, rootProxy) => {
    if (observables.has(data)) throw new Error("data is alreaby an observable");
    if (rootProxy && !observablesByProxy.has(rootProxy))
      throw new Error("rootProxy isn’t an observable");
    let observers;
    const proxy = new Proxy(data, {
      get: (target, key) => target[key],
      set(target, key, value) {
        if (target[key] !== value) {
          if (observers) {
            if (observablesByProxy.has(value))
              throw new Error("Can’t nest observables");
            changedProxies.add(rootProxy || proxy);
          }
          target[key] = value;
        }
        return !0;
      },
      deleteProperty: (target, key) =>
        key in target &&
        (delete target[key], changedProxies.add(rootProxy || proxy), !0),
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
        ((data) =>
          Array.isArray(data) ||
          ((data) =>
            !!data &&
            "object" == typeof data &&
            data.constructor === plainObjectConstructor)(data))(value) &&
          (proxy[key] = makeObservableProxy(value, rootProxy || proxy));
      }),
      observersByProxy.set(
        proxy,
        (observers = { change: new Set(), destroy: new Set() })
      ),
      proxy
    );
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
  };
tick(),
  (exports.ObservableEvents = ObservableEvents),
  (exports.destroy = (observableProxy) => {
    const observers = observersByProxy.get(observableProxy);
    return (
      !!observers &&
      (observers.change.clear(),
      observers.destroy.clear(),
      observables.delete(observablesByProxy.get(observableProxy)),
      observablesByProxy.delete(observableProxy),
      observersByProxy.delete(observableProxy),
      changedProxies.delete(observableProxy),
      !0)
    );
  }),
  (exports.observable = (data) => {
    if (
      ((data) =>
        Array.isArray(data) ||
        ((data) =>
          !!data &&
          "object" == typeof data &&
          data.constructor === plainObjectConstructor)(data))(data)
    )
      return makeObservableProxy(data);
    throw new Error("Only Arrays and plain Objects are observable");
  }),
  (exports.observe = (observableProxy, callback) =>
    on(observableProxy, ObservableEvents.change, callback)),
  (exports.off = off),
  (exports.on = on),
  (exports.unobserve = (observableProxy, callback) =>
    off(observableProxy, ObservableEvents.change, callback));
