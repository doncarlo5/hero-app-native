import { FlatList, View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { fetchApi } from "@/lib/api-handler";

export default function Settings() {
	const { signOut } = useAuth();
	const router = useRouter();

	const [isLoadingSessions, setIsLoadingSessions] = useState(false);
	const [sessions, setSessions] = useState<any[]>([]);

	const fetchUserSessions = async () => {
		try {
			setIsLoadingSessions(true);
			const response = await fetchApi(`/api/sessions`);
			setSessions(response);
		} catch (error: any) {
			console.error("Fetch error: ", error);
		} finally {
			setIsLoadingSessions(false);
		}
	};

	useEffect(() => {
		fetchUserSessions();
	}, []);

	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Sign Out</H1>
			<Muted className="text-center">
				Sign out and return to the welcome screen.
			</Muted>
			<Button
				className="w-full"
				size="default"
				variant="default"
				onPress={async () => {
					await signOut();
				}}
			>
				<Text>Sign Out</Text>
			</Button>
			<FlatList
				data={sessions}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<TouchableOpacity className="flex-row items-center p-3 mb-2 rounded bg-muted">
						<View
							className={`h-3 w-3 rounded-full mr-3 ${item.is_done ? "bg-green-500" : "bg-orange-500"}`}
						/>
						<Text className="mr-3">{item.comment ? "��" : "🗨️"}</Text>
						<Text className="mr-3">
							{new Date(item.date_session).toLocaleDateString("fr-FR")}
						</Text>
						<Text
							className={`mr-3 px-2 py-1 rounded ${
								item.type_session === "Upper A"
									? "bg-blue-200"
									: item.type_session === "Upper B"
										? "bg-blue-400"
										: item.type_session === "Lower"
											? "bg-green-200"
											: "bg-gray-200"
							}`}
						>
							{item.type_session}
						</Text>
						<Text className="text-center mr-3">
							{item.exercise_user_list.length}
						</Text>
						<Text>➡️</Text>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}
