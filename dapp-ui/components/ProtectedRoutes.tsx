import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

//check if you are on the client (browser) or server
const isBrowser = () => typeof window !== "undefined";

const ProtectedRoutes = ({ children } : any) => {
  const router = useRouter();
  const { data: session } = useSession();

  const isAuthenticated = session != null;
  const unprotectedRoutes = [
    '/login',
  ];

  const isProtectedPath = unprotectedRoutes.indexOf(router.pathname) === -1;
  // console.log('isProtectedPath', isProtectedPath, isAuthenticated);

  if (isBrowser() && !isAuthenticated && isProtectedPath)
    router.push('/login');

  return children;
};

export default ProtectedRoutes;
