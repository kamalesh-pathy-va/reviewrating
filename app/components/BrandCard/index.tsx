import Link from 'next/link';
import React from 'react'

type Brand = {
  name: string;
  id: string;
  createdAt: string;
  verified: boolean;
  _count: {
      products: number;
  };
};

const BrandCard = ({brand}: {brand: Brand}) => {
  return (
    <Link href={`/brands/${brand.id}`}>
      <div className='flex items-center bg-neutral-50 rounded-2xl shadow border h-full'>
        <div className='bg-amber-100 rounded-xl p-8 px-10 m-2 aspect-square flex items-center justify-center'>
          <span className='text-7xl text-amber-700'>{brand.name[0]}</span>
        </div>
        <div className='p-4 pl-2 h-full'>
          <div className='flex items-center gap-2'>
            <h2 className='text-2xl font-bold'>
              {brand.name}
            </h2>
            {brand.verified && <p className='bg-green-50 text-green-700 px-1 rounded-full'>&#10003;</p>}
          </div>
          <p className='text-sm text-neutral-400'>Member since {brand.createdAt.slice(0, 4)}</p>
          <p className='mt-4'>Offers <strong>{brand._count.products}</strong> products and services</p>
        </div>
      </div>
    </Link>
  )
}

export default BrandCard