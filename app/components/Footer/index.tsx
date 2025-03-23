import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div className='bg-emerald-500 p-6 text-white h-28'>
      <p>&copy; {new Date().getFullYear()} Re-view. All rights reserved.</p>
      <div className="flex justify-center space-x-6 mt-2">
        <Link href="/" className="hover:underline">About Us</Link>
        <Link href="/" className="hover:underline">Terms of Service</Link>
        <Link href="/" className="hover:underline">Privacy Policy</Link>
        <Link href="/" className="hover:underline">Contact</Link>
      </div>
    </div>
  )
}

export default Footer