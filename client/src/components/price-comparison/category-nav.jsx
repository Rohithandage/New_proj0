import { Link } from "react-router-dom";
import { Shirt, Heart, Baby, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CategoryNav = () => {
  const categories = [
    {
      name: "Men's Fashion",
      icon: <Shirt className="h-8 w-8" />,
      href: "/search?category=men",
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      subcategories: [
        "Formal Shirts", "T-Shirts", "Kurtas", "Jeans", "Blazers", "Shoes"
      ]
    },
    {
      name: "Women's Fashion",
      icon: <Heart className="h-8 w-8" />,
      href: "/search?category=women",
      color: "from-pink-500 to-rose-700",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      subcategories: [
        "Dresses", "Tops", "Kurtas", "Jeans", "Bags", "Shoes"
      ]
    },
    {
      name: "Kids' Fashion",
      icon: <Baby className="h-8 w-8" />,
      href: "/search?category=kids",
      color: "from-green-500 to-emerald-700",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      subcategories: [
        "Boys Clothing", "Girls Clothing", "Baby Clothes", "Shoes", "Toys"
      ]
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals across all categories of clothing and accessories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link key={index} to={category.href}>
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden">
                <div className={`h-48 bg-gradient-to-br ${category.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="absolute top-6 left-6 text-white">
                    <div className="mb-4">{category.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-white text-opacity-90">
                      Explore the latest trends
                    </p>
                  </div>
                  <div className="absolute bottom-6 right-6">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 group-hover:bg-opacity-30 transition-all">
                      <ArrowRight className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 3).map((sub, subIndex) => (
                        <Badge 
                          key={subIndex} 
                          variant="secondary" 
                          className={`${category.bgColor} ${category.textColor} border-0`}
                        >
                          {sub}
                        </Badge>
                      ))}
                      {category.subcategories.length > 3 && (
                        <Badge variant="outline" className="text-gray-500">
                          +{category.subcategories.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      <span>Shop now</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Popular Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Formal Shirts", href: "/search?subcategory=formal-shirts", icon: "👔" },
              { name: "T-Shirts", href: "/search?subcategory=t-shirts", icon: "👕" },
              { name: "Kurtas", href: "/search?subcategory=kurtas", icon: "👘" },
              { name: "Jeans", href: "/search?subcategory=jeans", icon: "👖" },
              { name: "Dresses", href: "/search?subcategory=dresses", icon: "👗" },
              { name: "Shoes", href: "/search?subcategory=shoes", icon: "👟" },
              { name: "Bags", href: "/search?subcategory=bags", icon: "👜" },
              { name: "Watches", href: "/search?subcategory=watches", icon: "⌚" },
              { name: "Blazers", href: "/search?subcategory=blazers", icon: "🤵" },
              { name: "Jackets", href: "/search?subcategory=jackets", icon: "🧥" },
              { name: "Accessories", href: "/search?subcategory=accessories", icon: "💍" },
              { name: "Kids Clothes", href: "/search?category=kids", icon: "👶" }
            ].map((item, index) => (
              <Link key={index} to={item.href}>
                <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 bg-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;



