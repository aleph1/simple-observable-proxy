const proxiesBySource = new WeakMap();
const callbacksByProxy = new WeakMap();
const revocablesByProxy = new WeakMap();
const toNotifyOnTick = [];

const deferNotify = callbacks => {
	toNotifyOnTick.push(callbacks);
}

const onTick = callbacks => {
	[...new Set(toNotifyOnTick.flat(Math.INFINTY))].forEach(callback => {
		callback();
	});
	toNotifyOnTick.length = 0;
	window.requestAnimationFrame(onTick);
}

const observe = (objOrArrOrProxy, callback, options = {}) => {
	// determine if objOrArr has already been proxified
	let proxy = proxiesBySource.get(objOrArrOrProxy) || callbacksByProxy.has(objOrArrOrProxy) && objOrArrOrProxy;
	let callbacks = proxy ? callbacksByProxy.get(proxy) : [callback];
	if(proxy) {
		if(!callbacks.includes(callback)) callbacks.push(callback);
		return proxy;
	}
	const handler = {
		get(target, key) {
			const prop = target[key];
			// return if property not found
			if (typeof prop !== 'undefined') {
				if (prop && typeof prop === 'object') {
					target[key] = observe(prop, callback, options);
				}
				return target[key];
			}
		},
		set(target, key, value) {
			if(target[key] !== value) {
				target[key] = value;
				deferNotify(callbacks);
			}
			return true;
		},
		deleteProperty(target, prop) {
			if (prop in target) {
				delete target[prop];
				deferNotify(callbacks);
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
	return proxy;
}

const unobserve = (objOrArrOrProxy, callback) => {
	const callbacks = callbacksByProxy.get(proxiesBySource.get(objOrArrOrProxy) || objOrArrOrProxy);
	if(callbacks) {
		const index = callbacks.indexOf(callback);
		if(index !== -1) callbacks.splice(index, 1);
	}
};

const revoke = (objOrArrOrProxy) => {
	const revoke = revocablesByProxy.get(proxiesBySource.get(objOrArrOrProxy) || objOrArrOrProxy);
	if(revoke) {
		revoke();
		return true;
	}
	return false;
};

window.requestAnimationFrame(onTick);

module.exports = {
	observe,
	unobserve,
	revoke	
}