"use client";

import React from 'react'

import BrandHeader from './BrandHeader';
import ReviewsSection from './ReviewsSection';

const Brand = ({ params }: { params: { brandId: string } }) => {
  
  return (
    <section className='p-6 min-h-screen bg-emerald-50 relative'>
      <div className='max-w-6xl mx-auto'>
        {params.brandId.length === 36 ?
          <>
            <BrandHeader brandId={params.brandId} />
            <ReviewsSection brandId={params.brandId} />
          </>
        : "Invalid Brand ID"}
      </div>
    </section>
  )
}

export default Brand