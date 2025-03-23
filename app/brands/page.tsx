"use client";
import React, { useState } from 'react';
import { trpc } from '../_trpc/client';
import BrandCard from '../components/BrandCard';

type Brand = {
  name: string;
  id: string;
  createdAt: string;
  verified: boolean;
  _count: {
      products: number;
  };
};

function Brands() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const { data, isLoading, isFetching, error } = trpc.brand.getAllBrands.useQuery(
    { limit: 10, cursor },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (newData) => {
        setBrands((prevBrands) => [...prevBrands, ...newData.brands]);
      },
    },  
  );

  return (
    <section className="p-6 min-h-screen bg-emerald-50">
      <div className='max-w-6xl mx-auto'>
      <h1 className="text-3xl font-bold mb-6">All Brands</h1>
      
      {isLoading && <p>Loading brands...</p>}
      {error && <p className="text-red-500">Error loading brands: {error.message}</p>}

      <div className='grid grid-cols-3 gap-4'>
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
      
      {data?.nextCursor && (
        <button
          onClick={() => setCursor(data.nextCursor)}
          disabled={isFetching}
          className="mt-4 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
        >
          {isFetching ? 'Loading...' : 'Load More'}
        </button>
        )}
      </div>
    </section>
  );
};

export default Brands