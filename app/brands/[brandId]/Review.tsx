"use client";

import { ProductType, ReviewStatus } from '@prisma/client';
import Link from 'next/link';
import React from 'react'
import { IoIosCheckmarkCircle } from 'react-icons/io';
import StarRatings from 'react-star-ratings';

type Reviews = {
  rating: number;
  title: string;
  comment: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  product: {
    brandId: string | null;
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    description: string | null;
    type: ProductType;
    createdById: string;
    verified: boolean;
  };
  user: {
    name: string;
    id: string;
  };
  status: ReviewStatus;
  productId: string;
}

const Review = ({review}: {review: Reviews}) => {
  return (
    <div className='bg-white flex flex-col drop-shadow-lg rounded-md p-4 gap-2 w-full'>
      <div className='flex flex-col'>
        <h4 className='font-bold'>{review.title}</h4>
        <div className='flex gap-2 items-center text-neutral-400 font-bold text-sm'>
          <span>{review.user.name}</span>
          <span>•</span>
          <span className='mb-1'>
            <StarRatings
              starRatedColor="orange"
              rating={review.rating}
              numberOfStars={5}
              starDimension='14px'
              starSpacing='1px'
            />
          </span>
          {/* <span>•</span> */}
        </div>
        <div className='text-sm flex gap-1 items-center'>
          <span className='font-semibold text-sky-600 hover:underline'>
            <Link href={`/products/${review.product.id}`}>{review.product.name}</Link>
          </span>
          {review.product.verified && 
            <span className='text-emerald-800 font-semibold text-xs'>
              <IoIosCheckmarkCircle />
            </span>
          }
        </div>
      </div>
      {review.comment &&
        <p className='text-ellipsis line-clamp-3'>{review.comment}</p>
      }
      <span className='text-sm text-neutral-500 mt-auto'>Rated on {review.createdAt.slice(0, 10)}</span>
    </div>
  )
}

export default Review