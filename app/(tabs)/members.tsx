import AddMemberModal from "@/components/AddMemberModal";
import useAppToast from "@/components/AppToast";
import MemberChangeRoleModal from "@/components/MemberChangeRoleModal";
import MemberDetailModal from "@/components/MemberDetailModal";
import SelectOrgDisplay from "@/components/SelectOrgDisplay";
import SkeletonLoading from "@/components/SkeletonLoading";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon, SearchIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useFam } from "@/hooks/useFamOpacity";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserInfo } from "@/hooks/useUserInfo";
import { OrganizationMember, Role } from "@/interfaces/interfaces";
import { addMember, fetchMemberData, updateMemberRole, updateMemberStatus } from "@/utils/apiFetch";
import { useFocusEffect, useNavigation } from "expo-router";
import { EllipsisVertical, Power, RefreshCcw, UserRoundPlus } from "lucide-react-native";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, SectionList, StyleSheet } from "react-native";

export default function MembersScreen() {
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isChangingRole, setIsChangingRole] = useState(false);
    const [selectedMember, setSelectedMember] = useState<OrganizationMember>();
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [statusChanging, setStatusChanging] = useState(false);
    const [isAddMember, setIsAddMember] = useState(false);
    const [isViewingMember, setIsViewingMember] = useState(false);
    const { selectedOrganizationId } = useOrganization();
    const { fetchedUserInfo } = useUserInfo();
    const navigation = useNavigation();
    const [query, setQuery] = useState('');
    const { showToast } = useAppToast();
    const { famOpacity, setFamOpacity } = useFam();
    const user = members.find(member => member.id === fetchedUserInfo?.id)

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                selectedOrganizationId ? (
                    <Button
                        className="h-8 w-8 rounded-full p-0"
                        onPress={() => setIsAddMember(true)}
                    >
                        <ButtonIcon as={UserRoundPlus} className="h-5 w-5" />
                    </Button>
                ) : null,
        });
    })

    const handleFetchMembers = async () => {
        if (!selectedOrganizationId) {
            return;
        }

        // setLoading(true);

        try {
            await fetchMemberData(
                setMembers,
                setRoles,
                selectedOrganizationId
            );
        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : 'An unexpected error occurred';

            showToast({
                action: 'error',
                title: 'Failed to Fetch Members',
                description: 'Failed to fetch organization members, please try again later',
            });
        } finally {
            // setLoading(false);
        }
    };

    const handleAddMember = async (
        email: string,
        role: string
    ) => {
        if (!selectedOrganizationId) {
            return;
        }

        try {
            await addMember(
                email,
                role,
                selectedOrganizationId
            );

            setIsAddMember(false);

            showToast({
                action: "success",
                title: "Member Added",
                description: "Member added successfully",
            });

            await handleFetchMembers();

        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : String(error);

            setIsAddMember(false);

            showToast({
                action: "error",
                title: "Failed to Add Member",
                description: "Failed to add member, please try again later.",
            });
        }
    };

    const handleUpdateMemberRole = async (
        role: string,
        memberId: number
    ) => {
        if (!selectedOrganizationId) {
            return;
        }

        try {
            await updateMemberRole(
                role,
                memberId,
                selectedOrganizationId
            );

            setIsChangingRole(false);

            showToast({
                action: "success",
                title: "Role Updated",
                description: "Member role updated successfully",
            });

            await handleFetchMembers();

        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "An unexpected error occurred";

            setIsChangingRole(false);

            showToast({
                action: "error",
                title: "Failed to Update Role",
                description: "Failed to update member role, please try again later."
            });
        }
    };

    const handleUpdateMemberStatus = async (
        active: boolean,
        memberId: number
    ) => {
        if (!selectedOrganizationId) {
            return;
        }

        try {
            setStatusChanging(true);

            await updateMemberStatus(
                active,
                memberId,
                selectedOrganizationId
            );

            setIsChangingStatus(false);
            setStatusChanging(false);

            showToast({
                action: "success",
                title: "Status Updated",
                description: "Member status updated successfully",
            });

            await handleFetchMembers();

        } catch (error) {
            // const message =
            //     error instanceof Error
            //         ? error.message
            //         : "An unexpected error occurred";

            setIsChangingStatus(false);
            setStatusChanging(false);

            showToast({
                action: "error",
                title: "Failed to Update Status",
                description: "Failed to update member status, please try again later.",
            });
        }
    };

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    await handleFetchMembers();
                } finally {
                    setLoading(false);
                }
            }
            fetchData();
        }, [selectedOrganizationId])
    );

    const handleRefresh = () => {
        // setRefreshing(true);
        handleFetchMembers();
        // setRefreshing(false);
    }

    const filteredMembers = useMemo(() => {
        const searchQuery = query.trim().toLowerCase();

        return members.filter((member) => {
            if (!searchQuery) return true;

            return (
            member.name.toLowerCase().includes(searchQuery) ||
            member.email.toLowerCase().includes(searchQuery) ||
            member.role.toLowerCase().includes(searchQuery)
            );
        });
    }, [members, query]);

    const sections = useMemo(
        () => [
            {
                title: "Owner",
                data: filteredMembers.filter((m) => m.role_id === 1),
            },
            {
                title: "Admin",
                data: filteredMembers.filter((m) => m.role_id === 2),
            },
            {
                title: "Maintenance",
                data: filteredMembers.filter((m) => m.role_id === 4),
            },
            {
                title: "Observer",
                data: filteredMembers.filter((m) => m.role_id === 3),
            },
        ].filter(section => section.data.length > 0),
        [filteredMembers]
    );

    const isMembersEmpty = members.length === 0;
    const isFilteredEmpty = filteredMembers.length === 0;
    
    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {!selectedOrganizationId ? (
                    <SelectOrgDisplay />
                ) : (
                    <VStack className="flex-1 p-5 mb-9"
                        space="md"
                    >
                        <Box>
                            <Input>
                                <InputSlot>
                                    <InputIcon as={SearchIcon} />
                                </InputSlot>
                                <InputField
                                    type="text"
                                    placeholder="Search..."
                                    placeholderTextColor={'gray'}
                                    value={query}
                                    onChangeText={(text) => setQuery(text)}
                                />
                            </Input>
                        </Box>
                        {loading ? (
                            <SkeletonLoading />
                        ) : isMembersEmpty && !loading? (
                            <Center className="flex-1">
                                <Text>There are no members available</Text>
                            </Center>
                        ) : isFilteredEmpty ? (
                            <Center className="flex-1">
                                <Text>No members match your search or filter.</Text>
                            </Center>
                        ) : (
                            <SectionList
                                sections={sections}
                                keyExtractor={(item) => item.id.toString()}
                                onScrollBeginDrag={() => {
                                    if (famOpacity === 100)
                                        setFamOpacity(35);
                                }}
                                renderSectionHeader={({ section }) => (
                                    <Box className="px-4 py-2 bg-background">
                                        <Text className="text-xs font-semibold uppercase text-foreground">
                                            {section.title}
                                        </Text>

                                        <Divider className="mt-2" />
                                    </Box>
                                )}
                                renderItem={({ item }) => {
                                    return (
                                        <Pressable
                                            key={item.id}
                                            // style={styles.itemContainer}
                                            style={({ pressed }) => [
                                                styles.itemContainer,
                                                pressed && styles.pressed,
                                            ]}
                                            onPress={() => {
                                                setSelectedMember(item)
                                                setIsViewingMember(true);
                                            }}
                                        >   
                                            <VStack className="flex-1">
                                                <HStack>
                                                    
                                                    <Box className="">
                                                        <Box>
                                                            <Text className="font-bold">
                                                                {item.name}
                                                                {fetchedUserInfo?.id === item.id && (
                                                                    <Text className="font-bold text-blue-500 text-sm">{' (You)'}</Text>
                                                                )}
                                                            </Text>
                                                            <Text className="text-gray-400">{item.email}</Text>
                                                            {!item.active && (
                                                                <Box className="flex-row items-center">
                                                                    <Icon as={Power} color="red" size="md" className="mr-2" />
                                                                    <Text className="text-red-500">Deactivated</Text>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        
                                                        
                                                    </Box>
                                                    <Box className="flex-1 justify-center items-end">
                                                        <HStack>
                                                            <Menu

                                                                className="w-fit"
                                                                placement="bottom right"
                                                                closeOnSelect
                                                                disabledKeys={
                                                                    user?.id === item.id ||
                                                                    (
                                                                        user?.role_id === 2 &&
                                                                        (item.role_id === 1 || item.role_id === 2)
                                                                    )
                                                                        ? ["Change Role", "Deactivate"]
                                                                        : []
                                                                }
                                                                trigger={(triggerProps) => (
                                                                    <Pressable
                                                                        {...triggerProps}
                                                                        onPress={(e) => {
                                                                            setSelectedMember(item);
                                                                            triggerProps.onPress?.(e); // Open the menu
                                                                        }}
                                                                    >
                                                                        <Icon as={EllipsisVertical} className="h-7 w-7" />
                                                                    </Pressable>
                                                                )}
                                                            >
                                                                <MenuItem
                                                                    key="Change Role"
                                                                    textValue="Change Role"
                                                                    onPress={() => {
                                                                        setSelectedMember(item)
                                                                        setIsChangingRole(true)
                                                                    }}
                                                                >
                                                                    <Icon as={RefreshCcw} size="sm" className="mr-2" />
                                                                    <MenuItemLabel>Change Role</MenuItemLabel>
                                                                </MenuItem>
                                                                <MenuItem
                                                                    key="Deactivate"
                                                                    textValue="Deactivate"
                                                                    onPress={() => {
                                                                        setIsChangingStatus(true)}
                                                                    }
                                                                >
                                                                    {item.active ? (
                                                                        <>
                                                                            
                                                                            <Icon as={Power} color="red" size="sm" className="mr-2" />
                                                                            <MenuItemLabel className="text-red-500">
                                                                                Deactivate
                                                                            </MenuItemLabel>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Icon as={Power} color="green" size="sm" className="mr-2" />
                                                                            <MenuItemLabel className="text-green-500">
                                                                                Activate
                                                                            </MenuItemLabel>
                                                                        </>
                                                                    )}
                                                                </MenuItem>
                                                            </Menu>
                                                        </HStack>
                                                    </Box>
                                                </HStack>
                                            </VStack>
                                        </Pressable>
                                    )
                                }}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                                }
                            />
                        )}
                    </VStack>
                )}
                <MemberChangeRoleModal
                    isOpen={isChangingRole}
                    onClose={() => setIsChangingRole(false)}
                    selectedMember={selectedMember}
                    roleList={roles}
                    user={user}
                    onRoleUpdated={handleUpdateMemberRole}
                />
                <AlertDialog
                    isOpen={isChangingStatus}
                    onClose={() => setIsChangingStatus(false)}
                >
                    <AlertDialogBackdrop />
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Heading className="text-foreground font-semibold text-lg">
                                Are you sure you want to{" "}
                                {selectedMember?.active ? "Deactivate" : "Activate"}{" "}
                                {selectedMember?.name}
                            </Heading>
                        </AlertDialogHeader>
                        <AlertDialogBody className="mt-3 mb-4">
                            <Text className="text-sm text-muted-foreground">
                                Confirming this will {selectedMember?.active ? 'Deactivate' : 'Activate'} the member {selectedMember?.name}.
                            </Text>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button variant="outline" onPress={() => setIsChangingStatus(false)}>
                                <ButtonText>Cancel</ButtonText>
                            </Button>
                            <Button
                                onPress={() => {
                                    if (!selectedMember) {
                                        return;
                                    }

                                    handleUpdateMemberStatus(
                                        !selectedMember.active,
                                        selectedMember.id
                                    );
                                }}
                                isDisabled={statusChanging}
                            >
                                <ButtonText>Confirm</ButtonText>
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <AddMemberModal
                    isOpen={isAddMember}
                    onClose={() => setIsAddMember(false)}
                    roleList={roles}
                    user={user}
                    onMemberAdded={handleAddMember}
                />
                <MemberDetailModal
                    isOpen={isViewingMember}
                    selectedMember={selectedMember}
                    onClose={() => {
                        setIsViewingMember(false);
                        setSelectedMember(undefined);
                    }}
                />
            </KeyboardAvoidingView>
        </>
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        borderWidth: 2,
        // borderColor: 'yellow',
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#ffffff25',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    pressed: {
        backgroundColor: 'black',
        borderColor: 'white'
    },
})