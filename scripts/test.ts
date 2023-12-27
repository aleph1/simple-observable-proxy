import { observable, on, off, observe, unobserve, destroy, Observable, ObservableEvents } from '../src/index';

function createState(): Observable {
  return {
    array: [1, 2, 3],
    boolean: true,
    number: 0,
    object: {
      string: 'test'
    },
    string: 'test'
  };
}

describe('observable()', () => {

  test('Observable from plain object', () => {
    const state = observable(createState());
    expect(state.array).toEqual([1, 2, 3]);
    expect(state.boolean).toEqual(true);
    expect(state.number).toEqual(0);
    expect(state.object).toEqual({
      string: 'test'
    });
    expect(state.string).toEqual('test');
  });

  test('Observable from array', () => {
    const state = observable([1, 2, 3]);
    expect(state).toEqual([1, 2, 3]);
  });

  test('Observable from sparse array', () => {
    const state = observable([1, , 3]);
    expect(state.length).toEqual(3);
    expect(state[0]).toEqual(1);
    expect(state[1]).toEqual(undefined);
    expect(state[2]).toEqual(3);
  });

  test('Throws error when passed boolean', () => {
    expect(() => {
      const state = observable(false as any);
    }).toThrow(Error);
  });

  test('Throws error when passed string', () => {
    expect(() => {
      const state = observable('test' as any);
    }).toThrow(Error);
  });

  test('Throws error when passed number', () => {
    expect(() => {
      const state = observable(1 as any);
    }).toThrow(Error);
  });

  test('Throws error when passed null', () => {
    expect(() => {
      const state = observable(null as any);
    }).toThrow(Error);
  });

  test('Throws error when passed undefined', () => {
    expect(() => {
      const state = observable(undefined as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of built-in class', () => {
    expect(() => {
      const state = observable(new Date() as any);
    }).toThrow(Error);
  });

  test('Throws error when passed instance of custom class', () => {
    class CustomClass {constructor(){}};
    expect(() => {
      const state = observable(new CustomClass() as any);
    }).toThrow(Error);
  });

  test('Throws error when object is already observable', () => {
    const state = observable({});
    console.log(state);
    expect(() => {
      const state2 = observable(state);
    }).toThrow(Error);
  });

  test('Throws error when observables are nested', () => {
    const state1 = observable(createState());
    expect(() => {
      const state2 = observable({
        state: state1
      });
    }).toThrow(Error);
  });

  test('Throws error when attempting to set property as observable', () => {
    const state1 = observable({});
    const state2 = observable({});
    expect(() => {
      state1.test = state2;
    }).toThrow(Error);
  });

});

describe('observe()', () => {

  test('Triggers deferred callback when adding object key', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    state.string2 = 'test2';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string2).toEqual('test2');
  });

  test('Triggers deferred callback when modifying object key', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    expect(state.boolean).toEqual(true);
    state.boolean = false;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.boolean).toEqual(false);
  });

  test('Triggers deferred callback when deleting object key', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    delete state.string;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string).toEqual(undefined);
  });

  test('Does not trigger deferred callback when deleting non-existent key', () => {
    const callback = jest.fn();
    const state = observable({});
    observe(state, callback);
    delete state.test;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).not.toBeCalled();
  });

  test('Triggers deferred callback when modifying mutliple object keys', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    state.boolean = false;
    state.number = 1;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.boolean).toEqual(false);
    expect(state.number).toEqual(1);
  });

  test('Triggers deferred callback when modifying object using Object.assign()', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    Object.assign(state, {
      boolean: false,
      number: 1
    });
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.boolean).toEqual(false);
    expect(state.number).toEqual(1);
  });

  test('Triggers deferred callback when modifying array using pop', () => {
    const callback = jest.fn();
    const state = observable([1, 2, 3]);
    observe(state, callback);
    expect(state).toEqual([1, 2, 3]);
    state.pop();
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.length).toEqual(2);
    expect(state).toEqual([1, 2]);
  });

  test('Triggers deferred callback when modifying array using push', () => {
    const callback = jest.fn();
    const state = observable([1, 2, 3]);
    observe(state, callback);
    expect(state).toEqual([1, 2, 3]);
    state.push(4);
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.length).toEqual(4);
    expect(state).toEqual([1, 2, 3, 4]);
  });

  test('Triggers deferred callback when modifying array using index', () => {
    const callback = jest.fn();
    const state = observable([1, 2, 3]);
    observe(state, callback);
    expect(state).toEqual([1, 2, 3]);
    state[0] = 0;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.length).toEqual(3);
    expect(state).toEqual([0, 2, 3]);
  });

  test('Triggers deferred callback when modifying array using length', () => {
    const callback = jest.fn();
    const state = observable([1, 2, 3]);
    observe(state, callback);
    expect(state).toEqual([1, 2, 3]);
    state.length = 1;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.length).toEqual(1);
    expect(state).toEqual([1]);
  });

  test('Triggers deferred callback when modifying nested array', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    expect(state.array).toEqual([1, 2, 3]);
    state.array.push(4);
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.array.length).toEqual(4);
    expect(state.array).toEqual([1, 2, 3, 4]);
  });

  test('Triggers deferred callback when modifying nested object', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    expect(state.array).toEqual([1, 2, 3]);
    state.object.string2 = 'test2';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.object.string2).toEqual('test2');
  });

  test('Triggers deferred callback for multiple observers', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const state = observable(createState());
    observe(state, callback1);
    observe(state, callback2);
    state.string = 'test2';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(state.string).toEqual('test2');
  });

  test('When trying to observe a non-observable returns false', () => {
    const obj1 = createState();
    expect(observe(obj1, ()=>{})).toEqual(false);
  });

});

describe('on()', () => {

  test('Triggers deferred callback when adding object key', () => {
    const callback = jest.fn();
    const state = observable(createState());
    on(state, ObservableEvents.change, callback);
    state.string2 = 'test2';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string2).toEqual('test2');
  });

  test('Triggers deferred callback when modifying object key', () => {
    const callback = jest.fn();
    const state = observable(createState());
    on(state, ObservableEvents.change, callback);
    expect(state.boolean).toEqual(true);
    state.boolean = false;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.boolean).toEqual(false);
  });

  test('Triggers deferred callback when deleting object key', () => {
    const callback = jest.fn();
    const state = observable(createState());
    on(state, ObservableEvents.change, callback);
    delete state.string;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string).toEqual(undefined);
  });

  test('Triggers deferred callback when modifying mutliple object keys', () => {
    const callback = jest.fn();
    const state = observable(createState());
    on(state, ObservableEvents.change, callback);
    state.boolean = false;
    state.number = 1;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.boolean).toEqual(false);
    expect(state.number).toEqual(1);
  });

  test('Triggers deferred callback when modifying object using Object.assign()', () => {
    const callback = jest.fn();
    const state = observable(createState());
    on(state, ObservableEvents.change, callback);
    Object.assign(state, {
      boolean: false,
      number: 1
    });
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.boolean).toEqual(false);
    expect(state.number).toEqual(1);
  });

  test('Triggers deferred callback when modifying array using pop', () => {
    const callback = jest.fn();
    const state = observable([1, 2, 3]);
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 2, 3]);
    state.pop();
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.length).toEqual(2);
    expect(state).toEqual([1, 2]);
  });

  test('Triggers deferred callback when modifying array using push', () => {
    const callback = jest.fn();
    const state = observable([1, 2, 3]);
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 2, 3]);
    state.push(4);
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.length).toEqual(4);
    expect(state).toEqual([1, 2, 3, 4]);
  });

  test('Triggers deferred callback when modifying array using index', () => {
    const callback = jest.fn();
    const state = observable([1, 2, 3]);
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 2, 3]);
    state[0] = 0;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.length).toEqual(3);
    expect(state).toEqual([0, 2, 3]);
  });

  test('Triggers deferred callback when modifying array using length', () => {
    const callback = jest.fn();
    const state = observable([1, 2, 3]);
    on(state, ObservableEvents.change, callback);
    expect(state).toEqual([1, 2, 3]);
    state.length = 1;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.length).toEqual(1);
    expect(state).toEqual([1]);
  });

  test('Triggers deferred callback when modifying nested array', () => {
    const callback = jest.fn();
    const state = observable(createState());
    on(state, ObservableEvents.change, callback);
    expect(state.array).toEqual([1, 2, 3]);
    state.array.push(4);
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.array.length).toEqual(4);
    expect(state.array).toEqual([1, 2, 3, 4]);
  });

  test('Triggers deferred callback when modifying nested object', () => {
    const callback = jest.fn();
    const state = observable(createState());
    on(state, ObservableEvents.change, callback);
    expect(state.array).toEqual([1, 2, 3]);
    state.object.string2 = 'test2';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.object.string2).toEqual('test2');
  });

  test('Triggers deferred callback when reobserved', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    state.string = 'test2';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string).toEqual('test2');
    unobserve(state, callback);
    state.string = 'test3';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string).toEqual('test3');
    observe(state, callback);
    state.string = 'test4';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(state.string).toEqual('test4');
  });

});

describe('unobserve()', () => {

  test('No callback when object is unobserved', () => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    state.string = 'test2';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(state.string).toEqual('test2');
    expect(callback).toHaveBeenCalledTimes(1);
    unobserve(state, callback);
    state.string = 'test3';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string).toEqual('test3');
  });

  test('After destroying a non-observable returns false', () => {
    const state1 = destroy(observable(createState()));
    expect(unobserve(state1 as any, ()=>{})).toEqual(false);
  });

  test('When trying to unobserve a non-observable returns false w', () => {
    const obj1 = createState();
    expect(unobserve(obj1, ()=>{})).toEqual(false);
  });

});

describe('destroy()', () => {

  test('When destroying an observable retuns true', () => {
    const state1 = observable(createState());
    expect(destroy(state1)).toEqual(true);
  });

  test('When destroying a non-observable returns false', () => {
    const state1 = destroy(observable(createState()));
    expect(observe(state1 as any, ()=>{})).toEqual(false);
  });

  test('Destroying an non-observable multiple times returns false', () => {
    const state1 = destroy(observable(createState()));
    expect(destroy(state1 as any)).toEqual(false);
  });

  test('When trying to destroy a non-observable returns false', () => {
    const state1 = createState();
    expect(destroy(state1)).toEqual(false);
  });

  test('Destroying removes all observers', () => {
    const state = observable({});
    const changeCallback = jest.fn();
    const destroyCallback = jest.fn();
    on(state, ObservableEvents.change, changeCallback);
    on(state, ObservableEvents.destroy, destroyCallback);
    state.test = 'test';
    expect(changeCallback).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(changeCallback).toHaveBeenCalledTimes(1);
    destroy(state);
    expect(destroyCallback).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
    state.test = 'test2';
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(changeCallback).toHaveBeenCalledTimes(1);
    destroy(state);
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });

});