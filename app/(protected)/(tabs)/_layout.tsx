import React from "react";
import { Tabs } from "expo-router";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: true,
				headerStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				headerTintColor: colors.light.foreground,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarShowLabel: false,
			}}
		>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="settings" options={{ title: "Settings" }} />
			<Tabs.Screen name="list" options={{ title: "Mes séances" }} />
		</Tabs>
	);
}
