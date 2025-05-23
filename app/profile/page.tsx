"use client";
import React, { useState, useEffect } from 'react'
import { trpc } from '../_trpc/client';
import { ProductType } from '@prisma/client';
import BrandListItem from '../components/BrandListItem';
import ProductListItem from '../components/ProductListItem';
import useFetchLocalUser from '../hooks/useFetchLocalUser';
import { PiPlusBold } from "react-icons/pi";
import Link from 'next/link';

type TempUser = {
  name: string;
  email: string;
  password: string | undefined;
};

type Brand = {
  name: string;
  id: string;
  createdAt: string;
  verified: boolean;
  _count: {
      products: number;
  };
};

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

const Profile = () => {
  const [productCursor, setProductCursor] = useState<string | null>(null);
  const [products, setProducts] = useState<Products[]>([]);
  const [brandCursor, setBrandCursor] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

  const {user, userLoading, userError, refetchUser } = useFetchLocalUser();

  const { data: brand, isLoading: brandLoading, isFetching: brandFetching, error: brandError } = trpc.brand.getBrandByUserId.useQuery(
    {
      userId: user?.id ?? "",
      limit: 5,
      cursor: brandCursor,
    },
    {
      enabled: !!user,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (newData) => {
        setBrands((prevBrands) => [...prevBrands, ...newData.brands]);
      },
    }
  );
  const { data: product, isLoading: productLoading, isFetching: productFetching, error: productError } = trpc.product.getProductByUserId.useQuery(
    {
      userId: user?.id ?? "",
      limit: 5,
      cursor: productCursor,
    },
    {
      keepPreviousData: true, 
      refetchOnWindowFocus: false,
      onSuccess: (newData) => {
        setProducts((prevProducts) => [...prevProducts, ...newData.products]);
      },
    }
  );

  const updateUser = trpc.user.updateUser.useMutation({
    onError: (error) => {
      console.log(error.message);
      alert(error.message);
    },
  });

  const [tempUser, setTempUser] = useState<TempUser>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUser({ ...tempUser, [e.target.name]: e.target.value })
  };

  const handleSave = async () => {
    await updateUser.mutateAsync(tempUser);
    await refetchUser();
    setIsEdit(prev => !prev);
  };

  useEffect(() => {
    setTempUser({
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: undefined,
    });
  }, [user, isEdit]);

  return (
    <main className='min-h-screen bg-emerald-50 p-6'>
      <section className='max-w-6xl mx-auto mb-12'>
        <h4 className='text-xl font-bold mb-6'>User Profile</h4>

        {userLoading && <p>Loading Profile...</p>}
        {userError && <p className="text-red-500">Error loading profile: {userError.message}</p>}

        {user &&
          <div className='flex flex-col gap-2'>
            <div>
              <h1 className='text-4xl font-bold flex gap-4'>
                <input type="text" name='name' value={tempUser?.name} className={`bg-emerald-50 focus:bg-white ${isEdit ? 'border-2 rounded': ''}`} onChange={handleDetailChange} disabled={!isEdit} />
                {isEdit ?
                  <>
                    <button className='text-base px-4 py-2 bg-emerald-500 hover:bg-emerald-700 text-white rounded-full font-normal' onClick={handleSave}>
                      Save
                    </button>
                    <button className='text-base px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-full font-normal' onClick={() => setIsEdit(prev => !prev)}>
                      Cancel
                    </button>
                  </>
                  :
                  <button className='text-base px-4 py-2 bg-sky-400 hover:bg-sky-700 hover:text-white rounded-full font-normal transition-colors' onClick={() => setIsEdit(prev => !prev)}>
                    Edit
                  </button>
                }
              </h1>
              <p className='text-sm text-neutral-500'>Member since {user?.createdAt.slice(0, 4)}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <input type="email" name='email' value={tempUser?.email} className={`bg-emerald-50 focus:bg-white w-fit ${isEdit ? 'border-2 rounded': ''}`} onChange={handleDetailChange} disabled={!isEdit} />
              {isEdit &&
                <div className='flex gap-2'>
                  <label htmlFor="password">Password</label>
                  <input type="password" name='password' value={tempUser?.password} placeholder='password' className={`bg-emerald-50 focus:bg-white ${isEdit ? 'border-2 rounded': ''} px-1`} onChange={handleDetailChange} disabled={!isEdit} />
                </div>
              }
            </div>
          </div>
        }
      </section>
      <section className='max-w-6xl mx-auto mb-12'>
        {brandLoading && <p>Loading brands...</p>}
        {brandError && <p className="text-red-500">Error loading brands: {brandError.message}</p>}

        <div className='flex flex-col w-full bg-white border border-b-0 border-neutral-300 rounded-lg rounded-b-none'>
          <div className='flex justify-between m-4 items-center'>
            <h4 className='text-2xl font-semibold'>My Brands</h4>
            <Link href={'/brands/new'} className='flex gap-2 items-center bg-sky-400 py-2 px-4 rounded hover:bg-sky-700 hover:text-white transition-colors font-bold'>
              <PiPlusBold />
              <button>New</button>
            </Link>
          </div>
          <div className='grid grid-cols-[40%_30%_30%] px-4 py-1 border-b border-neutral-300 font-bold text-neutral-400'>
            <span>Brand name</span>
            <span>Products</span>
            <span>Ratings</span>
          </div>
          {brands.length ? brands.map((brand) => (
            <BrandListItem key={brand.id} brand={brand} />
          )) : <span className='p-2'>No Brands</span>}
        </div>

        {brand?.nextCursor && (
        <button
          onClick={() => setBrandCursor(brand.nextCursor)}
          disabled={brandFetching}
          className="mt-4 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
        >
          {brandFetching ? 'Loading...' : 'Load More'}
        </button>
        )}
      </section>
      <section className='max-w-6xl mx-auto'>
        {productLoading && <p>Loading Products...</p>}
        {productError && <p className="text-red-500">Error loading products: {productError.message}</p>}

        <div className='flex flex-col w-full bg-white border border-b-0 border-neutral-300 rounded-lg rounded-b-none'>
          <h4 className='text-2xl font-semibold m-4'>My Products</h4>

          <div className='grid grid-cols-[40%_30%_30%] px-4 py-1 border-b border-neutral-300 font-bold text-neutral-400'>
            <span>Name</span>
            <span>Type</span>
            <span>Ratings</span>
          </div>
          {products.length ? products.map((product) => (
            <ProductListItem key={product.id} product={product} />
          )) : <span className='p-2'>No Products</span>}
        </div>

        {product?.nextCursor && (
          <button
            onClick={() => setProductCursor(product.nextCursor)}
            disabled={productFetching}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {productFetching ? 'Loading...' : 'Load More'}
          </button>
        )}
        </section>
    </main>
  )
}

export default Profile