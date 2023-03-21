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

  test('Throws error when observables are nested', done => {
    const state1 = observable(createState());
    expect(() => {
      const state2 = observable({
        state: state1
      });
    }).toThrow(Error);
    done();
  });

});

describe('observe()', () => {

  test('triggers deferred callback when adding object key', done => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    state.string2 = 'test2';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string2).toEqual('test2');
    done();
  });

  test('triggers deferred callback when modifying object key', done => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    expect(state.boolean).toEqual(true);
    state.boolean = false;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.boolean).toEqual(false);
    done();
  });

  test('triggers deferred callback when deleting object key', done => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    delete state.string;
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.string).toEqual(undefined);
    done();
  });

  test('triggers deferred callback when modifying mutliple object keys', done => {
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
    done();
  });

  test('triggers deferred callback when modifying object using Object.assign()', done => {
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
    done();
  });

  test('triggers deferred callback when modifying array using pop', done => {
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
    done();
  });

  test('triggers deferred callback when modifying array using push', done => {
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
    done();
  });

  test('triggers deferred callback when modifying array using index', done => {
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
    done();
  });

  test('triggers deferred callback when modifying array using length', done => {
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
    done();
  });

  test('triggers deferred callback when modifying nested array', done => {
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
    done();
  });

  test('triggers deferred callback when modifying nested object', done => {
    const callback = jest.fn();
    const state = observable(createState());
    observe(state, callback);
    expect(state.array).toEqual([1, 2, 3]);
    state.object.string2 = 'test2';
    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(global.FRAME_TIME);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(state.object.string2).toEqual('test2');
    done();
  });

  test('triggers deferred callback for multiple observers', done => {
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
    done();
  });

  test('When trying to observe a non-observable returns false', done => {
    const obj1 = createState();
    expect(observe(obj1, ()=>{})).toEqual(false);
    done();
  });

});

describe('unobserve()', () => {

  test('No callback when object is unobserved', done => {
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
    done();
  });

  test('After destroying a non-observable returns false', done => {
    const state1 = destroy(observable(createState()));
    expect(unobserve(state1 as any, ()=>{})).toEqual(false);
    done();
  });

  test('When trying to unobserve a non-observable returns false w', done => {
    const obj1 = createState();
    expect(unobserve(obj1, ()=>{})).toEqual(false);
    done();
  });


});

describe('destroy()', () => {

  test('When destroying an observable retuns true', done => {
    const state1 = observable(createState());
    expect(destroy(state1)).toEqual(true);
    done();
  });

  test('When destroying a non-observable returns false', done => {
    const state1 = destroy(observable(createState()));
    expect(observe(state1 as any, ()=>{})).toEqual(false);
    done();
  });

  test('Destroying an non-observable multiple times returns false', done => {
    const state1 = destroy(observable(createState()));
    expect(destroy(state1 as any)).toEqual(false);
    done();
  });

  test('When trying to destroy a non-observable returns false', done => {
    const obj1 = createState();
    expect(destroy(obj1)).toEqual(false);
    done();
  });

});