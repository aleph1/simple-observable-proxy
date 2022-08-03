# Simple Observable Proxy
Simple observable proxies for JavaScript, using requestAnimationFrame to defer callbacks and notify of changes. Observables can be shallow or deep objects or arrays, and all manipulation of objects (adding, editing, or deleting keys) and arrays (direct modification using \[\], methods, or changing length) is detected. Includes options for revocable proxies.

Simple Observable Proxy is intended to be a very small library (approximately 500 bytes gzipped) that serves to notify that a proxy has changed, but does not report on differences between current and prior state.

## Installation

Node
```
$ npm install simple-observable-proxy
```

Browser
```
import { observe, unobserve, revoke } from 'simple-observable-proxy';
```

## Basic Usage

Objects and arrays can also be observed and unobserved.

```js
import { observe, unobserve } from 'simple-observable-proxy';
const stateChange = () => {
  console.log('stateChange()');
}
const state = observe({
  test: 'test'
}, stateChange);
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
import { observe } from 'simple-observable-proxy';
// create 
const sharedState = observe([
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

## Advanced Usage

`observe` allows support for revocable proxies by passing `options.revocable` as `true`.

```js
import { observe, revoke } from 'simple-observable-proxy';
const stateChange = () => {
  console.log('stateChange()');
};
const state = observe({
  test: 'test'
}, stateChange);
state.test = 'test2'; // stateChange() will be called
revoke(state);
state.test = 'test3'; // will throw an error
```

## Methods

### observe(objectOrArray, callbackFn, options = {})
Converts objectOrArray to a proxy, and subscribes to additions/modifications/deletions using callbackFn.

Returns a proxy of objectOrArray.

### unobserve(objectOrArrayProxy, callbackFn)
Removes the callbackFn for objectOrArrayProxy if it exists.

Returns true if the callbackFn was removed, and false if callbackFn was not registered for that objectOrArrayProxy.

### revoke(objectOrArrayProxy)
Revokes the proxy if it was created using observe with options.revokable set to be true.

## Implementation

Internally Simple Observable Proxy maintains WeakMaps of observables (object and array) mapped to their respective Proxy, as well as a WeakMap of Proxy instances mapped to an array of callbacks. Whenever a proxy is modified it is added to a notification queue that is called once per requestAnimationFrame.

Even when multiple values are modified on an observable proxy only one notification is sent per callback on the next requestAnimationFrame. For example:

```js
const stateChange = () => {
  console.log('state changed')
};
const state = observe({
  test: 'test',
  test2: 'test2'
}, stateChange);
state.test = 'test2'; // modify key
state.nested = [1, 2, 3]; // added key
delete state.test2; // delete key

// depsite multiple changes to state, stateChange will 
// only be called once on next requestAnimationFrame
```