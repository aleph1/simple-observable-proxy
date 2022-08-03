const proxiesBySource = new WeakMap();
const callbacksByProxy = new WeakMap();
const revocablesByProxy = new WeakMap();
const modifiedProxies = new Set();

export function observe(objOrArrOrProxy, callback, options = {}) {
	// determine if objOrArr has already been proxified
	let proxy = proxiesBySource.get(objOrArrOrProxy) || callbacksByProxy.has(objOrArrOrProxy) && objOrArrOrProxy;
	let callbacks = proxy && callbacksByProxy.get(proxy) || [];
	if(typeof callback === 'function' && !callbacks.includes(callback)) callbacks.push(callback);
	if(!proxy) {
		const handler = {
			get(target, key) {
				const prop = target[key];
				return prop && typeof prop === 'object' ? target[key] = observe(prop, callback, options) : prop;
			},
			set(target, key, value) {
				if(target[key] !== value) {
					target[key] = value;
					modifiedProxies.add(proxy);
				}
				return true;
			},
			deleteProperty(target, prop) {
				if (prop in target) {
					delete target[prop];
					modifiedProxies.add(proxy);
					return true;
				}
				return false;
			}
		}
		if(options.revocable) {
			proxy = Proxy.revocable(objOrArrOrProxy, handler);
			revocablesByProxy.set(proxy.proxy, proxy.revoke);
			proxy = proxy.proxy;
		} else {
			proxy = new Proxy(objOrArrOrProxy, handler);
		}
		proxiesBySource.set(objOrArrOrProxy, proxy);
		callbacksByProxy.set(proxy, callbacks);
	}
	return proxy;
}

export function unobserve(objOrArrOrProxy, callback) {
	let callbacks = callbacksByProxy.get(proxiesBySource.get(objOrArrOrProxy) || objOrArrOrProxy);
	if(callbacks) {
		const index = callbacks.indexOf(callback);
		if(index !== -1) callbacks.splice(index, 1);
	}
}

export function revoke(objOrArrOrProxy) {
	const proxy = proxiesBySource.get(objOrArrOrProxy) || objOrArrOrProxy;
	const revoke = revocablesByProxy.get(proxy);
	if(revoke) {
		revoke();
		revocablesByProxy.delete(proxy);
		return true;
	}
	return false;		
}

function onTick(){
	modifiedProxies.forEach(proxy => {
		const callbacks = callbacksByProxy.get(proxy);
		callbacks && callbacks.forEach(callback => callback());
	});
	modifiedProxies.clear();
	window.requestAnimationFrame(onTick);
}

onTick();