import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const {
    mutate: loginMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("User data:", data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
    },
  });

  return { loginMutation, isPending, error };
};

export default useLogin;