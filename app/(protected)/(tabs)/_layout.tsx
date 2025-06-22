import React from "react";
import { Tabs } from "expo-router";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { HomeIcon, ListIcon, SettingsIcon } from "lucide-react-native";

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
				headerTintColor:
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor: "#14b8a6",
				tabBarInactiveTintColor: "#9ca3af",
				tabBarShowLabel: true,
				tabBarIconStyle: {
					marginBottom: 3,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<HomeIcon strokeWidth={1.7} size={26} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color, size }) => (
						<SettingsIcon strokeWidth={1.7} size={26} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="list"
				options={{
					title: "Mes séances",
					tabBarIcon: ({ color, size }) => (
						<ListIcon strokeWidth={1.7} size={26} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
