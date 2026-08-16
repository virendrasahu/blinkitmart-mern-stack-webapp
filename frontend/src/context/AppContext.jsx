import React, { createContext, useState, useEffect, useContext } from 'react';
import addressService from '../services/addressService.js';
import { useAuth } from './AuthContext.jsx';

// Create App Context
const AppContext = createContext();

/**
 * AppProvider Component
 * 
 * Manages active delivery location, location selection modal state,
 * saved addresses, search queries, cart drawer, and persistent storage.
 */
export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Active delivery location display string with localStorage persistence
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('blinkit_location') || 'Gurugram, Haryana - 122001';
  });

  // Active selected address object with localStorage persistence
  const [activeAddress, setActiveAddressState] = useState(() => {
    try {
      const saved = localStorage.getItem('blinkit_active_address');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Saved user addresses list
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Location modal toggle state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Search input query
  const [searchQuery, setSearchQuery] = useState('');

  // Selected category filter
  const [selectedCategory, setSelectedCategory] = useState('');

  // Cart drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch saved addresses from backend when user is logged in
  const fetchAddresses = async () => {
    if (!isAuthenticated) {
      setSavedAddresses([]);
      return;
    }
    try {
      const res = await addressService.getAddresses();
      if (res.success && res.data) {
        setSavedAddresses(res.data);
        
        // Auto-select default address if activeAddress is not set
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        if (defaultAddr && !activeAddress) {
          selectAddress(defaultAddr);
        }
      }
    } catch (err) {
      console.warn('Could not fetch saved addresses:', err.message);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isAuthenticated]);

  // Set selected address as active delivery location and persist to localStorage
  const selectAddress = (addr) => {
    setActiveAddressState(addr);

    if (typeof addr === 'string') {
      setLocation(addr);
      localStorage.setItem('blinkit_location', addr);
    } else if (addr) {
      const formatted =
        addr.fullAddress ||
        `${addr.houseNo ? addr.houseNo + ', ' : ''}${addr.street || addr.area || addr.city}, ${addr.city ? addr.city + ', ' : ''}${addr.state}${addr.pincode ? ' - ' + addr.pincode : ''}`;
      
      setLocation(formatted);
      localStorage.setItem('blinkit_location', formatted);
      localStorage.setItem('blinkit_active_address', JSON.stringify(addr));
    }
  };

  const value = {
    location,
    setLocation,
    activeAddress,
    setActiveAddress: selectAddress,
    savedAddresses,
    setSavedAddresses,
    fetchAddresses,
    isLocationModalOpen,
    setIsLocationModalOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isCartOpen,
    setIsCartOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
