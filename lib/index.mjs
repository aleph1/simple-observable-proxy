// data that is being observed
const observables = new Set();
// original data for each proxy
const observablesByProxy = new Map();
// observers for each proxy
const observersByProxy = new Map();
// observers to call on tick
const proxiesToNotify = new Set();
const plainObjectConstructor = {}.constructor;
const isPlainObject = (data) => !!data && typeof data === 'object' && data.constructor === plainObjectConstructor;
const canBeObservable = (data) => Array.isArray(data) || /*#__INLINE__*/ isPlainObject(data);
const tick = () => {
    proxiesToNotify.forEach(proxy => {
        observersByProxy.get(proxy).forEach((callback) => callback());
    });
    proxiesToNotify.clear();
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
                    proxiesToNotify.add(rootProxy || proxy);
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
        if (observablesByProxy.has(value))
            throw new Error('Can’t nest observables');
        if ( /*#__INLINE__*/canBeObservable(value))
            proxy[key] = makeObservableProxy(value, rootProxy || proxy);
    });
    observers = new Set();
    observables.add(data);
    observablesByProxy.set(proxy, data);
    observersByProxy.set(proxy, observers);
    return proxy;
};
export const observable = (data) => {
    if ( /*#__INLINE__*/canBeObservable(data))
        return makeObservableProxy(data);
    else
        throw new Error('Only Arrays and plain Objects are observable');
};
export const observe = (observableProxy, callback) => {
    const observers = observersByProxy.get(observableProxy);
    return observers && typeof callback === 'function' ? observers.add(callback) : false;
};
export const unobserve = (observableProxy, callback) => {
    const observers = observersByProxy.get(observableProxy);
    return observers && typeof callback === 'function' ? observers.delete(callback) : false;
};
export const destroy = (observableProxy) => {
    const observers = observersByProxy.get(observableProxy);
    if (observers) {
        observers.clear();
        observables.delete(observablesByProxy.get(observableProxy));
        observablesByProxy.delete(observableProxy);
        observersByProxy.delete(observableProxy);
        proxiesToNotify.delete(observableProxy);
        return true;
    }
    return false;
};
tick();
