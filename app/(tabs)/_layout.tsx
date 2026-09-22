import FloatingMenuButton from "@/components/FloatingMenuButton";
import ModalMenu from "@/components/ModalMenu";
import { useFam } from "@/hooks/useFamOpacity";
import { OrganizationProvider } from "@/hooks/useOrganization";

import { Stack, useSegments } from "expo-router";
import { Building2, LayoutDashboard, Leaf, Radar, Settings, User, UsersRound } from "lucide-react-native";
import { useState } from "react";

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const titleIconSize = 30;
  const segments = useSegments();
  const { famOpacity, setFamOpacity } = useFam();
  const isUnincluded =
    (segments[1] === "livestock" && segments[2] === "profiles") ||
    (segments[1] === "livestock" && segments[2] === "[livestockId]") ||
    (segments[1] === "livestock" && segments[2] === "form") ||
    (segments[1] === "livestock" && segments[2] === "profileForm") ||
    (segments[1] === "sensors" && segments[2] === "[sensorId]") ||
    (segments[1] === "livestock" && segments[2] === "logs") ||
    (segments[1] === "livestock" && segments[2] === "logForm") ||
    (segments[1] === "profile2");


  return (
    <>
      <OrganizationProvider>
        <Stack>
          <Stack.Screen
            name="dashboard"
            options={{
              title: " Dashboard",
              headerShown: true,
              headerLeft: () => (
                <LayoutDashboard color={'white'} size={titleIconSize} className="mx-5" />
              ),
              
            }}
          />
          <Stack.Screen
            name="members"
            options={{
              title: " Members",
              headerShown: true,
              headerLeft: () => (
                <UsersRound color={'white'} size={titleIconSize} className="mx-5" />
              ),
            }}
          />
          <Stack.Screen
            name="sensors"
            options={{
              title: " Sensors",
              headerShown: false,
              headerLeft: () => (
                <Radar color={'white'} size={titleIconSize} className="mx-5" />
              )
            }}
          />
          <Stack.Screen
            name="livestock"
            options={{
              title: " Livestock",
              headerShown: false,
              headerLeft: () => (
                <Leaf color={'white'} size={titleIconSize} className="mx-5" />
              )
            }}
          />
          <Stack.Screen
            name="organizations"
            options={{
              title: " Organizations",
              headerShown: true,
              headerLeft: () => (
                <Building2 color={'white'} size={titleIconSize} className="mx-5" />
              )
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              title: " Profile",
              headerShown: true,
              headerLeft: () => (
                <User color={'white'} size={titleIconSize} className="mx-5" />
              )
            }}
          />
          <Stack.Screen
            name="profile2"
            options={{
              title: " Change Password",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: " Settings",
              headerShown: true,
              headerLeft: () => (
                <Settings color={'white'} size={titleIconSize} className="mx-5" />
              )
            }}
          />
        </Stack>
      </OrganizationProvider>
      {!isUnincluded && (
        <FloatingMenuButton
          opacity={famOpacity}
          opacitySetter={setFamOpacity}
          isOpen={menuVisible}
          onOpen={() => setMenuVisible(true)}
          onClose={() => setMenuVisible(false)}
        />
      )} 

      <ModalMenu
        isOpen={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}