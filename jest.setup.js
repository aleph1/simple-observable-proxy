// inject a basic window
global.FRAME_TIME = 16;
global.window = {
	navigator: "node",
	userAgent: "node",
	requestAnimationFrame() {}
};

jest.useFakeTimers();
jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
  setTimeout(cb, FRAME_TIME);
});

afterAll(() => {
  window.requestAnimationFrame.mockRestore();
  jest.clearAllTimers();
});