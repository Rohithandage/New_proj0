import { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Lazy load ProductCard for better code splitting
const ProductCard = lazy(() => import("./product-card"));

// Loading skeleton that matches ProductCard structure
const ProductCardSkeleton = () => (
  <Card className="relative overflow-hidden bg-white border-0 shadow-lg rounded-xl sm:rounded-2xl animate-pulse">
    <div className="relative w-full h-64 md:h-64 lg:h-72 xl:h-80 bg-gray-200 rounded-t-xl sm:rounded-t-2xl" />
    <CardContent className="p-2.5 sm:p-3 md:p-3.5">
      <div className="mb-1">
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-6 w-32 bg-gray-200 rounded" />
    </CardContent>
  </Card>
);

/**
 * Lazy-loaded ProductCard with Intersection Observer for viewport-based loading
 */
const LazyProductCard = ({ product, isDetailPage = false, ...props }) => {
  return (
    <Suspense fallback={<ProductCardSkeleton />}>
      <ProductCard product={product} isDetailPage={isDetailPage} {...props} />
    </Suspense>
  );
};

export default LazyProductCard;

