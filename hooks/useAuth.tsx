import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<{
    userToken: string | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}>({
    userToken: null,
    isLoading: true,
    signIn: async () => {},
    signOut: async () => {
        
    },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const URANUS_URL = 'https://uranus.luscsusjr.dpdns.org'

    useEffect(() => {
        async function loadToken() {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                if (token) {
                    setUserToken(token);
                }
            } catch (error) {
                console.error('Failed to load token', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadToken();
    },[]);
    return (
        <AuthContext.Provider value={{
            userToken,
            isLoading,
            signIn: async (token: string) => {
                await SecureStore.setItemAsync('userToken', token);
                setUserToken(token);
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
                    router.replace('/');
                }
            },
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);