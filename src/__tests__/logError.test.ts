import { logError } from '../utils/logError';

describe('logError', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('logs Error instances with context and message', () => {
    logError('TestContext', new Error('something broke'));
    expect(warnSpy).toHaveBeenCalledWith('[TestContext] something broke');
  });

  it('logs non-Error values as strings', () => {
    logError('TestContext', 'plain string error');
    expect(warnSpy).toHaveBeenCalledWith('[TestContext] plain string error');
  });

  it('logs numbers', () => {
    logError('TestContext', 404);
    expect(warnSpy).toHaveBeenCalledWith('[TestContext] 404');
  });
});
