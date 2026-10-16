import useAppToast from "@/components/AppToast";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import {
    imageField,
    imagePickerModal,
    userEmailField,
    userNameField
} from "@/components/FormFields";
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
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
import { useAuth } from "@/hooks/useAuth";
import { UserData } from "@/interfaces/interfaces";
import { deleteAccount, getMe, updateMe } from "@/utils/apiFetch";
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
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [isDeleteWarning, setIsDeleteWarning] = useState(false);
    const navigation = useNavigation();
    const [password, setPassword] = useState<string>('');
    const router = useRouter();
    const { resetSession } = useAuth();

    const { showToast } = useAppToast();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button
                    className="h-8 w-8 rounded-full p-0"
                    onPress={() => router.push("/(tabs)/profile2")}
                >
                    <ButtonIcon as={ShieldLock} className="h-5 w-5" />
                </Button>
            ),
        });
    }, [navigation, router]);

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

    const handleDeleteAccount = async () => {
        if (!userData?.id) {
            showToast({
                action: "error",
                title: "Failed to Delete Account",
                description: "Unable to identify your account.",
            });
            return;
        }

        if (!password.trim()) {
            showToast({
                action: "error",
                title: "Password Required",
                description: "Please enter your password.",
            });
            return;
        }

        try {
            await deleteAccount(password, userData.id);

            showToast({
                action: "success",
                title: "Account Deleted",
                description: "Your account has been successfully deleted.",
            });

            setIsDeletingAccount(false);
            setPassword("");

            await resetSession();

            // Return to the index route for session evaluation.
            router.replace("/");
        } catch (error) {
            console.error("Failed to delete account:", error);

            showToast({
                action: "error",
                title: "Failed to Delete Account",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete your account. Please try again later.",
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

                    <Button
                        // variant="destructive"
                        onPress={() => setIsDeleteWarning(true)}
                    >
                        <ButtonText className="text-red-500">
                            Delete Account
                        </ButtonText>
                    </Button>
                </VStack>
            )}

            {imagePickerModal(
                isImagePickerOpen,
                setIsImagePickerOpen,
                takePhoto,
                pickImage
            )}

            
            <DeleteAccountModal
                isOpen={isDeletingAccount}
                onClose={() => {
                    setIsDeletingAccount(false);
                    setPassword("");
                }}
                onAction={handleDeleteAccount}
                password={password}
                setPassword={setPassword}
            />

            <AlertDialog
                isOpen={isDeleteWarning}
                onClose={() => setIsDeleteWarning(false)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">Confirm Account Deletion</Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Are you sure you want to delete your account? All the organizations that you own will be deleted as well. We recommend to turn over the ownership of these organizations before proceeding as this action cannot be undone.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            onPress={() => setIsDeleteWarning(false)}
                        >
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            variant="destructive"
                            onPress={() => {
                                setIsDeleteWarning(false);
                                setIsDeletingAccount(true);
                            }}
                        >
                            <ButtonText>Delete Account</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}