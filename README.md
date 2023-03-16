# Simple Observable Proxy
### Simple Observable Proxy is a dependency-free library for JavaScript, that allows for observation of arrays and objects that are either flat or deep.

For objects, changing values, as well as adding, editing, or deleting keys results in a callback signal. For arrays changing values, direct modification using \[\], methods that change the array (pop, push, shift, unshift, etc.), or modifying length results in a callback signal. Multiple observers can be created per observable, and all signals are queued and sent on requestAnimationFrame.

Simple Observable Proxy is written in TypeScript and is intended to be a very small library (approximately 650 bytes when minified and gzipped), and, as such, it does not report on specific differences between the current and prior state of the observed object or array.

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

### observable(plainObjectOrArray)
Converts a plain object or array to an instance of `Proxy` and returns it. If any other value is passed to the function it returns `false`.

### observe(proxy, callbackFn)
Subscribes to proxy changes using callbackFn, Returns `true` if successfully subscribed, or `false` in cases where the proxy or callback function is invalid, or the callback is already registered.

### unobserve(proxy, callbackFn)
Unsubscribes from proxy changes using callbackFn. Returns `true` if successfully unsubscribed, or `false` in cases where the proxy or callback function is invalid.

### destroy(proxy)
Cleans up the proxy. Returns `true` if successfully destroyed, or `false` in cases where the proxy has already been destroyed, or is not a valid proxy.

## Notes

Simple Observable Proxy maintains a list of sources to prevent observing the same object or array more than once. Attempting to do so will throw an error.

Attempting to nest one observable within another will throw an error.

When multiple values are modified on an observable proxy only one notification is sent per callback on the next requestAnimationFrame. For example:

```js
import { observable, observe } from 'simple-observable-proxy';
const stateChange = () => {
  console.log('state changed')
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
// only be called once on next requestAnimationFrame
```

## Roadmap

Version 2.0 will include the following changes:

- observable will throw errors when trying to observe a value other than an array or plain object

Version 3.0 will consider the following changes:

- Instances of classes are observable

## Browser Support
| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://gotbahn.github.io/browsers-support-badges/)</br>Opera |
|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|
| 12+| 34+| 63+| 10+| 10+| 50+
