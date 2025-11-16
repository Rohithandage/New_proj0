import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Shirt, Heart, Baby } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CategorySelector = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  const categories = [
    {
      id: 'men',
      name: "Men's Fashion",
      icon: <Shirt className="h-6 w-6" />,
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      subcategories: [
        { id: 'formal-shirts', name: 'Formal Shirts', icon: '👔', count: 150 },
        { id: 't-shirts', name: 'T-Shirts', icon: '👕', count: 200 },
        { id: 'polo-shirts', name: 'Polo Shirts', icon: '🏷️', count: 120 },
        { id: 'kurtas', name: 'Kurtas', icon: '👘', count: 80 },
        { id: 'jeans', name: 'Jeans', icon: '👖', count: 180 },
        { id: 'formal-pants', name: 'Formal Pants', icon: '👔', count: 90 },
        { id: 'cargo-pants', name: 'Cargo Pants', icon: '🪖', count: 60 },
        { id: 'shorts', name: 'Shorts', icon: '🩳', count: 100 },
        { id: 'blazers', name: 'Blazers', icon: '🤵', count: 70 },
        { id: 'jackets', name: 'Jackets', icon: '🧥', count: 110 },
        { id: 'hoodies', name: 'Hoodies', icon: '🧥', count: 85 },
        { id: 'sweaters', name: 'Sweaters', icon: '🧶', count: 75 },
        { id: 'shoes', name: 'Shoes', icon: '👞', count: 160 },
        { id: 'sneakers', name: 'Sneakers', icon: '👟', count: 140 },
        { id: 'formal-shoes', name: 'Formal Shoes', icon: '👞', count: 95 },
        { id: 'sandals', name: 'Sandals', icon: '🩴', count: 65 },
        { id: 'accessories', name: 'Accessories', icon: '💍', count: 130 },
        { id: 'watches', name: 'Watches', icon: '⌚', count: 85 }
      ]
    },
    {
      id: 'women',
      name: "Women's Fashion",
      icon: <Heart className="h-6 w-6" />,
      color: "from-pink-500 to-rose-700",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
      subcategories: [
        { id: 'dresses', name: 'Dresses', icon: '👗', count: 250 },
        { id: 'tops', name: 'Tops', icon: '👚', count: 200 },
        { id: 'blouses', name: 'Blouses', icon: '👔', count: 120 },
        { id: 't-shirts', name: 'T-Shirts', icon: '👕', count: 150 },
        { id: 'tunics', name: 'Tunics', icon: '👘', count: 100 },
        { id: 'kurtas', name: 'Kurtas', icon: '👘', count: 180 },
        { id: 'jeans', name: 'Jeans', icon: '👖', count: 220 },
        { id: 'skirts', name: 'Skirts', icon: '👗', count: 90 },
        { id: 'pants', name: 'Pants', icon: '👖', count: 160 },
        { id: 'leggings', name: 'Leggings', icon: '🩱', count: 110 },
        { id: 'shorts', name: 'Shorts', icon: '🩳', count: 80 },
        { id: 'blazers', name: 'Blazers', icon: '🤵', count: 70 },
        { id: 'jackets', name: 'Jackets', icon: '🧥', count: 120 },
        { id: 'cardigans', name: 'Cardigans', icon: '🧥', count: 95 },
        { id: 'shoes', name: 'Shoes', icon: '👠', count: 200 },
        { id: 'heels', name: 'Heels', icon: '👠', count: 150 },
        { id: 'flats', name: 'Flats', icon: '🥿', count: 130 },
        { id: 'sneakers', name: 'Sneakers', icon: '👟', count: 140 },
        { id: 'bags', name: 'Bags', icon: '👜', count: 180 },
        { id: 'handbags', name: 'Handbags', icon: '👜', count: 160 },
        { id: 'accessories', name: 'Accessories', icon: '💍', count: 170 },
        { id: 'jewelry', name: 'Jewelry', icon: '💎', count: 120 },
        { id: 'watches', name: 'Watches', icon: '⌚', count: 90 },
        { id: 'makeup', name: 'Makeup', icon: '💄', count: 200 }
      ]
    },
    {
      id: 'kids',
      name: "Kids' Fashion",
      icon: <Baby className="h-6 w-6" />,
      color: "from-green-500 to-emerald-700",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      subcategories: [
        { id: 'boys-clothing', name: 'Boys Clothing', icon: '👦', count: 150 },
        { id: 'girls-clothing', name: 'Girls Clothing', icon: '👧', count: 180 },
        { id: 'baby-clothing', name: 'Baby Clothing', icon: '👶', count: 120 },
        { id: 't-shirts', name: 'T-Shirts', icon: '👕', count: 100 },
        { id: 'shirts', name: 'Shirts', icon: '👔', count: 80 },
        { id: 'dresses', name: 'Dresses', icon: '👗', count: 90 },
        { id: 'jeans', name: 'Jeans', icon: '👖', count: 110 },
        { id: 'pants', name: 'Pants', icon: '👖', count: 95 },
        { id: 'shorts', name: 'Shorts', icon: '🩳', count: 85 },
        { id: 'shoes', name: 'Shoes', icon: '👟', count: 130 },
        { id: 'sneakers', name: 'Sneakers', icon: '👟', count: 120 },
        { id: 'sandals', name: 'Sandals', icon: '🩴', count: 70 },
        { id: 'accessories', name: 'Accessories', icon: '🎒', count: 90 },
        { id: 'toys', name: 'Toys', icon: '🧸', count: 200 },
        { id: 'school-supplies', name: 'School Supplies', icon: '📚', count: 80 },
        { id: 'backpacks', name: 'Backpacks', icon: '🎒', count: 60 }
      ]
    }
  ];

  const handleCategoryClick = (categoryId) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setActiveSubcategory(null);
    } else {
      setActiveCategory(categoryId);
      setActiveSubcategory(null);
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    setActiveSubcategory(subcategoryId);
    navigate(`/search?category=${categoryId}&subcategory=${subcategoryId}`);
  };

  const handleCategoryBrowse = (categoryId) => {
    navigate(`/search?category=${categoryId}`);
  };

  return (
    <div className="py-8 md:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Shop by Category
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Explore our wide range of clothing categories and find exactly what you're looking for
          </p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div 
                className={`cursor-pointer p-4 md:p-6 bg-gradient-to-r ${category.color} text-white transition-all duration-300`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="p-2 md:p-3 bg-white bg-opacity-20 rounded-full flex-shrink-0">
                      <div className="text-lg md:text-2xl">{category.icon}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-2xl font-bold truncate">{category.name}</h3>
                      <p className="text-xs md:text-base text-white text-opacity-90">
                        {category.subcategories.length} subcategories
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryBrowse(category.id);
                      }}
                      className="bg-white text-gray-700 hover:bg-gray-100 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
                    >
                      Browse All
                    </Button>
                    <div className="text-white">
                      {activeCategory === category.id ? (
                        <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
                      ) : (
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {activeCategory === category.id && (
                <CardContent className="p-4 md:p-6 bg-white">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {category.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className={`group relative cursor-pointer p-3 md:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          activeSubcategory === subcategory.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                      >
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl mb-1 md:mb-2">{subcategory.icon}</div>
                          <h4 className="font-semibold text-xs md:text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {subcategory.name}
                          </h4>
                          <p className="text-xs text-gray-500 hidden md:block">
                            {subcategory.count} products
                          </p>
                        </div>
                        {activeSubcategory === subcategory.id && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="text-xs md:text-sm text-gray-600">
                        {activeSubcategory ? 
                          `Selected: ${category.subcategories.find(s => s.id === activeSubcategory)?.name}` : 
                          <span className="hidden sm:inline">Select a subcategory to explore products</span>
                        }
                      </div>
                      {activeSubcategory && (
                        <Button
                          onClick={() => handleSubcategoryClick(category.id, activeSubcategory)}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm md:text-base px-4 md:px-6"
                        >
                          View Products
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 md:mt-16 bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Shop with Confidence
            </h3>
            <p className="text-sm md:text-base text-gray-600 px-2">
              Compare prices across multiple platforms to find the best deals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center p-3 md:p-0">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">6+</div>
              <div className="text-xs md:text-base text-gray-600">E-commerce Platforms</div>
            </div>
            <div className="text-center p-3 md:p-0">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1 md:mb-2">50+</div>
              <div className="text-xs md:text-base text-gray-600">Categories</div>
            </div>
            <div className="text-center p-3 md:p-0">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1 md:mb-2">10K+</div>
              <div className="text-xs md:text-base text-gray-600">Products</div>
            </div>
            <div className="text-center p-3 md:p-0">
              <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1 md:mb-2">35%</div>
              <div className="text-xs md:text-base text-gray-600">Average Savings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;








