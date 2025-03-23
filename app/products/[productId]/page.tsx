import React from 'react'

const Product = ({ params }: { params: {productId: string} }) => {
  return (
    <div>Product page of {params.productId}</div>
  )
}

export default Product