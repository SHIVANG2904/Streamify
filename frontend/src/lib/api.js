import { axiosInstance } from "./axios";

// ✅ Auth APIs
export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.error("❌ Error inside getAuthUser:", error);
    return null;
  }
};

// ✅ Onboarding
export const CompleteOnboarding = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/onboarding", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error inside CompleteOnboarding:", error);
    throw error;
  }
};

// ✅ Chat APIs
export const getChatHistory = async (roomId) => {
  const res = await axiosInstance.get(`/chat/${roomId}`);
  return res.data;
};

// ❌ Removed saveMessage() — socket now saves message directly to DB in real-time

// ✅ Friends and Requests
export const getUserFriends = async () => {
  try {
    const res = await axiosInstance.get("/user/friends");
    return res.data.friends;
  } catch (error) {
    console.error("❌ Error getting friends:", error);
    return null;
  }
};

export const getRecommendedUsers = async () => {
  try {
    const res = await axiosInstance.get("/user");
    const users = res.data.recommendedUsers;
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("❌ Error getting recommended users:", error);
    return [];
  }
};

export const getOutgoingFriendReqs = async () => {
  try {
    const res = await axiosInstance.get("/user/outgoing-friend-requests");
    return res.data;
  } catch (error) {
    console.error("Unable to fetch:", error);
    return null;
  }
};

export const sendFriendRequest = async (userid) => {
  try {
    const response = await axiosInstance.post(`/user/friend-request/${userid}`);
    return response.data;
  } catch (error) {
    console.error("Unable to send:", error);
  }
};

export const getFriendRequest = async () => {
  try {
    const response = await axiosInstance.get("/user/friend-requests");
    return response.data;
  } catch (error) {
    console.error("Unable to fetch friend requests:", error);
    throw error;
  }
};

export const acceptFriendRequest = async (id) => {
  try {
    const response = await axiosInstance.put(
      `/user/friend-request/${id}/accept`
    );
    return response.data;
  } catch (error) {
    console.error("Unable to accept friend request:", error);
  }
};
