import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      {/* This ensures your login screen doesn't have a double header */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}