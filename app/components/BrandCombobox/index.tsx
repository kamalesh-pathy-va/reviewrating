"use client";
import { trpc } from '@/app/_trpc/client';
import React, { useEffect, useState } from 'react';
import { PiCaretUpDownFill } from "react-icons/pi";

const BrandComboBox = ({onSelect}: {onSelect: (id: string)=>void}) => {
  const [selectValue, setSelectedValue] = useState({ id: "", name: "Select a brand" });
  const [toggleOptions, setToggleOptions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [query, setQuery] = useState("");

  const { data: brands } = trpc.brand.searchBrands.useQuery(
    {
      query: debouncedQuery,
    },
    {
      enabled: debouncedQuery.length > 0,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className='max-w-lg flex flex-col gap-2 relative'>
      <button className='border-2 border-neutral-200 rounded-lg bg-white p-2 px-3 text-sm font-bold w-full flex justify-between items-center hover:border-neutral-400 transition-colors' type='button' onClick={() => setToggleOptions(prev => !prev)}>
        <span>{selectValue.name}</span>
        <PiCaretUpDownFill />
      </button>
      {toggleOptions && 
        <div className='absolute top-11 z-10 border-2 rounded-lg bg-white text-sm w-full text-left border-neutral-400 flex flex-col overflow-hidden drop-shadow-lg'>
          <input type="text" placeholder='Search for a brand' className='outline-none w-full p-2 px-3 border-b' onChange={(e) => setQuery(e.target.value)} />
          <div className='flex flex-col'>
            {(brands?.length ?? 0) > 0 &&
              brands?.map(brand =>
                <button type='button' className='text-left py-1 px-3 hover:bg-neutral-100 transition-colors' key={brand.id} onClick={() => { setSelectedValue(brand); onSelect(brand.id); setToggleOptions(prev => !prev); } }>{brand.name}</button>
              )
            }
          </div>
        </div>
      }
    </div>
  )
}

export default BrandComboBox