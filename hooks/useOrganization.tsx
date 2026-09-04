import { createContext, ReactNode, useContext, useState } from 'react';

type OrganizationContextType = {
    selectedOrganizationId: number | null;
    setSelectedOrganizationId: (id: number | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);

    return (
        <OrganizationContext.Provider
            value={{
                selectedOrganizationId,
                setSelectedOrganizationId
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);

    if(!context) {
        throw new Error(
            'useOrganization must be used with an OrganizationProvider'
        );
    }

    return context;
}