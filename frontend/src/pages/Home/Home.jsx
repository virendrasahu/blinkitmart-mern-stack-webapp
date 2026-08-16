import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header.jsx';
import Footer from '../../components/common/Footer.jsx';
import HeroBanner from './HeroBanner.jsx';
import CategoryBar from './CategoryBar.jsx';
import CategoryGrid from './CategoryGrid.jsx';
import ProductSection from './ProductSection.jsx';
import ProductDetailsModal from '../../components/product/ProductDetailsModal.jsx';
import productService from '../../services/productService.js';

/**
 * Home Page Component
 */
function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch categories & products from Express backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, featuredRes, productsRes] = await Promise.all([
          productService.getCategories(),
          productService.getFeaturedProducts(),
          productService.getProducts({ category: activeCategory, limit: 12 }),
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (featuredRes.success) setFeaturedProducts(featuredRes.data);
        if (productsRes.success) setAllProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Sticky Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Horizontal Category Scroll Bar */}
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(slug) => setActiveCategory(slug)}
        />

        {/* Hero Banner Sliders (Shown when no category filter is active) */}
        {!activeCategory && <HeroBanner />}

        {/* Shop by Category Visual Department Grid */}
        {!activeCategory && <CategoryGrid categories={categories} />}

        {/* Featured Hot Deals Section (Limited to 6 items with "See All") */}
        {!activeCategory && (
          <ProductSection
            title="⚡ Trending & Featured Items"
            subtitle="Most ordered grocery items delivered in 10 minutes"
            products={featuredProducts}
            loading={loading}
            limit={6}
            seeAllLink="/products?isFeatured=true"
            onOpenModal={(prod) => setSelectedProduct(prod)}
          />
        )}

        {/* Main Product Catalog Section (Limited to 12 items with "See All") */}
        <ProductSection
          title={activeCategory ? `Department Items` : '🛒 Popular Groceries & Essentials'}
          subtitle="Quality inspected fresh items"
          products={allProducts}
          loading={loading}
          limit={12}
          seeAllLink={activeCategory ? `/products?category=${activeCategory}` : '/products'}
          onOpenModal={(prod) => setSelectedProduct(prod)}
        />

      </main>

      {/* Footer */}
      <Footer />

      {/* Product Details Popup Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default Home;
