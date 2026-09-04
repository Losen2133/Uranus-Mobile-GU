import { Link, useRouter } from "expo-router";
import { Center } from "./ui/center";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export default function SelectOrgDisplay() {
    const router = useRouter();

    return (
        <Center
            className="flex-1"
        >
            <VStack>
                <Text
                    className="text-2xl font-bold mb-5"
                >
                    Select an Organization
                </Text>
                <Link
                    href={'/(tabs)/organizations'}
                    className="text-white underline text-center"
                >
                    <Text className="text-white underline text-center">{'-->'} Go to Organization Page</Text>
                </Link>
            </VStack>
        </Center>
    )
}