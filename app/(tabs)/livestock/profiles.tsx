import useAppToast from "@/components/AppToast";
import LoaderDisplay from "@/components/LoaderDisplay";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, Icon, SearchIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useFam } from "@/hooks/useFamOpacity";
import { useOrganization } from "@/hooks/useOrganization";
import { LivestockProfileData } from "@/interfaces/interfaces";
import { deleteLivestockProfile, fetchLivestockProfileData } from "@/utils/apiFetch";
import { capitalize, formatDate } from "@/utils/stringUtils";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { EllipsisVertical, SquarePen, Trash2 } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, SectionList, StyleSheet } from "react-native";

export default function LivestockProfilesScreen() {
    const { selectedOrganizationId } = useOrganization();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [livestockProfileData, setLivestockProfileData] = useState<LivestockProfileData[]>([]);
    const [selectedType, setSelectedType] = useState<"all" | "plant" | "fish">("all");
    const [isDeletingLivestockProfile, setIsDeletingLivestockProfile] = useState(false);
    const [toDeleteLivestockProfile, setToDeleteLivestockProfile] = useState<LivestockProfileData>();
    const router = useRouter();
    const { famOpacity, setFamOpacity } = useFam();
    const { showToast } = useAppToast();

    useFocusEffect(
        useCallback(() => {
            if (selectedOrganizationId) {
                fetchLivestockProfileData(
                    setLoading,
                    setError,
                    setLivestockProfileData,
                    selectedOrganizationId
                );
            }
        }, [selectedOrganizationId])
    )

    const handleRefresh = () => {
        setRefreshing(true);
        selectedOrganizationId && fetchLivestockProfileData(
            setLoading,
            setError,
            setLivestockProfileData,
            selectedOrganizationId
        );
        setRefreshing(false);
    }

    const filteredLivestockProfile = useMemo(() => {
        const searchQuery = query.trim().toLowerCase();

        return livestockProfileData.filter((livestock) => {
            if (!searchQuery) return true;

            return (
                livestock.species_name.toLowerCase().includes(searchQuery) ||
                livestock.type.toLowerCase().includes(searchQuery) ||
                livestock.description.toLowerCase().includes(searchQuery)
            );
        });
    }, [livestockProfileData, query]);

    const sections = useMemo(() => {
        const grouped = filteredLivestockProfile.reduce((acc, livestock) => {
            const type = livestock.type;

            if (!acc[type]) {
                acc[type] = [];
            }

            acc[type].push(livestock);

            return acc;
        }, {} as Record<string, LivestockProfileData[]>);

        const order = ["plant", "fish"];

        return Object.entries(grouped)
            .sort(([typeA], [typeB]) => {
                return order.indexOf(typeA) - order.indexOf(typeB);
            })
            .map(([title, data]) => ({
                title: title.charAt(0).toUpperCase() + title.slice(1),
                data,
            }));
    }, [filteredLivestockProfile]);

    const filteredSections =
        selectedType === "all"
            ? sections
            : sections.filter(section => section.title === capitalize(selectedType));

    return (
        <>
            <VStack className="flex-1 p-5 mb-12"
                space="md"
            >
                <Box>
                    <Input>
                        <InputSlot>
                            <InputIcon as={SearchIcon}/>
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
                <Box className="border border-outline-300 border-white h-8 rounded-md justify-center px-3">
                    <Picker
                        selectedValue={selectedType}
                        onValueChange={(value) => {
                            setSelectedType(value);
                        }}
                        dropdownIconColor="white"
                        style={{
                            color: "white",
                            marginHorizontal: -10,
                        }}
                    >
                        <Picker.Item
                            label="All Livestock"
                            value="all"
                        />

                        <Picker.Item
                            label="Plants"
                            value="plant"
                        />

                        <Picker.Item
                            label="Fish"
                            value="fish"
                        />
                    </Picker>
                </Box>
                {loading ? (
                    <LoaderDisplay
                        type="loading"
                        message="Loading Livestock Profiles..."
                    />
                ) : error ? (
                    <LoaderDisplay
                        type="error"
                        message={error}
                    />
                ) : (
                    <SectionList
                        sections={filteredSections}
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
                        renderItem={({ item }) => (
                            <Pressable
                                key={item.id}
                                style={({ pressed }) => [
                                    styles.item,
                                    pressed && styles.pressed
                                ]}
                            >
                                <HStack>
                                    <Box className="flex-1">
                                        <Box className="justify-between flex-row items-center">
                                            <Text className="font-bold text-lg">
                                                {item.species_name}
                                            </Text>
                                            
                                            <Text className="text-sm text-foreground/70">
                                                { formatDate(item.created_at, "numeric") }
                                            </Text>
                                        </Box> 
                                        <Text className="mt-1">
                                            {item.description}
                                        </Text>
                                    </Box>
                                    <Menu
                                        className="w-fit"
                                        placement="bottom right"
                                        closeOnSelect
                                        trigger={({ ...triggerProps }) => {
                                            return (
                                                <Pressable className="items-center justify-center"
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
                                            onPress={() => router.push({
                                                pathname: "/(tabs)/livestock/profileForm",
                                                params: {
                                                    selectedProfileId: item.id
                                                }
                                            })}
                                        >
                                            <Icon as={SquarePen} size="sm" className="mr-2" />
                                            <MenuItemLabel>Edit</MenuItemLabel>
                                        </MenuItem>
                                        <MenuItem
                                            key="Delete"
                                            textValue="Delete"
                                            onPress={() => {
                                                setToDeleteLivestockProfile(item);
                                                setIsDeletingLivestockProfile(true);
                                            }}
                                        >
                                            <Icon as={Trash2} color="red" size="sm" className="mr-2" />
                                            <MenuItemLabel className="text-red-500">Delete</MenuItemLabel>
                                        </MenuItem>
                                    </Menu>
                                </HStack>
                                
                            </Pressable>
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                            />
                        }
                    />
                )}
            </VStack>
            <Fab
                size="md"
                placement="bottom right"
                isHovered={false}
                isDisabled={false}
                className="mb-15"
                onPress={() => router.push('/livestock/profileForm')}
            >
                <FabIcon as={AddIcon} />
                <FabLabel>Create Profile</FabLabel>
            </Fab>
            <AlertDialog
                isOpen={isDeletingLivestockProfile}
                onClose={() => setIsDeletingLivestockProfile(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Are you sure you want to delete {toDeleteLivestockProfile?.species_name}
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will delete the livestock profile {toDeleteLivestockProfile?.species_name}.
                        </Text>
                        <Text className="text-sm text-muted-foreground text-red-500">
                            This action cannot be undone.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" onPress={() => setIsDeletingLivestockProfile(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button onPress={() => {
                            setIsDeletingLivestockProfile(false)
                            deleteLivestockProfile(
                                toDeleteLivestockProfile?.id,
                                selectedOrganizationId,
                                async () => {
                                    showToast({
                                        action: "success",
                                        title: "Livestock Profile Deleted",
                                        description: `${toDeleteLivestockProfile?.species_name} deleted successfully`,
                                    });

                                    if (toDeleteLivestockProfile) {
                                        fetchLivestockProfileData(
                                            setLoading,
                                            setError,
                                            setLivestockProfileData,
                                            selectedOrganizationId
                                        );
                                        setToDeleteLivestockProfile(undefined);
                                    }
                                }
                            )
                        }}>
                            <ButtonText>Confirm</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
    pressed: {
        backgroundColor: 'black',
        borderColor: 'white'
    },
})