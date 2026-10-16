
import { registerPushToken } from "@/utils/apiFetch";
import { registerForPushNotifications } from "@/utils/notifications";
import { useEffect, useState } from "react";

export function useNotifications(
    userToken: string | null
) {
    const [pushToken, setPushToken] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const setupNotifications = async () => {
            if (!userToken) {
                setPushToken(null);
                return;
            }

            try {
                const expoPushToken =
                    await registerForPushNotifications();

                if (!expoPushToken || !isMounted) {
                    return;
                }

                setPushToken(expoPushToken);

                await registerPushToken(
                    expoPushToken,
                    "android"
                );

            } catch (error) {
                console.error(
                    "Notification setup failed:",
                    error
                );
            }
        };

        setupNotifications();

        return () => {
            isMounted = false;
        };
    }, [userToken]);

    return { pushToken };
}
