import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignup = () => {
  const queryClient = useQueryClient();
  const { mutate: signupMutation, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      console.log("Signup success:", data); // ✅ show success info
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); // ✅ refetch user
    },
    onError: (error) => {
      console.error(
        "Signup error:",
        error?.response?.data?.message || error.message
      );
    },
  });
  return { signupMutation, isPending, error };
};

export default useSignup;