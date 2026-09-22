import useAppToast from "@/components/AppToast";
import {
    imageField,
    imagePickerModal,
    userEmailField,
    userNameField
} from "@/components/FormFields";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import {
    ImageViewer,
    ImageViewerCloseButton,
    ImageViewerContent,
    ImageViewerTrigger
} from "@/components/ui/image-viewer";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { UserData } from "@/interfaces/interfaces";
import { getMe, updateMe } from "@/utils/apiFetch";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { ShieldLock } from "lucide-react-native";
import { useEffect, useLayoutEffect, useState } from "react";

export default function ProfileScreen() {
    const [userName, setUserName] = useState<string>('');
    const [isInvalidUserName, setIsInvalidUserName] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isInvalidUserEmail, setIsInvalidUserEmail] = useState(false);
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [changeImage, setChangeImage] = useState(false);
    const [oldImage, setOldImage] = useState<string>('');
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const navigation = useNavigation();
    const router = useRouter();

    const { showToast } = useAppToast();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <Button
                    className="h-8 w-8 rounded-full p-0"
                    onPress={() => router.push('/(tabs)/profile2')}
                >
                    <ButtonIcon as={ShieldLock} className="h-5 w-5" />
                </Button>     
        });
    });

    const handleProfileFetcher = async () => {
        try {
            await getMe(setUserData);
        } catch (error) {
            showToast({
                action: 'error',
                title: 'Failed to Fetch Profile',
                description: 'Failed to fetch profile data, please try again later',
            });
        }
    };

    const handleUpdateProfile = async () => {
        if (!userData) {
            return;
        }

        try {
            const nameChanged = userData.name !== userName;
            const emailChanged = userData.email !== userEmail;
            const imageChanged = image !== null;

            await updateMe({
                userId: userData.id,
                userName: nameChanged ? userName : undefined,
                userEmail: emailChanged ? userEmail : undefined,
                image: imageChanged ? image : undefined,
            });

            await handleProfileFetcher();

            setImage(null);
            setChangeImage(false);

            showToast({
                action: 'success',
                title: 'Profile Updated',
                description: 'Your profile information has been updated successfully.',
            });
        } catch (error) {
            await handleProfileFetcher();

            showToast({
                action: 'error',
                title: 'Failed to Update Profile',
                description: 'Failed to update profile data, please try again later',
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await handleProfileFetcher();
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!userData) {
            return;
        }

        setUserName(userData.name);
        setUserEmail(userData.email);

        // Make sure the image value is actually a string
        setOldImage(
            typeof userData.image_url === "string"
                ? userData.image_url
                : ""
        );
    }, [userData]);

    const pickImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const takePhoto = async () => {
        const permission =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const hasChanges =
        userData?.name !== userName ||
        userData?.email !== userEmail ||
        image !== null;

    return (
        <>
            {loading ? (
                <Center className="flex-1">
                    <Text>Loading...</Text>
                </Center>
            ) : (
                <VStack space="md" className="p-5">
                    <Box>
                        <Heading>Profile Information</Heading>
                        <Text className="text-gray-400 text-sm">
                            Update your profile information
                        </Text>
                    </Box>

                    <Divider />

                    {!changeImage ? (
                        <>
                            {oldImage ? (
                                <ImageViewer
                                    images={[
                                        {
                                            url: oldImage,
                                            alt: userData?.name ?? "Profile Image",
                                        },
                                    ]}
                                >
                                    <ImageViewerTrigger>
                                        <Center>
                                            <Image
                                                source={{ uri: oldImage }}
                                                alt={userData?.name ?? "Profile Image"}
                                                className="border-3 border-white rounded"
                                                resizeMode="cover"
                                                size="xl"
                                            />
                                        </Center>
                                    </ImageViewerTrigger>

                                    <ImageViewerContent>
                                        <ImageViewerCloseButton />
                                    </ImageViewerContent>
                                </ImageViewer>
                            ) : (
                                <Center>
                                    <Text>No profile image</Text>
                                </Center>
                            )}

                            <Button onPress={() => setChangeImage(true)}>
                                <ButtonText>
                                    Change Profile Image
                                </ButtonText>
                            </Button>
                        </>
                    ) : (
                        <>
                            {imageField(
                                image?.uri ?? null,
                                setIsImagePickerOpen,
                                "User Profile Image"
                            )}

                            <Button
                                variant="outline"
                                onPress={() => {
                                    setChangeImage(false);
                                    setImage(null);
                                }}
                            >
                                <ButtonText>Cancel</ButtonText>
                            </Button>
                        </>
                    )}

                    <Divider />

                    {userNameField(
                        userName,
                        setUserName,
                        isInvalidUserName
                    )}

                    {userEmailField(
                        userEmail,
                        setUserEmail,
                        isInvalidUserEmail
                    )}

                    <Divider />

                    <Button
                        isDisabled={!hasChanges}
                        onPress={handleUpdateProfile}
                    >
                        <ButtonText>Save</ButtonText>
                    </Button>
                </VStack>
            )}

            {imagePickerModal(
                isImagePickerOpen,
                setIsImagePickerOpen,
                takePhoto,
                pickImage
            )}
        </>
    );
}