import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CalendarMonthGrid from '../CalendarMonthGrid';
import { ThemeProvider } from '../../../context/ThemeContext';

const wrap = (ui: React.ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

describe('CalendarMonthGrid', () => {
  const noop = jest.fn();

  beforeEach(() => noop.mockClear());

  it('renders 42 day cells', () => {
    const { getAllByTestId } = render(
      wrap(<CalendarMonthGrid monthDate={new Date(2026, 4, 1)} selectedDate={null} entriesByDay={{}} onSelectDay={noop} />),
    );
    expect(getAllByTestId(/day-cell-/)).toHaveLength(42);
  });

  it('first cell is the Monday on or before the 1st (May 2026 → April 27)', () => {
    const { getByTestId } = render(
      wrap(<CalendarMonthGrid monthDate={new Date(2026, 4, 1)} selectedDate={null} entriesByDay={{}} onSelectDay={noop} />),
    );
    // May 1, 2026 is a Friday → Monday on or before is April 27
    expect(getByTestId('day-cell-2026-04-27')).toBeTruthy();
  });

  it('renders dot when entriesByDay[isoDate].length > 0', () => {
    const { getByTestId, queryByTestId } = render(
      wrap(<CalendarMonthGrid
        monthDate={new Date(2026, 4, 1)}
        selectedDate={null}
        entriesByDay={{ '2026-05-07': [{ id: 'e1' } as never] }}
        onSelectDay={noop}
      />),
    );
    expect(getByTestId('day-cell-2026-05-07-dot')).toBeTruthy();
    expect(queryByTestId('day-cell-2026-05-08-dot')).toBeNull();
  });

  it('renders week+day label when conceptionDate provided and date in range', () => {
    const { getByTestId } = render(
      wrap(<CalendarMonthGrid
        monthDate={new Date(2026, 4, 1)}
        selectedDate={null}
        entriesByDay={{}}
        conceptionDate="2026-01-01"
        onSelectDay={noop}
      />),
    );
    // 2026-05-07 is 126 days after conception, +14 offset = 140 days = 20 weeks exactly
    expect(getByTestId('day-cell-2026-05-07-weekday').props.children).toBe('20+0');
  });

  it('does not render week+day label when conceptionDate missing', () => {
    const { queryByTestId } = render(
      wrap(<CalendarMonthGrid monthDate={new Date(2026, 4, 1)} selectedDate={null} entriesByDay={{}} onSelectDay={noop} />),
    );
    expect(queryByTestId('day-cell-2026-05-07-weekday')).toBeNull();
  });

  it('calls onSelectDay with the cell date on press', () => {
    const onSelectDay = jest.fn();
    const { getByTestId } = render(
      wrap(<CalendarMonthGrid monthDate={new Date(2026, 4, 1)} selectedDate={null} entriesByDay={{}} onSelectDay={onSelectDay} />),
    );
    fireEvent.press(getByTestId('day-cell-2026-05-07'));
    expect(onSelectDay).toHaveBeenCalledTimes(1);
    const callArg = onSelectDay.mock.calls[0][0] as Date;
    expect(callArg.getFullYear()).toBe(2026);
    expect(callArg.getMonth()).toBe(4);
    expect(callArg.getDate()).toBe(7);
  });
});
