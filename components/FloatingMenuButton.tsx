import { Image } from "@/components/ui/image";
import { GlassView } from "@/components/ui/liquid-glass";
import { Pressable } from "@/components/ui/pressable";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const logoImage = require("../assets/images/icon.png");

type Props = {
  opacity?: number;
  opacitySetter: (opacity: number) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export default function FloatingMenuButton({
  opacity = 100,
  opacitySetter,
  isOpen,
  onOpen,
  onClose,
}: Props) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePress = () => {
    if (isOpen) {
      onClose();
      return;
    }

    if (opacity != 100)
      opacitySetter(100);

    scale.value = withTiming(0.88, { duration: 120 });

    rotation.value = withTiming(
      45,
      { duration: 150 },
      (finished) => {
        if (finished) {
          scale.value = withSpring(1);
          rotation.value = withSpring(0);

          runOnJS(onOpen)();
        }
      }
    );
  };

  return (
    <Animated.View
      style={style}
      className="absolute self-center bottom-15 z-20"
    >
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        className={`w-20 h-20 rounded-full overflow-visible`}
        style = {{ opacity: opacity / 100 }}
      >
        <Pressable
          className="flex-1 items-center justify-center overflow-visible"
          onPress={handlePress}
        >
          <Image
            source={logoImage}
            alt="Menu"
            className="w-24 h-24"
          />
        </Pressable>
      </GlassView>
    </Animated.View>
  );
}