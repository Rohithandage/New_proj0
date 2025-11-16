import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = "PriceCompare - Find Best Deals & Compare Prices Online",
  description = "Compare prices across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho. Find the best deals on clothing for men, women, and kids. Smart shopping made easy with real-time price comparison.",
  keywords = "price comparison, best deals, online shopping, compare prices, Amazon, Flipkart, Myntra, Ajio, Nykaa, Meesho, clothing deals, men clothing, women clothing, kids clothing, discount shopping, affordable fashion",
  image = "/Logo.png",
  url = "",
  type = "website",
  schema = null
}) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pricecompare.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="PriceCompare" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;





