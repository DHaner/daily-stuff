import * as React from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const TRACK_HEIGHT = 28;
const THUMB_SIZE = 28;

type ColorSliderProps = {
  /** 0–1 position of the thumb along the track. */
  value: number;
  onChange: (value: number) => void;
  /** Colors the track fades through, left to right. */
  stops: string[];
  /** Color shown inside the thumb. */
  thumbColor: string;
  accessibilityLabel: string;
};

/** Horizontal gradient slider; drag anywhere on the track to move the thumb. */
export function ColorSlider({
  value,
  onChange,
  stops,
  thumbColor,
  accessibilityLabel,
}: ColorSliderProps) {
  const [width, setWidth] = React.useState(0);
  // Gradient ids are global on web, so each slider needs its own.
  const gradientId = `track-${React.useId().replace(/:/g, '')}`;

  // The pan responder is created once, so it reads the latest props through refs.
  const widthRef = React.useRef(0);
  const onChangeRef = React.useRef(onChange);
  const startX = React.useRef(0);
  widthRef.current = width;
  onChangeRef.current = onChange;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Keep the drag even when a parent scroll view tries to take over.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        startX.current = event.nativeEvent.locationX;
        update(startX.current);
      },
      onPanResponderMove: (_event, gesture) => update(startX.current + gesture.dx),
    })
  ).current;

  function update(x: number) {
    if (widthRef.current <= 0) return;

    onChangeRef.current(Math.min(1, Math.max(0, x / widthRef.current)));
  }

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ height: THUMB_SIZE, justifyContent: 'center' }}
      {...panResponder.panHandlers}>
      {/* Children ignore touches so `locationX` is always relative to this container. */}
      <View pointerEvents="none">
        <Svg width="100%" height={TRACK_HEIGHT}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              {stops.map((color, index) => (
                <Stop key={index} offset={index / (stops.length - 1)} stopColor={color} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height={TRACK_HEIGHT}
            rx={TRACK_HEIGHT / 2}
            fill={`url(#${gradientId})`}
          />
        </Svg>

        <View
          style={{
            position: 'absolute',
            left: Math.min(width - THUMB_SIZE, Math.max(0, value * width - THUMB_SIZE / 2)),
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            borderWidth: 3,
            borderColor: '#ffffff',
            backgroundColor: thumbColor,
          }}
        />
      </View>
    </View>
  );
}
