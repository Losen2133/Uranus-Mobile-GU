import { Link } from "expo-router";
import { Building2 } from "lucide-react-native";
import { Center } from "./ui/center";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export default function SelectOrgDisplay() {
    return (
        <Center
            className="flex-1"
        >
            <VStack className="justify-center items-center">
                <Building2 color={'white'} size={50} />
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