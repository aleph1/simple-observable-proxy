import { observe, unobserve, revoke } from '../index.js';

function createState() {
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

test('Creates observable from plain object', () => {
  const state = observe(createState());
  expect(state.array).toEqual([1, 2, 3]);
  expect(state.boolean).toEqual(true);
  expect(state.number).toEqual(0);
  expect(state.object).toEqual({
    string: 'test'
  });
  expect(state.string).toEqual("test");
});

test('Creates observable from array', () => {
  const state = observe([1, 2, 3]);
  expect(state).toEqual([1, 2, 3]);
});

test('Deferred callback when adding object key', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  state.string2 = 'test2';
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.string2).toEqual('test2');
  done();
});

test('Deferred callback when modifying object key', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  expect(state.boolean).toEqual(true);
  state.boolean = false;
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.boolean).toEqual(false);
  done();
});

test('Deferred callback when deleting object key', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  delete state.string;
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.string).toEqual(undefined);
  done();
});

test('Deferred callback when modifying mutliple object keys', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  state.boolean = false;
  state.number = 1;
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.boolean).toEqual(false);
  expect(state.number).toEqual(1);
  done();
});

test('Deferred callback when modifying array using pop', done => {
  const callback = jest.fn();
  const state = observe([1, 2, 3], callback);
  expect(state).toEqual([1, 2, 3]);
  state.pop();
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.length).toEqual(2);
  expect(state).toEqual([1, 2]);
  done();
});

test('Deferred callback when modifying array using push', done => {
  const callback = jest.fn();
  const state = observe([1, 2, 3], callback);
  expect(state).toEqual([1, 2, 3]);
  state.push(4);
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.length).toEqual(4);
  expect(state).toEqual([1, 2, 3, 4]);
  done();
});

test('Deferred callback when modifying array using index', done => {
  const callback = jest.fn();
  const state = observe([1, 2, 3], callback);
  expect(state).toEqual([1, 2, 3]);
  state[0] = 0;
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.length).toEqual(3);
  expect(state).toEqual([0, 2, 3]);
  done();
});

test('Deferred callback when modifying array using length', done => {
  const callback = jest.fn();
  const state = observe([1, 2, 3], callback);
  expect(state).toEqual([1, 2, 3]);
  state.length = 1;
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.length).toEqual(1);
  expect(state).toEqual([1]);
  done();
});

test('Deferred callback when modifying nested array', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  expect(state.array).toEqual([1, 2, 3]);
  state.array.push(4);
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.array.length).toEqual(4);
  expect(state.array).toEqual([1, 2, 3, 4]);
  done();
});

test('Deferred callback when modifying nested object', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  expect(state.array).toEqual([1, 2, 3]);
  state.object.string2 = 'test2';
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.object.string2).toEqual('test2');
  done();
});

//
//test('Modifies nested array by index with deferred callback', done => {
//  const callback = jest.fn();
//  const state = observe(createState(), callback);
//  expect(state.array).toEqual([1, 2, 3]);
//  state.array[0] = 0;
//  expect(callback).not.toBeCalled();
//  jest.advanceTimersByTime(FRAME_TIME);
//  expect(callback).toHaveBeenCalledTimes(1);
//  expect(state.array.length).toEqual(3);
//  expect(state.array).toEqual([0, 2, 3]);
//  done();
//});

test('Multiple deferred callbacks when modifying object', done => {
  const callback1 = jest.fn();
  const callback2 = jest.fn();
  const state = observe(createState(), callback1);
  observe(state, callback2);
  state.string = 'test2';
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback1).toHaveBeenCalledTimes(1);
  expect(callback2).toHaveBeenCalledTimes(1);
  expect(state.string).toEqual('test2');
  done();
});

test('No callback when object is unobserved', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  unobserve(state, callback);
  state.string = 'test2';
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(0);
  expect(state.string).toEqual('test2');
  done();
});

test('Deferred callback when object is reobserved', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  state.string = 'test2';
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.string).toEqual('test2');
  unobserve(state, callback);
  state.string = 'test3';
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.string).toEqual('test3');
  observe(state, callback);
  state.string = 'test4';
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(2);
  expect(state.string).toEqual('test4');
  done();
});

test('Error when observable has been revoked', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback, {
    revocable: true
  });
  revoke(state);
  expect(() => {
    state.string = 'test2';
  }).toThrow(TypeError);
  done();
});