// Schema Markup Utilities for SEO

export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PriceCompare",
    "url": "https://pricecompare.com",
    "description": "Compare prices across multiple e-commerce platforms to find the best deals on clothing",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pricecompare.com/search?query={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ClothingStore"],
    "name": "PriceCompare - All Brands of Clothing",
    "url": "https://pricecompare.com",
    "logo": "https://pricecompare.com/Logo.png",
    "description": "Search and compare prices for all brands of clothing - men, women, and kids clothes. Find best deals on clothing from top brands.",
    "knowsAbout": [
      "Clothing",
      "Fashion",
      "Men's Clothing",
      "Women's Clothing",
      "Kids Clothing",
      "Price Comparison",
      "Online Shopping",
      "Brand Clothing",
      "All Brands",
      "Clothing Brands",
      "Shirts",
      "Dresses",
      "Jeans",
      "Shoes"
    ],
    "sameAs": [
      // Add social media links if available
    ]
  };
};

export const generateProductSchema = (product) => {
  if (!product) return null;

  const prices = product.prices || [];
  const bestPrice = prices.length > 0 
    ? Math.min(...prices.map(p => p.price).filter(p => p != null))
    : null;

  const offers = prices.map(price => ({
    "@type": "Offer",
    "url": price.url,
    "priceCurrency": "INR",
    "price": price.price,
    "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "itemCondition": "https://schema.org/NewCondition",
    "availability": price.inStock 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": price.website.charAt(0).toUpperCase() + price.website.slice(1)
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image || (product.images && product.images[0]) || "",
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "category": product.category,
    "offers": offers.length > 0 ? offers : {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": bestPrice,
      "highPrice": bestPrice,
      "offerCount": prices.length,
      "offers": offers
    }
  };
};

export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateCollectionPageSchema = (category, products) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.charAt(0).toUpperCase() + category.slice(1)} Clothing - Best Deals`,
    "description": `Find the best deals on ${category} clothing from top brands. Compare prices across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho.`,
    "numberOfItems": products?.length || 0
  };
};

