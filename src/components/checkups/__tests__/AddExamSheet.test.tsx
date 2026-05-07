import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddExamSheet from '../AddExamSheet';
import { ThemeProvider } from '../../../context/ThemeContext';

const wrap = (ui: React.ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

describe('AddExamSheet', () => {
  it('shows exam name and week as read-only', () => {
    const { getByText } = render(
      wrap(<AddExamSheet visible examName="USG genetyczne" week={12} onCancel={jest.fn()} onSubmit={jest.fn()} />),
    );
    expect(getByText('USG genetyczne')).toBeTruthy();
    expect(getByText(/Tydzień: 12/)).toBeTruthy();
  });

  it('calls onCancel when Anuluj pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      wrap(<AddExamSheet visible examName="USG" week={12} onCancel={onCancel} onSubmit={jest.fn()} />),
    );
    fireEvent.press(getByText('Anuluj'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onSubmit with default values (tomorrow 09:00, 60min) and empty optional fields', async () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      wrap(<AddExamSheet visible examName="USG" week={12} onCancel={jest.fn()} onSubmit={onSubmit} />),
    );
    fireEvent.press(getByText('Zapisz'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.start).toBeInstanceOf(Date);
    expect(payload.end).toBeInstanceOf(Date);
    expect(payload.end.getTime() - payload.start.getTime()).toBe(60 * 60 * 1000);
    expect(payload.start.getHours()).toBe(9);
    expect(payload.start.getMinutes()).toBe(0);
    expect(payload.doctor).toBeUndefined();
    expect(payload.location).toBeUndefined();
    expect(payload.notes).toBeUndefined();
  });

  it('resets state when reopened', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByText, rerender } = render(
      wrap(<AddExamSheet visible examName="USG" week={12} onCancel={jest.fn()} onSubmit={onSubmit} />),
    );
    fireEvent.changeText(getByPlaceholderText('Lekarz (opcjonalne)'), 'Dr Stale');
    rerender(wrap(<AddExamSheet visible={false} examName="USG" week={12} onCancel={jest.fn()} onSubmit={onSubmit} />));
    rerender(wrap(<AddExamSheet visible examName="USG" week={12} onCancel={jest.fn()} onSubmit={onSubmit} />));
    fireEvent.press(getByText('Zapisz'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].doctor).toBeUndefined();
  });

  it('passes optional fields when filled', async () => {
    const onSubmit = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      wrap(<AddExamSheet visible examName="USG" week={12} onCancel={jest.fn()} onSubmit={onSubmit} />),
    );
    fireEvent.changeText(getByPlaceholderText('Lekarz (opcjonalne)'), 'Dr Kowalska');
    fireEvent.changeText(getByPlaceholderText('Miejsce (opcjonalne)'), 'Klinika A');
    fireEvent.changeText(getByPlaceholderText('Notatka (opcjonalne)'), 'Na czczo');
    fireEvent.press(getByText('Zapisz'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.doctor).toBe('Dr Kowalska');
    expect(payload.location).toBe('Klinika A');
    expect(payload.notes).toBe('Na czczo');
  });

  it('uses defaultDate when provided (sets time to 09:00)', async () => {
    const onSubmit = jest.fn();
    const customDate = new Date(2026, 5, 15); // 15 June 2026
    const { getByText } = render(
      wrap(<AddExamSheet visible examName="USG" week={20} defaultDate={customDate} onCancel={jest.fn()} onSubmit={onSubmit} />),
    );
    fireEvent.press(getByText('Zapisz'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.start.getFullYear()).toBe(2026);
    expect(payload.start.getMonth()).toBe(5);
    expect(payload.start.getDate()).toBe(15);
    expect(payload.start.getHours()).toBe(9);
    expect(payload.start.getMinutes()).toBe(0);
  });

  it('renders editable name input when editableName=true', () => {
    const { getByPlaceholderText, queryByText } = render(
      wrap(<AddExamSheet visible examName="" week={20} editableName onCancel={jest.fn()} onSubmit={jest.fn()} />),
    );
    expect(getByPlaceholderText('Nazwa badania')).toBeTruthy();
    expect(queryByText('USG')).toBeNull();
  });

  it('disables Zapisz button when editableName=true and name is empty', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      wrap(<AddExamSheet visible examName="" week={20} editableName onCancel={jest.fn()} onSubmit={onSubmit} />),
    );
    fireEvent.press(getByText('Zapisz'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('enables Zapisz and submits with typed name when editableName=true', async () => {
    const onSubmit = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      wrap(<AddExamSheet visible examName="" week={20} editableName onCancel={jest.fn()} onSubmit={onSubmit} />),
    );
    fireEvent.changeText(getByPlaceholderText('Nazwa badania'), 'Morfologia');
    fireEvent.press(getByText('Zapisz'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.name).toBe('Morfologia');
  });
});
