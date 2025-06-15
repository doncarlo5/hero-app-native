import {
	FlatList,
	View,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";

import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { fetchApi } from "@/lib/api-handler";
import { colors } from "@/constants/colors";

export default function List() {
	const [isLoadingSessions, setIsLoadingSessions] = useState(false);
	const [sessions, setSessions] = useState<any[]>([]);
	const [sortConfig, setSortConfig] = useState({
		field: "date_session",
		order: "desc",
	});

	const fetchUserSessions = async () => {
		try {
			setIsLoadingSessions(true);
			const response = await fetchApi(
				`/api/sessions?limit=1000&sortBy=${sortConfig.field}:${sortConfig.order}`,
			);
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

	console.log("sessions", sessions);

	return (
		<View className="flex-1 items-center justify-center bg-background dark:bg-background-dark p-4 w-full gap-y-4">
			{isLoadingSessions ? (
				<ActivityIndicator size="large" color={colors.light.primary} />
			) : (
				<FlatList
					className="w-full"
					data={sessions}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => (
						<TouchableOpacity className="flex-row items-center p-2 mb-2 rounded bg-muted dark:bg-muted-dark w-full">
							<View
								className={`h-3 w-3 rounded-full mr-3 ${item.is_done ? "bg-green-500" : "bg-orange-500"}`}
							/>
							<Text className="mr-3 text-foreground dark:text-foreground-dark">
								{item.comment ? "" : "🗨️"}
							</Text>
							<Text className="mr-3 text-foreground dark:text-foreground-dark">
								{new Date(item.date_session).toLocaleDateString("fr-FR")}
							</Text>
							<Text
								className={`mr-3 px-2 py-1 rounded ${
									item.type_session === "Upper A"
										? "bg-blue-200 dark:bg-blue-800"
										: item.type_session === "Upper B"
											? "bg-blue-400 dark:bg-blue-600"
											: item.type_session === "Lower"
												? "bg-green-200 dark:bg-green-800"
												: "bg-gray-200 dark:bg-gray-700"
								} text-foreground dark:text-foreground-dark`}
							>
								{item.type_session}
							</Text>
							<Text className="text-center mr-3 text-foreground dark:text-foreground-dark">
								{item.exercise_user_list.length}
							</Text>
							<Text className="text-foreground dark:text-foreground-dark">
								➡️
							</Text>
						</TouchableOpacity>
					)}
				/>
			)}
		</View>
	);
}
