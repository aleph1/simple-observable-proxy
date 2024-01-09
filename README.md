# Simple Observable Proxy
### Simple Observable Proxy is a dependency-free library for JavaScript, that allows for observation of arrays, objects, and maps.

For objects, changing values, as well as adding, editing, or deleting keys results in a callback signal. For arrays direct modification using \[\], methods that change the array (pop, push, shift, unshift, etc.), or modifying length results in a callback signal. For maps, modifying values using set, delete, or clear will result in a callback signal.

Multiple observers can be created per observable, and all signals are queued and sent using requestAnimationFrame in the browser, and an interval of 16 milliseconds in a node environment.

Simple Observable Proxy is written in TypeScript and compiles as CommonJS and ESM. It is intended to be a very small library (less than 1000 bytes when minified and gzipped), and, as such, it does not report on specific differences between the current and prior state of the observed object, array, or map.

- [Installation](#real-cool-heading)
- [Basic Usage](#basic-usage)
- [Methods](#methods)
- [Migrating from 1.x to 2.x](#migrating-from-1x-to-2x)
- [Notes](#notes)
- [Roadmap](#roadmap)
- [Browser Support](#browser-support)

## Installation

Node
```
npm install simple-observable-proxy
```

Browser
```
import { observable } from 'simple-observable-proxy';
```

## Basic Usage

Observing an object.

```js
import { observableObject, observableEvents, on, off } from 'simple-observable-proxy';
const stateChange = state => {
  console.log('stateChange()');
}
const state = observableObject({
  test: 'test'
});
on(state, observableEvents.change, stateChange);
state.test = 'test2'; // in browser stateChange() will be called on requestAnimationFrame, and in Node approximately 16ms after being set
```

Observing an array.

```js
import { observableArray, observableEvents, on, off } from 'simple-observable-proxy';
const stateChange = state => {
  console.log('stateChange()');
}
const state = observableArray([1, 2, 3]);
on(state, observableEvents.change, stateChange);
state.push(4); // in browser stateChange() will be called on requestAnimationFrame, and in Node approximately 16ms after being set
```

Observing a map.

```js
import { observableMap, observableEvents, on, off } from 'simple-observable-proxy';
const stateChange = state => {
  console.log('stateChange()');
}
const state = observableMap(new Map);
on(state, observableEvents.change, stateChange);
state.set(0, 'test'); // in browser stateChange() will be called on requestAnimationFrame, and in Node approximately 16ms after being set
```

There is also a function that will automatically detect the data type and return an observable. This is used internally by the library for deep data structures.

```js
import { observable, isPlainObject } from 'simple-observable-proxy';

const objState = observable({});
console.log(isPlainObject(arrState)); // true

const arrState = observable([]);
console.log(Array.isArray(arrState)); // true

const mapState = observable(new Map);
console.log(mapState instanceof Map); // true
```

It is possible to have multiple callbacks on the same observable. This can be useful in specific cases such as multiple components sharing state.

```js
import { observable, observableEvents, on } from 'simple-observable-proxy';
// create 
const sharedState = observable([
  {
    id: 1,
    name: 'My first book.'
  },
  {
    id: 2,
    name: 'My second book.'
  }
]);

const sharedStateCallback1 = state => {
  console.log('sharedStateCallback1()');
};

const sharedStateCallback2 = state => {
  console.log('sharedStateCallback2()');
};

on(sharedState, ObservableEvents.change, sharedStateCallback1);
on(sharedState, ObservableEvents.change, sharedStateCallback2);
```

## Methods

### `observable(data: Array<any> | {[name: string]: any;} | Map<any, any>): Observable`
Converts an `Array`, plain `Object` (not an instance of a class) or `Map` to an instance of `Proxy` and returns it. There are numerous cases where this function will throw an Error:

- If any value other than an `Array` or plain `Object` is passed.
- If the `Array` or plain `Object` contains an instance of a class.
- If the `Array` or plain `Object` contains an `Array` or plain `Object` that has already been passed to `observable()`.

### `on(proxy: Observable, ObservableEventType: "change" | "destroy", callbackFn: (proxy: Observable) => void): boolean`
Subscribes to either the change or destroy event using callbackFn, Returns `true` if successfully subscribed, or `false` in cases where the proxy or callback function is invalid, or the callback is already registered.

### `off(proxy: Observable, ObservableEventType: "change" | "destroy", callbackFn: (proxy: Observable) => void): boolean`
Unsubscribes from either the change or destroy event using callbackFn. Returns `true` if successfully unsubscribed, or `false` in cases where the proxy or callback function is invalid.

### `destroy(proxy: Observable): boolean`
Cleans up the proxy. Returns `true` if successfully destroyed, or `false` in cases where the proxy has already been destroyed, or is not a valid proxy.

### `isObservable(proxy: Observable): boolean`
Whether the proxy is an observable.

### `isPlainObject(value: {[name: string]: any;}): boolean`
Returns `true` if value was created using `{}` or `new Object`, and `false` if the value is a class instance or any other value.

## Callbacks

When a value is modified on an observable, its updated values is available immediately. However, change or delete notifications are triggered on the next requestAnimationFrame in the browser or after 16ms in a Node environment. This is by design, otherwise multiple changes to an observable on the same “frame” would trigger multiple change events.

```js
import { observable, ObservableEvents, on } from 'simple-observable-proxy';
const stateChange = () => {
  console.log('state changed callback')
};
const state = observable({
  test: 'test',
  test2: 'test2'
});
on(state, ObservableEvents.change, stateChange);
state.test = 'test2'; // modify key
state.nested = [1, 2, 3]; // added key
delete state.test2; // delete key

// despite multiple changes to state, stateChange will 
// only be called once on next requestAnimationFrame or after 16ms
console.log('before state changed callback');

// output in the console should be
// 'before state changed callback'
// 'state changed callback'
```

## Migrating from 1.x or 2.x to 3.0
The object containing event types is now `observableEvents` versus `ObservableEvents`.

The `observe` and `unobserve` methods have been removed as of v3.0 and should be updated as follows:

1. Where you import the `observe` and `unobserve` methods, instead import the `on` and `off` methods, and the `ObservableEvents` object.
2. Replace any calls to `observe(yourState, yourChangeCallback)` with `on(yourState, ObservableEvents.change, yourChangeCallback)`, and any calls to `unobserve(yourState, yourChangeCallback)` with `off(yourState, ObservableEvents.change, yourChangeCallback)`.

If you wish to recreate the deprecated `observe` and `unobserve` methods, you can add the following to your codeset.

### TypeScript
```typescript
const observe = (observableProxy: Observable, callback: ObservableCallback): boolean => on(observableProxy, ObservableEvents.change, callback);
const unobserve = (observableProxy: Observable, callback: ObservableCallback): boolean => off(observableProxy, ObservableEvents.change, callback);
```

### JavaScript
```js
const observe = (observableProxy, callback) => on(observableProxy, ObservableEvents.change, callback);
const unobserve = (observableProxy, callback) => off(observableProxy, ObservableEvents.change, callback);
```

## Roadmap

Version 4.0 will consider the following changes:

- Primitives (will not use proxies, and will likely complicate the API by requiring configuration options for observables)
- Instances of classes are observable (might be beyond the scope of this library)

## Browser Support
| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Opera |
|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|
| 12+| 34+| 63+| 10+| 10+| 50+
