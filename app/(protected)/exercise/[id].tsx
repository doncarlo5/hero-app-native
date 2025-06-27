import {
	View,
	ScrollView,
	RefreshControl,
	ActivityIndicator,
	Alert,
	TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api-handler";
import {
	InfoIcon,
	TrashIcon,
	EditIcon,
	XIcon,
	CheckIcon,
} from "lucide-react-native";

type ExerciseUser = {
	_id: string;
	type: {
		_id: string;
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
	session?: string;
};

type ExerciseType = {
	_id: string;
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

type Session = {
	_id: string;
	date_session: string;
	name?: string;
};

export default function ExerciseDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();

	const [exercise, setExercise] = useState<ExerciseUser | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [isEditable, setIsEditable] = useState(false);
	const [selectedExerciseType, setSelectedExerciseType] =
		useState<ExerciseType | null>(null);
	const [isRep4, setIsRep4] = useState(false);

	const [formState, setFormState] = useState({
		rep1: "",
		rep2: "",
		rep3: "",
		rep4: "",
		weight1: "",
		weight2: "",
		weight3: "",
		weight4: "",
		comment: "",
	});

	const fetchExercise = async () => {
		if (!id) return;
		try {
			const response: ExerciseUser = await fetchApi(`/api/exercise-user/${id}`);
			setExercise(response);
			setSelectedExerciseType(response.type);

			// Initialize form state
			setFormState({
				rep1: response.rep[0]?.toString() || "",
				rep2: response.rep[1]?.toString() || "",
				rep3: response.rep[2]?.toString() || "",
				rep4: response.rep[3]?.toString() || "",
				weight1: response.weight[0]?.toString() || "",
				weight2: response.weight[1]?.toString() || "",
				weight3: response.weight[2]?.toString() || "",
				weight4: response.weight[3]?.toString() || "",
				comment: response.comment || "",
			});

			if (response.rep[3] && response.rep[3] > 0) {
				setIsRep4(true);
			}

			// Fetch session data
			if (response.session) {
				const sessionData: Session = await fetchApi(
					`/api/sessions/${response.session}`,
				);
				setSession(sessionData);
			}

			// Fetch exercise types
			const exerciseTypesData: ExerciseType[] = await fetchApi(
				`/api/exercise-type?limit=1000`,
			);
			setExerciseTypes(exerciseTypesData);
		} catch (error) {
			console.error("Fetch exercise error:", error);
		} finally {
			setIsLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchExercise();
	}, [id]);

	const handleInputChange = (field: string, value: string) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		if (!exercise || !selectedExerciseType) return;

		setIsSaving(true);
		try {
			const repArray = [
				parseInt(formState.rep1) || 0,
				parseInt(formState.rep2) || 0,
				parseInt(formState.rep3) || 0,
			];
			const weightArray = [
				parseInt(formState.weight1) || 0,
				parseInt(formState.weight2) || 0,
				parseInt(formState.weight3) || 0,
			];

			if (isRep4) {
				repArray.push(parseInt(formState.rep4) || 0);
				weightArray.push(parseInt(formState.weight4) || 0);
			}

			await fetchApi(`/api/exercise-user/${exercise._id}`, {
				method: "PUT",
				body: JSON.stringify({
					type: selectedExerciseType,
					rep: repArray,
					weight: weightArray,
					comment: formState.comment,
				}),
			});

			// Refresh data
			await fetchExercise();
			setIsEditable(false);
		} catch (error) {
			console.error("Update exercise error:", error);
			Alert.alert("Error", "Failed to update exercise");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = () => {
		if (!exercise) return;

		Alert.alert(
			"Delete Exercise",
			"Are you sure you want to delete this exercise? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await fetchApi(`/api/exercise-user/${exercise._id}`, {
								method: "DELETE",
							});

							if (session) {
								router.push(`/session/${session._id}`);
							} else {
								router.back();
							}
						} catch (error) {
							console.error("Delete exercise error:", error);
							Alert.alert("Error", "Failed to delete exercise");
						}
					},
				},
			],
		);
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
				<ActivityIndicator />
			</View>
		);
	}

	if (!exercise) {
		return (
			<View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
				<Text className="text-foreground dark:text-foreground-dark">
					Exercise not found
				</Text>
			</View>
		);
	}

	const completedSets = exercise.rep.filter(
		(rep, index) => rep > 0 && exercise.weight[index] > 0,
	);
	const totalReps = completedSets.reduce((sum, rep) => sum + rep, 0);
	const maxWeight = Math.max(
		...exercise.weight.filter(
			(weight, index) => weight > 0 && exercise.rep[index] > 0,
		),
	);

	return (
		<ScrollView
			className="flex-1 bg-background dark:bg-background-dark"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={() => {
						setRefreshing(true);
						fetchExercise();
					}}
				/>
			}
			contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
		>
			{/* Header with back button */}
			<View className="flex-row items-center mb-6">
				<View className="flex-1">
					<Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
						{exercise.type.name}
					</Text>
					{session && (
						<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
							Session: {new Date(session.date_session).toLocaleDateString()}
						</Text>
					)}
				</View>
			</View>

			{/* Exercise Type Selector (when editing) */}
			{isEditable && (
				<View className="mb-6">
					<Text className="text-sm font-medium text-foreground dark:text-foreground-dark mb-2">
						Exercise Type
					</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View className="flex-row space-x-2">
							{exerciseTypes.map((type) => (
								<TouchableOpacity
									key={type._id}
									onPress={() => setSelectedExerciseType(type)}
									className={`px-4 py-2 rounded-lg border ${
										selectedExerciseType?._id === type._id
											? "bg-primary border-primary"
											: "bg-muted/30 border-muted dark:bg-muted-dark/30 dark:border-muted-dark"
									}`}
								>
									<Text
										className={`text-sm ${
											selectedExerciseType?._id === type._id
												? "text-primary-foreground"
												: "text-foreground dark:text-foreground-dark"
										}`}
									>
										{type.name}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>
				</View>
			)}

			{/* Advice */}
			{exercise.type.advice && (
				<View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 flex-row items-center gap-2">
					<InfoIcon size={15} color="#1e40af" />
					<Text className="text-sm text-blue-700 dark:text-blue-200">
						{exercise.type.advice}
					</Text>
				</View>
			)}

			{/* Sets Form */}
			<View className="mb-6">
				<Text className="text-xl font-bold text-foreground dark:text-foreground-dark mb-4">
					{isEditable ? "Edit Sets" : "Sets Detail"}
				</Text>

				{isEditable ? (
					<View className="space-y-4">
						{/* Set 1 */}
						<View className="bg-primary/5 dark:bg-primary-dark/5 rounded-lg p-4 border border-primary/10 dark:border-primary-dark/10">
							<Text className="text-sm font-medium text-primary dark:text-primary-dark mb-3">
								Set 1
							</Text>
							<View className="flex-row space-x-3">
								<View className="flex-1">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark mb-1">
										Reps
									</Text>
									<Input
										value={formState.rep1}
										onChangeText={(value) => handleInputChange("rep1", value)}
										placeholder="0"
										keyboardType="numeric"
										className="text-center"
									/>
								</View>
								<View className="flex-1">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark mb-1">
										Weight (kg)
									</Text>
									<Input
										value={formState.weight1}
										onChangeText={(value) =>
											handleInputChange("weight1", value)
										}
										placeholder="0"
										keyboardType="numeric"
										className="text-center"
									/>
								</View>
							</View>
						</View>

						{/* Set 2 */}
						<View className="bg-primary/5 dark:bg-primary-dark/5 rounded-lg p-4 border border-primary/10 dark:border-primary-dark/10">
							<Text className="text-sm font-medium text-primary dark:text-primary-dark mb-3">
								Set 2
							</Text>
							<View className="flex-row space-x-3">
								<View className="flex-1">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark mb-1">
										Reps
									</Text>
									<Input
										value={formState.rep2}
										onChangeText={(value) => handleInputChange("rep2", value)}
										placeholder="0"
										keyboardType="numeric"
										className="text-center"
									/>
								</View>
								<View className="flex-1">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark mb-1">
										Weight (kg)
									</Text>
									<Input
										value={formState.weight2}
										onChangeText={(value) =>
											handleInputChange("weight2", value)
										}
										placeholder="0"
										keyboardType="numeric"
										className="text-center"
									/>
								</View>
							</View>
						</View>

						{/* Set 3 */}
						<View className="bg-primary/5 dark:bg-primary-dark/5 rounded-lg p-4 border border-primary/10 dark:border-primary-dark/10">
							<Text className="text-sm font-medium text-primary dark:text-primary-dark mb-3">
								Set 3
							</Text>
							<View className="flex-row space-x-3">
								<View className="flex-1">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark mb-1">
										Reps
									</Text>
									<Input
										value={formState.rep3}
										onChangeText={(value) => handleInputChange("rep3", value)}
										placeholder="0"
										keyboardType="numeric"
										className="text-center"
									/>
								</View>
								<View className="flex-1">
									<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark mb-1">
										Weight (kg)
									</Text>
									<Input
										value={formState.weight3}
										onChangeText={(value) =>
											handleInputChange("weight3", value)
										}
										placeholder="0"
										keyboardType="numeric"
										className="text-center"
									/>
								</View>
							</View>
						</View>

						{/* Set 4 (conditional) */}
						{isRep4 && (
							<View className="bg-primary/5 dark:bg-primary-dark/5 rounded-lg p-4 border border-primary/10 dark:border-primary-dark/10">
								<Text className="text-sm font-medium text-primary dark:text-primary-dark mb-3">
									Set 4
								</Text>
								<View className="flex-row space-x-3">
									<View className="flex-1">
										<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark mb-1">
											Reps
										</Text>
										<Input
											value={formState.rep4}
											onChangeText={(value) => handleInputChange("rep4", value)}
											placeholder="0"
											keyboardType="numeric"
											className="text-center"
										/>
									</View>
									<View className="flex-1">
										<Text className="text-xs text-muted-foreground dark:text-muted-foreground-dark mb-1">
											Weight (kg)
										</Text>
										<Input
											value={formState.weight4}
											onChangeText={(value) =>
												handleInputChange("weight4", value)
											}
											placeholder="0"
											keyboardType="numeric"
											className="text-center"
										/>
									</View>
								</View>
							</View>
						)}

						{/* Add Set 4 button */}
						{!isRep4 && (
							<TouchableOpacity
								onPress={() => setIsRep4(true)}
								className="bg-muted/30 dark:bg-muted-dark/30 rounded-lg p-4 border border-dashed border-muted dark:border-muted-dark"
							>
								<Text className="text-center text-muted-foreground dark:text-muted-foreground-dark">
									+ Add Set 4
								</Text>
							</TouchableOpacity>
						)}
					</View>
				) : (
					<View className="space-y-3">
						<View className="flex-row gap-2 w-full">
							{exercise.rep.map((rep, index) => {
								if (rep <= 0 || exercise.weight[index] <= 0) return null;

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
											{exercise.weight[index]} kg
										</Text>
									</View>
								);
							})}
						</View>
					</View>
				)}
			</View>

			{/* Comment */}
			<View className="mb-6">
				<Text className="text-xl font-bold text-foreground dark:text-foreground-dark mb-4">
					Notes
				</Text>
				{isEditable ? (
					<Textarea
						value={formState.comment}
						onChangeText={(value) => handleInputChange("comment", value)}
						placeholder="Add notes about this exercise..."
						className="bg-muted/20 dark:bg-muted-dark/20 rounded-lg p-4"
						multiline
						numberOfLines={4}
					/>
				) : (
					<View className="bg-muted/20 dark:bg-muted-dark/20 rounded-lg p-4">
						<Text className="text-sm text-foreground dark:text-foreground-dark">
							{exercise.comment || "No notes added"}
						</Text>
					</View>
				)}
			</View>

			{/* Exercise Type Information */}
			<View className="mb-6">
				<Text className="text-xl font-bold text-foreground dark:text-foreground-dark mb-4">
					Exercise Information
				</Text>
				<View className="bg-muted/20 dark:bg-muted-dark/20 rounded-lg p-4 space-y-3">
					<View className="flex-row justify-between">
						<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
							Timer:
						</Text>
						<Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
							{exercise.type.timer} seconds
						</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
							Rep Range 1:
						</Text>
						<Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
							{exercise.type.repRange1}
						</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
							Rep Range 2:
						</Text>
						<Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
							{exercise.type.repRange2}
						</Text>
					</View>
					<View className="flex-row justify-between">
						<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
							Rep Range 3:
						</Text>
						<Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
							{exercise.type.repRange3}
						</Text>
					</View>
					{exercise.type.repRange4 && (
						<View className="flex-row justify-between">
							<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
								Rep Range 4:
							</Text>
							<Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
								{exercise.type.repRange4}
							</Text>
						</View>
					)}
					<View className="flex-row justify-between">
						<Text className="text-sm text-muted-foreground dark:text-muted-foreground-dark">
							Session Types:
						</Text>
						<Text className="text-sm font-medium text-foreground dark:text-foreground-dark">
							{exercise.type.type_session.join(", ")}
						</Text>
					</View>
				</View>
			</View>

			{/* Action Buttons */}
			<View className="flex-row gap-2 mb-6">
				<Button
					variant="outline"
					onPress={handleDelete}
					className="flex-1 flex-row items-center justify-center dark:bg-background-dark dark:text-foreground-dark"
				>
					<TrashIcon size={16} color="#ef4444" />
					<Text className="ml-2 text-red-500">Delete</Text>
				</Button>

				{!isEditable ? (
					<Button
						onPress={() => setIsEditable(true)}
						className="flex-1 dark:bg-transparent flex-row items-center justify-center dark:bg-background-dark dark:text-foreground-dark"
					>
						<EditIcon size={16} color="white" />
						<Text className="ml-2">Edit</Text>
					</Button>
				) : (
					<View className="flex-1 flex-row gap-2">
						<Button
							variant="outline"
							onPress={() => {
								setIsEditable(false);
								// Reset form state
								setFormState({
									rep1: exercise.rep[0]?.toString() || "",
									rep2: exercise.rep[1]?.toString() || "",
									rep3: exercise.rep[2]?.toString() || "",
									rep4: exercise.rep[3]?.toString() || "",
									weight1: exercise.weight[0]?.toString() || "",
									weight2: exercise.weight[1]?.toString() || "",
									weight3: exercise.weight[2]?.toString() || "",
									weight4: exercise.weight[3]?.toString() || "",
									comment: exercise.comment || "",
								});
								setIsRep4(Boolean(exercise.rep[3] && exercise.rep[3] > 0));
								setSelectedExerciseType(exercise.type);
							}}
							disabled={isSaving}
							className="flex-1 flex-row items-center justify-center dark:bg-background-dark dark:text-foreground-dark"
						>
							<XIcon size={16} color="#6b7280" />
							<Text className="ml-2 text-muted-foreground dark:text-muted-foreground-dark">
								Cancel
							</Text>
						</Button>
						<Button
							onPress={handleSave}
							disabled={isSaving}
							className="flex-1 dark:bg-transparent flex-row items-center justify-center dark:bg-background-dark dark:text-foreground-dark"
						>
							{isSaving ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<CheckIcon size={16} color="white" />
							)}
							<Text className="ml-2">{isSaving ? "Saving..." : "Save"}</Text>
						</Button>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
