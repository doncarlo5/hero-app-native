import { View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Text } from "@/components/ui/text";
import { fetchApi } from "@/lib/api-handler";

export default function SessionDetail() {
	const { id } = useLocalSearchParams();
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				setIsLoading(true);
				const response = await fetchApi(`/api/sessions/${id}`);
				setSession(response);
			} catch (error: any) {
				console.error("Fetch session error: ", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchSession();
		}
	}, [id]);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
				<Text className="text-foreground dark:text-foreground-dark">
					Loading...
				</Text>
			</View>
		);
	}

	if (!session) {
		return (
			<View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
				<Text className="text-foreground dark:text-foreground-dark">
					Session not found
				</Text>
			</View>
		);
	}

	return (
		<ScrollView className="flex-1 bg-background dark:bg-background-dark p-4">
			<View className="bg-muted dark:bg-muted-dark p-4 rounded-lg mb-4">
				<Text className="text-lg font-bold text-foreground dark:text-foreground-dark mb-2">
					Session Details
				</Text>
				<Text className="text-foreground dark:text-foreground-dark mb-1">
					Date: {new Date(session.date_session).toLocaleDateString("fr-FR")}
				</Text>
				<Text className="text-foreground dark:text-foreground-dark mb-1">
					Type: {session.type_session}
				</Text>
				<Text className="text-foreground dark:text-foreground-dark mb-1">
					Status: {session.is_done ? "Completed" : "In Progress"}
				</Text>
				{session.comment && (
					<Text className="text-foreground dark:text-foreground-dark mb-1">
						Comment: {session.comment}
					</Text>
				)}
			</View>

			<View className="bg-muted dark:bg-muted-dark p-4 rounded-lg">
				<Text className="text-lg font-bold text-foreground dark:text-foreground-dark mb-2">
					Exercises ({session.exercise_user_list.length})
				</Text>
				{session.exercise_user_list.map((exercise: any, index: number) => (
					<View
						key={index}
						className="mb-2 p-2 bg-background dark:bg-background-dark rounded"
					>
						<Text className="text-foreground dark:text-foreground-dark font-medium">
							{exercise.exercise_name}
						</Text>
						<Text className="text-foreground dark:text-foreground-dark text-sm">
							Sets: {exercise.sets} | Reps: {exercise.reps}
						</Text>
						{exercise.weight && (
							<Text className="text-foreground dark:text-foreground-dark text-sm">
								Weight: {exercise.weight}kg
							</Text>
						)}
					</View>
				))}
			</View>
		</ScrollView>
	);
}
