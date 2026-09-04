import LoaderDisplay from "@/components/LoaderDisplay";
import SelectOrgDisplay from "@/components/SelectOrgDisplay";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useFam } from "@/hooks/useFamOpacity";
import { useOrganization } from "@/hooks/useOrganization";
import { LivestockData } from "@/interfaces/interfaces";
import { fetchLivestockData } from "@/utils/apiFetch";
import { capitalize, formatDate } from "@/utils/stringUtils";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { Check, Folder, Plus, SearchIcon } from "lucide-react-native";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, SectionList, StyleSheet } from "react-native";

export default function LivestockScreen() {
    const { selectedOrganizationId } = useOrganization();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [livestockData, setLivestockData] = useState<LivestockData[]>([]);
    const [query, setQuery] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedType, setSelectedType] = useState<"all" | "plant" | "fish">("all");
    const router = useRouter();
    const { famOpacity, setFamOpacity } = useFam();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                selectedOrganizationId ? (
                    <>
                        <Button
                            className="h-8 w-8 rounded-full p-0 mr-2"
                            onPress={() => router.push('/livestock/profiles')}
                        >
                            <ButtonIcon as={Folder} className="h-5 w-5" />
                        </Button>
                        <Button
                            className="h-8 w-8 rounded-full p-0"
                            onPress={() => router.push('/livestock/form')}
                        >
                            <ButtonIcon as={Plus} className="h-5 w-5" />
                        </Button>
                    </>
                    
                ) : null,
        });
    });

    useFocusEffect(
        useCallback(() => {
            if (selectedOrganizationId) {
                fetchLivestockData(
                    setLoading,
                    setError,
                    setLivestockData,
                    selectedOrganizationId
                );
                // console.log(livestockData);
            }
            // console.log('Selected Organization ID:', selectedOrganizationId);
            // console.log('Livestock Data:', livestockData);
            // console.log('Livestock Profile Data:', livestockProfileData);
        }, [selectedOrganizationId])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        selectedOrganizationId && fetchLivestockData(
            setLoading,
            setError,
            setLivestockData,
            selectedOrganizationId
        );
        setRefreshing(false);
    }

    const filteredLivestock = useMemo(() => {
        const searchQuery = query.trim().toLowerCase();

        return livestockData.filter((livestock) => {
            if (!searchQuery) return true;

            return (
                livestock.livestock_name.toLowerCase().includes(searchQuery) ||
                livestock.species_name.toLowerCase().includes(searchQuery) ||
                livestock.type.toLowerCase().includes(searchQuery) ||
                livestock.description.toLowerCase().includes(searchQuery)
            );
        });
    }, [livestockData, query]);

    const sections = useMemo(() => {
        const grouped = filteredLivestock.reduce((acc, livestock) => {
            const type = livestock.type;

            if (!acc[type]) {
                acc[type] = [];
            }

            acc[type].push(livestock);

            return acc;
        }, {} as Record<string, LivestockData[]>);

        const order = ["plant", "fish"];

        return Object.entries(grouped)
            .sort(([typeA], [typeB]) => {
                return order.indexOf(typeA) - order.indexOf(typeB);
            })
            .map(([title, data]) => ({
                title: title.charAt(0).toUpperCase() + title.slice(1),
                data,
            }));
    }, [filteredLivestock]);

    const filteredSections =
    selectedType === "all"
        ? sections
        : sections.filter(section => section.title === capitalize(selectedType));

    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {!selectedOrganizationId ? (
                    <SelectOrgDisplay />
                ) : (
                    <VStack className="flex-1 p-5 mb-12"
                        space='md'
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
                                message="Loading Livestocks..."
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

                                            item.harvested &&
                                                item.type === "plant" && {
                                                    borderColor: "#22c55e",
                                                    backgroundColor: "#22c55e25",
                                                },

                                            item.harvested &&
                                                item.type === "fish" && {
                                                    borderColor: "#3b82f6",
                                                    backgroundColor: "#3b82f625",
                                                },

                                            pressed && styles.pressed,
                                        ]}
                                        onPress={() => {
                                            // setSelectedLivestock(item); setIsViewingSelectedLivestock(true);
                                            router.push({
                                                pathname: '/livestock/[livestockId]',
                                                params: {
                                                    livestockId: item.id,
                                                    livestockName: item.livestock_name
                                                }
                                            })
                                        }}
                                    >
                                        <HStack space="md">
                                            <Center>
                                                <Image
                                                    size="sm"
                                                    className="border-1 border-white rounded-full"
                                                    source={{
                                                        uri: `${item.image_url}`
                                                    }}
                                                    alt="Plant Image Here"
                                                />
                                            </Center>
                                            <Box className="flex-1">
                                                <Box className="justify-between flex-row items-center">
                                                    <Text className="font-bold text-lg">
                                                        {item.livestock_name} {item.harvested && <Icon as={Check} />}
                                                    </Text>
                                                    
                                                    <Text className="text-sm text-foreground/70">
                                                        { formatDate(item.created_at, "numeric") }
                                                    </Text>
                                                </Box> 
                                                <Text className="text-md text-foreground/70">Species: {item.species_name}</Text>
                                                <Text className="mt-1">
                                                    {item.description}
                                                </Text>
                                            </Box>
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
                )}
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
    pressed: {
        backgroundColor: 'black',
        borderColor: 'white'
    },
})