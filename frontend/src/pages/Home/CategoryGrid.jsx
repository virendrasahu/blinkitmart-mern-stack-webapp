import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CategoryGrid Component - Visual Department Tiles Grid
 */
function CategoryGrid({ categories = [] }) {
  if (categories.length === 0) return null;

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Shop by Department</h2>
          <p className="text-xs text-gray-500 font-medium">Select a category to browse products</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/products?category=${cat.slug}`}
            className="flex flex-col items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden mb-2 p-1.5 group-hover:scale-105 transition-transform">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoryGrid;
