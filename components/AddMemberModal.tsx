import { useOrganization } from "@/hooks/useOrganization";
import { OrganizationMember, Role } from "@/interfaces/interfaces";
import { capitalize } from "@/utils/stringUtils";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "./ui/alert-dialog";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "./ui/form-control";
import { Heading } from "./ui/heading";
import { AlertCircleIcon, CloseIcon, Icon } from "./ui/icon";
import { Input, InputField } from "./ui/input";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "./ui/modal";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

type AddMemberModalProps = {
    isOpen: boolean;
    onClose: () => void;
    roleList: Role[];
    user: OrganizationMember | undefined;
    onMemberAdded: (
        email: string,
        role: string
    ) => void | Promise<void>;
}

export default function AddMemberModal({
    isOpen,
    onClose,
    roleList,
    user,
    onMemberAdded
}: AddMemberModalProps) {
    const availableRoles = roleList.filter(
        (role) => !user || role.id > user?.role_id
    )
    const { selectedOrganizationId } = useOrganization();
    const [email, setEmail] = useState('');
    const [isInvalidEmail, setIsInvalidEmail] = useState(false);
    const [addingMember, setAddingMember] = useState(false);
    const [selectedRole, setSelectedRole] = useState<number | undefined>(
        roleList[0]?.id
    );
    const [confirmAddMemberVisible, setConfirmAddMemberVisibile] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (availableRoles.length > 0) {
            setSelectedRole(availableRoles[0].id);
        }

        setEmail('');
    }, [isOpen]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">Add Member</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="md">
                            <FormControl
                                isInvalid={isInvalidEmail}
                            >
                                <FormControlLabel>
                                    <FormControlLabelText>Email Address</FormControlLabelText>
                                </FormControlLabel>
                                <Input>
                                    <InputField 
                                        type='text'
                                        keyboardType='email-address'
                                        placeholder='Email Address'
                                        placeholderTextColor={'gray'}
                                        value={email}
                                        autoCapitalize="none"
                                        onChangeText={(text) => setEmail(text)}
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
                            <Box className="border border-outline-300 border-white rounded-md h-12 justify-center px-3">
                                {availableRoles.length > 0 && (
                                    <Picker
                                        selectedValue={selectedRole}
                                        onValueChange={setSelectedRole}
                                        dropdownIconColor="white"
                                        style={{
                                            color: "white",
                                            marginHorizontal: -10,
                                        }}
                                    >
                                        {availableRoles.map((role) => (
                                            <Picker.Item
                                                key={role.id}
                                                label={capitalize(role.name)}
                                                value={role.id}
                                            />
                                        ))}
                                    </Picker>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            className="mr-3"
                            onPress={onClose}
                        >
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={() => setConfirmAddMemberVisibile(true)}
                            isDisabled={!email || addingMember}
                        >
                            <ButtonText>Add</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={confirmAddMemberVisible}
                onClose={() => setConfirmAddMemberVisibile(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Adding a member
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will add {email} as a member.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" onPress={() => setConfirmAddMemberVisibile(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={async () => {
                                setAddingMember(true);
                                const role = availableRoles.find(
                                    role => role.id === selectedRole
                                );

                                if (!role || !selectedOrganizationId) {
                                    return;
                                }

                                setConfirmAddMemberVisibile(false);

                                await onMemberAdded(
                                    email,
                                    role.name
                                );
                                setAddingMember(false);
                            }}
                        >
                            <ButtonText>Confirm</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}