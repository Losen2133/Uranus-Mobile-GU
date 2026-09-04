import { Stack } from "expo-router";
import { Radar } from "lucide-react-native";

export default function TabLayout() {
    const titleIconSize = 30;

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: " Sensors",
                    headerShown: true,
                    headerLeft: () => (
                        <Radar color={'white'} size={titleIconSize} className="mx-5" />
                    ),
                }}
            />
            <Stack.Screen
                name="[sensorId]"
                options={{
                    title: "Sensor Graph",
                }}
            />
        </Stack>
    )
}