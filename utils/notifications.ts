// utils/notifications.ts

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotifications() {

    if (!Device.isDevice) {
        console.log('Push notifications require a physical device.');
        return null;
    }

    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } =
            await Notifications.requestPermissionsAsync();

        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission denied.');
        return null;
    }

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId) {
        throw new Error('Expo project ID is missing.');
    }

    const token =
        await Notifications.getExpoPushTokenAsync({
            projectId,
        });

    console.log('Expo Push Token:', token.data);

    return token.data;
}