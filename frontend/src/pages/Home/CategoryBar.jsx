import React from 'react';

/**
 * CategoryBar Component - Horizontal Category Filter Chips
 */
function CategoryBar({ categories = [], activeCategory, onSelectCategory }) {
  return (
    <div className="my-6">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
        {/* All Products Chip */}
        <button
          onClick={() => onSelectCategory('')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs border ${
            activeCategory === ''
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
          }`}
        >
          <span>🛒 All Departments</span>
        </button>

        {/* Dynamic Category Chips */}
        {categories.map((cat) => (
          <button
            key={cat._id || cat.slug}
            onClick={() => onSelectCategory(cat.slug)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs border ${
              activeCategory === cat.slug
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm">{cat.icon || '🛒'}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;
