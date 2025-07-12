import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '../lib/api'
import toast from 'react-hot-toast'

function useLogout() {
  const queryClient = useQueryClient()
  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['authUser'] })
        toast.success("Logged out successfully!")
    },
    onError: (error) => {
      console.error("Logout error:", error?.response?.data?.message || error.message)
      toast.error(error?.response?.data?.message || "An error occurred during logout.")
    }
  })
  return { logoutMutation }
}

export default useLogout
