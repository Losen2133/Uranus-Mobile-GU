import { LivestockProfileData } from "@/interfaces/interfaces"
import { Picker } from "@react-native-picker/picker"
import { Camera, Image as ImageIcon, RotateCcw } from "lucide-react-native"
import { Dispatch, SetStateAction } from "react"
import { Box } from "./ui/box"
import { Button, ButtonIcon, ButtonText } from "./ui/button"
import { Center } from "./ui/center"
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText } from "./ui/form-control"
import { Heading } from "./ui/heading"
import { HStack } from "./ui/hstack"
import { AlertCircleIcon, CloseIcon, Icon } from "./ui/icon"
import { Image } from "./ui/image"
import { Input, InputField } from "./ui/input"
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from "./ui/modal"
import { Text } from "./ui/text"
import { VStack } from "./ui/vstack"

export const livestockTypeField = (
    livestockType: "plant" | "fish" | undefined,
    livestockTypeSetter: Dispatch<SetStateAction<"plant" | "fish" | undefined>>,
    mode: "auto" | "manual"
) => {
    return (
        <Box>
            <VStack space="md">
                <Text className="font-bold">
                    Livestock Type
                </Text>

                <HStack space="md">
                    <Button
                        className="flex-1"
                        variant={livestockType === "plant" ? "default" : "outline"}
                        onPress={() => livestockTypeSetter("plant")}
                        disabled={mode === "auto"}
                    >
                        <ButtonText>
                            Plant
                        </ButtonText>
                    </Button>

                    <Button
                        className="flex-1"
                        variant={livestockType === "fish" ? "default" : "outline"}
                        onPress={() => livestockTypeSetter("fish")}
                        disabled={mode === "auto"}
                    >
                        <ButtonText>
                            Fish
                        </ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Box>
    )
}

export const imageField = (
    image: string | null,
    isImagePickerOpenSetter: Dispatch<SetStateAction<boolean>>
) => {
 return (
    <Box>
        <VStack space="md">
            <Text className="font-bold">
                Livestock Image
            </Text>

            <Center>
                {image ? (
                    <Box className="rounded-full border-3 border-white overflow-hidden">
                        <Image
                            source={{ uri: image }}
                            alt="Selected livestock"
                            className="w-40 h-40"
                        />
                    </Box>
                ) : (
                    <Box className="p-3 rounded-full border-3 border-white">
                        <ImageIcon
                            size={64}
                            color="white"
                        />
                    </Box>
                )}
            </Center>

            <Button onPress={() => isImagePickerOpenSetter(true)}>
                <ButtonText>
                    {image ? "Change Image" : "Upload Image"}
                </ButtonText>
            </Button>
        </VStack>
    </Box>
 )
}

export const imagePickerModal = (
    isImagePickerOpen: boolean,
    isImagePickerOpenSetter: Dispatch<SetStateAction<boolean>>,
    takePhoto: () => void,
    pickImage: () => void
) => {
    return(
        <Modal
            isOpen={isImagePickerOpen}
            onClose={() => isImagePickerOpenSetter(false)}
        >
            <ModalBackdrop />

            <ModalContent className="w-[90%]">
                <ModalHeader>
                    <Heading size="md">
                        Select Image
                    </Heading>

                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody>
                    <HStack
                        space="lg"
                        className="justify-center"
                    >
                        <Button
                            className="flex-1"
                            onPress={() => {
                                isImagePickerOpenSetter(false);
                                takePhoto();
                            }}
                        >
                            <ButtonIcon as={Camera} />
                            <ButtonText>
                                Camera
                            </ButtonText>
                        </Button>

                        <Button
                            className="flex-1"
                            onPress={() => {
                                isImagePickerOpenSetter(false);
                                pickImage();
                            }}
                        >
                            <ButtonIcon as={ImageIcon} />
                            <ButtonText>
                                Gallery
                            </ButtonText>
                        </Button>
                    </HStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export const livestockNameField = (
    livestockName: string,
    livestockNameSetter: Dispatch<SetStateAction<string>>,
    isError: boolean
) => {
    return(
        <FormControl
            isInvalid={isError}
        >
            <FormControlLabel>
                <FormControlLabelText>Livestock Name</FormControlLabelText>
            </FormControlLabel>
            <Input>
                <InputField
                    type='text'
                    placeholder='Ex: {Species Name} #1'
                    placeholderTextColor={'gray'}
                    value={livestockName}
                    onChangeText={(text) => livestockNameSetter(text)}
                />
            </Input>
            <FormControlError>
                <FormControlErrorIcon
                    as={AlertCircleIcon}
                    className='text-destructive'
                />
                <FormControlErrorText className='text-destructive'>
                    Please fill out this field
                </FormControlErrorText>
            </FormControlError>
        </FormControl>
    )
}

export const livestockDescriptionField = (
    description: string,
    descriptionSetter: Dispatch<SetStateAction<string>>,
    isError: boolean
) => {
    return (
        <FormControl
            isInvalid={isError}
        >
            <FormControlLabel>
                <FormControlLabelText>Description</FormControlLabelText>
            </FormControlLabel>
            <Input>
                <InputField
                    type='text'
                    placeholder='Ex: This is a...'
                    placeholderTextColor={'gray'}
                    value={description}
                    onChangeText={(text) => descriptionSetter(text)}
                    multiline
                    numberOfLines={4}
                    className="h-25 pt-3"
                    style={{ textAlignVertical: 'top' }}
                />
            </Input>
            <FormControlError>
                <FormControlErrorIcon
                    as={AlertCircleIcon}
                    className='text-destructive'
                />
                <FormControlErrorText className='text-destructive'>
                    Please fill out this field
                </FormControlErrorText>
            </FormControlError>
        </FormControl>
    )
}

export const useLivestockProfileField = (
    useProfile: boolean | undefined,
    useProfileSetter: Dispatch<SetStateAction<boolean | undefined >>,
    selectedProfileSetter: Dispatch<SetStateAction<LivestockProfileData | null>>
) => {
    return (
        <Box>
            <VStack space="md">
                <Text className="font-bold">
                    Use a Livestock Profile?
                </Text>

                <HStack space="md">
                    <Button
                        className="flex-1"
                        variant={useProfile === true ? "default" : "outline"}
                        onPress={() => {useProfileSetter(true);}}
                    >
                        <ButtonText>
                            Yes
                        </ButtonText>
                    </Button>

                    <Button
                        className="flex-1"
                        variant={useProfile === false ? "default" : "outline"}
                        onPress={() => {
                            useProfileSetter(false);
                            selectedProfileSetter(null);
                        }}
                    >
                        <ButtonText>
                            No
                        </ButtonText>
                    </Button>
                </HStack>
            </VStack>
        </Box>
    )
}

export const livestockProfilePickerField = (
    selectedProfileId: number | undefined,
    selectedProfileIdSetter: Dispatch<SetStateAction<number | undefined>>,
    selectedProfileSetter: Dispatch<SetStateAction<LivestockProfileData | null>>,
    livestockType: "plant" | "fish",
    livestockProfiles: LivestockProfileData[],
    applyLivestockProfile: (selectedProfile: LivestockProfileData) => void
) => {
    return (
        <Box>
            <VStack space="md">
                <Text className="font-bold">
                    Livestock Profile
                </Text>

                <Box className="border border-outline-300 border-white rounded-md h-12 justify-center px-3">
                    <Picker
                        selectedValue={selectedProfileId}
                        onValueChange={(value) => {
                            selectedProfileIdSetter(value);

                            const selectedProfile = livestockProfiles.find(
                                (profile) => profile.id === value
                            );

                            if (!selectedProfile) {
                                return;
                            }

                            selectedProfileSetter(selectedProfile);
                            applyLivestockProfile(selectedProfile);

                        }}
                        dropdownIconColor="white"
                        style={{
                            color: "white",
                            marginHorizontal: -10,
                        }}
                    >
                        <Picker.Item
                            label="Select a profile..."
                            value={null}
                        />

                        {livestockProfiles
                            .filter(
                                (profile) =>
                                    profile.type === livestockType
                            )
                            .map((profile) => (
                                <Picker.Item
                                    key={profile.id}
                                    label={profile.species_name}
                                    value={profile.id}
                                />
                            ))}
                    </Picker>
                </Box>
            </VStack>
        </Box>
    )
}

export const speciesNameField = (
    mode: "auto" | "manual",
    speciesName: string,
    speciesNameSetter: Dispatch<SetStateAction<string | undefined>>,
    isError: boolean,
    placeholder: string
) => {
    return (
        <FormControl
            isInvalid={isError}
            isDisabled={mode === "auto"}
        >
            <FormControlLabel>
                <FormControlLabelText>Species Name</FormControlLabelText>
            </FormControlLabel>
            <HStack space="md">
                <Input className="flex-1">
                    <InputField
                        type='text'
                        placeholder={placeholder}
                        placeholderTextColor={'gray'}
                        value={speciesName}
                        onChangeText={(text) => speciesNameSetter(text)}
                    />
                </Input>
            </HStack>
            
            <FormControlError>
                <FormControlErrorIcon
                    as={AlertCircleIcon}
                    className='text-destructive'
                />
                <FormControlErrorText className='text-destructive'>
                    Please fill out this field
                </FormControlErrorText>
            </FormControlError>
        </FormControl>

        
    )
}

export const numberField = (
    mode: "auto" | "manual",
    label: string,
    errorText: string,
    value: number | undefined,
    valueSetter: Dispatch<SetStateAction<number | undefined>>,
    isError: boolean,
    profileValue?: number,
    helperText?: string,
) => {
    return (
        <FormControl isInvalid={isError}>
            <FormControlLabel>
                <FormControlLabelText>
                    {label}
                </FormControlLabelText>
            </FormControlLabel>

            <HStack space="md">
                <Input className="flex-1">
                    <InputField
                        keyboardType="numeric"
                        value={value?.toString() ?? ""}
                        onChangeText={(value) => {
                            valueSetter(
                                value === "" ? undefined : Number(value)
                            );
                        }}
                    />
                </Input>
                {mode === "auto" && isModified(profileValue, value) && (
                    resetButton(() => valueSetter(profileValue))
                )}
                
            </HStack>
            
            {helperText && (
                <FormControlHelper>
                    <FormControlHelperText>
                        {helperText}
                    </FormControlHelperText>
                </FormControlHelper>
            )}
            
            <FormControlError>
                <FormControlErrorIcon
                    as={AlertCircleIcon}
                    className="text-destructive"
                />
                <FormControlErrorText>
                    {errorText}
                </FormControlErrorText>
            </FormControlError>
        </FormControl>
    );
};

const resetButton = (
    resetAction: () => void
) => {
    return (
        <Button
            onPress={resetAction}
        >
            <ButtonIcon as={RotateCcw}/>
        </Button>
    )
}

const isModified = (
    original: string | number | undefined,
    input: string | number | undefined
) => {
    return original !== input
}