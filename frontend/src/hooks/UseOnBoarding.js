import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CompleteOnboarding } from '../lib/api';
import toast from 'react-hot-toast';

function UseOnBoarding() {
  const queryClient = useQueryClient();
  const { mutate: onboardingMutation, isPending ,error } = useMutation({
    mutationFn: CompleteOnboarding,
    onSuccess: (data) => {
      console.log("Onboarding success:", data);
      toast.success("Onboarding completed successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error(
        "Onboarding error:",
        error?.response?.data?.message || error.message
      );
      toast.error(
        error?.response?.data?.message || "An error occurred during onboarding."
      );
    },
  });
  return { onboardingMutation, isPending, error };
}

export default UseOnBoarding
