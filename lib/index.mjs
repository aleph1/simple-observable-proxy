export const ObservableEvents = {
    change: 'change',
    destroy: 'destroy',
};
// data that is being observed
const observables = new Set();
// original data for each proxy
const observablesByProxy = new Map();
// observers for each proxy
const observersByProxy = new Map();
// collections to call on tick
const changedProxies = new Set();
const destroyedProxies = new Set();
const plainObjectConstructor = {}.constructor;
const isPlainObject = (data) => !!data && typeof data === 'object' && data.constructor === plainObjectConstructor;
const canBeObservable = (data) => Array.isArray(data) || /*#__INLINE__*/ isPlainObject(data);
const tick = () => {
    changedProxies.forEach(proxy => {
        const observers = observersByProxy.get(proxy);
        if (observers)
            observers.change.forEach((callback) => callback());
    });
    changedProxies.clear();
    destroyedProxies.forEach(proxy => {
        const observers = observersByProxy.get(proxy);
        if (observers)
            observers.destroy.forEach((callback) => callback());
    });
    destroyedProxies.clear();
    if (typeof window !== "undefined" && window.requestAnimationFrame)
        window.requestAnimationFrame(tick);
    else
        setTimeout(tick, 16);
};
const makeObservableProxy = (data, rootProxy) => {
    if (observables.has(data))
        throw new Error('Only Arrays and plain Objects are observable');
    if (observablesByProxy.has(data))
        throw new Error('rootProxy isn’t an observable');
    let observers;
    const proxy = new Proxy(data, {
        get(target, key) {
            return target[key];
        },
        set(target, key, value) {
            if (target[key] !== value) {
                if (observers) {
                    if (observablesByProxy.has(value))
                        throw new Error('Can’t nest observables');
                    changedProxies.add(rootProxy || proxy);
                }
                target[key] = value;
            }
            return true;
        },
        deleteProperty(target, key) {
            if (key in target) {
                delete target[key];
                changedProxies.add(rootProxy || proxy);
                return true;
            }
            return false;
        }
    });
    (Array.isArray(data) ? [...Array(data.length).keys()] : Object.keys(data)).forEach(key => {
        const value = data[key];
        if (observablesByProxy.has(value))
            throw new Error('Can’t nest observables');
        if ( /*#__INLINE__*/canBeObservable(value))
            proxy[key] = makeObservableProxy(value, rootProxy || proxy);
    });
    observables.add(data);
    observablesByProxy.set(proxy, data);
    observersByProxy.set(proxy, observers = {
        change: new Set(),
        destroy: new Set()
    });
    return proxy;
};
export const observable = (data) => {
    if ( /*#__INLINE__*/canBeObservable(data))
        return makeObservableProxy(data);
    else
        throw new Error('Only Arrays and plain Objects are observable');
};
export const on = (observableProxy, eventType, callback) => {
    const observers = observersByProxy.get(observableProxy);
    if (observers && observers[eventType] && typeof callback === 'function' && !observers[eventType].has(callback)) {
        observers[eventType].add(callback);
        return true;
    }
    return false;
};
export const off = (observableProxy, eventType, callback) => {
    const observers = observersByProxy.get(observableProxy);
    if (observers && observers[eventType] && typeof callback === 'function')
        return observers[eventType].delete(callback);
    return false;
};
// deprecated and to be removed in 3.0
export const observe = (observableProxy, callback) => on(observableProxy, ObservableEvents.change, callback);
export const unobserve = (observableProxy, callback) => off(observableProxy, ObservableEvents.change, callback);
export const destroy = (observableProxy) => {
    const observers = observersByProxy.get(observableProxy);
    if (observers) {
        observers.change.clear();
        observers.destroy.clear();
        observables.delete(observablesByProxy.get(observableProxy));
        observablesByProxy.delete(observableProxy);
        observersByProxy.delete(observableProxy);
        changedProxies.delete(observableProxy);
        return true;
    }
    return false;
};
tick();
