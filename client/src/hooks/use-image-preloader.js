import { useEffect, useRef } from 'react';
import { preloadProductImages, preloadImagesInHead } from '@/lib/image-preloader';

/**
 * Hook to aggressively preload product images
 * Starts preloading immediately when products are available
 */
export const useImagePreloader = (products, options = {}) => {
  const {
    priority = 'high',
    preloadInHead = true,
    maxHeadPreload = 6,
    enabled = true
  } = options;
  
  const preloadedRef = useRef(false);
  
  useEffect(() => {
    if (!enabled || !products || products.length === 0 || preloadedRef.current) {
      return;
    }
    
    preloadedRef.current = true;
    
    // Extract critical images for head preload
    if (preloadInHead) {
      const criticalImages = [];
      products.slice(0, maxHeadPreload).forEach(product => {
        if (product.images && product.images.length > 0) {
          criticalImages.push(product.images[0]);
        } else if (product.image) {
          criticalImages.push(product.image);
        }
      });
      
      if (criticalImages.length > 0) {
        preloadImagesInHead(criticalImages);
      }
    }
    
    // Preload all product images
    preloadProductImages(products, priority);
  }, [products, priority, preloadInHead, maxHeadPreload, enabled]);
};

