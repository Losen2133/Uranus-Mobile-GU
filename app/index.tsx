import { Center } from '@/components/ui/center';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
const logoImage = require("../assets/images/icon.png");

export default function Index() {
    const { userToken, isLoading } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setIsRedirecting(true);
            console.log("Reached here");
        }
    }, [isLoading, userToken]);

    return (
        <>
            <Center className='flex-1 p-5'>
                <Center className='mb-5'>
                    <Image
                        size="xl"
                        source={logoImage}
                        alt="Uranus Logo"
                    />
                </Center>
                {isLoading ? (
                    <Text size='lg' className='text-center'>Loading Session...</Text>
                ) : isRedirecting ? (
                    <>
                        {userToken ? (
                            <Text size='lg' className='text-center'>Session verified. Redirecting to Dashboard...</Text>
                        ) : (
                            <Text size='lg' className='text-center'>Session invalid. Redirecting to Login...</Text>
                        )}

                        {userToken ? (
                            <Redirect href="/(tabs)/dashboard" />
                        ) : (
                            <Redirect href="/(auth)/login" />
                        )}
                    </>
                ) : null}
            </Center>
        </>
    );
}