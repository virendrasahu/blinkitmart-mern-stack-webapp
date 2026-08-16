import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard.jsx';

/**
 * ProductSection Component - Section wrapper displaying product grid with skeletons & "See All" button
 */
function ProductSection({ title, subtitle, products = [], loading = false, onOpenModal, seeAllLink, limit }) {
  // Skeleton loading placeholders
  if (loading) {
    return (
      <div className="my-8">
        <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-4 w-32 bg-gray-100 rounded-md animate-pulse mb-6"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-64 border border-gray-100 animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded-md w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-full mt-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  // Limit displayed items on homepage if limit prop is passed
  const displayedProducts = limit ? products.slice(0, limit) : products;

  return (
    <div className="my-8">
      {/* Section Header with Title, Subtitle, and "See All" Link */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
        </div>

        {seeAllLink && (
          <Link
            to={seeAllLink}
            className="text-xs font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-0.5 bg-primary-light px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <span>See All</span>
            <FiChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {displayedProducts.map((product) => (
          <ProductCard key={product._id} product={product} onOpenModal={onOpenModal} />
        ))}
      </div>
    </div>
  );
}

export default ProductSection;
