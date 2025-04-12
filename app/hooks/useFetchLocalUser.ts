"use client";
import { useEffect, useState } from 'react'
import { trpc } from '../_trpc/client';

const useFetchLocalUser = () => {
  const [localUser, setlocalUser] = useState<{ id: string; } | null>(null);

  const { data: user, isLoading: userLoading, error: userError, refetch: refetchUser } = trpc.user.getUserById.useQuery(
    { userId: localUser?.id ?? "" },
    {
      enabled: !!localUser,
      refetchOnWindowFocus: false
    },
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      const authToken = document.cookie.includes("authToken");
      if (authToken) {
        const localUserData = document.cookie.replace(/(?:(?:^|.*;\s*)user\s*\=\s*([^;]*).*$)|^.*$/,
          "$1");
        setlocalUser(localUserData ? JSON.parse(localUserData) : null);
      }
    }
  }, []);
  
  return {user, userLoading, userError, refetchUser};
}

export default useFetchLocalUser;