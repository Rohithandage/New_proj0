import { useState, useEffect, useRef, memo } from "react";
import ProductCard from "./product-card";

/**
 * ProductCard wrapper with Intersection Observer for viewport-based loading
 * Only loads the card when it's about to enter the viewport
 */
const ViewportProductCard = memo(({ product, isDetailPage = false, forceLoad = false, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  // INSTANT: If forceLoad is true, load immediately
  const [shouldLoad, setShouldLoad] = useState(forceLoad || isDetailPage);
  const cardRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // INSTANT: For detail pages or forced load, load immediately (no observer needed)
    if (isDetailPage || forceLoad) {
      setShouldLoad(true);
      return;
    }

    // AGGRESSIVE: Start preloading images immediately even before card is visible
    if (product?.images && product.images.length > 0) {
      // Use global preloader if available (from inline script)
      if (typeof window !== 'undefined' && window.__preloadImage) {
        window.__preloadImage(product.images[0]);
      }
    } else if (product?.image && typeof window !== 'undefined' && window.__preloadImage) {
      window.__preloadImage(product.image);
    }

    // Create Intersection Observer with early trigger (300px before viewport for faster loading)
    const observerOptions = {
      root: null,
      rootMargin: '300px', // Start loading 300px before entering viewport (more aggressive)
      threshold: 0.01
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Load immediately when visible
          setShouldLoad(true);
          // Disconnect observer after first trigger
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      });
    }, observerOptions);

    if (cardRef.current) {
      observerRef.current.observe(cardRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isDetailPage, forceLoad, product]);

  // Render lightweight placeholder immediately to prevent layout shift
  // This renders instantly without any heavy operations
  if (!shouldLoad) {
    return (
      <div 
        ref={cardRef} 
        className="relative overflow-hidden bg-white border-0 shadow-lg rounded-xl sm:rounded-2xl"
        style={{ minHeight: '400px' }}
      >
        <div className="relative w-full h-64 md:h-64 lg:h-72 xl:h-80 bg-gray-100 rounded-t-xl sm:rounded-t-2xl" />
        <div className="p-2.5 sm:p-3 md:p-3.5">
          <div className="mb-1">
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-3 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="h-6 w-24 bg-gray-200 rounded mb-2 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef}>
      <ProductCard product={product} isDetailPage={isDetailPage} {...props} />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.product?._id === nextProps.product?._id &&
         prevProps.isDetailPage === nextProps.isDetailPage;
});

ViewportProductCard.displayName = 'ViewportProductCard';

export default ViewportProductCard;

