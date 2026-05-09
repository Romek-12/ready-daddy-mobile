import React from 'react';
import { render } from '@testing-library/react-native';
import RingLoader from '../RingLoader';

describe('RingLoader', () => {
  it('renders without crashing at default size', () => {
    const { getByTestId } = render(<RingLoader testID="loader" />);
    expect(getByTestId('loader')).toBeTruthy();
  });

  it('renders with explicit size 20 (button-sized)', () => {
    const { getByTestId } = render(<RingLoader testID="loader" size={20} />);
    const root = getByTestId('loader');
    expect(root.props.style).toMatchObject([{ width: 20, height: 20 }, undefined]);
  });

  it('hides monogram automatically when size < 64', () => {
    const { queryByText } = render(<RingLoader size={20} showMonogram />);
    expect(queryByText('RD')).toBeNull();
  });

  it('shows monogram when size >= 64 and showMonogram=true', () => {
    const { getByText } = render(<RingLoader size={120} showMonogram />);
    expect(getByText('RD')).toBeTruthy();
  });

  it('hides monogram when showMonogram=false even for large size', () => {
    const { queryByText } = render(<RingLoader size={120} showMonogram={false} />);
    expect(queryByText('RD')).toBeNull();
  });

  it('uses 40 segments by default for large size', () => {
    const { UNSAFE_root } = render(<RingLoader size={120} testID="loader" />);
    const rects = UNSAFE_root.findAllByType('RNSVGRect');
    expect(rects.length).toBe(40);
  });

  it('uses 20 segments automatically for small size', () => {
    const { UNSAFE_root } = render(<RingLoader size={20} testID="loader" />);
    const rects = UNSAFE_root.findAllByType('RNSVGRect');
    expect(rects.length).toBe(20);
  });

  it('respects explicit segments prop over auto-mapping', () => {
    const { UNSAFE_root } = render(<RingLoader size={20} segments={10} testID="loader" />);
    const rects = UNSAFE_root.findAllByType('RNSVGRect');
    expect(rects.length).toBe(10);
  });

  it('accepts custom fromColor and toColor', () => {
    const { getByTestId } = render(
      <RingLoader testID="loader" fromColor="#FF0000" toColor="#00FF00" />,
    );
    expect(getByTestId('loader')).toBeTruthy();
  });
});
