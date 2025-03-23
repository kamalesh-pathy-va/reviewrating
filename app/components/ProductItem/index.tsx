import { ProductType } from '@prisma/client';
import Link from 'next/link'
import React from 'react'

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

const ProductItem = ({product}: {product: Products}) => {
  return (
    <div className='bg-white rounded-2xl shadow-md h-full'>
      <Link href={`/products/${product.id}`}>
        <div className='flex justify-center items-center bg-gradient-to-b from-purple-100 to-white rounded-xl h-60'>
          <span className='text-9xl text-purple-700'>{product.name[0]}</span>
        </div>
      </Link>
      <div className='m-4 mt-2 flex flex-col gap-2'>
        <div className='flex gap-2 text-xs items-center'>
          <div>
            <span>{product.type}</span>
          </div>
          {product.verified &&
            <div>
              <span className='bg-emerald-200 p-1 px-2 text-emerald-800 font-semibold rounded-md'>VERIFIED</span>
            </div>
          }
        </div>
        <div className='flex justify-between items-center'>
          <Link href={`/products/${product.id}`}>
            <h2 className='font-bold leading-6 w-48 line-clamp-2'>{product.name}</h2>
            <p className='text-sm text-neutral-400'>Since {product.createdAt.slice(0, 4)}</p>
          </Link>
          <div className='flex justify-center items-center'>
            {
              product.reviews.length
                ?
                <span className='text-sm font-bold'>
                  <span className='text-lg'>
                    {product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length}
                  </span>
                  <span className='font-normal'>
                    /5 ({product.reviews.length})
                  </span>
                </span>
                : <span className='text-sm font-bold'>N/A</span>
            }
          </div>
        </div>
        <p className='text-sm line-clamp-1'>{product.description}</p>
        {product.brand &&
          <div className='mt-2 text-sm font-bold '>
            <Link href={`/brands/${product.brand.id}`}>
              {product.brand.name}
            </Link>
          </div>
        }
      </div>
    </div>
  )
}

export default ProductItem