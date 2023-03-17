global.FRAME_TIME = 16;

Object.defineProperty(window, 'navigator', {value: 'node'});
Object.defineProperty(window, 'userAgent', {value: 'node'});
Object.defineProperty(window, 'requestAnimationFrame', {value: (callback:any) =>{}});

jest.useFakeTimers();
const spiedRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
spiedRequestAnimationFrame.mockImplementation((callback: FrameRequestCallback): number => {
  return window.setTimeout(callback, global.FRAME_TIME);
});

afterAll(() => {
  spiedRequestAnimationFrame.mockRestore();
  jest.clearAllTimers();
});

export {};