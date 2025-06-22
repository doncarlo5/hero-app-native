import {
	View,
	ScrollView,
	FlatList,
	RefreshControl,
	ActivityIndicator,
	TextInput,
	Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { Text } from "@/components/ui/text";
import { fetchApi } from "@/lib/api-handler";
import { ChevronRightIcon } from "lucide-react-native";

type ExerciseUser = {
	_id: string;
	type: {
		name: string;
		advice?: string;
		timer: number;
		repRange1: string;
		repRange2: string;
		repRange3: string;
		repRange4?: string;
		type_session: string[];
		trophyLocked?: boolean;
		owner?: string;
	};
	rep: number[];
	weight: number[];
	comment?: string;
};

type Session = {
	_id: string;
	date_session: string;
	type_session: string;
	body_weight: string;
	is_done: boolean;
	comment?: string;
	exercise_user_list: ExerciseUser[];
};

export default function SessionDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();

	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const [bodyWeight, setBodyWeight] = useState("");
	const [comment, setComment] = useState("");

	const fetchSession = async () => {
		if (!id) return;
		try {
			const response: Session = await fetchApi(`/api/sessions/${id}`);
			setSession(response);
			setBodyWeight(response.body_weight);
			setComment(response.comment ?? "");
		} catch (error) {
			console.error("Fetch session error:", error);
		} finally {
			setIsLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchSession();
	}, [id]);

	console.log("session", session);
	const hasChanges =
		session &&
		(bodyWeight !== session.body_weight || comment !== (session.comment ?? ""));

	const onSave = async () => {
		if (!session || !hasChanges) return;
		try {
			setIsSaving(true);
			await fetchApi(`/api/sessions/${session._id}`, {
				method: "PUT",
				body: JSON.stringify({
					body_weight: bodyWeight,
					comment,
				}),
			});
			await fetchSession();
		} catch (error) {
			console.error("Save session error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
				<ActivityIndicator />
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
		<ScrollView
			className="flex-1 bg-background dark:bg-background-dark"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={() => {
						setRefreshing(true);
						fetchSession();
					}}
				/>
			}
			contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
		>
			<View className="">
				{/* Session Header */}
				<View className="flex-row items-center justify-between mb-4">
					<View className="flex-1">
						<Text className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-1">
							Session Details
						</Text>
						<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
							{new Date(session.date_session).toLocaleDateString("fr-FR", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</Text>
					</View>
					<View
						className={`rounded-full px-4 py-2 ${
							session.is_done
								? "bg-green-100 dark:bg-green-900/30"
								: "bg-orange-100 dark:bg-orange-900/30"
						}`}
					>
						<Text
							className={`text-sm font-medium ${
								session.is_done
									? "text-green-700 dark:text-green-300"
									: "text-orange-700 dark:text-orange-300"
							}`}
						>
							{session.is_done ? "Completed" : "In Progress"}
						</Text>
					</View>
				</View>

				{/* Editable Fields */}
				<View className="space-y-4">
					{/* Body Weight */}
					<View className="">
						<Text className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark mb-2">
							Body Weight
						</Text>
						<TextInput
							value={bodyWeight}
							onChangeText={setBodyWeight}
							keyboardType="numeric"
							placeholder="Enter your weight in kg"
							className="text-foreground dark:text-foreground-dark bg-transparent"
							placeholderTextColor="#6b7280"
						/>
					</View>

					{/* Comment */}
					<View className="">
						<Text className="text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark mb-2">
							Session Notes
						</Text>
						<TextInput
							value={comment}
							onChangeText={setComment}
							multiline
							placeholder="Add notes about your session..."
							className="text-foreground dark:text-foreground-dark bg-transparent"
							placeholderTextColor="#6b7280"
						/>
					</View>
				</View>

				{/* Save Button */}
				{hasChanges && (
					<View className="mt-4">
						<Pressable
							disabled={isSaving}
							onPress={onSave}
							className={`rounded-lg px-6 py-3 flex-row items-center justify-center ${
								isSaving
									? "bg-muted dark:bg-muted-dark"
									: "bg-primary dark:bg-primary-dark"
							}`}
						>
							<Text
								className={`font-medium ${
									isSaving
										? "text-muted-foreground dark:text-muted-foreground-dark"
										: "text-white"
								}`}
							>
								{isSaving ? "💾 Saving..." : "💾 Save Changes"}
							</Text>
						</Pressable>
					</View>
				)}
			</View>

			{/* EXERCISES */}
			<View className="">
				<View className="flex-row items-center justify-between mb-6">
					<View className="flex-1">
						<Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
							Exercises
						</Text>
						<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
							{session.exercise_user_list.length} exercise
							{session.exercise_user_list.length !== 1 ? "s" : ""} completed
						</Text>
					</View>
				</View>

				<FlatList
					data={session.exercise_user_list}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => (
						<View className="mb-4 overflow-hidden rounded-xl bg-background dark:bg-background-dark shadow-sm border border-muted/20 dark:border-muted-dark/20">
							{/* Exercise Header */}
							<View className="flex-row items-center justify-between mb-3">
								<View className="flex-1">
									<Text className="font-bold text-lg text-foreground dark:text-foreground-dark">
										{item.type.name}
									</Text>
								</View>
								<ChevronRightIcon size={20} color="#6b7280" />
							</View>

							<View className="mb-3">
								<View className="flex-row gap-2 w-full">
									{item.rep.map((rep, index) => {
										// Only show sets with actual data
										if (rep <= 0 || item.weight[index] <= 0) return null;

										return (
											<View
												key={index}
												className="bg-primary/5 flex-1 dark:bg-primary-dark/5 rounded-lg px-3 py-2 border border-primary/10 dark:border-primary-dark/10"
											>
												<Text className="text-xs font-medium text-primary dark:text-primary-dark">
													Set {index + 1}
												</Text>
												<Text className="text-sm font-bold text-foreground dark:text-foreground-dark">
													{rep} reps
												</Text>
												<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
													{item.weight[index]} kg
												</Text>
											</View>
										);
									})}
								</View>
							</View>

							{/* Summary Stats
							<View className="flex-row justify-between items-center bg-muted/30 dark:bg-muted-dark/30 rounded-lg p-3 mb-3">
								<View className="items-center">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
										Total Reps
									</Text>
									<Text className="font-bold text-lg text-foreground dark:text-foreground-dark">
										{item.rep
											.filter((rep, index) => rep > 0 && item.weight[index] > 0)
											.reduce((sum, rep) => sum + rep, 0)}
									</Text>
								</View>
								<View className="h-8 w-px bg-muted dark:bg-muted-dark" />
								<View className="items-center">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
										Max Weight
									</Text>
									<Text className="font-bold text-lg text-foreground dark:text-foreground-dark">
										{Math.max(
											...item.weight.filter(
												(weight, index) => weight > 0 && item.rep[index] > 0,
											),
										)}{" "}
										kg
									</Text>
								</View>
								<View className="h-8 w-px bg-muted dark:bg-muted-dark" />
								<View className="items-center">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
										Avg Weight
									</Text>
									<Text className="font-bold text-lg text-foreground dark:text-foreground-dark">
										{(
											item.weight
												.filter(
													(weight, index) => weight > 0 && item.rep[index] > 0,
												)
												.reduce((sum, weight) => sum + weight, 0) /
											item.weight.filter(
												(weight, index) => weight > 0 && item.rep[index] > 0,
											).length
										).toFixed(1)}{" "}
										kg
									</Text>
								</View>
							</View> */}

							{item.comment && (
								<View className="bg-muted/20 dark:bg-muted-dark/20 rounded-lg p-3">
									<Text className="text-sm text-foreground dark:text-foreground-dark">
										{item.comment}
									</Text>
								</View>
							)}
						</View>
					)}
					scrollEnabled={false}
				/>
			</View>
		</ScrollView>
	);
}
