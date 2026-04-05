"use client"


import { useState } from "react";
import Image from "next/image";

type ProductDetailProps = {
  sku: string;
  collection?: string;
  itemNumber?: string;
  name: string;
  description: string;
  specs?: string[];
  price: string;
  currency?: string;
  sizes?: string[];
  images?: string[];
  inStock?: boolean;
  onAddToCart?: (size: string) => void;
}

const SpecBullet = ({ text }: { text: string }) => (
  <div className="flex gap-3 mb-2 items-start font-mono text-[10px] uppercase text-gray-500">
    <span>+</span>
    <span>{text}</span>
  </div>
);

export const ProductDetail = ({
  sku,
  collection = "SYS.STATUS: ACTIVE // NODE 01",
  itemNumber,
  name,
  description,
  specs = [],
  price,
  currency = "€",
  sizes = ["S", "M", "L", "XL"],
  images = [], 
  inStock = true,
  onAddToCart,
}: ProductDetailProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<number>(0);

  const handleAdd = () => {
    if (!selectedSize) return;
    if (onAddToCart) {
      onAddToCart(selectedSize);
    } else {
      console.log(`Added ${name} in size ${selectedSize} to cart!`);
    }
  };

  return(
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1B1A] flex flex-col font-mono border border-[#C8C5BE]">
    

      <div className="flex flex-col md:flex-row flex-1">

        <div className="w-full md:w-[60%] border-b md:border-b-0 md:border-r border-[#C8C5BE] relative min-h-[50vh] flex flex-col items-center justify-center p-8 overflow-hidden group bg-[#FAF9F6]">
          

          <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#1C1B1A] opacity-30"></div>
          <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#1C1B1A] opacity-30"></div>
          <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-[#1C1B1A] opacity-30"></div>
          <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-[#1C1B1A] opacity-30"></div>


          {images && images.length > 1 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`font-mono text-[9px] tracking-[0.2em] px-3 py-1 border border-[#1C1B1A] transition-colors ${
                    activeImage === index 
                      ? "bg-[#1C1B1A] text-[#FAF9F6]" 
                      : "bg-[#FAF9F6] text-[#1C1B1A] hover:bg-[#F0EDE7]"
                  }`}
                >
                  VIEW // 0{index + 1}
                </button>
              ))}
            </div>
          )}

  
          {images && images.length > 0 ? (
            <div className="relative w-full h-[50vh] md:h-[70vh] z-10">
              <Image 
                src={images[activeImage]} 
                alt={`${name} - View ${activeImage + 1}`} 
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
          ) : (
            <div className="text-gray-400 font-mono tracking-widest z-10 text-xs">
              [ AWAITING VISUAL DATA ]
            </div>
          )}
        </div>


        <div className="w-full md:w-[40%] flex flex-col bg-[#FAF9F6]">
          

          <div className="p-8 md:p-12 flex-1 flex flex-col">
            
  
            <span className="text-[10px] tracking-[0.2em] font-mono text-gray-500 uppercase mb-3">
              {collection}
            </span>

            <h1 className="font-monument text-3xl md:text-4xl font-bold uppercase tracking-wider mb-6 text-[#1C1B1A]">
              {name}
            </h1>
            
            <p className="text-sm leading-relaxed text-gray-600 mb-10 font-sans">
              {description}
            </p>

  
            <div className="mb-8 border-t border-[#C8C5BE] pt-6">
              {specs.map((s, i) => (
                <SpecBullet key={i} text={s} />
              ))}
            </div>
          </div>

  
          <div className="border-t border-[#C8C5BE] mt-auto">
            

            <div className="flex justify-between items-end p-8 border-b border-[#C8C5BE]">
              <span className="text-[10px] tracking-[0.2em] text-gray-500 uppercase pb-1">Price</span>
              <span className="font-bitcount text-4xl text-[#1C1B1A]">{currency}{price}</span>
            </div>

            <div className="flex flex-col sm:flex-row">
              

              <div className="flex border-b sm:border-b-0 sm:border-r border-[#C8C5BE] bg-[#FAF9F6]">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-16 h-16 flex items-center justify-center border-r border-[#C8C5BE] last:border-r-0 text-xs font-mono tracking-widest transition-colors ${
                      selectedSize === size
                        ? "bg-[#1C1B1A] text-[#FAF9F6]"
                        : "bg-[#FAF9F6] text-[#1C1B1A] hover:bg-[#F0EDE7]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 bg-[#1C1B1A] text-[#FAF9F6] py-5 sm:py-4 flex flex-col items-center justify-center group transition-colors hover:bg-black min-h-18 sm:min-h-16">
                  <span className="font-monument text-sm uppercase tracking-widest leading-tight">
                    {selectedSize ? "BUY NOW" : "Select Size"}
                   </span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-gray-400 mt-1.5 group-hover:text-white transition-colors">
                [ {inStock ? "ITEM IN STOCK" : "OUT OF STOCK"} ]
                    </span>
                </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}