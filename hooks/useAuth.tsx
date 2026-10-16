
import { getMe, logoutUser } from '@/utils/apiFetch';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useNotifications } from './useNotification';
import { useUserInfo } from './useUserInfo';
import { useUserSettings } from './useUserSettings';

type AuthContextType = {
    userToken: string | null;
    pushToken: string | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    userToken: null,
    pushToken: null,
    isLoading: true,
    signIn: async () => {},
    signOut: async () => {},
    resetSession: async () => {},
});

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { setFetchedUserInfo } = useUserInfo();
    const { setFetchedUserSettings } = useUserSettings();
    const router = useRouter();

    // Obtain the Expo push token from the notification hook.
    const { pushToken } = useNotifications(userToken);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');

                if (!token) {
                    setUserToken(null);
                    return;
                }

                await getMe(
                    setFetchedUserInfo,
                    setFetchedUserSettings
                );

                setUserToken(token);
            } catch (error) {
                await SecureStore.deleteItemAsync('userToken');
                setUserToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    const resetSession = async () => {
        await SecureStore.deleteItemAsync("userToken");

        setUserToken(null);
        setFetchedUserInfo(null);
        setFetchedUserSettings(null);
    };

    return (
        <AuthContext.Provider
            value={{
                userToken,
                pushToken,
                isLoading,
                resetSession,

                signIn: async (token: string) => {
                    await SecureStore.setItemAsync('userToken', token);

                    await getMe(
                        setFetchedUserInfo,
                        setFetchedUserSettings
                    );

                    setUserToken(token);
                    router.replace('/');
                },

                signOut: async () => {
                    try {
                        // Send the push token before clearing authentication.
                        await logoutUser(pushToken);
                    } catch (error) {
                        console.error(
                            'Server logout failed:',
                            error
                        );
                    } finally {
                        await SecureStore.deleteItemAsync('userToken');

                        setUserToken(null);
                        setFetchedUserInfo(null);
                        setFetchedUserSettings(null);

                        router.replace('/(auth)/login');
                    }
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
