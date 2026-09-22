import useAppToast from "@/components/AppToast";
import { passwordField } from "@/components/FormFields";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { changePassword } from "@/utils/apiFetch";
import { useState } from "react";

export default function ProfileScreen2() {
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [isInvalidCurrentPassword, setIsInvalidCurrentPassword] = useState(false);

    const [newPassword, setNewPassword] = useState<string>('');
    const [isInvalidNewPassword, setIsInvalidNewPassword] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isInvalidConfirmPassword, setIsInvalidConfirmPassword] = useState(false);

    const [changingPassword, setChangingPassword] = useState<boolean>(false);

    const { showToast } = useAppToast();

    const isTheSame =
        newPassword === confirmPassword;

    const currentPasswordError =
        currentPassword.length === 0
            ? "Please fill out this field"
            : "";

    const newPasswordError =
        newPassword.length === 0
            ? "Please fill out this field"
            : newPassword.length < 8
                ? "Password must be at least 8 characters"
                : "";

    const confirmPasswordError =
        confirmPassword.length === 0
            ? "Please fill out this field"
            : !isTheSame
                ? "Passwords do not match"
                : "";

    const handleSubmit = async () => {
        const currentPasswordInvalid =
            currentPassword.length === 0;

        const newPasswordInvalid =
            newPassword.length < 8;

        const confirmPasswordInvalid =
            confirmPassword.length === 0 ||
            !isTheSame;

        setIsInvalidCurrentPassword(currentPasswordInvalid);
        setIsInvalidNewPassword(newPasswordInvalid);
        setIsInvalidConfirmPassword(confirmPasswordInvalid);

        // Stop here if there are validation errors
        if (
            currentPasswordInvalid ||
            newPasswordInvalid ||
            confirmPasswordInvalid
        ) {
            return;
        }

        try {
            setChangingPassword(true);

            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setIsInvalidCurrentPassword(false);
            setIsInvalidNewPassword(false);
            setIsInvalidConfirmPassword(false);
            setChangingPassword(false);

            showToast({
                action: 'success',
                title: 'Successfully Changed Password',
                description: "Your password has been successfully changed",
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred';

            showToast({
                action: 'error',
                title: 'Failed to Change Password',
                description: message,
            });

            setChangingPassword(false);
        }
    };

    return (
        <VStack space="md" className="p-5">

            {passwordField(
                currentPassword,
                setCurrentPassword,
                "Current Password",
                isInvalidCurrentPassword,
                currentPasswordError,
            )}

            {passwordField(
                newPassword,
                setNewPassword,
                "New Password",
                isInvalidNewPassword,
                newPasswordError,
            )}

            {passwordField(
                confirmPassword,
                setConfirmPassword,
                "Confirm Password",
                isInvalidConfirmPassword,
                confirmPasswordError,
            )}

            <Button isDisabled={changingPassword} onPress={handleSubmit}>
                <ButtonText>Change Password</ButtonText>
            </Button>

        </VStack>
    );
}