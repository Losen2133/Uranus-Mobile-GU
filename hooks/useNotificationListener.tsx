import { useOrganization } from "@/hooks/useOrganization";
import { useUserInfo } from "@/hooks/useUserInfo";
import { UserOrgRoleResponse } from "@/interfaces/interfaces";
import { getMyOrgRole } from "@/utils/apiFetch";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

export function useNotificationListener() {
    const { fetchedUserInfo } = useUserInfo();

    const {
        selectedOrganizationId,
        setSelectedOrganizationUserRole,
    } = useOrganization();

    const [userRole, setUserRole] =
        useState<UserOrgRoleResponse>();

    useEffect(() => {
        const subscription =
            Notifications.addNotificationReceivedListener(
                async (notification) => {
                    const data =
                        notification.request.content.data;

                    if (
                        data?.type !== "member" ||
                        data?.action !== "role_changed"
                    ) {
                        return;
                    }

                    const notificationUserId = Number(
                        data.user_id
                    );

                    const notificationOrganizationId =
                        Number(data.organization_id);

                    // Check if notification belongs
                    // to the currently logged-in user
                    if (
                        notificationUserId !==
                        fetchedUserInfo?.id
                    ) {
                        return;
                    }

                    // Check if notification belongs
                    // to the currently selected organization
                    if (
                        notificationOrganizationId !==
                        selectedOrganizationId
                    ) {
                        return;
                    }

                    try {
                        await getMyOrgRole(
                            selectedOrganizationId,
                            setUserRole
                        );

                        // Update the organization context
                        // with the role returned by the API
                        if (userRole?.data.role) {
                            setSelectedOrganizationUserRole(
                                userRole.data.role
                            );
                        }
                        console.log("Changing user role");
                    } catch (error) {
                        console.error(
                            "Failed to refresh organization role:",
                            error
                        );
                    }
                }
            );

        return () => {
            subscription.remove();
        };
    }, [
        fetchedUserInfo?.id,
        selectedOrganizationId,
        setSelectedOrganizationUserRole,
        userRole,
    ]);
}