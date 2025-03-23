"use client";
import React, { useState } from 'react';
import { trpc } from '../_trpc/client';
import { ProductType } from '@prisma/client';
import ProductItem from '../components/ProductItem';
import Link from 'next/link';

type Products = {
  name: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  type: ProductType;
  verified: boolean;
  brand: {
      name: string;
      id: string;
  } | null;
  reviews: {
      rating: number;
  }[];
};

function Products() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [products, setProducts] = useState<Products[]>([]);
  const { data, isLoading, isFetching, error } = trpc.product.getAllProducts.useQuery(
    { limit: 10, cursor },
    {
      keepPreviousData: true, 
      refetchOnWindowFocus: false,
      onSuccess: (newData) => {
        setProducts((prevProducts) => [...prevProducts, ...newData.products]);
      },
    }
  );

  return (
    <section className="p-6 min-h-screen bg-emerald-50">
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className="text-3xl font-bold">All Products</h1>
          <Link href='/products/new'>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800 font-semibold">
              Create new Product
            </button>
          </Link>
        </div>
        
        {isLoading && <p>Loading Products...</p>}
        {error && <p className="text-red-500">Error loading products: {error.message}</p>}

        <div className='grid grid-cols-4 gap-4'>
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
        
        {data?.nextCursor && (
          <button
            onClick={() => setCursor(data.nextCursor)}
            disabled={isFetching}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isFetching ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </section>
  );
}

export default Products