import { create } from "zustand";
import { api } from "../api/axios";
import { userApi } from "../api/userApi";

export const useAuth = create((set) => {
    return {
        isCheckingAuth: true,
        userInfo: null,

        getInfo: async () => {
            try {
                const res = await api.post("/Users/getProfile");
                const resEmail = res.data.content.email;
                const detail = await userApi.getDetailApi(resEmail);
                set({
                    userInfo: {
                        ...res.data.content,
                        ...detail.data.content,
                    },
                    isCheckingAuth: false,
                });
            } catch (error) {
                console.log(error);
                set({
                    userInfo: null,
                    isCheckingAuth: false,
                });
            }
        },
        logout: () => {
            localStorage.clear();
            set({
                userInfo: null,
                isCheckingAuth: false,
            });
            window.location.href = "/login";
        },
    };
});
