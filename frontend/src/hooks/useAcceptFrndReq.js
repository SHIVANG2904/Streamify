import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { acceptFriendRequest } from '../lib/api';

function useAcceptFrndReq() {
  const queryClient = useQueryClient();
  const { mutate: acceptFriendReq, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['friendRequests']); // Refetch friend requests after accepting
      queryClient.invalidateQueries(['friends']); // Optionally, refetch friends list if needed
      console.log("Friend request accepted successfully:", data);
      toast.success("Friend request accepted!");
      // Optionally, you can trigger a refetch of friend requests or update local state here
    },
    onError: (error) => {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request.");
    },
  });
  return { acceptFriendReq, isPending };
}

export default useAcceptFrndReq
