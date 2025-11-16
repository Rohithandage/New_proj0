import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SubcategoryFilter = ({ category, currentSubcategory, onSubcategoryChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const subcategories = {
    men: [
      { name: "Formal Shirts", value: "formal-shirts", icon: "👔", color: "bg-blue-100 text-blue-800" },
      { name: "T-Shirts", value: "t-shirts", icon: "👕", color: "bg-gray-100 text-gray-800" },
      { name: "Polo Shirts", value: "polo-shirts", icon: "🏷️", color: "bg-green-100 text-green-800" },
      { name: "Kurtas", value: "kurtas", icon: "👘", color: "bg-orange-100 text-orange-800" },
      { name: "Jeans", value: "jeans", icon: "👖", color: "bg-indigo-100 text-indigo-800" },
      { name: "Formal Pants", value: "formal-pants", icon: "👔", color: "bg-slate-100 text-slate-800" },
      { name: "Cargo Pants", value: "cargo-pants", icon: "🪖", color: "bg-amber-100 text-amber-800" },
      { name: "Shorts", value: "shorts", icon: "🩳", color: "bg-cyan-100 text-cyan-800" },
      { name: "Blazers", value: "blazers", icon: "🤵", color: "bg-purple-100 text-purple-800" },
      { name: "Jackets", value: "jackets", icon: "🧥", color: "bg-red-100 text-red-800" },
      { name: "Hoodies", value: "hoodies", icon: "🧥", color: "bg-pink-100 text-pink-800" },
      { name: "Sweaters", value: "sweaters", icon: "🧶", color: "bg-rose-100 text-rose-800" },
      { name: "Shoes", value: "shoes", icon: "👞", color: "bg-yellow-100 text-yellow-800" },
      { name: "Sneakers", value: "sneakers", icon: "👟", color: "bg-emerald-100 text-emerald-800" },
      { name: "Formal Shoes", value: "formal-shoes", icon: "👞", color: "bg-stone-100 text-stone-800" },
      { name: "Sandals", value: "sandals", icon: "🩴", color: "bg-teal-100 text-teal-800" },
      { name: "Accessories", value: "accessories", icon: "💍", color: "bg-violet-100 text-violet-800" },
      { name: "Watches", value: "watches", icon: "⌚", color: "bg-sky-100 text-sky-800" }
    ],
    women: [
      { name: "Dresses", value: "dresses", icon: "👗", color: "bg-pink-100 text-pink-800" },
      { name: "Tops", value: "tops", icon: "👚", color: "bg-rose-100 text-rose-800" },
      { name: "Blouses", value: "blouses", icon: "👔", color: "bg-purple-100 text-purple-800" },
      { name: "T-Shirts", value: "t-shirts", icon: "👕", color: "bg-gray-100 text-gray-800" },
      { name: "Tunics", value: "tunics", icon: "👘", color: "bg-orange-100 text-orange-800" },
      { name: "Kurtas", value: "kurtas", icon: "👘", color: "bg-amber-100 text-amber-800" },
      { name: "Jeans", value: "jeans", icon: "👖", color: "bg-indigo-100 text-indigo-800" },
      { name: "Skirts", value: "skirts", icon: "👗", color: "bg-cyan-100 text-cyan-800" },
      { name: "Pants", value: "pants", icon: "👖", color: "bg-blue-100 text-blue-800" },
      { name: "Leggings", value: "leggings", icon: "🩱", color: "bg-green-100 text-green-800" },
      { name: "Shorts", value: "shorts", icon: "🩳", color: "bg-teal-100 text-teal-800" },
      { name: "Blazers", value: "blazers", icon: "🤵", color: "bg-slate-100 text-slate-800" },
      { name: "Jackets", value: "jackets", icon: "🧥", color: "bg-red-100 text-red-800" },
      { name: "Cardigans", value: "cardigans", icon: "🧥", color: "bg-pink-100 text-pink-800" },
      { name: "Shoes", value: "shoes", icon: "👠", color: "bg-yellow-100 text-yellow-800" },
      { name: "Heels", value: "heels", icon: "👠", color: "bg-rose-100 text-rose-800" },
      { name: "Flats", value: "flats", icon: "🥿", color: "bg-emerald-100 text-emerald-800" },
      { name: "Sneakers", value: "sneakers", icon: "👟", color: "bg-violet-100 text-violet-800" },
      { name: "Bags", value: "bags", icon: "👜", color: "bg-stone-100 text-stone-800" },
      { name: "Handbags", value: "handbags", icon: "👜", color: "bg-sky-100 text-sky-800" },
      { name: "Accessories", value: "accessories", icon: "💍", color: "bg-orange-100 text-orange-800" },
      { name: "Jewelry", value: "jewelry", icon: "💎", color: "bg-purple-100 text-purple-800" },
      { name: "Watches", value: "watches", icon: "⌚", color: "bg-indigo-100 text-indigo-800" },
      { name: "Makeup", value: "makeup", icon: "💄", color: "bg-pink-100 text-pink-800" }
    ],
    kids: [
      { name: "Boys Clothing", value: "boys-clothing", icon: "👦", color: "bg-blue-100 text-blue-800" },
      { name: "Girls Clothing", value: "girls-clothing", icon: "👧", color: "bg-pink-100 text-pink-800" },
      { name: "Baby Clothing", value: "baby-clothing", icon: "👶", color: "bg-green-100 text-green-800" },
      { name: "T-Shirts", value: "t-shirts", icon: "👕", color: "bg-gray-100 text-gray-800" },
      { name: "Shirts", value: "shirts", icon: "👔", color: "bg-purple-100 text-purple-800" },
      { name: "Dresses", value: "dresses", icon: "👗", color: "bg-rose-100 text-rose-800" },
      { name: "Jeans", value: "jeans", icon: "👖", color: "bg-indigo-100 text-indigo-800" },
      { name: "Pants", value: "pants", icon: "👖", color: "bg-cyan-100 text-cyan-800" },
      { name: "Shorts", value: "shorts", icon: "🩳", color: "bg-teal-100 text-teal-800" },
      { name: "Shoes", value: "shoes", icon: "👟", color: "bg-yellow-100 text-yellow-800" },
      { name: "Sneakers", value: "sneakers", icon: "👟", color: "bg-emerald-100 text-emerald-800" },
      { name: "Sandals", value: "sandals", icon: "🩴", color: "bg-orange-100 text-orange-800" },
      { name: "Accessories", value: "accessories", icon: "🎒", color: "bg-violet-100 text-violet-800" },
      { name: "Toys", value: "toys", icon: "🧸", color: "bg-amber-100 text-amber-800" },
      { name: "School Supplies", value: "school-supplies", icon: "📚", color: "bg-slate-100 text-slate-800" },
      { name: "Backpacks", value: "backpacks", icon: "🎒", color: "bg-sky-100 text-sky-800" }
    ]
  };

  const currentSubcategories = subcategories[category] || [];

  if (!currentSubcategories.length) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {category === 'men' ? "Men's" : category === 'women' ? "Women's" : "Kids'"} Categories
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {currentSubcategories.slice(0, isExpanded ? currentSubcategories.length : 12).map((sub, index) => (
            <div
              key={index}
              onClick={() => {
                if (onSubcategoryChange) {
                  onSubcategoryChange(sub.value);
                }
              }}
              className="cursor-pointer"
            >
              <div className={`
                group relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer
                ${currentSubcategory === sub.value 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }
              `}>
                <div className="text-center">
                  <div className="text-2xl mb-2">{sub.icon}</div>
                  <p className={`text-xs font-medium ${
                    currentSubcategory === sub.value ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'
                  }`}>
                    {sub.name}
                  </p>
                </div>
                {currentSubcategory === sub.value && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {currentSubcategories.length > 12 && !isExpanded && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              View {currentSubcategories.length - 12} more categories
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubcategoryFilter;



