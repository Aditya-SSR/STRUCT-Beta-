import Link from "next/link";
import Image from "next/image";
import { myProducts } from "@/components/data"; // Adjust import path if needed

// ── Types ───────────────────────────────────────────────────────────────────
export type CardProduct = {
  sku: string;
  name: string;
  material: string;
  price: string;
  currency?: string;
  image1: string;
  image2: string;
  collection: string;
  description: string;
  specs: string[];
  sizes: string[];
  inStock: boolean;
};

type ImageProps = {
  sku: string;
  image1?: string;
  image2?: string;
};

type ProductCardProps = {
  product: CardProduct;
  index: number;
};

type ProductGridProps = {
  products: CardProduct[];
  collectionLabel?: string;
};

// ── Components ──────────────────────────────────────────────────────────────

const ImagePlaceholder = ({ sku, image1, image2 }: ImageProps) => (
  <div className="relative w-full aspect-4/5 overflow-hidden bg-[#FAF9F6] border-b border-[#C8C5BE]">
    {image1 && (
      <Image
        src={image1}
        alt={sku}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    )}
    {image2 && (
      <Image
        src={image2}
        alt={`${sku} alternate view`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-[1.03]"
      />
    )}
  </div>
);

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { sku, name, material, price, currency = "€", image1, image2 } = product;
  
  // Adds a right border only to the first column to match your screenshot
  const isLeftColumn = index % 2 === 0;

  return (
    <Link 
      href={`/products/${sku}`}
      className={`struct-card group flex flex-col cursor-pointer bg-[#FAF9F6] hover:bg-[#F3F1EC] transition-colors duration-200 ease-in ${
        isLeftColumn ? "border-r border-[#C8C5BE]" : ""
      }`}
    >
      <ImagePlaceholder sku={sku} image1={image1} image2={image2} />

      <div className="p-5 flex flex-col">
        <span className="text-[10px] tracking-[0.2em] font-mono text-gray-500 uppercase mb-1">
          {sku}
        </span>

        <h3 className="font-monument text-lg font-bold tracking-[0.05em] text-[#1C1B1A] uppercase mb-1">
          {name}
        </h3>

        <span className="text-[9px] tracking-[0.15em] text-gray-500 uppercase">
          MAT / {material}
        </span>

        <div className="flex justify-between items-end mt-6 pt-4 border-t border-[#C8C5BE]">
          <span className="font-bitcount text-3xl text-[#1C1B1A] tracking-wider">
            {currency} {price}
          </span>
        </div>
      </div>
    </Link>
  );
};

export const ProductGrid = ({ products, collectionLabel = "DROP-01 / SS-26" }: ProductGridProps) => {
  return (
    <section className="bg-[#FAF9F6] min-h-screen flex flex-col">
      
      {/* 🔝 Top Header (Matches Screenshot) */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-[#C8C5BE]">
        <h1 className="font-monument text-xl md:text-2xl tracking-widest text-[#1C1B1A] uppercase">
          {collectionLabel}
        </h1>
      </div>

      {/* 🔲 2-Column Grid */}
      <div className="grid grid-cols-2 border-b border-[#C8C5BE]">
        {products.map((product, index) => (
          <ProductCard key={product.sku} product={product} index={index} />
        ))}
      </div>
      
    </section>
  );
};

export default function ProductsPage() {
  return (
    <main>
      <ProductGrid products={myProducts} />
    </main>
  );
}