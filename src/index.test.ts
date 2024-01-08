import { observable, observableArray, observableObject, observableMap, on, off, destroy, Observable, ObservableObject, ObservableEvents } from './index';

describe('observableArray()', () => {

  test('from empty array', () => {
    const state = observableArray([]);
    expect(state.length).toEqual(0);
  });

  test('from packed array', () => {
    const state = observableArray([1, 2, 3]);
    expect(state).toEqual([1, 2, 3]);
  });

  test('from sparse array', () => {
    const state = observableArray([1, , 3]);
    expect(state).toEqual([1, undefined, 3]);
  });

  test('from array with nested observable types', () => {
    const state = observableArray([
      [],
      {},
      new Map
    ]);
    expect(state.length).toEqual(3);
    expect(state[0]).toEqual([]);
    expect(state[1]).toEqual({});
    // jest still is messy with map and set comparison so we need extra tests
    expect(state[2] instanceof Map).toEqual(true);
    expect(state[2].size).toEqual(0);
  });

  test('Throws error when passed plain object', () => {
    expect(() => {
      const state = observableArray({} as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of Map', () => {
    expect(() => {
      const state = observableArray(new Map as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of Set', () => {
    expect(() => {
      const state = observableArray(new Set as any);
    }).toThrow(Error);
  });

  test('Throws error when passed boolean', () => {
    expect(() => {
      const state = observableArray(false as any);
    }).toThrow(Error);
  });

  test('Throws error when passed number', () => {
    expect(() => {
      const state = observableArray(1 as any);
    }).toThrow(Error);
  });

  test('Throws error when passed string', () => {
    expect(() => {
      const state = observableArray('test' as any);
    }).toThrow(Error);
  });

  test('Throws error when passed null', () => {
    expect(() => {
      const state = observableArray(null as any);
    }).toThrow(Error);
  });

  test('Throws error when passed undefined', () => {
    expect(() => {
      const state = observableArray(undefined as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of built-in class', () => {
    expect(() => {
      const state = observableArray(new Date() as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of custom class', () => {
    class CustomClass {constructor(){}};
    expect(() => {
      const state = observableArray(new CustomClass() as any);
    }).toThrow(Error);
  });

});

describe('observableObject()', () => {

  test('from plain object', () => {
    const state = observableObject({
      test: 'test',
    });
    expect(state.test).toEqual('test');
  });

  test('from object with nested observable types', () => {
    const state = observableObject({
      'arr': [],
      'obj': {},
      'map': new Map,
    });
    expect(state.arr).toEqual([]);
    expect(state.obj).toEqual({});
    // jest still is messy with map and set comparison so we need extra tests
    expect(state.map instanceof Map).toEqual(true);
    expect(state.map.size).toEqual(0);
  });

  test('Throws error when passed array', () => {
    expect(() => {
      const state = observableObject([] as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of Map', () => {
    expect(() => {
      const state = observableObject(new Map as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of Set', () => {
    expect(() => {
      const state = observableObject(new Set as any);
    }).toThrow(Error);
  });

  test('Throws error when passed boolean', () => {
    expect(() => {
      const state = observableObject(false as any);
    }).toThrow(Error);
  });

  test('Throws error when passed number', () => {
    expect(() => {
      const state = observableObject(1 as any);
    }).toThrow(Error);
  });

  test('Throws error when passed string', () => {
    expect(() => {
      const state = observableObject('test' as any);
    }).toThrow(Error);
  });

  test('Throws error when passed null', () => {
    expect(() => {
      const state = observableObject(null as any);
    }).toThrow(Error);
  });

  test('Throws error when passed undefined', () => {
    expect(() => {
      const state = observableObject(undefined as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of built-in class', () => {
    expect(() => {
      const state = observableObject(new Date() as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of custom class', () => {
    class CustomClass {constructor(){}};
    expect(() => {
      const state = observableObject(new CustomClass() as any);
    }).toThrow(Error);
  });

  test('Throws error when object is already observable', () => {
    const state = observableObject({});
    expect(() => {
      const state2 = observableObject(state);
    }).toThrow(Error);
  });

  test('Throws error when observables are nested', () => {
    const state1 = observableObject({});
    expect(() => {
      const state2 = observableObject({
        state: state1
      });
    }).toThrow(Error);
  });

  test('Throws error when attempting to set property as observable', () => {
    const state1 = observableObject({});
    const state2 = observableObject({});
    expect(() => {
      state1.test = state2;
    }).toThrow(Error);
  });

});

describe('observableMap()', () => {

  test('from empty Map', () => {
    const state = observableMap(new Map());
    expect(state.size).toEqual(0);
  });

  test('from Map with array', () => {
    const state = observableMap(new Map([
      [1, 1],
      [2, 2],
      [3, 3],
    ]));
    expect(state.size).toEqual(3);
    expect(state.get(1)).toEqual(1);
    expect(state.get(2)).toEqual(2);
    expect(state.get(3)).toEqual(3);
  });

  test('from Map with nested observable types', () => {
    const state = observableMap(new Map<any, any>([
      [1, []],
      [2, {}],
      [3, new Map],
      [4, new Set],
    ]));
    expect(state.size).toEqual(4);
    expect(state.get(1)).toEqual([]);
    expect(state.get(2)).toEqual({});
    // jest still is messy with map and set comparison so we need extra tests
    expect(state.get(3) instanceof Map).toEqual(true);
    expect(state.get(3).size).toEqual(0);
    expect(state.get(4) instanceof Set).toEqual(true);
    expect(state.get(4).size).toEqual(0);
  });

  test('Throws error when attempting to nest existing observable', () => {
    const state1 = observableObject({});
    expect(() => {
      const state2 = observableMap(new Map<any, any>([
        [1, state1]
      ]));
    }).toThrow(Error);
  });

  test('Throws error when observing and observed Map', () => {
    const map = new Map();
    const state1 = observableMap(map);
    expect(() => {
      const state2 = observableMap(map);
    }).toThrow(Error);
  });

  test('Throws error when passed array', () => {
    expect(() => {
      const state = observableMap([] as any);
    }).toThrow(Error);
  });

  test('Throws error when passed object', () => {
    expect(() => {
      const state = observableMap({} as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of Set', () => {
    expect(() => {
      const state = observableMap(new Set as any);
    }).toThrow(Error);
  });

  test('Throws error when passed boolean', () => {
    expect(() => {
      const state = observableMap(false as any);
    }).toThrow(Error);
  });

  test('Throws error when passed number', () => {
    expect(() => {
      const state = observableMap(1 as any);
    }).toThrow(Error);
  });

  test('Throws error when passed string', () => {
    expect(() => {
      const state = observableMap('test' as any);
    }).toThrow(Error);
  });

  test('Throws error when passed null', () => {
    expect(() => {
      const state = observableMap(null as any);
    }).toThrow(Error);
  });

  test('Throws error when passed undefined', () => {
    expect(() => {
      const state = observableMap(undefined as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of built-in class', () => {
    expect(() => {
      const state = observableMap(new Date() as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of custom class', () => {
    class CustomClass {constructor(){}};
    expect(() => {
      const state = observableMap(new CustomClass() as any);
    }).toThrow(Error);
  });

});

/*
describe('observableSet()', () => {

  test('from empty Set', () => {
    const state = observableSet(new Set());
    expect(state.size).toEqual(0);
  });

  test('from Set with dense array', () => {
    const state = observableSet(new Set([1, 2]));
    expect(state.size).toEqual(2);
    expect(state.has(1)).toEqual(true);
    expect(state.has(2)).toEqual(true);
  });

  test('from Set with sparse array', () => {
    const state = observableSet(new Set([1, , 3]));
    expect(state.size).toEqual(3);
    expect(state.has(1)).toEqual(true);
    expect(state.has(undefined)).toEqual(true);
    expect(state.has(3)).toEqual(true);
  });

  test('from Set with nested observable types', () => {
    const state = observableSet(new Set([
      [],
      {},
      new Map,
      new Set,
    ]));
    let index = 0;
    state.forEach((value:any) => {
      if(index === 0) {
        expect(value).toEqual([]);
      } else if(index === 1) {
        expect(value).toEqual({});
      } else if(index === 2) {
        expect(value instanceof Map).toEqual(true);
        expect(value.size).toEqual(0);
      } else if(index === 3) {
        expect(value instanceof Set).toEqual(true);
        expect(value.size).toEqual(0);
      }
      index++;
    });
  });

  test('Throws error when passed array', () => {
    expect(() => {
      const state = observableSet([] as any);
    }).toThrow(Error);
  });

  test('Throws error when passed object', () => {
    expect(() => {
      const state = observableSet({} as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of Map', () => {
    expect(() => {
      const state = observableSet(new Map as any);
    }).toThrow(Error);
  });

  test('Throws error when passed boolean', () => {
    expect(() => {
      const state = observableSet(false as any);
    }).toThrow(Error);
  });

  test('Throws error when passed number', () => {
    expect(() => {
      const state = observableSet(1 as any);
    }).toThrow(Error);
  });

  test('Throws error when passed string', () => {
    expect(() => {
      const state = observableSet('test' as any);
    }).toThrow(Error);
  });

  test('Throws error when passed null', () => {
    expect(() => {
      const state = observableSet(null as any);
    }).toThrow(Error);
  });

  test('Throws error when passed undefined', () => {
    expect(() => {
      const state = observableSet(undefined as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of built-in class', () => {
    expect(() => {
      const state = observableSet(new Date() as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of custom class', () => {
    class CustomClass {constructor(){}};
    expect(() => {
      const state = observableSet(new CustomClass() as any);
    }).toThrow(Error);
  });

});
*/

describe('observable()', () => {
  
  test('[] returns same type', () => {
    const state = observable([]);
    expect(Array.isArray(state)).toEqual(true);
  });

  test('{} returns same type', () => {
    const state = observable({});
    expect(typeof state).toEqual('object');
    expect(state.constructor).toEqual({}.constructor);
  });

  test('Map returns same type', () => {
    const state = observable(new Map());
    expect(state instanceof Map).toEqual(true);
  });

  //test('Set returns same type', () => {
  //  const state = observable(new Set());
  //  expect(state instanceof Set).toEqual(true);
  //});

  test('Throws error on null', () => {
    expect(() => {
      const state = observable(null as any);
    }).toThrow(Error);
  });

  test('Throws error on boolean', () => {
    expect(() => {
      const state = observable(true as any);
    }).toThrow(Error);
  });

  test('Throws error on string', () => {
    expect(() => {
      const state = observable('test' as any);
    }).toThrow(Error);
  });

  test('Throws error on number', () => {
    expect(() => {
      const state = observable(1 as any);
    }).toThrow(Error);
  });

  test('Throws error on class instance', () => {
    class CustomClass {constructor(){}};
    expect(() => {
      const state = observable(new CustomClass as any);
    }).toThrow(Error);
  });

});

describe('ObservableArray type', () => {

  test('Triggers deferred change callback when adding element using index equal to length', () => {
    const state = observableArray([]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([]);
    state[0] = 'test';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual(['test']);
  });

  test('Triggers deferred change callback when adding element using index greater to length', () => {
    const state = observableArray([]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([]);
    state[1] = 'test';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([undefined, 'test']);
  });

  test('Array.length (lengthening) triggers deferred change callback', () => {
    const state = observableArray([]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    state.length = 1;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([undefined]);
  });

  test('Array.length (shortening) triggers deferred change callback', () => {
    const state = observableArray(['test']);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    state.length = 0;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([]);
  });

  test('Array.push triggers deferred change callback', () => {
    const state = observableArray([]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([]);
    state.push('test');
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual(['test']);
  });

  test('Array.pop triggers deferred change callback', () => {
    const state = observableArray([1, 2]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 2]);
    state.pop();
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([1]);
  });

  test('Array.shift triggers deferred change callback', () => {
    const state = observableArray([1, 2]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 2]);
    state.shift();
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([2]);
  });

  test('Array.unshift triggers deferred change callback', () => {
    const state = observableArray([2]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([2]);
    state.unshift(1);
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([1, 2]);
  });

  test('Array.splice triggers deferred change callback ', () => {
    const state = observableArray([1, 3]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 3]);
    state.splice(1, 0, 2);
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([1, 2, 3]);
  });

  test('Array.reverse triggers deferred change callback ', () => {
    const state = observableArray([1, 2, 3]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 2, 3]);
    state.reverse(1, 2, 3);
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([3, 2, 1]);
  });

  test('Object.assign triggers deferred change callback', () => {
    const state = observableArray([1, 2]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 2]);
    Object.assign(state, {
      0: 3,
      1: 4,
    });
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([3, 4]);
  });

  test('Deleting existing key triggers deferred change callback', () => {
    const state = observableArray([1, 2]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    delete state[0];
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual([undefined, 2]);
  });

  test('Deleting non-existent key does not trigger deferred change callback', () => {
    const state = observableArray([1]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    delete state[1];
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).not.toBeCalled();
  });

  test('Multiple change callbacks on the same observable are triggered', () => {
    const state = observableArray([]);
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    on(state, ObservableEvents.change, callback1);
    on(state, ObservableEvents.change, callback2);
    state[0] = 'test';
    expect(callback1).not.toBeCalled();
    expect(callback2).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test('Deferred change callbacks triggered when reobserved', () => {
    const state = observableArray([]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    state[0] = 'test';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual(['test']);
    off(state, ObservableEvents.change, callback);
    state[0] = 'test2';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual(['test2']);
    on(state, ObservableEvents.change, callback);
    state[0] = 'test3';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(state).toEqual(['test3']);
  });

  test('Triggers correct deferred change callbacks when unobserved', () => {
    const state = observableArray([]);
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    on(state, ObservableEvents.change, callback1);
    on(state, ObservableEvents.change, callback2);
    state[0] = 'test';
    expect(callback1).not.toBeCalled();
    expect(callback2).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    off(state, ObservableEvents.change, callback2);
    state[0] = 'test2';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test('Triggers deferred destroy callback', () => {
    const state = observableArray([]);
    const destroyCallback = jest.fn();
    on(state, ObservableEvents.destroy, destroyCallback);
    expect(destroyCallback).not.toBeCalled();
    destroy(state);
    expect(destroyCallback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });

  test('Triggers deferred destroy callback only once', () => {
    const state = observableArray([]);
    const destroyCallback = jest.fn();
    on(state, ObservableEvents.destroy, destroyCallback);
    expect(destroyCallback).not.toBeCalled();
    destroy(state);
    expect(destroyCallback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
    destroy(state);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });

  test('Triggers change callback before destroy callback when change callback is added before destroy callback', () => {
    const state = observableArray([]);
    const changeCallback = jest.fn();
    const destroyCallback = jest.fn();
    on(state, ObservableEvents.change, changeCallback);
    on(state, ObservableEvents.destroy, destroyCallback);
    state[0] = 'test';
    expect(changeCallback).not.toBeCalled();
    expect(destroyCallback).not.toBeCalled();
    destroy(state);
    expect(changeCallback).not.toBeCalled();
    expect(destroyCallback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(changeCallback).toHaveBeenCalledTimes(1);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });

  test('Throws error when trying to assign to self', () => {
    const state = observableArray([]);
    expect(() => {
      state[0] = state;
    }).toThrow(Error);
  });

});

describe('ObservableObject type', () => {

  test('Triggers deferred change callback when adding key', () => {
    const state = observableObject({});
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual({});
    state.test = 'test';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual({test: 'test'});
  });

  test('Triggers deferred change callback when modifying key', () => {
    const state = observableObject({test: 'test'});
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual({test: 'test'});
    state.test = 'test2';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual({test: 'test2'});
  });

  test('Triggers deferred change callback when deleting existing key', () => {
    const state = observableObject({test: 'test'});
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual({test: 'test'});
    delete state.test;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual({});
  });

  test('No deferred change callback when deleting non-existent key', () => {
    const state = observableObject({});
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    delete state.test;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).not.toBeCalled();
  });

  test('Triggers deferred change callback with Object.assign', () => {
    const state = observableObject({test: 'test'});
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual({test: 'test'});
    Object.assign(state, {test: 'test2'});
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual({test: 'test2'});
  });

  test('Triggers multiple deferred change callbacks', () => {
    const state = observableObject({});
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    on(state, ObservableEvents.change, callback1);
    on(state, ObservableEvents.change, callback2);
    state.test = 'test';
    expect(callback1).not.toBeCalled();
    expect(callback2).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(state).toEqual({test: 'test'});
  });

  test('Triggers deferred change callback when reobserved', () => {
    const state = observableObject({});
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    state.test = 'test';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual({test: 'test'});
    off(state, ObservableEvents.change, callback);
    state.test = 'test2';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state).toEqual({test: 'test2'});
    on(state, ObservableEvents.change, callback);
    state.test = 'test3';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(state).toEqual({test: 'test3'});
  });

  test('Triggers correct deferred change callbacks when unobserved', () => {
    const state = observableObject({});
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    on(state, ObservableEvents.change, callback1);
    on(state, ObservableEvents.change, callback2);
    state.test = 'test';
    expect(callback1).not.toBeCalled();
    expect(callback2).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    off(state, ObservableEvents.change, callback2);
    state.test = 'test2';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test('Triggers deferred destroy callback', () => {
    const state = observableObject({});
    const destroyCallback = jest.fn();
    on(state, ObservableEvents.destroy, destroyCallback);
    expect(destroyCallback).not.toBeCalled();
    destroy(state);
    expect(destroyCallback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });

  test('Triggers deferred destroy callback only once', () => {
    const state = observableObject({});
    const destroyCallback = jest.fn();
    on(state, ObservableEvents.destroy, destroyCallback);
    expect(destroyCallback).not.toBeCalled();
    destroy(state);
    expect(destroyCallback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
    destroy(state);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });

  test('Triggers change callback before destroy callback when change callback is added before destroy callback', () => {
    const state = observableObject({});
    const changeCallback = jest.fn();
    const destroyCallback = jest.fn();
    on(state, ObservableEvents.change, changeCallback);
    on(state, ObservableEvents.destroy, destroyCallback);
    state.test = 'test';
    expect(changeCallback).not.toBeCalled();
    expect(destroyCallback).not.toBeCalled();
    destroy(state);
    expect(changeCallback).not.toBeCalled();
    expect(destroyCallback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(changeCallback).toHaveBeenCalledTimes(1);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });

  test('Throws error when trying to assign to self', () => {
    const state = observableObject({});
    expect(() => {
      state.state = state;
    }).toThrow(Error);
  });

});

describe('ObservableMap type', () => {

  test('Triggers deferred change callback with Map.set with different value', () => {
    const state = observableMap(new Map());
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state.size).toEqual(0);
    state.set('test', 'test');
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.size).toEqual(1);
    expect(state.has('test')).toEqual(true);
  });

  test('No deferred change callback with Map.set with same value', () => {
    const state = observableMap(new Map([
      ['test', 'test']
    ]));
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    state.set('test', 'test');
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).not.toBeCalled();
  });

  test('Triggers deferred change callback with Map.delete with existing key', () => {
    const state = observableMap(new Map([
      ['test', 'test']
    ]));
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state.size).toEqual(1);
    state.delete('test');
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.size).toEqual(0);
  });

  test('No deferred change callback with Map.delete with non-existent key', () => {
    const state = observableMap(new Map());
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state.size).toEqual(0);
    state.delete('test');
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).not.toBeCalled();
  });

  test('Triggers deferred change callback with Map.clear when Map.size > 0', () => {
    const state = observableMap(new Map([
      [1, 1]
    ]));
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(state.size).toEqual(1);
    state.clear();
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.size).toEqual(0);
  });

  test('No deferred change callback with Map.clear when Map.size is 0', () => {
    const state = observableMap(new Map());
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    state.clear();
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).not.toBeCalled();
  });

  test('Throws error when trying to assign to self', () => {
    const state = observableMap(new Map());
    expect(() => {
      state.set('state', state);
    }).toThrow(Error);
  });

});

describe('on() and off()', () => {

  test('Adding a new listener returns true', () => {
    const state = observable({});
    const callback = jest.fn();
    expect(on(state, ObservableEvents.change, callback)).toEqual(true);
  });

  test('Adding an exisiting listener returns false', () => {
    const state = observable({});
    const callback = jest.fn();
    expect(on(state, ObservableEvents.change, callback)).toEqual(true);
    expect(on(state, ObservableEvents.change, callback)).toEqual(false);
  });

  test('Removing an existing listener returns true', () => {
    const state = observable({});
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(off(state, ObservableEvents.change, callback)).toEqual(true);
  });

  test('Removing a non-existent listener returns false', () => {
    const state = observable({});
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(off(state, ObservableEvents.change, callback)).toEqual(true);
    expect(off(state, ObservableEvents.change, callback)).toEqual(false);
  });

  test('Removing a listener from a non-observable returns false', () => {
    const state = {};
    const callback = jest.fn();
    expect(off(state, ObservableEvents.change, callback)).toEqual(false);
  });

});

describe('Nested callbacks', () => {

  test('array with nested observable types triggers change callbacks', () => {
    const state = observableArray([
      [],
      {},
      new Map
    ]);
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(callback).not.toBeCalled();
    state[0][0] = 'test';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    state[1].test = 'test';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(2);
    state[2].set('test', 'test');
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('object with nested observable types triggers change callbacks', () => {
    const state = observableObject({
      arr: [],
      obj: {},
      map: new Map
    });
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(callback).not.toBeCalled();
    state.arr[0] = 'test';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    state.obj.test = 'test';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(2);
    state.map.set('test', 'test');
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('map with nested observable types triggers change callbacks', () => {
    const state = observableMap(new Map<any, any>([
      [1, []],
      [2, {}],
      [3, new Map],
    ]));
    const callback = jest.fn();
    on(state, ObservableEvents.change, callback);
    expect(callback).not.toBeCalled();
    state.get(1)[0] = 'test';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    state.get(2).test = 'test';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(2);
    state.get(3).set('test', 'test');
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(3);
  });

});