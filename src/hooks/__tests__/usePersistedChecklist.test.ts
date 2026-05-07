import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersistedChecklist } from '../usePersistedChecklist';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(() => AsyncStorage.clear());

describe('usePersistedChecklist', () => {
  it('migrates legacy boolean state to object form', async () => {
    await AsyncStorage.setItem('checklist_test', JSON.stringify({ a: true, b: false }));
    const { result } = renderHook(() => usePersistedChecklist('test'));
    await waitFor(() => expect(result.current.checked.a).toBe(true));
    expect(result.current.checked.a).toBe(true);
    expect(result.current.checked.b).toBe(false);
    expect(result.current.getMeta('a')).toBeUndefined();
  });

  it('toggleCheck flips state and clears meta on uncheck', async () => {
    const { result } = renderHook(() => usePersistedChecklist('test'));
    await act(async () => { result.current.setCheckedWithMeta('x', true, { calendarEventId: 'evt-1', journalEntryId: 'j-1' }); });
    expect(result.current.checked.x).toBe(true);
    expect(result.current.getMeta('x')).toEqual({ calendarEventId: 'evt-1', journalEntryId: 'j-1' });
    await act(async () => { result.current.toggleCheck('x'); });
    expect(result.current.checked.x).toBe(false);
    expect(result.current.getMeta('x')).toBeUndefined();
  });

  it('persists meta across reload', async () => {
    const { result, unmount } = renderHook(() => usePersistedChecklist('test'));
    await act(async () => { result.current.setCheckedWithMeta('y', true, { calendarEventId: 'evt-2' }); });
    unmount();
    const { result: result2 } = renderHook(() => usePersistedChecklist('test'));
    await waitFor(() => expect(result2.current.checked.y).toBe(true));
    expect(result2.current.getMeta('y')).toEqual({ calendarEventId: 'evt-2' });
  });

  it('returns undefined meta for unknown key', () => {
    const { result } = renderHook(() => usePersistedChecklist('test'));
    expect(result.current.getMeta('nonexistent')).toBeUndefined();
  });
});
