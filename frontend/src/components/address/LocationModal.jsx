import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import {
  FiX,
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiHome,
  FiBriefcase,
  FiCheck,
  FiTrash2,
  FiPlus,
  FiAlertTriangle,
  FiEdit3,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import addressService from '../../services/addressService.js';

// Fix Leaflet Default Icon Paths in Vite Bundles
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/**
 * Helper Component: Smoothly Pan Map Center when Coordinates Change
 */
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 16, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

/**
 * Helper Component: Re-calculates Map Dimensions to Prevent Blank/Grey Tiles
 */
function ResizeMap({ activeTab }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 200),
      setTimeout(() => map.invalidateSize(), 500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [map, activeTab]);
  return null;
}

/**
 * Helper Component: Handles Map Click Events to Move Draggable Marker
 */
function MapEventsHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * Blinkit-Style Location Selection & Address Management Modal
 * 
 * Features:
 * - 📍 Map Location Picker (Leaflet + Nominatim Geocoding + GPS API)
 * - 📝 Enter Address Manually (Direct Form with robust validation)
 * - 🏠 Saved Addresses (Logged-in User Saved List)
 */
function LocationModal() {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    setActiveAddress,
    savedAddresses,
    fetchAddresses,
  } = useApp();

  const { isAuthenticated, user } = useAuth();

  // Active Tab: 'map' | 'manual' | 'saved'
  const [activeTab, setActiveTab] = useState('map');

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Internal Map Coordinates [lat, lng] - Default: Gurugram, India
  const [position, setPosition] = useState([28.4595, 77.0266]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Address Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'home',
    fullAddress: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const markerRef = useRef(null);

  // Auto-fill recipient details when user loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  /**
   * Reverse Geocode Coordinates to Address using OpenStreetMap Nominatim
   */
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    setGpsError('');
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );

      if (response.data) {
        const addr = response.data.address || {};
        const house = addr.house_number || addr.building || addr.amenity || '';
        const street = addr.road || addr.street || addr.footway || addr.pedestrian || '';
        const area = addr.neighbourhood || addr.suburb || addr.residential || addr.subdistrict || addr.county || '';
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.district || addr.state_district || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';
        const displayName = response.data.display_name || `${street}, ${city}`;

        setFormData((prev) => ({
          ...prev,
          houseNo: house || prev.houseNo || 'Block 1',
          street: street || prev.street || 'Main Road',
          area: area || prev.area || city,
          city: city || prev.city || 'City',
          state: state || prev.state || 'State',
          pincode: pincode || prev.pincode || '',
          fullAddress: displayName,
        }));
      }
    } catch (err) {
      console.warn('Reverse geocoding note:', err.message);
    } finally {
      setIsGeocoding(false);
    }
  };

  /**
   * Handle Map Marker Drag Event
   */
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          const newPos = [latLng.lat, latLng.lng];
          setPosition(newPos);
          reverseGeocode(latLng.lat, latLng.lng);
        }
      },
    }),
    []
  );

  /**
   * Primary Location Detection via Browser Geolocation API
   */
  const handleDetectLocation = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      const msg = 'Browser Geolocation API is not supported by your browser. Switch to Manual Address below.';
      setGpsError(msg);
      toast.error(msg);
      return;
    }

    setIsDetecting(true);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const exactLat = pos.coords.latitude;
        const exactLng = pos.coords.longitude;
        const exactPos = [exactLat, exactLng];

        setPosition(exactPos);
        reverseGeocode(exactLat, exactLng);

        toast.success('Location detected successfully!');
        setIsDetecting(false);
      },
      (error) => {
        setIsDetecting(false);
        let errMsg = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errMsg = 'GPS location permission denied. You can drag the map marker or switch to Manual Address Entry.';
            break;
          case error.POSITION_UNAVAILABLE:
            errMsg = 'GPS signal unavailable. You can drag the map marker or switch to Manual Address Entry.';
            break;
          case error.TIMEOUT:
            errMsg = 'GPS request timed out. You can select location on the map or switch to Manual Address Entry.';
            break;
          default:
            errMsg = 'Location detection failed. You can select location on the map or switch to Manual Address Entry.';
            break;
        }
        setGpsError(errMsg);
        toast.info(errMsg);
      },
      geoOptions
    );
  };

  /**
   * Search Location via Nominatim API
   */
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGpsError('');
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      );
      setSearchResults(res.data || []);
      if (res.data.length === 0) {
        toast.info('No matching locations found. Try a different search query.');
      }
    } catch (err) {
      toast.error('Error searching location.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newPos = [lat, lng];
    setPosition(newPos);
    setSearchResults([]);
    setSearchQuery(result.display_name);
    reverseGeocode(lat, lng);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * 📍 Flow 1: Submit Map Location Selection
   */
  const handleConfirmMapLocation = async () => {
    const displayAddr =
      formData.fullAddress ||
      `${formData.houseNo || ''} ${formData.street || 'Selected Locality'}, ${formData.city || ''} ${formData.state || ''}`;

    const cleanArea = formData.area.trim() || formData.street.trim() || formData.city.trim() || 'Selected Area';

    const payload = {
      fullName: formData.fullName.trim() || user?.name || 'Customer',
      phone: formData.phone.trim() || user?.phone || '9876543210',
      houseNo: formData.houseNo.trim() || 'Map Location',
      street: formData.street.trim() || 'Selected Locality',
      area: cleanArea,
      city: formData.city.trim() || 'City',
      state: formData.state.trim() || 'State',
      pincode: formData.pincode.trim() || '122001',
      landmark: formData.landmark.trim() || '',
      latitude: position[0],
      longitude: position[1],
      fullAddress: displayAddr,
      addressType: formData.addressType || 'home',
    };

    setSubmitting(true);
    try {
      if (isAuthenticated) {
        try {
          const res = await addressService.addAddress(payload);
          if (res.success && res.data) {
            await fetchAddresses();
            setActiveAddress(res.data);
          } else {
            setActiveAddress(payload);
          }
        } catch (err) {
          setActiveAddress(payload);
        }
      } else {
        setActiveAddress(payload);
      }

      toast.success('Map location confirmed & set as delivery address!');
      setIsLocationModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 📝 Flow 2: Submit Manual Address Form
   */
  const handleManualSubmit = async (e) => {
    e.preventDefault();

    // Check visible required fields
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.houseNo.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      toast.error('Please fill in all required address fields (Name, Phone, Flat/House No, Street, City, State, Pincode)!');
      return;
    }

    setSubmitting(true);
    try {
      const cleanArea = formData.area.trim() || formData.street.trim() || formData.city.trim();
      const formattedFullAddress = `${formData.houseNo.trim()}, ${formData.street.trim()}, ${cleanArea}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.pincode.trim()}`;

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        houseNo: formData.houseNo.trim(),
        street: formData.street.trim(),
        area: cleanArea,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        landmark: formData.landmark.trim(),
        addressType: formData.addressType || 'home',
        latitude: position[0] || 28.4595,
        longitude: position[1] || 77.0266,
        fullAddress: formattedFullAddress,
      };

      if (isAuthenticated) {
        const res = await addressService.addAddress(payload);
        if (res.success && res.data) {
          toast.success('Delivery address saved successfully!');
          await fetchAddresses();
          setActiveAddress(res.data);
        } else {
          setActiveAddress(payload);
          toast.success('Delivery location set!');
        }
      } else {
        setActiveAddress(payload);
        toast.success('Delivery location set!');
      }

      setIsLocationModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🏠 Flow 3: Select Saved Address
   */
  const handleSelectSavedAddress = (addr) => {
    setActiveAddress(addr);
    toast.success(`Selected "${addr.addressType.toUpperCase()}" delivery address`);
    setIsLocationModalOpen(false);
  };

  const handleDeleteSavedAddress = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await addressService.deleteAddress(id);
      if (res.success) {
        toast.info('Address removed');
        fetchAddresses();
      }
    } catch (err) {
      toast.error('Error deleting address');
    }
  };

  if (!isLocationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
              <FiMapPin className="text-primary" /> Select Delivery Location
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Choose address for 10-minute grocery delivery</p>
          </div>

          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Independent Flow Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/40 px-3 sm:px-5 pt-2.5 gap-1 sm:gap-3 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            📍 Map Location Picker
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            📝 Enter Address Manually
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              🏠 Saved ({savedAddresses.length})
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: 📍 MAP LOCATION PICKER */}
          {activeTab === 'map' && (
            <div className="space-y-3.5">
              
              {/* GPS Warning / Failure Banner with Manual Switch Button */}
              {gpsError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="font-medium">{gpsError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('manual')}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl text-[11px] hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
                  >
                    📝 Switch to Manual Address
                  </button>
                </div>
              )}

              {/* Location Search Bar & Detect GPS Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearchLocation} className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiSearch className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search street, area, city, pincode..."
                    className="w-full pl-9 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute inset-y-1 right-1 px-3 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-dark cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="px-4 py-2.5 bg-green-50 border border-green-200 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FiNavigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
                  {isDetecting ? 'Detecting GPS...' : 'Detect My Location'}
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100 z-50">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectSearchResult(res)}
                      className="p-3 text-xs font-medium text-gray-800 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <FiMapPin className="text-primary shrink-0" />
                      <span className="truncate">{res.display_name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Responsive Leaflet Map Container */}
              <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-2xs relative z-0">
                <MapContainer
                  center={position}
                  zoom={16}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ResizeMap activeTab={activeTab} />
                  <ChangeMapView center={position} />
                  <MapEventsHandler onLocationSelect={(newPos) => {
                    setPosition(newPos);
                    reverseGeocode(newPos[0], newPos[1]);
                  }} />
                  <Marker
                    position={position}
                    draggable={true}
                    eventHandlers={eventHandlers}
                    ref={markerRef}
                  />
                </MapContainer>

                <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-gray-700 px-2.5 py-1 rounded-md border border-gray-200 z-[400] shadow-xs">
                  Drag the marker or tap on the map to adjust location.
                </span>
              </div>

              {/* Selected Location Address Card */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1">
                    <FiMapPin /> Selected Map Location
                  </span>
                  {isGeocoding && <span className="text-[10px] text-gray-400 font-bold animate-pulse">Updating address...</span>}
                </div>
                <p className="text-xs font-bold text-gray-900 leading-snug">
                  {formData.fullAddress || 'Selected location on map'}
                </p>
              </div>

              {/* Map CTA Confirm Button */}
              <button
                type="button"
                onClick={handleConfirmMapLocation}
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" /> Confirm & Set Map Location
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: 📝 ENTER ADDRESS MANUALLY */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FiEdit3 className="text-primary" /> Direct Address Entry Form
                </h4>
                <span className="text-[10px] text-gray-400 font-semibold">* Required fields</span>
              </div>

              {/* Address Type Pills */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Save Address As</label>
                <div className="flex gap-2">
                  {['home', 'work', 'other'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormData({ ...formData, addressType: type })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold capitalize flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        formData.addressType === type
                          ? 'bg-primary text-white border-primary shadow-2xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {type === 'home' && <FiHome className="w-3.5 h-3.5" />}
                      {type === 'work' && <FiBriefcase className="w-3.5 h-3.5" />}
                      {type === 'other' && <FiMapPin className="w-3.5 h-3.5" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* House & Street */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Flat / House No. *</label>
                  <input
                    type="text"
                    name="houseNo"
                    required
                    value={formData.houseNo}
                    onChange={handleInputChange}
                    placeholder="House / Flat / Building No."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Street / Locality *</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Street / Colony / Locality"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Area & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Area / Sector / Neighborhood</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Area / Sector (Optional)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Near Park / Bank / Station"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" /> Save & Set as Delivery Location
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: 🏠 SAVED ADDRESSES */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Your Saved Delivery Addresses</h4>
                <button
                  onClick={() => setActiveTab('manual')}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Enter New Address
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                  <FiMapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-800">No saved addresses found</p>
                  <button
                    onClick={() => setActiveTab('manual')}
                    className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Enter Address Manually
                  </button>
                </div>
              ) : (
                savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="p-4 bg-white hover:bg-green-50/40 rounded-2xl border border-gray-200 hover:border-primary transition-all flex items-start justify-between cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        {addr.addressType === 'home' && <FiHome className="w-4 h-4" />}
                        {addr.addressType === 'work' && <FiBriefcase className="w-4 h-4" />}
                        {addr.addressType === 'other' && <FiMapPin className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-gray-900">{addr.addressType}</span>
                          {addr.isDefault && (
                            <span className="bg-green-100 text-green-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-800 mt-0.5">{addr.fullName} • {addr.phone}</p>
                        <p className="text-xs text-gray-600 font-medium mt-0.5 leading-snug">
                          {addr.fullAddress || `${addr.houseNo}, ${addr.street}, ${addr.area || addr.city}, ${addr.city}, ${addr.state} - ${addr.pincode}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleDeleteSavedAddress(addr._id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default LocationModal;
