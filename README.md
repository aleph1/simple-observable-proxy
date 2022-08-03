# Simple Observable Proxy
Simple observable proxies for JavaScript. Fully tested to work with objects, arrays, and primitive types. Includes options for revocable proxies and deep observation. Only 500 bytes gzipped.

## Installation

```
$ npm install simple-observable-proxy
```

## Usage

```js
const { observe, unobserve, revoke } = require('simple-observable-proxy');
const stateChange = () => {
  console.log('stateChange()');
};
const state = observe({
	test: 'test'
}, stateChange);

state.test = 'test2';

// it is possible to have multiple callbacks on the same observable
// useful in cases such as multiple components sharing state
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