import { createContext, useContext, useState } from "react";

type FamContextType = {
    famOpacity: number;
    setFamOpacity: (opacity: number) => void;
};

const FamContext = createContext<FamContextType | undefined>(undefined);

export function FamProvider({ children }: { children: React.ReactNode }) {
    const [famOpacity, setFamOpacity] = useState(100);

    return (
        <FamContext.Provider
            value={{
                famOpacity,
                setFamOpacity,
            }}
        >
            {children}
        </FamContext.Provider>
    );
}

export function useFam() {
    const context = useContext(FamContext);

    if (!context) {
        throw new Error("useFam must be used within a FamProvider");
    }

    return context;
}