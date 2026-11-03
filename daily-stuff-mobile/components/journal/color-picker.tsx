import { ColorSlider } from '@/components/journal/color-slider';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { RipplePressable } from '@/components/ui/ripple-pressable';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { hexToHsv, hsvToHex, type Hsv } from '@/lib/color';
import { LABEL_COLORS, isHexColor } from '@/lib/journal-colors';
import { cn } from '@/lib/utils';
import { CheckIcon, PipetteIcon } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

const HUE_STOPS = [0, 60, 120, 180, 240, 300, 360].map((h) => hsvToHex({ h, s: 1, v: 1 }));

/**
 * Preset swatches and a `#rrggbb` field; tapping the preview next to the field opens a
 * modal with hue/saturation/brightness sliders for fine-tuning.
 */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hexText, setHexText] = React.useState(value);
  const [editorOpen, setEditorOpen] = React.useState(false);
  // Hue is lost when a color is grey or black, so it is kept here instead of derived from `value`.
  const [hsv, setHsv] = React.useState<Hsv>(() => hexToHsv(value));

  // Follow outside changes (a swatch, or another label being edited) without
  // overwriting the sliders while they are being dragged.
  React.useEffect(() => {
    setHexText(value);
    setHsv((current) => (hsvToHex(current) === value.toLowerCase() ? current : hexToHsv(value)));
  }, [value]);

  function handleSliderChange(change: Partial<Hsv>) {
    const next = { ...hsv, ...change };

    setHsv(next);
    onChange(hsvToHex(next));
  }

  function handleHexChange(text: string) {
    const normalized = text.startsWith('#') || text.length === 0 ? text : `#${text}`;

    setHexText(normalized);

    if (isHexColor(normalized)) {
      onChange(normalized.toLowerCase());
    }
  }

  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-2">
        {LABEL_COLORS.map((color) => {
          const isSelected = color === value.toLowerCase();

          return (
            <RipplePressable
              key={color}
              onPress={() => onChange(color)}
              accessibilityRole="button"
              accessibilityLabel={`Color ${color}`}
              accessibilityState={{ selected: isSelected }}
              className={cn(
                'size-9 items-center justify-center rounded-full',
                isSelected && 'border-foreground border-2'
              )}
              style={{ backgroundColor: color }}>
              {isSelected ? <Icon as={CheckIcon} className="size-4" color="#ffffff" /> : null}
            </RipplePressable>
          );
        })}
      </View>

      <View className="flex-row items-center gap-3">
        <RipplePressable
          onPress={() => setEditorOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir editor de color"
          className="border-border size-10 items-center justify-center rounded-md border"
          style={{ backgroundColor: isHexColor(value) ? value : undefined }}>
          <Icon as={PipetteIcon} className="size-4" color="#ffffff" />
        </RipplePressable>
        <View className="flex-1">
          <Input
            value={hexText}
            onChangeText={handleHexChange}
            placeholder="#3b82f6"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={7}
          />
        </View>
      </View>

      <Modal
        visible={editorOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditorOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 p-6">
          {/* Tapping outside the card closes the editor. */}
          <Pressable
            className="absolute inset-0"
            accessibilityLabel="Cerrar editor de color"
            onPress={() => setEditorOpen(false)}
          />

          <View className="bg-card border-border w-full max-w-sm gap-4 rounded-xl border p-5">
            <View className="flex-row items-center gap-3">
              <View
                className="border-border size-12 rounded-lg border"
                style={{ backgroundColor: isHexColor(value) ? value : undefined }}
              />
              <Text className="text-lg font-semibold">Editor de color</Text>
              <Text className="text-muted-foreground ml-auto text-sm">{value.toLowerCase()}</Text>
            </View>

            <View className="gap-1">
              <Text className="text-muted-foreground text-xs">Tono</Text>
              <ColorSlider
                accessibilityLabel="Tono"
                value={hsv.h / 360}
                onChange={(position) => handleSliderChange({ h: position * 360 })}
                stops={HUE_STOPS}
                thumbColor={hsvToHex({ h: hsv.h, s: 1, v: 1 })}
              />
            </View>

            <View className="gap-1">
              <Text className="text-muted-foreground text-xs">Saturación</Text>
              <ColorSlider
                accessibilityLabel="Saturación"
                value={hsv.s}
                onChange={(position) => handleSliderChange({ s: position })}
                stops={[
                  hsvToHex({ h: hsv.h, s: 0, v: hsv.v }),
                  hsvToHex({ h: hsv.h, s: 1, v: hsv.v }),
                ]}
                thumbColor={hsvToHex(hsv)}
              />
            </View>

            <View className="gap-1">
              <Text className="text-muted-foreground text-xs">Brillo</Text>
              <ColorSlider
                accessibilityLabel="Brillo"
                value={hsv.v}
                onChange={(position) => handleSliderChange({ v: position })}
                stops={[
                  hsvToHex({ h: hsv.h, s: hsv.s, v: 0 }),
                  hsvToHex({ h: hsv.h, s: hsv.s, v: 1 }),
                ]}
                thumbColor={hsvToHex(hsv)}
              />
            </View>

            <Button onPress={() => setEditorOpen(false)}>
              <Text>Listo</Text>
            </Button>
          </View>
        </View>
      </Modal>
     </View>
  );
}
