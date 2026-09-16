import { verifyMe } from '@/utils/apiFetch';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from './useNotification';
import { useUserInfo } from './useUserInfo';
import { useUserSettings } from './useUserSettings';

const AuthContext = createContext<{
    userToken: string | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}>({
    userToken: null,
    isLoading: true,
    signIn: async () => {},
    signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { setFetchedUserInfo, fetchedUserInfo } = useUserInfo();
    const { setFetchedUserSettings, fetchedUserSettings } = useUserSettings();
    const router = useRouter();

    useNotifications(userToken);
    
    const URANUS_URL = 'https://uranus.luscsusjr.dpdns.org'

    useEffect(() => {
        const checkSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');

                if (!token) {
                    setUserToken(null);
                    return;
                }

                await verifyMe(setFetchedUserInfo, setFetchedUserSettings);

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

    return (
        <AuthContext.Provider value={{
            userToken,
            isLoading,
            signIn: async (token: string) => {
                // Save token first
                await SecureStore.setItemAsync('userToken', token);

                // Verify token and fetch user data/settings
                await verifyMe(
                    setFetchedUserInfo,
                    setFetchedUserSettings
                );

                // Only mark the user as authenticated after
                // user information has been fetched
                setUserToken(token);

                // Go through app/index.tsx
                router.replace('/');
            },
            signOut: async () => {
                try {
                    // 1. Get the current token so you can send it to the server
                    const token = await SecureStore.getItemAsync('userToken');

                    if (token) {
                    // 2. Tell the server to invalidate the token
                    await fetch(URANUS_URL + '/api/logout', {
                        method: 'POST', // or DELETE, depending on your API
                        headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Pass the token to identify the session
                        }
                    });
                    }
                } catch (error) {
                    // If the user is offline or the server is down, we catch the error 
                    // so the app doesn't crash, but we STILL proceed to the finally block.
                    console.error("Server logout failed, but proceeding with local logout", error);
                } finally {
                    // 3. ALWAYS clear the local storage and state, no matter what happened above
                    await SecureStore.deleteItemAsync('userToken');
                    setUserToken(null);
                    setFetchedUserInfo(null);
                    setFetchedUserSettings(null);
                    router.replace('/(auth)/login');
                }
            },
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);