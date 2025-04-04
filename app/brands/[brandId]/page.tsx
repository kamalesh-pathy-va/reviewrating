"use client";
import { trpc } from '@/app/_trpc/client'
import React from 'react'

const Brand = ({ params }: { params: { brandId: string } }) => {
  const { data: brandData, isLoading: brandIsLoading, error: brandError, refetch: refetchBrand } = trpc.brand.getBrandById.useQuery(
    { id: params.brandId },
    {
      enabled: params.brandId.length === 36,
      refetchOnWindowFocus: false,
    },
  );
  return (
    <section className='p-6 min-h-screen bg-emerald-50 relative'>
      <div className='max-w-6xl mx-auto'>
        {brandIsLoading && <p>Loading Brand...</p>}
        {brandError && <p className="text-red-500">Error loading brand: {brandError.message}</p>}
        {
          brandData && (
            <div className='flex gap-4 items-center'>
              <div className='w-48 aspect-square bg-slate-200/50 rounded-full flex justify-center items-center'>
                <span className='text-4xl font-bold'>{brandData.name[0]}</span>
              </div>
              <div>
                <div>
                  <h1 className='text-3xl font-bold'>
                    {brandData.name}
                  </h1>
                  <span className='text-sm text-neutral-400'>Memeber since {brandData.createdAt.slice(0,4)}</span>
                </div>
                <div>
                  <span></span>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </section>
  )
}

export default Brand