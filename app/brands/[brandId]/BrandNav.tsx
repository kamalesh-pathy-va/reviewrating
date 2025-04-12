import React from 'react';
import Link from 'next/link';

const BrandNav = () => {
  return (
    <div className='sticky top-4 z-10 bg-emerald-200/20 backdrop-blur-3xl p-1 mt-8 rounded-lg flex gap-2'>
      <Link href={"#home"} className='font-bold'>
        <button className='bg-emerald-300 p-2 px-4 rounded-md'>
          Brand info
        </button>
      </Link>
      <Link href={"#reviews"} className='font-bold'>
        <button className='bg-emerald-300 p-2 px-4 rounded-md'>
          Reviews
        </button>
      </Link>
      <Link href={"#products"} className='font-bold'>
        <button className='bg-emerald-300 p-2 px-4 rounded-md'>
          Products
        </button>
      </Link>
    </div>
  )
}

export default BrandNav