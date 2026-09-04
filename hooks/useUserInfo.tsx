import { UserData } from "@/interfaces/interfaces";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type UserInfoContextType = {
    fetchedUserInfo : UserData | null;
    setFetchedUserInfo: Dispatch<SetStateAction<UserData | null>>
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export function UserInfoProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // console.log("UserInfoProvider mounted");
    const [fetchedUserInfo, setFetchedUserInfo] = useState<UserData | null>(null);

    return (
        <UserInfoContext.Provider
            value={{
                fetchedUserInfo,
                setFetchedUserInfo,
            }}
        >
            {children}
        </UserInfoContext.Provider>
    );
}

export function useUserInfo() {
  const context = useContext(UserInfoContext);

  if (!context) {
    throw new Error(
      'useUserInfo must be used within a UserInfoProvider'
    );
  }

  return context;
}