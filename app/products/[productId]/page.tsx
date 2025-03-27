"use client";
import { trpc } from '@/app/_trpc/client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import StarRatings from "react-star-ratings";

const Product = ({ params }: { params: { productId: string } }) => {
  const [localUser, setlocalUser] = useState<{ id: string; } | null>(null);

  const { data, isLoading, error } = trpc.product.getProductById.useQuery(
    { id: params.productId },
    {
      enabled: params.productId.length !== 0
    }
  );

  const { data: reviews, isLoading: reviewsLoading, error: errorLoading } = trpc.review.getReviewsByProductId.useQuery(
    {
      productId: params.productId,
    },
    {
      enabled: (params.productId.length !== 0 && localUser?.id !== null),
    }
  )

  useEffect(() => {
    if (typeof document !== "undefined") {
      const authToken = document.cookie.includes("authToken");
      if (authToken) {
        const localUserData = document.cookie.replace(/(?:(?:^|.*;\s*)user\s*\=\s*([^;]*).*$)|^.*$/,
          "$1");
        setlocalUser(localUserData ? JSON.parse(localUserData) : null);
      }
    }
  }, []);

  return (
    <section className='p-6 min-h-screen bg-emerald-50'>
      <div className='max-w-6xl mx-auto'>
        {isLoading && <p>Loading Products...</p>}
        {error && <p className="text-red-500">Error loading products: {error.message}</p>}
        {
          data ? (
            <div className='grid grid-cols-2 gap-4'>
              <div className='w-full flex justify-center items-center h-96 bg-gradient-to-b from-indigo-300 to-purple-200 rounded-xl'>
                {/* <Image src={shoe} alt=''
                  className='scale-110 object-cover w-full aspect-video group-hover:scale-100 transition-all delay-75'
                  loading='lazy'
                /> */}
                <span className='text-9xl text-purple-800'>{data.name[0]}</span>
              </div>
              <div className='flex flex-col gap-2 text-base'>
                <div className='flex gap-2 items-center'>
                  <div className="text-xs text-purple-800 font-semibold">{data.type}</div>
                  {data.verified && 
                    <span className='bg-emerald-200 p-1 px-2 text-emerald-800 font-semibold rounded-md text-xs'>VERIFIED</span>
                  }
                </div>
                <div>
                  <h1 className="text-3xl font-bold line-clamp-2 w-5/6">{data.name}</h1>
                  <div className='flex items-center gap-2 text-sm text-neutral-400'>
                    <div className="">Created: {data.createdAt.slice(0, 10)}</div>
                    <div className='h-3 w-px bg-neutral-400' />
                    <div className="">Last updated: {data.updatedAt.slice(0, 10)}</div>
                  </div>
                </div>
                <div className='flex gap-2 items-baseline'>
                  <span>by</span>
                  {data.verified ?
                    <Link href={`/brands/${data.brand?.id}`}>
                      <span className='font-bold text-lg text-sky-600 underline'>{data.brand?.name}</span>
                    </Link>
                    :
                      <span className='font-bold text-lg'>{data.createdBy.id === localUser?.id ? "You" : data.createdBy?.name}</span>
                  }
                </div>
                <div className="mt-2">{data.description}</div>
                {localUser ?
                  <div className='mt-auto flex flex-col gap-4 bg-emerald-100 p-4 rounded-lg w-4/5'>
                    <h2 className='text-2xl font-bold'>
                      Reviews and ratings
                    </h2>
                    <div className='flex items-center gap-4'>
                      <div className='text-5xl font-bold p-4 py-2'>
                        {reviews?.reviews.length &&
                          <span>{reviews.aggregation._avg.rating}</span>
                        }
                      </div>
                      <div>
                        <div className=''>
                          {reviews &&
                            <span><StarRatings
                              rating={reviews.aggregation._avg.rating ? reviews.aggregation._avg.rating : 0}
                              starRatedColor="orange"
                              numberOfStars={5}
                              starDimension='35px'
                              starSpacing='1px'
                            /></span>
                          }
                        </div>
                        <span className='text-sm text-neutral-400 ml-1'>Based on { reviews?.aggregation._count.rating } ratings</span>
                      </div>
                    </div>
                  </div> :
                  <div className='mt-auto flex flex-col gap-4 bg-emerald-100 p-4 rounded-lg w-4/5'>
                    <span>Please <Link href={'/auth/login'} className='text-sky-600 font-semibold'>Sign in</Link> to view Reviews</span>
                  </div>
                }
              </div>
            </div>
          ) : "Unexpectd error occured"
        }
      </div>
    </section>
  )
}

export default Product