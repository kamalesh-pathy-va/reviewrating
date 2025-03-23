import React from 'react'

const Brand = ({ params }: { params: {brandId: string} }) => {
  return (
    <div>Brand page of {params.brandId}</div>
  )
}

export default Brand