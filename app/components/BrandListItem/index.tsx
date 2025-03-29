"use client"
import { trpc } from '@/app/_trpc/client';
import Link from 'next/link';
import React from 'react';
import { IoIosCheckmarkCircle } from "react-icons/io";

type Brand = {
  name: string;
  id: string;
  createdAt: string;
  verified: boolean;
  _count: {
      products: number;
  };
};


const BrandListItem = ({ brand }: { brand: Brand }) => {
  const { data: reviews } = trpc.review.getReviewsByBrandId.useQuery(
    { brandId: brand.id },
    { enabled: brand.id.length !== 0 },
  );
  return (
    <Link href={`/brands/${brand.id}`}>
      <div className='grid grid-cols-[40%_30%_30%] bg-white border-b border-neutral-300 w-full hover:bg-neutral-200 transition-colors'>
        <div className='flex items-center'>
          <div className='bg-amber-100 rounded-lg m-2 w-14 aspect-square flex items-center justify-center'>
            <span className='text-xl text-amber-700'>{brand.name[0]}</span>
          </div>
          <div className='p-2 pl-2 flex flex-col'>
            <div className='flex items-center gap-2'>
              <h2 className='text-xl font-bold'>
                {brand.name}
              </h2>
              {brand.verified && <p className='text-green-600 text-xl'>
                <IoIosCheckmarkCircle />
              </p>}
            </div>
            <p className='text-sm text-neutral-400'>Member since {brand.createdAt.slice(0, 4)}</p>
          </div>
        </div>
        <div className='flex items-center'>{brand._count.products}</div>
        <div className='flex items-center'>{reviews?.aggregation._avg.rating ?
          <span>{reviews?.aggregation._avg.rating} ({reviews.aggregation._count.rating})</span> :
          "0"
        }</div>
      </div>
    </Link>
  )
}

export default BrandListItem