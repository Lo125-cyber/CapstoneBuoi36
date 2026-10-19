import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://shop.cyberlearn.vn",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 20000,
});

api.interceptors.request.use((config) => {
    const token =
        typeof window !== "undefined"
            ? window.localStorage.getItem("accessToken")
            : null;

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export function getApiErrorMessage(
    error,
    fallback = "Đã xảy ra lỗi khi kết nối API.",
) {
    const responseData = error?.response?.data;
    return (
        responseData?.message ||
        responseData?.content?.message ||
        responseData?.result?.message ||
        error?.message ||
        fallback
    );
}

export default api;
