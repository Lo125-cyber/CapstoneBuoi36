import axios from "axios";

export const api = axios.create({
    baseURL: "https://apistore.cybersoft.edu.vn/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    function (config) {
        const accessToken = localStorage.getItem("accessToken");
        config.headers.Authorization = accessToken;
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        return Promise.reject(error);
    },
);
