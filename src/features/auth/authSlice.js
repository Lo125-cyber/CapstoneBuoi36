import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../../api/api";

function unwrapPayload(data) {
    return (
        data?.content ??
        data?.result?.content ??
        data?.result ??
        data?.data ??
        data
    );
}

function findAccessToken(value, depth = 0) {
    if (!value || typeof value !== "object" || depth > 5) return null;

    const directToken = value.accessToken ?? value.access_token ?? value.token;
    if (typeof directToken === "string" && directToken.trim())
        return directToken;

    for (const key of ["content", "result", "data", "user", "payload"]) {
        const token = findAccessToken(value[key], depth + 1);
        if (token) return token;
    }

    return null;
}

function persistAccessToken(body) {
    const token = findAccessToken(body);
    if (token && typeof window !== "undefined") {
        window.localStorage.setItem("accessToken", token);
    }
    return token;
}

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post("/api/Users/signin", {
                email: credentials.email.trim(),
                password: credentials.password,
            });
            const body = response.data;

            if (body?.statusCode >= 400 || body?.success === false) {
                return rejectWithValue(
                    body?.message ||
                        "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.",
                );
            }

            const result = unwrapPayload(body);
            persistAccessToken(body);
            return result;
        } catch (error) {
            return rejectWithValue(
                getApiErrorMessage(
                    error,
                    "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
                ),
            );
        }
    },
);

/**
 * Đăng nhập bằng Facebook:
 * 1. Facebook JS SDK cấp access token cho người dùng.
 * 2. Gửi token đến API CyberLearn để đổi lấy token đăng nhập của hệ thống.
 */
export const loginWithFacebook = createAsyncThunk(
    "auth/loginWithFacebook",
    async (facebookAccessToken, { rejectWithValue }) => {
        try {
            if (
                typeof facebookAccessToken !== "string" ||
                !facebookAccessToken.trim()
            ) {
                return rejectWithValue(
                    "Facebook không trả về access token hợp lệ.",
                );
            }

            const response = await api.post("/api/Users/facebooklogin", {
                facebookToken: facebookAccessToken,
            });
            const body = response.data;

            if (body?.statusCode >= 400 || body?.success === false) {
                return rejectWithValue(
                    body?.message ||
                        "API CyberLearn từ chối đăng nhập Facebook.",
                );
            }

            const token = persistAccessToken(body);
            if (!token) {
                return rejectWithValue(
                    "API đã phản hồi nhưng không tìm thấy token đăng nhập. Hãy kiểm tra schema Response trong Swagger.",
                );
            }

            return unwrapPayload(body);
        } catch (error) {
            return rejectWithValue(
                getApiErrorMessage(
                    error,
                    "Không thể đăng nhập bằng Facebook. Vui lòng thử lại.",
                ),
            );
        }
    },
);

const initialState = {
    user: null,
    loading: false,
    facebookLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.error = null;
            if (typeof window !== "undefined") {
                window.localStorage.removeItem("accessToken");
            }
        },
        clearAuthError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload ||
                    action.error.message ||
                    "Đăng nhập thất bại.";
            })
            .addCase(loginWithFacebook.pending, (state) => {
                state.facebookLoading = true;
                state.error = null;
            })
            .addCase(loginWithFacebook.fulfilled, (state, action) => {
                state.facebookLoading = false;
                state.user = action.payload;
            })
            .addCase(loginWithFacebook.rejected, (state, action) => {
                state.facebookLoading = false;
                state.error =
                    action.payload ||
                    action.error.message ||
                    "Đăng nhập Facebook thất bại.";
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
