import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendFriendRequest } from '../lib/api'
import toast from 'react-hot-toast';

function useSendFriendReq() {
  const queryClient = useQueryClient();
  const { mutate: sendFriendReq, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['outgoingFriendReqs'] });
      console.log("Friend request sent successfully:", data);
      toast.success("Friend request sent successfully!");
    },
    onError: (error) => {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request.");
    }
  })
  return { sendFriendReq, isPending }
}

export default useSendFriendReq
