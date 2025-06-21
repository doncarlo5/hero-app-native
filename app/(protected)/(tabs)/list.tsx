import {
	FlatList,
	View,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { Text } from "@/components/ui/text";
import { fetchApi } from "@/lib/api-handler";
import { colors } from "@/constants/colors";
import { MessageSquareText } from "@/lib/icons/messageSquareText";

export default function List() {
	const router = useRouter();
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

	const handleSessionPress = (sessionId: string) => {
		router.push(`/session/${sessionId}`);
	};

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
						<TouchableOpacity
							className="flex-row items-center px-2 py-2 border-b border-border dark:border-border-dark w-full"
							onPress={() => handleSessionPress(item._id)}
						>
							<View
								className={`h-3 w-3 rounded-full mr-3 ${item.is_done ? "bg-green-500" : "bg-orange-500"}`}
							/>
							<Text className="mr-3 text-foreground dark:text-foreground-dark">
								<MessageSquareText
									className={`${!item.comment && "opacity-30"}`}
								/>
							</Text>
							<Text className="mr-3 text-foreground dark:text-foreground-dark">
								{new Date(item.date_session).toLocaleDateString("fr-FR")}
							</Text>
							<Text
								className={`mr-3 px-2 py-1 rounded-md font-medium text-xs ${
									item.type_session === "Upper A"
										? "bg-blue-200/30 text-blue-600 dark:bg-blue-800/20 dark:text-blue-200"
										: item.type_session === "Upper B"
											? "bg-violet-400/20 text-violet-500 dark:bg-violet-600/50 dark:text-violet-200"
											: item.type_session === "Lower"
												? "bg-green-600/10 text-green-700 dark:bg-green-800/50 dark:text-green-200"
												: "bg-gray-200/50 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200"
								}`}
							>
								{item.type_session}
							</Text>
							<Text className="text-center mr-3 text-foreground dark:text-foreground-dark">
								{item.exercise_user_list.length}
							</Text>
						</TouchableOpacity>
					)}
				/>
			)}
		</View>
	);
}
