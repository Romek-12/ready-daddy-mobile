import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNameDrawStorage } from '../hooks/useNameDrawStorage';
import { NAME_DRAW_STORAGE_KEY } from '../constants';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('useNameDrawStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns default empty state on first load', async () => {
    const { result } = renderHook(() => useNameDrawStorage());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.names.mama).toEqual(['', '', '', '', '']);
    expect(result.current.names.tata).toEqual(['', '', '', '', '']);
    expect(result.current.lastResult).toBeNull();
    expect(result.current.nextSlot).toBe(1);
  });

  it('persists setName after debounce', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useNameDrawStorage());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setName('mama', 0, 'Anna');
    });
    expect(result.current.names.mama[0]).toBe('Anna');

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    const raw = await AsyncStorage.getItem(NAME_DRAW_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.mamaNames[0]).toBe('Anna');
    jest.useRealTimers();
  });

  it('setLastResult persists immediately', async () => {
    const { result } = renderHook(() => useNameDrawStorage());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setLastResult('Jakub');
    });
    expect(result.current.lastResult).toBe('Jakub');

    const raw = await AsyncStorage.getItem(NAME_DRAW_STORAGE_KEY);
    const parsed = JSON.parse(raw!);
    expect(parsed.lastResult).toBe('Jakub');
  });

  it('clearLastResult sets it to null', async () => {
    const { result } = renderHook(() => useNameDrawStorage());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setLastResult('Jakub');
    });
    await act(async () => {
      result.current.clearLastResult();
    });
    expect(result.current.lastResult).toBeNull();
  });

  it('advanceSlot toggles 1 <-> 2', async () => {
    const { result } = renderHook(() => useNameDrawStorage());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.nextSlot).toBe(1);

    await act(async () => {
      result.current.advanceSlot();
    });
    expect(result.current.nextSlot).toBe(2);

    await act(async () => {
      result.current.advanceSlot();
    });
    expect(result.current.nextSlot).toBe(1);
  });
});
