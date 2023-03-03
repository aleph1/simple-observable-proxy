# Simple Observable Proxy
### Simple observable proxies for JavaScript, allows observation of arrays and objects that are either flat or deep.

For objects, changing values, as well as adding, editing, or deleting keys results in callback signal. For arrays changing values, direct modification using \[\], methods that change the array (pop, push, shift, unshift, etc.), or modifying length results in callback signal. Multiple observers can be created per observable, and all signals are queued and sent on requestAnimationFrame.

Simple Observable Proxy is dependency-free and is a very small library (it’s less than 600 bytes gzipped). It does not report on specific differences between the current and prior state of the observed object or array. 

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

### observable(objectOrArray)
Converts objectOrArray to a proxy and returns it.

### observe(proxy, callbackFn)
Subscribes to proxy changes using callbackFn.

### unobserve(proxy, callbackFn)
Unsubscribes from proxy changes using callbackFn.

Returns true if the callbackFn was removed.

### destroy(proxy)
Cleans up the proxy.

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