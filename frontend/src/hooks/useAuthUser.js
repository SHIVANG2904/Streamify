import { useQuery } from "@tanstack/react-query";
import {getAuthUser} from "../lib/api";

export const useAuthUser = () => {
    const authUser = useQuery({
    queryKey: ["authUser"], 
    queryFn: getAuthUser,
    retry: false
  });
  return {isloading: authUser.isLoading, authUser: authUser.data?.user, error: authUser.error}
}

