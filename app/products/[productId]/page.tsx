"use client";
import { trpc } from '@/app/_trpc/client'
import Link from 'next/link';
import React from 'react'

const Product = ({ params }: { params: { productId: string } }) => {
  const { data, isLoading, error } = trpc.product.getProductById.useQuery(
    { id: params.productId },
    {
      enabled: params.productId.length !== 0
    }
  )

  return (
    <section className='p-6 min-h-screen bg-emerald-50'>
      <div className='max-w-6xl mx-auto'>
        {isLoading && <p>Loading Products...</p>}
        {error && <p className="text-red-500">Error loading products: {error.message}</p>}
        {
          data ? (
            <div className='grid grid-cols-2 gap-4'>
              <div className='w-full flex justify-center items-center h-96 bg-gradient-to-b from-purple-100 to-emerald-50 rounded-xl'>
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
                  <Link href={`/brands/${data.brand?.id}`}>
                    <span className='font-bold text-lg text-sky-600 underline'>{data.brand?.name}</span>
                  </Link>
                </div>
                <div className="">{data.description}</div>
              </div>
            </div>
          ) : "Unexpectd error occured"
        }
      </div>
    </section>
  )
}

export default Product