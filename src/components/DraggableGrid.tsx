import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export interface DraggableGridProps<T> {
  data: T[];
  numColumns?: number;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, isActive: boolean) => React.ReactNode;
  onReorder: (newData: T[]) => void;
  itemHeight: number;
  gap?: number;
}

function reorderArr(order: number[], from: number, to: number): number[] {
  const next = [...order];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

// Single draggable cell — hooks at top level, no conditions
function DraggableCell({
  children,
  itemWidth,
  itemHeight,
  gap,
  numColumns,
  index,
  orderRef,
  activeIndexRef,
  allX,
  allY,
  onReorder,
  onDragEnd,
}: {
  children: React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  gap: number;
  numColumns: number;
  index: number;
  orderRef: React.MutableRefObject<number[]>;
  activeIndexRef: React.MutableRefObject<number>;
  allX: ReturnType<typeof useSharedValue<number>>[];
  allY: ReturnType<typeof useSharedValue<number>>[];
  onReorder: (newOrder: number[]) => void;
  onDragEnd: () => void;
}) {
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [isActive, setIsActive] = useState(false);

  const getPos = useCallback((position: number) => ({
    x: (position % numColumns) * (itemWidth + gap),
    y: Math.floor(position / numColumns) * (itemHeight + gap),
  }), [numColumns, itemWidth, itemHeight, gap]);

  const longPress = Gesture.LongPress().minDuration(250).onStart(() => {
    'worklet';
    runOnJS(setIsActive)(true);
    activeIndexRef.current = index;
    scale.value = withSpring(1.08, { damping: 14 });
    zIndex.value = 100;
    opacity.value = withTiming(0.88);
  });

  const pan = Gesture.Pan().activateAfterLongPress(250)
    .onUpdate((e) => {
      'worklet';
      const pos = getPos(orderRef.current.indexOf(index));
      allX[index].value = pos.x + e.translationX;
      allY[index].value = pos.y + e.translationY;

      const cx = allX[index].value + itemWidth / 2;
      const cy = allY[index].value + itemHeight / 2;
      const col = Math.max(0, Math.min(numColumns - 1, Math.floor(cx / (itemWidth + gap))));
      const maxRow = Math.ceil(orderRef.current.length / numColumns) - 1;
      const row = Math.max(0, Math.min(maxRow, Math.floor(cy / (itemHeight + gap))));
      const hovered = Math.min(orderRef.current.length - 1, row * numColumns + col);
      const current = orderRef.current.indexOf(index);
      if (hovered !== current) {
        runOnJS(onReorder)(reorderArr(orderRef.current, current, hovered));
      }
    })
    .onEnd(() => {
      'worklet';
      runOnJS(setIsActive)(false);
      activeIndexRef.current = -1;
      scale.value = withSpring(1);
      zIndex.value = 1;
      opacity.value = withTiming(1);
      const finalPos = getPos(orderRef.current.indexOf(index));
      allX[index].value = withSpring(finalPos.x, { damping: 20 });
      allY[index].value = withSpring(finalPos.y, { damping: 20 });
      runOnJS(onDragEnd)();
    });

  const composed = Gesture.Simultaneous(longPress, pan);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: allX[index].value },
      { translateY: allY[index].value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.cell, { width: itemWidth, height: itemHeight }, animStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

// Fixed-length pool of shared values — we support up to MAX_ITEMS
const MAX_ITEMS = 20;

export default function DraggableGrid<T>({
  data,
  numColumns = 2,
  keyExtractor,
  renderItem,
  onReorder,
  itemHeight,
  gap = 8,
}: DraggableGridProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);

  const itemWidth = containerWidth > 0
    ? (containerWidth - gap * (numColumns - 1)) / numColumns
    : 0;

  const getPos = useCallback((position: number, iw: number) => ({
    x: (position % numColumns) * (iw + gap),
    y: Math.floor(position / numColumns) * (itemHeight + gap),
  }), [numColumns, itemHeight, gap]);

  // Fixed pool of MAX_ITEMS shared values (hooks must be unconditional)
  /* eslint-disable react-hooks/rules-of-hooks */
  const allX = [
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
  ];
  const allY = [
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
    useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0),
  ];
  /* eslint-enable react-hooks/rules-of-hooks */

  const orderRef = useRef<number[]>(data.map((_, i) => i));
  const activeIndexRef = useRef(-1);
  const prevItemWidth = useRef(0);

  // Sync positions when containerWidth changes
  if (itemWidth > 0 && itemWidth !== prevItemWidth.current) {
    prevItemWidth.current = itemWidth;
    orderRef.current.forEach((originalIdx, position) => {
      const pos = getPos(position, itemWidth);
      allX[originalIdx].value = pos.x;
      allY[originalIdx].value = pos.y;
    });
  }

  const handleReorder = useCallback((newOrder: number[]) => {
    orderRef.current = newOrder;
    newOrder.forEach((originalIdx, position) => {
      if (originalIdx !== activeIndexRef.current) {
        const pos = getPos(position, itemWidth);
        allX[originalIdx].value = withSpring(pos.x, { damping: 20, stiffness: 200 });
        allY[originalIdx].value = withSpring(pos.y, { damping: 20, stiffness: 200 });
      }
    });
  }, [getPos, itemWidth, allX, allY]);

  const handleDragEnd = useCallback(() => {
    onReorder(orderRef.current.map(i => data[i]));
  }, [onReorder, data]);

  const numRows = Math.ceil(data.length / numColumns);
  const totalHeight = numRows * itemHeight + (numRows - 1) * gap;

  const onLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  if (containerWidth === 0 || itemWidth === 0) {
    return <View style={{ height: totalHeight }} onLayout={onLayout} />;
  }

  return (
    <View style={[styles.container, { height: totalHeight }]} onLayout={onLayout}>
      {data.slice(0, MAX_ITEMS).map((item, i) => (
        <DraggableCell
          key={keyExtractor(item)}
          index={i}
          itemWidth={itemWidth}
          itemHeight={itemHeight}
          gap={gap}
          numColumns={numColumns}
          orderRef={orderRef}
          activeIndexRef={activeIndexRef}
          allX={allX}
          allY={allY}
          onReorder={handleReorder}
          onDragEnd={handleDragEnd}
        >
          {renderItem(item, false)}
        </DraggableCell>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', width: '100%' },
  cell: { position: 'absolute' },
});
