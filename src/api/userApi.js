import { api } from "./axios";

export const userApi = {
    getDetailApi: (email) => {
        return api.get(`/Users/detail?email=${email}`);
    },
};
