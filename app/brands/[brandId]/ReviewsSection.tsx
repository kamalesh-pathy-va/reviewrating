"use client";

import { trpc } from '@/app/_trpc/client';
import { ProductType, ReviewStatus } from '@prisma/client';
import React, { useState } from 'react'
import Review from './Review';

type Review = {
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

const ReviewsSection = ({ brandId }: { brandId: string }) => {
  const [cursor, setCursor] = useState<string | null>(null);
  const [allReview, setAllReview] = useState<Review[]>([]);

  const { data: reviews, isLoading: isReviewLoading, error: reviewErrors, isFetching: isReviewFetching } = trpc.review.getReviewsByBrandId.useQuery(
    {
      brandId: brandId,
      cursor,
      limit: 5,
    },
    {
      enabled: brandId.length === 36,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      onSuccess: (newData) => {
        setAllReview(prevReviews => [...prevReviews, ...newData.reviews]);
      },
    },
  );

  return (
    <div className='mt-10 flex flex-col gap-2'>
      <h4 className='font-bold text-xl'>Reviews of Products and services offered</h4>
      <div>
        {isReviewLoading && <p>Loading Reviews...</p>}
        {reviewErrors && <p className="text-red-500">Error loading reviews: {reviewErrors.message}</p>}
        {allReview.length > 0 &&
          <div className='flex flex-wrap gap-2'>
            {allReview.map(review => <Review review={review} key={review.id} />)}
          </div>
        }
      </div>
      {reviews?.nextCursor && (
        <button
          onClick={() => setCursor(reviews.nextCursor)}
          disabled={isReviewFetching}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isReviewFetching ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}

export default ReviewsSection