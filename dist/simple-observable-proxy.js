/*! simple observable proxy v2.0.0 | MIT License | © 2022 Aleph1 Technologies Inc */
const observables = new Set(),
  observablesByProxy = new Map(),
  observersByProxy = new Map(),
  proxiesToNotify = new Set(),
  plainObjectConstructor = {}.constructor,
  tick = () => {
    proxiesToNotify.forEach((proxy) => {
      observersByProxy.get(proxy).forEach((callback) => callback());
    }),
      proxiesToNotify.clear(),
      "undefined" != typeof window && window.requestAnimationFrame
        ? window.requestAnimationFrame(tick)
        : setTimeout(tick, 16);
  },
  makeObservableProxy = (data, rootProxy) => {
    if (observables.has(data))
      throw new Error("Only Arrays and plain Objects are observable");
    if (observablesByProxy.has(data))
      throw new Error("rootProxy isn’t an observable");
    let observers;
    const proxy = new Proxy(data, {
      get: (target, key) => target[key],
      set(target, key, value) {
        if (target[key] !== value) {
          if (observers) {
            if (observablesByProxy.has(value))
              throw new Error("Can’t nest observables");
            proxiesToNotify.add(rootProxy || proxy);
          }
          target[key] = value;
        }
        return !0;
      },
      deleteProperty: (target, key) =>
        key in target &&
        (delete target[key], proxiesToNotify.add(rootProxy || proxy), !0),
    });
    return (
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
      (observers = new Set()),
      observables.add(data),
      observablesByProxy.set(proxy, data),
      observersByProxy.set(proxy, observers),
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
  observe = (observableProxy, callback) => {
    const observers = observersByProxy.get(observableProxy);
    return (
      !(!observers || "function" != typeof callback) && observers.add(callback)
    );
  },
  unobserve = (observableProxy, callback) => {
    const observers = observersByProxy.get(observableProxy);
    return (
      !(!observers || "function" != typeof callback) &&
      observers.delete(callback)
    );
  },
  destroy = (observableProxy) => {
    const observers = observersByProxy.get(observableProxy);
    return (
      !!observers &&
      (observers.clear(),
      observables.delete(observablesByProxy.get(observableProxy)),
      observablesByProxy.delete(observableProxy),
      observersByProxy.delete(observableProxy),
      proxiesToNotify.delete(observableProxy),
      !0)
    );
  };
tick();
export { destroy, observable, observe, unobserve };
