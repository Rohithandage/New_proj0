import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Bell, BarChart3, Mail, Search, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/seo/SEO";

const About = () => {
  const platforms = [
    { name: "Amazon", color: "from-orange-500 to-orange-600" },
    { name: "Flipkart", color: "from-blue-500 to-blue-600" },
    { name: "Myntra", color: "from-pink-500 to-pink-600" },
    { name: "Ajio", color: "from-purple-500 to-purple-600" },
    { name: "Nykaa", color: "from-rose-500 to-rose-600" },
    { name: "Meesho", color: "from-green-500 to-green-600" }
  ];

  return (
    <>
      <SEO
        title="About PriceCompare - Price Comparison Platform | How It Works"
        description="Learn about PriceCompare - your trusted price comparison platform for finding the best deals across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho. Compare prices and save money."
        keywords="about price comparison, price comparison platform, best deals, online shopping, Amazon, Flipkart, Myntra, Ajio, price drop alerts, save money"
        url="/about"
      />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-6">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              About ClothNest
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Compare prices from multiple platforms and never miss a great deal
            </p>
          </div>
        </div>
      </section>

      {/* Price Comparison Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Price Comparison from Different Platforms
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ClothNest helps you compare prices of clothing products across multiple e-commerce platforms 
              to find the best deals. We aggregate prices from all major platforms so you can make informed 
              purchasing decisions.
            </p>
          </div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {platforms.map((platform, index) => (
              <Card key={index} className="text-center p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-gray-100">
                <CardContent className="p-0">
                  <div className={`w-full h-20 bg-gradient-to-br ${platform.color} rounded-lg mb-3 flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm md:text-base">{platform.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border-2 border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Price Comparison Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">1. Search Products</h4>
                <p className="text-gray-600 text-sm">
                  Search for any clothing product by name, category, or description. Our system finds matching products across all platforms.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">2. Compare Prices</h4>
                <p className="text-gray-600 text-sm">
                  View prices from Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho side by side. See ratings, reviews, and availability.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">3. Get Best Deal</h4>
                <p className="text-gray-600 text-sm">
                  Click on the best deal and purchase directly from the platform. Save time and money with our comparison tool.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alert On Feature Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl mb-4 shadow-lg">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Alert On - Price Drop Notifications
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Never miss a great deal! Set up price alerts and get notified via email when products 
              drop to your desired price range.
            </p>
          </div>

          {/* Alert Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Price Drop Alerts</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Set your desired price range (minimum and maximum price) for any product. When the price 
                  falls within your specified range, you'll receive an instant email notification.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Set custom price range for each product</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Choose specific website or all platforms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Instant email notifications when price drops</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Email Notifications</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Receive detailed email alerts with product information, current price, and a direct link 
                  to purchase. Our automated system checks prices regularly and sends notifications immediately 
                  when your price target is met.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Product image included in email</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Direct link to product page</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Price range and current price details</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* How to Use Alert */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-amber-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How to Set Up Price Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Search and Select Products</h4>
                  <p className="text-gray-600 text-sm">
                    Search for products you're interested in. You can select multiple products to set up alerts for all of them at once.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Click "Alert On" Button</h4>
                  <p className="text-gray-600 text-sm">
                    On the search results page, click the "Alert On" button to open the price alert settings. 
                    You'll need to be logged in to create alerts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Set Your Price Range</h4>
                  <p className="text-gray-600 text-sm">
                    Enter your desired minimum and maximum price. Optionally, filter by specific website. 
                    Select the products you want to track. Your email will be automatically used if you're logged in.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Receive Notifications</h4>
                  <p className="text-gray-600 text-sm">
                    Our system automatically monitors prices and sends you an email notification when any 
                    product's price falls within your specified range. Check your email regularly for great deals!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Save Money?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start comparing prices and set up alerts to never miss a great deal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Compare Prices Now
            </Link>
            <Link
              to="/register"
              className="inline-block bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors border-2 border-blue-500"
            >
              Sign Up for Alerts
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default About;
