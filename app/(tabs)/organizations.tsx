import useAppToast from "@/components/AppToast";
import LoaderDisplay from "@/components/LoaderDisplay";
import OrgModalAction from "@/components/OrgModalAction";
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
import { OrganizationData } from "@/interfaces/interfaces";
import { deleteOrganization, fetchOrganizations } from "@/utils/apiFetch";
import { useFocusEffect, useNavigation } from "expo-router";
import { EllipsisVertical, Plus, SquarePen, Trash2 } from "lucide-react-native";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, SectionList, StyleSheet } from "react-native";

export default function OrganizationsScreen() {
    const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [openOrgModal, setOpenOrgModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [toEditOrg, setToEditOrg] = useState<OrganizationData>();
    const [isDeletingOrg, setIsDeletingOrg] = useState(false);
    const [toDeleteOrg, setToDeleteOrg] = useState<OrganizationData>();
    const { fetchedUserInfo } = useUserInfo();
    const { selectedOrganizationId, setSelectedOrganizationId } = useOrganization();
    const { showToast } = useAppToast();
    const { famOpacity, setFamOpacity } = useFam();
    const navigation = useNavigation();
    const [query, setQuery] = useState('');

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                    <Button
                        isDisabled={editMode}
                        className="h-8 w-8 rounded-full p-0"
                        onPress={() => setOpenOrgModal(true)}
                    >
                        <ButtonIcon as={Plus} className="h-5 w-5" />
                    </Button>
        });
    })

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrganizations(
            setLoading,
            setError,
            setOrganizations
        );
        setRefreshing(false);
    }

    useFocusEffect(
        useCallback(() => {
            fetchOrganizations(
                setLoading,
                setError,
                setOrganizations
            );
            return () => {
                setLoading(true);
            };
        }, [])
    );

    const filteredOrganizations = useMemo(() => {
        const searchQuery = query.trim().toLowerCase();

        return organizations
            .filter((org) => {
                if (!searchQuery) return true;

                return org.name.toLowerCase().includes(searchQuery);
            })
            .sort(
                (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
    }, [organizations, query]);

    const sections = useMemo(() => {
        const search = query.trim().toLowerCase();

        const filtered = organizations.filter(org =>
            !search || org.name.toLowerCase().includes(search)
        );

        const owned = filtered.filter(org =>
            org.members.some(
                member =>
                    member.id === fetchedUserInfo?.id &&
                    member.role_id === 1
            )
        );

        const shared = filtered.filter(org =>
            org.members.some(
                member =>
                    member.id === fetchedUserInfo?.id &&
                    member.role_id !== 1
            )
        );

        return [
            {
                title: "Your Organizations",
                data: owned,
            },
            {
                title: "Shared Organizations",
                data: shared,
            },
        ].filter(section => section.data.length > 0);
    }, [organizations, query, fetchedUserInfo?.id]);

    const isOrganizationsEmpty = organizations.length === 0;
    const isFilteredEmpty = filteredOrganizations.length === 0;

    return(
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <VStack className="flex-1 p-5 mb-9"
                    space="md"
                >  
                    <Box>
                        <Input
                            isDisabled={isOrganizationsEmpty}
                        >
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
                        <LoaderDisplay 
                            type="loading"
                            message="Loading Organizations..."
                        />
                    ) : error ? (
                        <LoaderDisplay 
                            type="error"
                            message={error}
                        />
                    ) : isOrganizationsEmpty ? (
                        <Center className="flex-1">
                            <Text>There are no organizations available</Text>
                        </Center>
                    ) : isFilteredEmpty ? (
                        <Center className="flex-1">
                            <Text>No organizations match your search or filter.</Text>
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
                                        style={({ pressed }) => [styles.item, selectedOrganizationId === item.id && styles.selectedItem, pressed && styles.pressed]}
                                        onPress={() => setSelectedOrganizationId(item.id)}
                                    >
                                        <HStack>
                                            <Box>
                                                <Text className="font-bold">{item.name}</Text>
                                                <Text className="italic">{item.description}</Text>
                                            </Box>
                                            <Box className="flex-1 justify-center items-end">
                                                <Menu
                                                    disabledKeys={
                                                        editMode ||
                                                        item.members.find(
                                                            (member) => member.id === fetchedUserInfo?.id
                                                        )?.role_id !== 1
                                                            ? ["Edit", "Delete"]
                                                            : []
                                                    }
                                                    className="w-fit"
                                                    placement="bottom right"
                                                    closeOnSelect
                                                    trigger={({ ...triggerProps }) => {
                                                        return (
                                                            <Pressable
                                                                { ...triggerProps }
                                                            >
                                                                <Icon as={EllipsisVertical} className="h-7 w-7" />
                                                            </Pressable>
                                                        )
                                                    }}

                                                >
                                                    <MenuItem
                                                        key="Edit"
                                                        textValue="Edit"
                                                        onPress={() => {
                                                            setToEditOrg(item)
                                                            setEditMode(true);
                                                            setOpenOrgModal(true);
                                                        }}
                                                    >
                                                        <Icon as={SquarePen} size="sm" className="mr-2" />
                                                        <MenuItemLabel>Edit</MenuItemLabel>
                                                    </MenuItem>
                                                    <MenuItem
                                                        key="Delete"
                                                        textValue="Delete"
                                                        onPress={() => {
                                                            setToDeleteOrg(item);
                                                            setIsDeletingOrg(true);
                                                        }}
                                                    >
                                                        <Icon as={Trash2} color="red" size="sm" className="mr-2" />
                                                        <MenuItemLabel className="text-red-500">Delete</MenuItemLabel>
                                                    </MenuItem>
                                                </Menu>
                                            </Box>
                                        </HStack>
                                        
                                    </Pressable>
                                )
                            }}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                            }
                        />
                    )}
                </VStack>
                <OrgModalAction
                    isOpen={openOrgModal}
                    editMode={editMode}
                    toEditOrg={toEditOrg}
                    errorSetter={setError}
                    onOrgEdit={() => setEditMode(false)}
                    onClose={() => setOpenOrgModal(false)}
                    onOrgAction={ () => {
                        if (error) {
                            showToast({
                                action: "warning",
                                title: "Error",
                                description: error
                            });
                        } else {
                            showToast({
                                action: "success",
                                title: `Organization ${(editMode ? "Editted" : "Created")}`,
                                description: ` Organization ${(editMode ? "editted" : "created")} successfully`,
                            });
                            fetchOrganizations(
                                setLoading,
                                setError,
                                setOrganizations
                            )
                        }
                        
                    }}
                />
                <AlertDialog
                    isOpen={isDeletingOrg}
                    onClose={() => setIsDeletingOrg(false)}
                >
                    <AlertDialogBackdrop />
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Heading className="text-foreground font-semibold text-lg">
                                Are you sure you want to delete {toDeleteOrg?.name}
                            </Heading>
                        </AlertDialogHeader>
                        <AlertDialogBody className="mt-3 mb-4">
                            <Text className="text-sm text-muted-foreground">
                                Confirming this will delete the organization {toDeleteOrg?.name}.
                            </Text>
                            <Text className="text-sm text-muted-foreground text-red-500">
                                This action cannot be undone.
                            </Text>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button variant="outline" onPress={() => setIsDeletingOrg(false)}>
                                <ButtonText>Cancel</ButtonText>
                            </Button>
                            <Button onPress={() => {
                                setIsDeletingOrg(false)
                                deleteOrganization(
                                    toDeleteOrg?.id,
                                    async () => {
                                        showToast({
                                            action: "success",
                                            title: "Organization Deleted",
                                            description: `${toDeleteOrg?.name} deleted successfully`,
                                        });

                                        if (toDeleteOrg) {
                                            fetchOrganizations(
                                                setLoading,
                                                setError,
                                                setOrganizations
                                            );
                                            setToDeleteOrg(undefined);
                                        }
                                    }
                                )
                            }}>
                                <ButtonText>Confirm</ButtonText>
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </KeyboardAvoidingView>
        </>
    )
}

const styles = StyleSheet.create({
    item: {
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: '#ffffff25',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    itemName: {
        fontWeight: 'bold'
    },
    itemDescription: {
        fontStyle: 'italic'
    },
    selectedItem: {
        borderColor: 'white'
    },
    pressed: {
        backgroundColor: 'black',
        borderColor: 'white'
    },
})