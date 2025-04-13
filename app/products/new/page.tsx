"use client";
import { trpc } from '@/app/_trpc/client';
import BrandComboBox from '@/app/components/BrandCombobox';
import useFetchLocalUser from '@/app/hooks/useFetchLocalUser';
import { ProductType } from '@prisma/client';
import { TRPCClientError } from '@trpc/client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { PiWarningCircleLight } from 'react-icons/pi';
import { MdClose } from "react-icons/md";
import Link from 'next/link';

type NewProduct = {
  name: string;
  description: string | undefined;
  type: ProductType | undefined;
  brand: string | undefined;
  verified: boolean | undefined;
};

const NewProduct = () => {
  const [formData, setFormData] = useState<NewProduct>({
    name: "",
    description: undefined,
    type: undefined,
    brand: undefined,
    verified: false,
  });
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [formError, setFormError] = useState({
    name: false,
    type: false,
  });
  const [productCreateErrors, setProductCreateErrors] = useState<string[]>([]);
  const [productCreateLoading, setProductCreateLoading] = useState(false);

  const [previewProduct, setPreviewProduct] = useState("");

  const router = useRouter();

  const { data: searchedProducts } = trpc.product.searchProducts.useQuery({ query: debouncedQuery }, { enabled: debouncedQuery.length >= 3, refetchOnWindowFocus: false });
  const { user } = useFetchLocalUser();
  const createProduct = trpc.product.createProduct.useMutation();
  const updateProduct = trpc.product.updateProduct.useMutation();
  const { data: selectedProduct } = trpc.product.getProductById.useQuery({ id: previewProduct }, { enabled: previewProduct.length > 0, refetchOnWindowFocus: false });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(formData?.name.trim());
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [formData.name]);

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.name?.length < 3) {
      setFormError({ ...formError, name: true });
    } else {
      setFormError({ ...formError, name: false });
    }

    if (!formData.type) {
      setFormError({ ...formError, type: true });
    } else {
      setFormError({ ...formError, type: false });
    }

    setProductCreateErrors([]);
    setProductCreateLoading(true);

    try {
      const newProduct = await createProduct.mutateAsync({
        name: formData.name,
        description: formData.description,
        type: formData.type!,
        brandId: formData.brand
      });

      await updateProduct.mutateAsync({
        id: newProduct.id,
        brandId: formData.brand,
        verified: formData.verified,
      })
      router.push(`/products/${newProduct.id}`)
    } catch (err) {
      if (err instanceof TRPCClientError) {
        try {
          const parsedError = JSON.parse(err.message);
          if (Array.isArray(parsedError)) {
            setProductCreateErrors(parsedError.map((error) => error.message));
          } else {
            setProductCreateErrors([err.message]);
          }
        } catch {
          setProductCreateErrors([err.message]);
        }
      } else {
        setProductCreateErrors(["Product update failed. Please try again."]);
      }
    } finally {
      setFormData({
        name: "",
        description: undefined,
        type: undefined,
        brand: undefined,
        verified: false,
      });
      setProductCreateLoading(false);
    }
  }

  useEffect(() => console.log(formData), [formData]);

  return (
    <section className="p-6 min-h-screen bg-emerald-50">
      <div className='max-w-6xl mx-auto grid grid-cols-[60%_40%]'>
        <div>
          <h1 className='text-3xl font-bold'>Create a new product</h1>
          <form className='flex flex-col gap-4 mt-4' onSubmit={handleProductSubmit}>
            <div className='flex flex-col gap-1'>
              <label htmlFor="name" className='font-bold ml-1 w-fit'>Name</label>
              <input type="text" name="name" id="name" placeholder="Product name" className='border-2 border-neutral-200 rounded-lg p-2 px-3 outline-none max-w-lg hover:border-neutral-400 focus:border-neutral-400 transition-colors' onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))} />
            </div>
            {
              (searchedProducts?.length ?? 0) > 0 && 
              <div>
                <h4 className='font-bold ml-1 w-fit'>Existing matches <span className='text-xs font-normal text-neutral-500'>(select one to preview)</span></h4>
                <div className='bg-emerald-100 max-w-lg rounded-lg p-2 flex flex-col'>
                    {searchedProducts?.map(product => (
                      <button type='button' key={product.id} className='w-full hover:bg-emerald-200 rounded-lg p-2 text-left' onClick={() => setPreviewProduct(product.id)}>
                        {product.name}
                      </button>
                    ))}
                  </div>
                </div>
            }
            <div className='flex flex-col gap-1'>
              <label htmlFor="description" className='font-bold ml-1'>Description <span className='text-xs font-normal text-neutral-500'>(optional)</span></label>
              <textarea name="description" id="description" cols={30} rows={4} placeholder='This product is...' className='border-2 border-neutral-200 rounded-lg p-2 px-3 outline-none max-w-lg hover:border-neutral-400 focus:border-neutral-400 transition-colors resize-none' onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}></textarea>
            </div>
            <div>
              <h4 className='font-bold ml-1'>Type</h4>
              <div className='flex gap-2'>
                <div className='mt-2'>
                  <input type="radio" name="type" id={ProductType.PRODUCT} value={ProductType.PRODUCT} className='hidden peer' onChange={() => setFormData(prev => ({...prev, type: ProductType.PRODUCT}))} />
                  <label htmlFor={ProductType.PRODUCT} className='font-bold border-2 px-4 py-2 rounded-md border-neutral-300 bg-neutral-50 peer-checked:bg-blue-100 peer-checked:border-blue-600 peer-checked:text-blue-700 hover:border-neutral-600 hover:bg-neutral-100 transition-colors'>Product</label>
                </div>
                <div className='mt-2'>
                  <input type="radio" name="type" id={ProductType.SERVICE} value={ProductType.SERVICE} className='hidden peer' onChange={() => setFormData(prev => ({...prev, type: ProductType.SERVICE}))} />
                  <label htmlFor={ProductType.SERVICE} className='font-bold border-2 px-4 py-2 rounded-md border-neutral-300 bg-neutral-50 peer-checked:bg-blue-100 peer-checked:border-blue-600 peer-checked:text-blue-700 hover:border-neutral-600 hover:bg-neutral-100 transition-colors'>Service</label>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <label htmlFor="brand" className='font-bold ml-1'>Brand <span className='text-xs font-normal text-neutral-500'>(optional)</span></label>
              <BrandComboBox onSelect={(id) => setFormData(prev => ({ ...prev, brand: id, verified: undefined }))} />
            </div>
            {user?.ownedBrands.some(ownedBrand => ownedBrand.brand.id === formData.brand && ownedBrand.brand.verified) &&
              <div className='flex flex-col gap-1'>
                <h4 className='font-bold ml-1'>Verified <span className='text-xs font-normal text-neutral-500'>(optional)</span></h4>
                <div className='flex gap-2 items-center ml-1'>
                  <input type="checkbox" name='verified' id='verified' className='w-4 aspect-square rounded-md' checked={formData.verified} onChange={e => (setFormData(prev => ({...prev, verified: e.target.checked})))}/>
                  <label htmlFor="verified">Mark this {formData?.type === ProductType.PRODUCT && "product"}{formData?.type === ProductType.SERVICE && "service"} as verified</label>
                </div>
              </div>
            }
            {formError.name &&
              <div className='bg-red-100 p-2 px-4 text-red-600 rounded-lg flex items-center gap-2 max-w-lg'>
                <PiWarningCircleLight className='text-xl' />
                <span>The <strong>name</strong> is required and should be atleast 3 characters</span>
              </div>
            }
            {formError.type &&
              <div className='bg-red-100 p-2 px-4 text-red-600 rounded-lg flex items-center gap-2 max-w-lg'>
                <PiWarningCircleLight className='text-xl' />
                <span>The <strong>product type</strong> is required</span>
              </div>
            }
            {productCreateErrors.length > 0 && (
              productCreateErrors.map((err, index) => (
                <div className='bg-red-100 p-2 px-4 text-red-600 rounded-lg flex items-center gap-2' key={index}>
                  <PiWarningCircleLight className='text-xl' />
                  <span>{err}</span>
                </div>
              ))
            )}
            <button type="submit" className='w-fit py-2 px-4 bg-emerald-400 rounded-md mt-4 hover:bg-emerald-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-400 disabled:hover:text-black' disabled={(!((formData.name?.length ?? 0) > 2 && !!formData.type) || productCreateLoading)}>
              Create {formData?.type === ProductType.PRODUCT && "product"}{formData?.type === ProductType.SERVICE && "service"}
            </button>
          </form>
        </div>
        {previewProduct &&
          <div className='bg-sky-100 rounded-lg p-4 flex flex-col gap-6 h-fit border border-sky-300'>
            <div className='flex justify-between'>
              <h4 className='font-bold text-xl items-center'>Preview</h4>
              <button type='button' onClick={() => setPreviewProduct("")} className='bg-red-200 text-red-700 w-8 aspect-square flex justify-center items-center rounded-md hover:bg-red-600 hover:text-red-50 transition-colors'><MdClose /></button>
            </div>
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-[30%_70%]'>
                <span className='font-bold'>Name</span>
                <span>{selectedProduct?.name}</span>
              </div>
              <div className='grid grid-cols-[30%_70%]'>
                <span className='font-bold'>Brand</span>
                <span>{selectedProduct?.brand?.name ?? ""}</span>
              </div>
              <div className='grid grid-cols-[30%_70%]'>
                <span className='font-bold'>Type</span>
                <span>{selectedProduct?.type === ProductType.PRODUCT && "Product"}{selectedProduct?.type === ProductType.SERVICE && "Service"}</span>
              </div>
              <div className='grid grid-cols-[30%_70%]'>
                <span className='font-bold'>Description</span>
                <span className='line-clamp-3 leading-relaxed' title={selectedProduct?.description ?? ""}>{selectedProduct?.description ?? "No description"}</span>
              </div>
              <div className='grid grid-cols-[30%_70%]'>
                <span className='font-bold'>Verified</span>
                <span>{selectedProduct?.verified ? "Yes" : "No"}</span>
              </div>
            </div>
            <Link href={`/products/${selectedProduct?.id}`}>
              <button className='bg-sky-300 rounded-md p-2 w-full hover:bg-sky-400 transition-colors'>Review this {selectedProduct?.type === ProductType.PRODUCT && "product"}{selectedProduct?.type === ProductType.SERVICE && "service"}</button>
            </Link>
          </div>
        }
      </div>
    </section>
  )
}

export default NewProduct