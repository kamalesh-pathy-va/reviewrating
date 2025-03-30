"use client";
import { useRouter } from 'next/navigation';
import React, {useState} from 'react'

const ProfileButton = ({ username }: { username: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const logout = () => {
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Remove token
    router.push("/auth/login"); // Redirect to login
  };
  return (
    <div className='relative'>
      <button className='bg-emerald-600 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-full mr-4' onClick={() => setIsOpen(!isOpen)}>
        {username}
      </button>
      {isOpen && (
        <div className='absolute -left-2 mt-2 bg-emerald-50 p-1 rounded-lg shadow-lg w-full z-10'>
          <button className='block w-full text-left hover:bg-emerald-100 p-2 rounded-lg' onClick={() => { router.push("/profile"); setIsOpen(!isOpen) }}>Profile</button>
          <button className='block w-full text-left hover:bg-emerald-100 p-2 rounded-lg' onClick={() => logout()}>Logout</button>
        </div>
      )}
    </div>
  )
}

export default ProfileButton