import { UserSettings } from "@/interfaces/interfaces";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type UserSettingsContextType = {
    fetchedUserSettings : UserSettings | null;
    setFetchedUserSettings: Dispatch<SetStateAction<UserSettings | null>>
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export function UserSettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [fetchedUserSettings, setFetchedUserSettings] = useState<UserSettings | null>(null);
    
    return (
        <UserSettingsContext.Provider
            value={{
                fetchedUserSettings,
                setFetchedUserSettings,
            }}
        >
            {children}
        </UserSettingsContext.Provider>
    );
}

export function useUserSettings() {
    const context = useContext(UserSettingsContext);

    if (!context) {
        throw new Error(
            'useUserSettings must be used within a UserSettingsProvider'
        );
    }
    
  return context;
}