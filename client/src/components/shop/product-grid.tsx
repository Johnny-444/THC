import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product, Category } from '@shared/schema';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ShoppingCart } from 'lucide-react';

const ProductGrid = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>('popular');
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Fetch product categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories/product'],
  });
  
  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategoryId],
    queryFn: async () => {
      const url = selectedCategoryId 
        ? `/api/products?categoryId=${selectedCategoryId}` 
        : '/api/products';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });
  
  // Sort products based on selected sort option
  const sortedProducts = products ? [...products].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return Number(a.price) - Number(b.price);
      case 'price-high':
        return Number(b.price) - Number(a.price);
      case 'rated':
        return Number(b.rating) - Number(a.rating);
      case 'popular':
      default:
        return b.isBestSeller ? 1 : -1;
    }
  }) : [];
  
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart`,
    });
  };
  
  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center">
          <span className="mr-2 font-medium">Filter:</span>
          <Select 
            value={selectedCategoryId?.toString() || 'all'} 
            onValueChange={(value) => setSelectedCategoryId(value !== 'all' ? Number(value) : null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <span className="mr-2 font-medium">Sort by:</span>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Most Popular" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rated">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {sortedProducts.map((product) => (
          <Card key={product.id} className="product-card overflow-hidden">
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-64 object-cover" 
              />
              {product.isBestSeller && (
                <div className="absolute top-2 right-2 bg-secondary text-white text-xs font-bold uppercase py-1 px-2 rounded">
                  Best Seller
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-neutral text-sm mb-2">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">${Number(product.price).toFixed(2)}</span>
                <div className="flex text-secondary">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5" 
                      fill={i < Math.floor(Number(product.rating)) ? "currentColor" : "none"} 
                    />
                  ))}
                </div>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-gray-900 text-white font-bold"
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
              >
                {product.inStock ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                ) : 'Out of Stock'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold mb-2">No Products Found</h3>
          <p className="text-neutral">Try changing your filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
