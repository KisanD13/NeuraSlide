import axiosInstance from "../../libs/api/axiosInstance";

export const instagramApi = {
  getOAuthUrl: (userId?: string) => {
    const params = userId ? `?userId=${userId}` : "";
    return axiosInstance.get(`/crystal/instagram/oauth-url${params}`);
  },

  handleOAuthCallback: (code: string, state: string) =>
    axiosInstance.get(
      `/crystal/instagram/callback?code=${code}&state=${state}`
    ),

  connectAccount: (data: { code: string; state: string }) =>
    axiosInstance.post("/crystal/instagram/connect", data),

  getConnectedAccounts: () => axiosInstance.get("/crystal/instagram/accounts"),

  disconnectAccount: (accountId: string) =>
    axiosInstance.delete(`/crystal/instagram/accounts/${accountId}`),

  testConnection: (accountId: string) =>
    axiosInstance.get(`/crystal/instagram/test-connection/${accountId}`),
};
