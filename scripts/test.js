const { observe, unobserve } = require('../index.js');

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

test('Creates observable with plain object', () => {
  const state = observe(createState());
  expect(state.array).toEqual([1, 2, 3]);
  expect(state.boolean).toEqual(true);
  expect(state.number).toEqual(0);
  expect(state.object).toEqual({
    string: 'test'
  });
  expect(state.string).toEqual("test");
});

test('Modifies array by method with deferred callback', done => {
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

test('Modifies array by index with deferred callback', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  expect(state.array).toEqual([1, 2, 3]);
  state.array[0] = 0;
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.array.length).toEqual(3);
  expect(state.array).toEqual([0, 2, 3]);
  done();
});

test('Modifies boolean with deferred callback', done => {
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

test('Modifies number with deferred callback', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  expect(state.number).toEqual(0);
  state.number = 1;
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.number).toEqual(1);
  done();
});

test('Modifies string with deferred callback', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  expect(state.string).toEqual('test');
  state.string = 'test2';
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.string).toEqual('test2');
  done();
});

test('Modifies multiple values with deferred callback', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  expect(state.boolean).toEqual(true);
  expect(state.string).toEqual('test');
  state.boolean = false;
  state.string = 'test2';
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.boolean).toEqual(false);
  expect(state.string).toEqual('test2');
  done();
});

test('Adds value with deferred callback', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  state.string2 = 'test2';
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.string2).toEqual('test2');
  done();
});

test('Deletes value with deferred callback', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  delete state.string;
  expect(callback).not.toBeCalled();
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(state.string).toEqual(undefined);
  done();
});

test('Multiple callbacks on same observable', done => {
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

test('Should not receive notification after unobserve', done => {
  const callback = jest.fn();
  const state = observe(createState(), callback);
  unobserve(state, callback);
  state.string = 'test2';
  jest.advanceTimersByTime(FRAME_TIME);
  expect(callback).toHaveBeenCalledTimes(0);
  expect(state.string).toEqual('test2');
  done();
});

test('Should receive notifications after reobserve', done => {
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