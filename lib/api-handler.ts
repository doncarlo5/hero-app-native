import AsyncStorage from "@react-native-async-storage/async-storage";

const baseURL = process.env.EXPO_PUBLIC_BASE_URL as string;

const getAuthHeaders = async () => {
	let token: { access_token: string; refresh_token: string } | null = null;

	try {
		const raw = await AsyncStorage.getItem(
			"sb-qmhziwpyeqpwllseache-auth-token",
		);
		if (raw) token = JSON.parse(raw);
	} catch (error) {
		console.error("Error parsing token", error);
	}

	return {
		Authorization: token ? `Bearer ${token.access_token}` : "",
		RefreshToken: token?.refresh_token ?? "",
		"Content-Type": "application/json",
	};
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
	const headers = await getAuthHeaders();

	const response = await fetch(`${baseURL}${endpoint}`, {
		...options,
		headers: {
			...headers,
			...options.headers,
		},
	});

	if (!response.ok) {
		let errorMessage = "Something went wrong";
		try {
			const data = await response.json();
			errorMessage = data.message || errorMessage;
		} catch (e) {
			console.error("Error parsing error response", e);
		}
		throw new Error(errorMessage);
	}

	if (
		response.status === 204 ||
		response.headers.get("Content-Length") === "0"
	) {
		return;
	}

	return response.json();
};

export default fetchApi;
