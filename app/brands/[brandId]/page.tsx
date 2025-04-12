"use client";

import React from 'react'

import BrandHeader from './BrandHeader';
import ReviewsSection from './ReviewsSection';
import BrandNav from './BrandNav';
import VerifiedProductsSection from './VerifiedProductsSection';
import UnverifiedProductsSection from './UnverifiedProductsSection';
import useFetchLocalUser from '@/app/hooks/useFetchLocalUser';

const Brand = ({ params }: { params: { brandId: string } }) => {

  const { user } = useFetchLocalUser();
  const isBrandOwnerOfThisBrand = user?.ownedBrands.some(ownedBrand => ownedBrand.brand.id === params.brandId);
  
  return (
    <section className='p-6 min-h-screen bg-emerald-50 relative'>
      <div className='max-w-6xl mx-auto'>
        {params.brandId.length === 36 ?
          <>
            <BrandHeader brandId={params.brandId} />
            <BrandNav />
            <ReviewsSection brandId={params.brandId} />
            <VerifiedProductsSection brandId={params.brandId} />
            {
              isBrandOwnerOfThisBrand &&
              <UnverifiedProductsSection brandId={params.brandId} />
            }
          </>
        : "Invalid Brand ID"}
      </div>
    </section>
  )
}

export default Brand