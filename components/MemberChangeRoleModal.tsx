import { OrganizationMember, Role } from "@/interfaces/interfaces";
import { capitalize } from "@/utils/stringUtils";
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "./ui/alert-dialog";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { CloseIcon, Icon } from "./ui/icon";
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from "./ui/modal";
import { Text } from "./ui/text";

type MemberChangeRoleModalProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedMember: OrganizationMember | undefined;
    roleList: Role[];
    user: OrganizationMember | undefined;
    onRoleUpdated: (
        role: string,
        memberId: number
    ) => void | Promise<void>;
}

export default function MemberChangeRoleModal({
    isOpen,
    onClose,
    selectedMember,
    roleList,
    user,
    onRoleUpdated
}: MemberChangeRoleModalProps) {
    const availableRoles = roleList.filter(
        (role) => !user || role.id > user?.role_id
    )
    const [changingRole, setChangingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState(selectedMember?.role_id);
    const [confirmChangeRoleVisible, setConfirmChangeRoleVisible] = useState(false);

    useEffect(() => {
        if (isOpen && selectedMember) {
            setSelectedRole(selectedMember.role_id);
        }
    }, [isOpen, selectedMember]);
    
    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">Update {selectedMember?.name}'s Role</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Box className="border border-outline-300 border-white rounded-md h-12 justify-center px-3">
                            <Picker
                                selectedValue={selectedRole}
                                onValueChange={(value) => setSelectedRole(value)}
                                dropdownIconColor="white"
                                style={{
                                    color: "white",
                                    marginHorizontal: -10, // optional
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
                        </Box> 
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
                            onPress={() => setConfirmChangeRoleVisible(true)}
                            isDisabled={selectedMember?.role_id === selectedRole || changingRole}
                        >
                            <ButtonText>Change</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={confirmChangeRoleVisible}
                onClose={() => setConfirmChangeRoleVisible(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-foreground font-semibold text-lg">
                            Are you sure you want to change {selectedMember?.name}'s role?
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Confirming this will change {selectedMember?.name}'s role
                            from {capitalize(selectedMember?.role)} to {capitalize(availableRoles.find(role => role.id === selectedRole)?.name ?? '')}.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button variant="outline" onPress={() => setConfirmChangeRoleVisible(false)}>
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            onPress={ async () => {
                                setChangingRole(true)
                                const role = availableRoles.find(
                                    role => role.id === selectedRole
                                );

                                if (!role || !selectedMember) {
                                    return;
                                }

                                setConfirmChangeRoleVisible(false);

                                await onRoleUpdated(
                                    role.name,
                                    selectedMember.id
                                );
                                setChangingRole(false)
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