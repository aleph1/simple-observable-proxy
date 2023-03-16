declare global {
  var FRAME_TIME: number;
}

global.FRAME_TIME = 16;
Object.defineProperty(window, 'navigator', {value: 'node'});
Object.defineProperty(window, 'userAgent', {value: 'node'});
Object.defineProperty(window, 'requestAnimationFrame', {value: callback =>{}});

jest.useFakeTimers();
const spiedRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
spiedRequestAnimationFrame.mockImplementation((callback: FrameRequestCallback): number => {
  return window.setTimeout(callback, FRAME_TIME);
});

afterAll(() => {
  spiedRequestAnimationFrame.mockRestore();
  jest.clearAllTimers();
});

export {};