"use client";
import React, { useEffect, useState } from 'react'
import { trpc } from '@/app/_trpc/client'
import { IoIosCheckmarkCircle } from 'react-icons/io';
import StarRatings from 'react-star-ratings';

const BrandHeader = ({ brandId }: { brandId: string }) => {
  const [avgRating, setAvgRating] = useState(0);
  const { data: brandData, isLoading: brandIsLoading, error: brandError } = trpc.brand.getBrandById.useQuery(
    { id: brandId },
    {
      enabled: brandId.length === 36,
      refetchOnWindowFocus: false,
    },
  );

  const { data: reviews } = trpc.review.getReviewsByBrandId.useQuery(
    { brandId: brandId },
    { enabled: brandId.length === 36 },
  );

  useEffect(() => {
    setAvgRating(Math.round(((reviews?.aggregation._avg.rating ?? 0) + Number.EPSILON) * 10) / 10)
  }, [reviews]);

  return (
    <>
      {brandIsLoading && <p>Loading Brand...</p>}
      {brandError && <p className="text-red-500">Error loading brand: {brandError.message}</p>}
      {
        brandData && (
          <div className='flex gap-4 items-center' id='home'>
            <div className='w-48 aspect-square bg-slate-200/50 rounded-full flex justify-center items-center'>
              <span className='text-4xl font-bold'>{brandData.name[0]}</span>
            </div>
            <div className='flex flex-col gap-2'>
              <div>
                <h1 className='text-3xl font-bold flex gap-2 items-center'>
                  {brandData.name}
                  {brandData.verified && <p className='text-green-600 text-xl'>
                    <IoIosCheckmarkCircle title='Verified' />
                  </p>}
                </h1>
                <span className='text-sm text-neutral-400'>Memeber since {brandData.createdAt.slice(0, 4)}</span>
              </div>
              <div className='flex gap-4 items-center'>
                <span>
                  <StarRatings
                    starRatedColor="orange"
                    rating={avgRating}
                    numberOfStars={5}
                    starDimension='24px'
                    starSpacing='1px'
                  />
                </span>
                <div className='flex items-center self-end mt-1'>
                  {reviews?.aggregation._avg.rating ?
                    <span><strong>{avgRating}</strong> from {reviews.aggregation._count.rating} reviews</span> :
                    "0 (0)"
                  }</div>
              </div>
            </div>
          </div>
        )
      }
    </>
  )
};

export default BrandHeader