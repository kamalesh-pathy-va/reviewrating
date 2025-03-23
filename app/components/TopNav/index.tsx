"use client";
import React, {useEffect, useState} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Search from '../Search';
import ProfileButton from './ProfileButton';

interface TopNavProps {
  user?: {
    name: string;
  };
}

const TopNav: React.FC<TopNavProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isAuthPage = pathname.includes('/auth');
  
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const authToken = document.cookie.includes("authToken");
      if (authToken) {
        const userData = document.cookie.replace(
          /(?:(?:^|.*;\s*)user\s*\=\s*([^;]*).*$)|^.*$/,
          "$1"
        );
        setUser(userData ? JSON.parse(userData) : null);
      }
    }
  }, [isAuthPage]);

  return (
    <nav className="w-full flex justify-between items-center p-6 bg-emerald-200">
      <Link href="/">
        <div className="font-bold text-4xl">Re-view</div>
      </Link>
      {(!isHomePage && !isAuthPage) && (
        <div className='w-1/3'>
          <Search />
        </div>
      )}
      <div className="flex items-center">
        {user ? (!isAuthPage &&
          <div className='flex items-center gap-4'>
            <Link href="/brands">
              <span className='font-bold hover:underline text-emerald-600 hover:text-emerald-700 text-md'>Brands</span>
            </Link>
            <Link href="/products">
              <span className='font-bold hover:underline text-emerald-600 hover:text-emerald-700 text-md'>Products</span>
            </Link>
            <ProfileButton username={user.name} />
          </div>
        ) : (
            isAuthPage ? null :
          <>
            <button
                onClick={() => router.push('/auth/login')}
                className='bg-emerald-600 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-full mr-4'
            >
              Login
            </button>
            <button
                onClick={() => router.push('/auth/signup')}
                className='font-bold hover:underline'
            >
              Signup
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default TopNav;