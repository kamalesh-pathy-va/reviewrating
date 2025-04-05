"use client";

import { ProductType, ReviewStatus } from '@prisma/client';
import React from 'react'

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
  status: ReviewStatus;
  productId: string;
}

const Review = ({review}: {review: Reviews}) => {
  return (
    <div className='bg-sky-300'>
      {review.title}
    </div>
  )
}

export default Review