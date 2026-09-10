import { Stack } from "expo-router";
import { Leaf } from "lucide-react-native";

export default function TabLayout() {
    const titleIconSize = 30;

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: " Livestock",
                    headerShown: true,
                    headerLeft: () => (
                        <Leaf color={'white'} size={titleIconSize} className="mx-5" />
                    ),
                }}
            />
            <Stack.Screen
                name="[livestockId]"
                options={{
                    title: "Livestock Details",
                }}
            />
            <Stack.Screen
                name="form"
                options={{
                    title: "New Livestock",
                }}
            />
            <Stack.Screen
                name="logs"
                options={{
                    title: "Livestock Logs",
                }}
            />
            <Stack.Screen
                name="profiles"
                options={{
                    title: "Livestock Profiles",
                }}
            />
            <Stack.Screen
                name="profileForm"
                options={({ route }) => {
                    const params = route.params as { selectedProfileId?: string };

                    return {
                        title: params.selectedProfileId
                            ? "Edit Livestock Profile"
                            : "New Livestock Profile",
                    };
                }}
            />
        </Stack>
    )
}