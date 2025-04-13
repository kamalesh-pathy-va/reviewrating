"use client";
import { trpc } from '@/app/_trpc/client';
import { ProductType } from '@prisma/client';
import Link from 'next/link';
import React, {useEffect, useState} from 'react'

const Search = ({ border = false }: { border?: boolean }) => {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [query, setQuery] = useState('');
  const { data: products } = trpc.product.searchProducts.useQuery({ query: debouncedQuery }, { enabled: debouncedQuery.length >= 3 });
  const { data: brands } = trpc.brand.searchBrands.useQuery({ query: debouncedQuery }, { enabled: debouncedQuery.length >= 1 });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className='relative flex items-center flex-col'>
      <div className={`w-full ${border && 'border border-gray-300 rounded'}`}>
        <input type="search" placeholder="Search for products and brands" className='outline-none w-full p-2 rounded font-semibold text-gray-700' onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className='absolute w-full bg-white rounded shadow-lg mt-1 top-10 flex flex-col max-h-80 overflow-x-hidden overflow-y-auto z-50'>
        {(products || brands) && (
          <div className='font-semibold text-gray-700 p-2 flex gap-2 items-center'>
            <span className='text-xs font-extralight bg-neutral-200 p-1 px-2 rounded-full'>all</span>
            <span className='text-xs font-extralight bg-neutral-200 p-1 px-2 rounded-full'>products & services</span>
            <span className='text-xs font-extralight bg-neutral-200 p-1 px-2 rounded-full'>brands</span>
          </div>
        )}
        {(debouncedQuery.length !== 0 && products?.length === 0 && brands?.length === 0) && (
          <div className='font-semibold text-gray-700 p-2'>
            <span>No results found for &quot;{debouncedQuery}&quot;</span>
          </div>
        )
        }
        {products && products.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <div className='font-semibold text-gray-700 p-2 hover:bg-neutral-200 flex justify-between items-center' onClick={() => setDebouncedQuery('')}>
              <span>{product.name}</span>
              <span className={`text-xs font-extralight ${product.type === ProductType.PRODUCT ? "bg-purple-100" : "bg-teal-100"}  p-1 px-2 rounded-full`}>{product.type.toLowerCase()}</span>
            </div>
          </Link>
        ))}
        {brands && brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.id}`}>
            <div className='font-semibold text-gray-700 p-2 hover:bg-neutral-200 flex justify-between items-center' onClick={() => setDebouncedQuery('')}>
              <span>{brand.name}</span>
              <span className='text-xs font-extralight bg-amber-100 p-1 px-2 rounded-full'>brand</span>
            </div>
          </Link>
        ))}
        {debouncedQuery.length !== 0 && (
          <div className='font-semibold text-gray-700 p-2 flex gap-1' onClick={() => setDebouncedQuery('')}>
            <Link href={'/products/new'}>
              <span className='text-sky-500 hover:underline hover:text-sky-700'>
                Create a product
              </span>
            </Link>
            <span>
              and leave a review
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search