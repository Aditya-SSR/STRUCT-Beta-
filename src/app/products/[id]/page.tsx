import { myProducts } from "@/components/data";
import { ProductDetail } from "@/components/productDetail";

export default async function Page({params} : {params : {id : string}}){

const { id } = await params;

  const product = myProducts.find((p) => p.sku === id);

  if (!product) {
    return <div className="p-10 font-mono">ERROR: ITEM NOT FOUND</div>;
  }

const detailData = {
    ...product, 
    images: [product.image1, product.image2], 
  };

  return <ProductDetail {...detailData} />;
}