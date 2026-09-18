import { registerPushToken } from "@/utils/apiFetch";
import { registerForPushNotifications } from "@/utils/notifications";
import { useEffect } from "react";

export function useNotifications(
    userToken: string | null
) {

    useEffect(() => {

        if (!userToken) {
            return;
        }

        const setupNotifications = async () => {
            try {

                const pushToken =
                    await registerForPushNotifications();

                if (!pushToken) {
                    return;
                }

                await registerPushToken(
                    pushToken,
                    "android"
                );

                // console.log("Push token registered with Laravel.");

            } catch (error) {

                console.error(
                    "Notification setup failed:",
                    error
                );

            }
        };

        setupNotifications();

    }, [userToken]);
}