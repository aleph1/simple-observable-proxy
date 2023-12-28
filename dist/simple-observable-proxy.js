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
      window.requestAnimationFrame(tick);
  },
  makeObservableProxy = (data, rootProxy) => {
    if (observables.has(data) || observablesByProxy.has(data))
      throw new Error("data is alreaby an observable");
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
      deleteProperty: (target, key) => (
        key in target &&
          (delete target[key], changedProxies.add(rootProxy || proxy)),
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
  observable = (data) => {
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
  observe = (observableProxy, callback) =>
    on(observableProxy, ObservableEvents.change, callback),
  unobserve = (observableProxy, callback) =>
    off(observableProxy, ObservableEvents.change, callback),
  destroy = (observableProxy) =>
    !!observersByProxy.get(observableProxy) &&
    (destroyedProxies.add(observableProxy),
    observables.delete(observablesByProxy.get(observableProxy)),
    !0);
tick();
export { ObservableEvents, destroy, observable, observe, off, on, unobserve };
