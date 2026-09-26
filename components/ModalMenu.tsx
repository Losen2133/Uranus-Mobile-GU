import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
} from "@/components/ui/modal";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useRouter, useSegments } from "expo-router";
import { Building2, LayoutDashboard, Leaf, LogOut, Radar, Settings, User, UsersRound } from "lucide-react-native";
import { useState } from "react";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from "./ui/alert-dialog";
import { Button, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";

const logoImage = require("../assets/images/icon.png");

type ModalMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

// const zoomOutDown = () => {
//   "worklet";

//   return {
//     initialValues: {
//       opacity: 1,
//       transform: [{ scale: 1 }, { translateY: 0 }],
//     },
//     animations: {
//       opacity: withTiming(0, { duration: 200 }),
//       transform: [
//         { scale: withTiming(0, { duration: 200 }) },
//         { translateY: withTiming(100, { duration: 200 }) },
//       ],
//     },
//   };
// };

const AnimatedModalContent = Animated.createAnimatedComponent(ModalContent);
export default function ModalMenu({
  isOpen,
  onClose,
}: ModalMenuProps) {
  const router = useRouter();
  const segments = useSegments();
  const currentPage = segments[1];
  const { signOut } = useAuth();
  const { selectedOrganizationUserRole } = useOrganization();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleNavigation = (route: string) => {
    onClose();
    router.replace(route as any);
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
    disabled = false
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`w-24 h-24 m-3 rounded-2xl items-center justify-center ${
        disabled
          ? "bg-white/5 opacity-40"
          : "bg-white/15 active:bg-black"
      }`}
    >
      {icon}
      <Text
        className={`text-xs mt-2 ${
          disabled ? "text-white/40" : "text-white"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );

  const hasRole = (...allowedRoles: string[]) =>
    allowedRoles.includes(selectedOrganizationUserRole ?? "");

  const canAccessLivestock = hasRole(
    "owner",
    "admin",
    "observer"
  );

  const canAccessMembers = hasRole(
    "owner",
    "admin"
  );

  const canAccessSensors = hasRole(
    "owner",
    "admin",
    "maintenance"
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalBackdrop className="bg-black/80" />

          <AnimatedModalContent
              entering={SlideInDown.springify()}
              exiting={SlideOutDown.duration(250)}
              className="absolute bottom-0 w-full h-[70%] rounded-t-3xl border-t-4 border-t-white bg-black"
          >
          <Center className="flex-1 mb-5">
            <HStack className="flex-wrap justify-center px-6 pt-6">
              {currentPage === 'dashboard' ? (
                  null
              ) : (
                  <MenuItem
                      label="Dashboard"
                      onPress={() => handleNavigation("/(tabs)/dashboard")}
                      icon={<LayoutDashboard color="white" size={40} />}
                  />
              )}

              {currentPage === 'members' ? (
                  null
              ) : (
                  <MenuItem
                      label="Members"
                      onPress={() => handleNavigation("/(tabs)/members")}
                      icon={<UsersRound color="white" size={40} />}
                      disabled={!canAccessMembers}
                  />
              )}

              {currentPage === 'sensors' ? (
                  null
              ) : (
                  <MenuItem
                      label="Sensors"
                      onPress={() => handleNavigation("/(tabs)/sensors")}
                      icon={<Radar color="white" size={40} />}
                      disabled={!canAccessSensors}
                  />
              )}

              {currentPage === 'livestock' ? (
                  null
              ) : (
                  <MenuItem
                      label="Livestock"
                      onPress={() => handleNavigation("/(tabs)/livestock")}
                      icon={<Leaf color="white" size={40} />}
                      disabled={!canAccessLivestock}
                  />
              )}
              
              {currentPage === 'organizations' ? (
                null
              ) : (
                <MenuItem
                  label="Organizations"
                  onPress={() => handleNavigation("/(tabs)/organizations")}
                  icon={<Building2 color="white" size={40} />}
                />
              )}

              {currentPage === 'profile' ? (
                null
              ) : (
                <MenuItem
                  label="Profile"
                  onPress={() => handleNavigation("/(tabs)/profile")}
                  icon={<User color="white" size={40} />}
                />
              )}

              {currentPage === 'settings' ? (
                null
              ) : (
                <MenuItem
                  label="Settings"
                  onPress={() => handleNavigation("/(tabs)/settings")}
                  icon={<Settings color="white" size={40} />}
                />
              )}

              <MenuItem
                  label="Logout"
                  onPress={() => setConfirmLogout(true)}
                  icon={<LogOut color="red" size={40} />}
                />
            </HStack>
          </Center>
        </AnimatedModalContent>
      </Modal>
      <AlertDialog
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
              <Heading className="text-foreground font-semibold text-lg">
                  Are you sure you want to logout?
              </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="mt-3 mb-4">
              <Text className="text-sm text-muted-foreground">
                  Confirming will log you out of Uranus.
              </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
              <Button variant="outline" onPress={() => setConfirmLogout(false)}>
                  <ButtonText>Cancel</ButtonText>
              </Button>
              <Button onPress={() => {
                  setConfirmLogout(false)
                  signOut();
              }}>
                  <ButtonText>Confirm</ButtonText>
              </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}