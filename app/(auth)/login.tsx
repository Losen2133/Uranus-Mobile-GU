import useAppToast from "@/components/AppToast";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
const logoImage = require("../../assets/images/icon.png");

export default function LoginScreen() {
    const { showToast } = useAppToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const URANUS_URL = 'https://uranus.luscsusjr.dpdns.org'
    
    const { signIn } = useAuth();

    const [isInvalidEmail, setIsInvalidEmail] = useState(false);
    const [isInvalidPassword, setIsInvalidPassword] = useState(false);

    const handleSubmit = () => {
        if(!email || !password) {
            setIsInvalidEmail(true);
            setIsInvalidPassword(true);
            return
        }

        handleLogin();
    }

    const handleLogin = async () => {
        setLoading(true);

        try {
            const response = await fetch(URANUS_URL + '/api/login', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
            });

        const data = await response.json();

        if (response.ok) {
            // Success: Update global state. The index.tsx redirect will handle navigation!
            await signIn(data.token);
        } else {
            // Alert.alert("Login Failed", data.message || "Invalid credentials.");
            showToast({
                action: "warning",
                title: "Login Failed",
                description: data.message
            })
            
        }
        } catch (error) {
            showToast({
                action: "warning",
                title: "Login Failed",
                description: "Could not connect to the server, please try again later"
            })
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Center className="flex-1">
                <Box
                    className="rounded-xl w-80 p-5"
                >
                    <VStack
                        space="md"
                    >
                        <Center>
                            <Image
                                size="xl"
                                source={logoImage}
                                alt="Uranus Logo"
                            />
                        </Center>
                        
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

                        <FormControl
                            isInvalid={isInvalidPassword}
                        >
                            <FormControlLabel>
                                <FormControlLabelText>Password</FormControlLabelText>
                            </FormControlLabel>
                            <Input>
                                <InputField
                                    type="password"
                                    placeholder="Password"
                                    placeholderTextColor={'gray'}
                                    value={password}
                                    onChangeText={(text) => setPassword(text)}
                                    autoCapitalize="none"
                                />
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon
                                    as={AlertCircleIcon}
                                    className='text-destructive'
                                />
                                <FormControlErrorText className="text-destructive">
                                    Please fill out this field
                                </FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        <Button
                            isDisabled={loading}
                            className="w-fit self-center mt-4 mb-5" size="lg" onPress={handleSubmit}
                        >
                            {loading && <Spinner size="small" color="grey" />}
                            <ButtonText>Login</ButtonText>
                        </Button>

                        <Text
                            className="text-center text-sm text-gray-400"
                        >
                            Don't have an account?{' '}
                            <Link 
                                href={(URANUS_URL + '/register') as any} 
                                className="text-white underline font-bold"
                            >
                                Sign up
                            </Link>
                        </Text>
                    </VStack>
                </Box>
            </Center>
        </KeyboardAvoidingView>
    )
}