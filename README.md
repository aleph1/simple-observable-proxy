# Simple Observable Proxy
### Simple Observable Proxy is a dependency-free library for JavaScript, that allows for observation of arrays and objects that are either flat or deep.

For objects, changing values, as well as adding, editing, or deleting keys results in a callback signal. For arrays changing values, direct modification using \[\], methods that change the array (pop, push, shift, unshift, etc.), or modifying length results in a callback signal. Multiple observers can be created per observable, and all signals are queued and sent using requestAnimationFrame in the browser, and an interval of 16 milliseconds in a node environment.

Simple Observable Proxy is written in TypeScript and compiles as CommonJS and ESM. It is intended to be a very small library (approximately 700 bytes when minified and gzipped), and, as such, it does not report on specific differences between the current and prior state of the observed object or array.

## Installation

Node
```
npm install simple-observable-proxy
```

Browser
```
import { observable, observe } from 'simple-observable-proxy';
```

## Basic Usage

Objects and arrays can also be observed and unobserved.

```js
import { observable, observe, unobserve } from 'simple-observable-proxy';
const stateChange = () => {
  console.log('stateChange()');
}
const state = observable({
  test: 'test'
});
observe(state, stateChange);
state.test = 'test2'; // stateChange() will be called on RAF
window.requestAnimationFrame(() => {
  console.log('state.test : ' + state.test);
  unobserve(state, stateChange);
  state.test = 'test3'; // stateChange() will not be called
  console.log('state.test : ' + state.test);
});
```

It is possible to have multiple callbacks on the same observable. This can be useful in specific cases such as multiple components sharing state.

```js
import { observable, observe } from 'simple-observable-proxy';
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

const sharedStateCallback1 = () => {
  console.log('sharedStateCallback1()');
};

const sharedStateCallback2 = () => {
  console.log('sharedStateCallback2()');
};

observe(sharedState, sharedStateCallback1);
observe(sharedState, sharedStateCallback2);
```

## Methods

### observable(arrayOrPlainObject: Observable): Observable
Converts an `Array` or plain `Object` (not an instance of a class) to an instance of `Proxy` and returns it. There are numerous cases where this function will throw an Error:

- If any value other than an `Array` or plain `Object` is passed.
- If the `Array` or plain `Object` contains an instance of a class.
- If the `Array` or plain `Object` contains an `Array` or plain `Object` that has already been passed to `observable()`.

### observe(proxy: Observable, callbackFn: () => {}): boolean
Subscribes to proxy changes using callbackFn, Returns `true` if successfully subscribed, or `false` in cases where the proxy or callback function is invalid, or the callback is already registered.

### unobserve(proxy: Observable, callbackFn: () => {}): boolean
Unsubscribes from proxy changes using callbackFn. Returns `true` if successfully unsubscribed, or `false` in cases where the proxy or callback function is invalid.

### destroy(proxy: Observable): boolean
Cleans up the proxy. Returns `true` if successfully destroyed, or `false` in cases where the proxy has already been destroyed, or is not a valid proxy.

## Notes

When a value is modified on an observable proxy, its updated values is available immediately. When multiple values are modified on the observable proxy each registered callback will be called only once using requestAnimationFrame in the browser, or after 16ms in a Node environment. For example:

```js
import { observable, observe } from 'simple-observable-proxy';
const stateChange = () => {
  console.log('state changed callback')
};
const state = observable({
  test: 'test',
  test2: 'test2'
});
observe(state, stateChange);
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

## Roadmap

Version 3.0 will consider the following changes:

- Instances of classes are observable

## Browser Support
| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Opera |
|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|
| 12+| 34+| 63+| 10+| 10+| 50+
