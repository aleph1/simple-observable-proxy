# Simple Observable Proxy
Simple observable proxies for JavaScript, using deferred callbacks to notify of changes. Fully tested to work with objects, arrays, and primitive types. Includes options for revocable proxies and deep observation. Approximately 500 bytes gzipped.

## Installation

```
$ npm install simple-observable-proxy
```

## Usage

Objects and arrays can also be observed and unobserved.

```js
const { observe, unobserve } = require('simple-observable-proxy');
const stateChange = () => {
  console.log('stateChange()');
};
const state = observe({
	test: 'test'
}, stateChange);

state.test = 'test2'; // stateChange() will be called
unobserve(state, stateChange);
state.test = 'test3'; // stateChange() will not be called
```

It is possible to have multiple callbacks on the same observable. This can be useful in specific cases such as multiple components sharing state.

```js
const { observe } = require('simple-observable-proxy');
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

## Implementation

TBC

## Methods

### observe(objectOrArray, callbackFn, options = {})
Converts objectOrArray to a proxy, and subscribes to additions/modifications/deletions using callbackFn.

Returns a proxy of objectOrArray.

### unobserve(objectOrArrayProxy, callbackFn)
Removes the callbackFn for objectOrArrayProxy if it exists.

Returns true if the callbackFn was removed, and false if callbackFn was not registered for that objectOrArrayProxy.

### revoke(objectOrArrayProxy)
Revokes the proxy if it was created using observe with options.revokable set to be true.