"use client";

import { trpc } from '@/app/_trpc/client';
import ProductItem from '@/app/components/ProductItem';
import React, { useState } from 'react';

const VerifiedProductsSection = ({ brandId }: { brandId: string }) => {
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  
  const { data, isLoading, isFetching, error } = trpc.product.getProductsByBrandId.useQuery(
    {
      brandId,
      limit: 4,
      cursor: cursor ?? "",
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const handleNext = () => {
    if (data?.nextCursor) {
      setCursorStack((prev) => [...prev, cursor ?? ""]);
      setCursor(data.nextCursor);
    }
  };

  const handlePrev = () => {
    if (cursorStack.length > 0) {
      const newStack = [...cursorStack];
      const prevCursor = newStack.pop();
      setCursor(prevCursor ?? null);
      setCursorStack(newStack);
    }
  }

  return (
    <div className='mt-8 flex flex-col gap-2' id='products'>
      <h4 className='font-bold text-xl'>Products</h4>
      {isLoading && <p>Loading Products...</p>}
      {error && <p className="text-red-500">Error loading products: {error.message}</p>}
      {data?.products?.length ?
        <>
          <div className='grid grid-cols-4 gap-4'>
            {data?.products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>

          <div className='flex gap-2 h-10 mt-2'>
            {!(isFetching || cursorStack.length === 0) &&
              <button
              onClick={handlePrev}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Previous
            </button>
            }

            {!(isFetching || !data?.nextCursor) &&
              <button
                onClick={handleNext}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Next
              </button>
            }
          </div>
        </> : (
          !isLoading &&
          <span>No products found</span>
        )
      }
    </div>
  )
}

export default VerifiedProductsSection