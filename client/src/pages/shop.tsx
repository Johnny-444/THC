import ProductGrid from '@/components/shop/product-grid';

const Shop = () => {
  return (
    <section id="shop" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-heading text-center mb-4">SHOP OUR PRODUCTS</h2>
        <p className="text-neutral text-center max-w-2xl mx-auto mb-12">
          Maintain your style with our premium collection of grooming products specially curated for the modern gentleman.
        </p>
        
        <ProductGrid />
      </div>
    </section>
  );
};

export default Shop;
