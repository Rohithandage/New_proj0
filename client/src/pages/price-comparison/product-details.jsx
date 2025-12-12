import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "@/components/price-comparison/product-card";
import ProductRecommendations from "@/components/price-comparison/product-recommendations";
import SEO from "@/components/seo/SEO";
import { generateProductSchema, generateBreadcrumbSchema } from "@/utils/schema";
import axios from "axios";
import apiConfig from "@/config/api";
import { getCachedRequest } from "@/lib/api-cache";

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const url = `${apiConfig.PRICE_COMPARISON}/product/${productId}`;
      
      const productData = await getCachedRequest(url, {}, async () => {
        const response = await axios.get(url);
        return response.data.data;
      });
      
      setProduct(productData);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const productSchema = product ? generateProductSchema(product) : null;
  const breadcrumbSchema = product ? generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : "Products", url: `/search?category=${product.category || ''}` },
    { name: product.name || "Product", url: `/product/${productId}` }
  ]) : null;

  const combinedSchema = productSchema && breadcrumbSchema ? {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumbSchema]
  } : null;

  const minPrice = product?.prices?.length > 0 
    ? Math.min(...product.prices.map(p => p.price).filter(p => p != null))
    : null;

  return (
    <>
      {product && (
        <SEO
          title={`${product.name} - Price Comparison | Best Deals on ${product.name} | PriceCompare`}
          description={`Compare prices for ${product.name} across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho. ${minPrice ? `Starting from ₹${minPrice.toLocaleString()}. ` : ''}Find the best deals and save money.`}
          keywords={`${product.name}, price comparison, best price, ${product.brand}, ${product.category} clothing, ${product.subcategory}, Amazon, Flipkart, Myntra, Ajio, discount deals`}
          image={product.image || (product.images && product.images[0])}
          url={`/product/${productId}`}
          type="product"
          schema={combinedSchema}
        />
      )}
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Product Card - Larger on Desktop */}
        <div className="max-w-5xl xl:max-w-6xl mx-auto mb-8 sm:mb-12 md:mb-16 lg:mb-20">
          <ProductCard product={product} isDetailPage={true} />
        </div>

        {/* Product Recommendations */}
        <ProductRecommendations 
          productId={productId}
          product={product}
          category={product?.category}
          subcategory={product?.subcategory}
        />
      </div>
    </div>
    </>
  );
};

export default ProductDetails;
