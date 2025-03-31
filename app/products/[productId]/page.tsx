"use client";
import { trpc } from '@/app/_trpc/client'
import { ProductType, ReviewStatus, Role } from '@prisma/client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import StarRatings from "react-star-ratings";
import { PiDotsThreeOutlineVerticalFill, PiWarningCircleLight } from "react-icons/pi";
import { TRPCClientError } from '@trpc/client';

type Review = {
    user: {
        name: string;
    id: string;
    _count: {reviews: number;};
    };
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    rating: number;
    comment: string;
    status: ReviewStatus;
}

type Product = {
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
  _count: {
    reviews: number;
  };
  createdBy: {
    id: string;
    name: string;
  };
};

type User = {
  name: string;
  id: string;
  email: string;
  createdAt: string;
  roles: {
    userId: string;
    role: Role;
  }[];
  ownedBrands: {
    brand: {
      id: string;
      verified: boolean;
      name: string;
    };
  }[];
  reviewsCount: number;
  brandCount: number;
  productCount: number;
};

const Product = ({ params }: { params: { productId: string } }) => {
  // Varibles
  const [cursor, setCursor] = useState<string | null>(null);
  const [allReview, setAllReview] = useState<Review[]>([]);
  const [localUser, setlocalUser] = useState<{ id: string; } | null>(null);
  const [toggleAddReview, setToggleAddReview] = useState(false);
  const [formReviewData, setFormReviewData] = useState<{ rating: number; title: string; comment: string | undefined}>({
    rating: 0,
    title: '',
    comment: undefined,
  });
  const [formError, setFormError] = useState({
    rating: false,
    title: false,
  });
  const [formSubmitErrors, setFormSubmitErrors] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toggleOptions, setToggleOptions] = useState(false);
  const [toggleClaimThis, setToggleClaimThis] = useState(false);
  const [toggleDeleteThis, setToggleDeleteThis] = useState(false);

  //Queries
  const { data, isLoading, error } = trpc.product.getProductById.useQuery(
    { id: params.productId },
    {
      enabled: params.productId.length !== 0
    }
  );

  const { data: reviews, isLoading: reviewsLoading, error: reviewsError, isFetching: reviewsFetching, refetch: reviewRefetch } = trpc.review.getReviewsByProductId.useQuery(
    {
      productId: params.productId,
      limit: 10,
      cursor,
    },
    {
      enabled: (params.productId.length !== 0),
      keepPreviousData: true, 
      refetchOnWindowFocus: false,
      onSuccess: (newData) => {
        setAllReview((prevReviews) => [...prevReviews, ...newData.reviews]);
      },
    }
  );

  const reviewMutation = trpc.review.postReview.useMutation();

  const { data: userData } = trpc.user.getUserById.useQuery(
    { userId: localUser?.id ?? "" },
    {
      enabled: localUser?.id != undefined,
      refetchOnWindowFocus: false,
    }
  );

  //Helpers
  useEffect(() => {
    if (typeof document !== "undefined") {
      const authToken = document.cookie.includes("authToken");
      if (authToken) {
        const localUserData = document.cookie.replace(/(?:(?:^|.*;\s*)user\s*\=\s*([^;]*).*$)|^.*$/,
          "$1");
        setlocalUser(localUserData ? JSON.parse(localUserData) : null);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formReviewData.rating == 0) {
      setFormError(prev => ({ ...prev, rating: true }));
      return;
    }
    else {
      setFormError(prev => ({ ...prev, rating: false }));
    }

    if (formReviewData.title.length == 0) {
      setFormError(prev => ({ ...prev, title: true }));
      return;
    }
    else {
      setFormError(prev => ({ ...prev, title: false }));
    }

    setFormSubmitErrors([]);
    setSubmitLoading(true);

    try {
      await reviewMutation.mutateAsync({
        productId: params.productId,
        ...formReviewData
      });
      setToggleAddReview(!toggleAddReview);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        // Extract Zod validation errors
        try {
          const parsedError = JSON.parse(err.message);
          if (Array.isArray(parsedError)) {
            setFormSubmitErrors(parsedError.map((error) => error.message));
          } else {
            setFormSubmitErrors([err.message]);
          }
        } catch {
          setFormSubmitErrors([err.message]);
        }
      } else {
        setFormSubmitErrors(["Signup failed. Please try again."]);
      }
    } finally {
      setSubmitLoading(false);
      setFormReviewData({ title: '', rating: 0, comment: '' });
      setAllReview([]);
      reviewRefetch();
    }
  };

  const isProductDeletableButton = (product: Product, user: User): boolean => { 
    if (!product.brand?.id && user.id === product.createdBy.id) {
      return true;
    }
    if (product.brand?.id && !user?.roles.some(r => r.role === Role.ADMIN)) {
      return user.ownedBrands.some(ownedBrand => (ownedBrand.brand.verified && ownedBrand.brand.id === product.brand?.id));
    }
    return user?.roles.some(r => r.role === Role.ADMIN);
  };

  const handleClaimThis = () => {
    setToggleClaimThis(prev => !prev);
    setToggleOptions(prev => !prev);
  };
  const handleDelete = () => {
    setToggleDeleteThis(prev => !prev);
    setToggleOptions(prev => !prev);
  };

  const handleClaimThisOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  
  return (
    <section className='p-6 min-h-screen bg-emerald-50 relative'>
      <div className='max-w-6xl mx-auto'>
        {isLoading && <p>Loading Product...</p>}
        {error && <p className="text-red-500">Error loading product: {error.message}</p>}
        {
          data && (
            <div className='grid grid-cols-2 gap-4'>
              <div className='w-full flex justify-center items-center h-96 bg-gradient-to-b from-indigo-300 to-purple-200 rounded-xl'>
                {/* <Image src={shoe} alt=''
                  className='scale-110 object-cover w-full aspect-video group-hover:scale-100 transition-all delay-75'
                  loading='lazy'
                /> */}
                <span className='text-9xl text-purple-800'>{data.name[0]}</span>
              </div>
              <div className='grid grid-cols-[75%_25%]'>
                <div className='flex flex-col gap-2 text-base'>
                  <div className='flex gap-2 items-center'>
                    <div className="text-xs text-purple-800 font-semibold">{data.type}</div>
                    {data.verified && 
                      <span className='bg-emerald-200 p-1 px-2 text-emerald-800 font-semibold rounded-md text-xs'>VERIFIED</span>
                    }
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold line-clamp-2 w-5/6">{data.name}</h1>
                    <div className='flex items-center gap-2 text-sm text-neutral-400'>
                      <div className="">Created: {data.createdAt.slice(0, 10)}</div>
                      <div className='h-3 w-px bg-neutral-400' />
                      <div className="">Last updated: {data.updatedAt.slice(0, 10)}</div>
                    </div>
                  </div>
                  <div className='flex gap-2 items-baseline'>
                    <span>by</span>
                    {data.verified ?
                      <Link href={`/brands/${data.brand?.id}`}>
                        <span className='font-bold text-lg text-sky-600 underline'>{data.brand?.name}</span>
                      </Link>
                      :
                        <span className='font-bold text-lg'>{data.createdBy.id === localUser?.id ? "You" : data.createdBy?.name}</span>
                    }
                  </div>
                  <div className="mt-2">{data.description}</div>
                  {localUser ?
                    <div className='mt-auto flex flex-col gap-2 bg-emerald-100 p-4 pt-2 rounded-lg w-fit items-center'>
                        <div className='text-7xl font-bold'>
                          {reviews?.reviews.length &&
                            <span>{reviews.aggregation._avg.rating}</span>
                          }
                        </div>
                        <div className=''>
                          {reviews &&
                            <span><StarRatings
                              rating={reviews.aggregation._avg.rating ? reviews.aggregation._avg.rating : 0}
                              starRatedColor="orange"
                              numberOfStars={5}
                              starDimension='20px'
                              starSpacing='1px'
                            /></span>
                          }
                        </div>
                        <span className='text-sm text-neutral-400 ml-1'>{ reviews?.aggregation._count.rating } reviews</span>
                    </div> :
                    <div className='mt-auto flex flex-col gap-4 bg-emerald-100 p-4 rounded-lg w-4/5'>
                      <span>Please <Link href={'/auth/login'} className='text-sky-600 font-semibold'>Sign in</Link> to view Rating</span>
                    </div>
                  }
                </div>

                <div className='mt-8'>
                  <div className='relative'>
                    <button className='p-2 hover:bg-emerald-600 hover:text-emerald-50 text-emerald-700 rounded-full transition-colors' title='Options' onClick={() => setToggleOptions(prev => !prev)}>
                      <PiDotsThreeOutlineVerticalFill className='text-xl' />
                    </button>
                    {toggleOptions &&
                      <div className='absolute top-10 flex flex-col bg-emerald-50 min-w-max items-center p-1 shadow-xl rounded-lg border shadow-emerald-900/20'>
                        {!data.verified &&
                          (userData?.ownedBrands.some((ownedBrand) => ownedBrand.brand.verified === true) &&
                            <button className='p-2 px-4 w-full hover:bg-emerald-100 rounded-lg' onClick={handleClaimThis}>Claim this {data.type === ProductType.PRODUCT && "product"}{data.type === ProductType.SERVICE && "service"}</button>
                          )
                        }
                        {userData && isProductDeletableButton(data, userData) &&
                          <button className='p-2 px-4 w-full text-red-600 hover:bg-red-600 hover:text-red-50 rounded-lg' onClick={handleDelete}>Delete</button>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div>

      {/* Review Section */}
      <div className='mt-8 flex max-w-6xl mx-auto'>
        <div className='w-4/5 pb-4'>
          <h4 className='text-3xl font-bold mb-4'>Reviews</h4>
          <div className='grid grid-cols-[70%_30%]'>
            {allReview.length > 0 ?
              <div className='flex flex-col gap-12'>
                {reviewsLoading && <p>Loading Reviews...</p>}
                {reviewsError && <p className="text-red-500">Error loading reviews: {reviewsError.message}</p>}
                {allReview.map(review => (
                  <div key={review.id} className='w-3/4' id={review.id}>
                    <div className='flex justify-between'>
                      <div className='flex gap-2 items-center'>
                        <span className='bg-fuchsia-200 rounded-full text-lg font-bold w-12 aspect-square flex justify-center items-center'>{review.user.name[0]}</span>
                        <div className='flex flex-col'>
                          <span className='font-bold text-lg'>{review.user.name}</span>
                          <span className='text-sm text-neutral-400'>{review.user._count.reviews} reviews</span>
                        </div>
                      </div>
                      <span className='text-xs font-bold text-neutral-400'>{review.updatedAt.slice(0,10)}</span>
                    </div>
                    <div className='mt-2 flex flex-col gap-2'>
                      <span><StarRatings
                        rating={review.rating}
                        starRatedColor="orange"
                        numberOfStars={5}
                        starDimension='20px'
                        starSpacing='1px'
                      /></span>
                      <h4 className='font-bold'>{review.title}</h4>
                      {review.comment && <p>{review.comment}</p>}
                    </div>
                  </div>
                ))}
                {reviews?.nextCursor && (
                  <button
                    onClick={() => setCursor(reviews.nextCursor)}
                    disabled={reviewsFetching}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {reviewsFetching ? 'Loading...' : 'Load More'}
                  </button>
                )}
              </div> :
              <span>No reviews found for this product</span>
            }
            <div className='ml-auto'>
              {localUser?.id &&
                <button className='bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors' onClick={() => setToggleAddReview(prev => !prev)}>Add a review</button>
              }
            </div>
            </div>
        </div>
      </div>

      {/* Add review modal */}
      {toggleAddReview &&
        <div className='absolute w-full h-full inset-0 bg-neutral-950/30 backdrop-blur-md' onClick={() => setToggleAddReview(prev => !prev)}>
          <div className='sticky top-16'>
            <div className='bg-white max-w-2xl mx-auto mt-8 rounded-xl p-16 py-12' onClick={(e) => e.stopPropagation()}>
              <h4 className='text-2xl font-bold pb-4'>Post a review</h4>
              <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                <div className='flex flex-col gap-1 mb-4'>
                  <label htmlFor="rating" className='font-semibold'>Overall Rating</label>
                  <StarRatings
                    starRatedColor="orange"
                    rating={formReviewData.rating}
                    numberOfStars={5}
                    starHoverColor='gold'
                    starDimension='40px'
                    starSpacing='5px'
                    changeRating={(ratingNo) => setFormReviewData(prev => ({...prev, rating: ratingNo}))}
                    name='rating'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label htmlFor="title" className='font-semibold'>Title</label>
                  <input
                    type="text"
                    name='title'
                    className='p-2 outline-none border border-neutral-400 rounded-lg'
                    placeholder='An amazing product'
                    value={formReviewData.title}
                    onChange={e => (setFormReviewData(prev => ({ ...prev, title: e.target.value })))}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label htmlFor="comments" className='font-semibold'>Comments</label>
                  <textarea
                    name="comments"
                    className='p-2 outline-none border border-neutral-400 rounded-lg'
                    rows={4}
                    placeholder='This product is awesome...'
                    value={formReviewData.comment}
                    onChange={e => (setFormReviewData(prev => ({ ...prev, comment: e.target.value })))}
                  />
                </div>
                {formError.rating &&
                  <div className='bg-red-100 p-2 px-4 text-red-600 rounded-lg flex items-center gap-2'>
                    <PiWarningCircleLight className='text-xl' />
                    <span>The Rating is required</span>
                  </div>
                }
                {formError.title &&
                  <div className='bg-red-100 p-2 px-4 text-red-600 rounded-lg flex items-center gap-2'>
                    <PiWarningCircleLight className='text-xl' />
                    <span>The Tile is required</span>
                  </div>
                }
                {formSubmitErrors.length > 0 && (
                  formSubmitErrors.map((err, index) => (
                    <div className='bg-red-100 p-2 px-4 text-red-600 rounded-lg flex items-center gap-2' key={index}>
                      <PiWarningCircleLight className='text-xl' />
                      <span>{err}</span>
                    </div>
                  ))
                )}
                <div className='flex gap-4 ml-auto'>
                  <button
                    className='bg-red-400 hover:bg-red-500 text-white font-bold text-lg px-6 py-1 transition-colors'
                    type='button'
                    disabled={submitLoading}
                    onClick={(e) => { e.preventDefault(); setFormReviewData({ title: '', rating: 0, comment: '' }); setToggleAddReview(!toggleAddReview); }}
                  >
                    Clear & Close
                  </button>
                  <button className='bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg px-6 py-1 transition-colors' type='submit' disabled={submitLoading}>{submitLoading ? "Posting..." : "Post"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      {/* "Claim This" modal */}
      {toggleClaimThis &&
        <div className='absolute w-full h-full inset-0 bg-neutral-950/30 backdrop-blur-md' onClick={() => setToggleClaimThis(prev => !prev)}>
          <div className='sticky top-16'>
            <div className='bg-white max-w-2xl mx-auto mt-8 rounded-xl p-16 py-12' onClick={(e) => e.stopPropagation()}>
              <h4 className='text-2xl font-bold pb-4'>Claim this {data?.type === ProductType.PRODUCT && "product"}{data?.type === ProductType.SERVICE && "service"}</h4>
              <form className='flex flex-col gap-6' onSubmit={handleClaimThisOnSubmit}>
                <div className='flex flex-col gap-1'>
                  <label htmlFor="brand" className='font-semibold'>Select a brand</label>
                  <select name="brand" id="brand" className='p-2 border-2 border-neutral-300 rounded-lg outline-none'>
                    {userData?.id &&
                      userData.ownedBrands.filter(ownedBrand => ownedBrand.brand.verified === true).map((ownedBrand) => (
                        <option key={ownedBrand.brand.id} value={ownedBrand.brand.id}>
                          {ownedBrand.brand.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
                <div className='flex gap-2 items-center'>
                  <input type="checkbox" name='verified' id='verified' className='w-4 aspect-square rounded-md'/>
                  <label htmlFor="verified">Mark this {data?.type === ProductType.PRODUCT && "product"}{data?.type === ProductType.SERVICE && "service"} as verified</label>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      {/* "Delete This" modal */}
      {toggleDeleteThis &&
        <div className='absolute w-full h-full inset-0 bg-neutral-950/30 backdrop-blur-md' onClick={() => setToggleDeleteThis(prev => !prev)}></div>
      }
    </section>
  )
}

export default Product

