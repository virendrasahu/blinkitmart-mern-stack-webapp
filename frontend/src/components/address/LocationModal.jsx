import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
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
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import addressService from '../../services/addressService.js';

// Fix Leaflet Default Icon Paths in Vite/Webpack Bundles
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
function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
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

  // Active Tab: 'map' or 'saved'
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
  const [editingAddressId, setEditingAddressId] = useState(null);
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
    isDefault: false,
    fullAddress: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const markerRef = useRef(null);

  // Auto-fill recipient details when user changes
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
          houseNo: house || prev.houseNo || '',
          street: street || prev.street || '',
          area: area || prev.area || city,
          city: city || prev.city || '',
          state: state || prev.state || '',
          pincode: pincode || prev.pincode || '',
          fullAddress: displayName,
        }));
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err.message);
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
      const msg = 'Browser Geolocation API is not supported by your browser.';
      setGpsError(msg);
      toast.error(msg);
      return;
    }

    setIsDetecting(true);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
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
            errMsg = 'Location permission denied by browser. Please select location manually on the map.';
            break;
          case error.POSITION_UNAVAILABLE:
            errMsg = 'GPS signal unavailable. Please select location manually on the map.';
            break;
          case error.TIMEOUT:
            errMsg = 'GPS location request timed out. Please select location manually on the map.';
            break;
          default:
            errMsg = 'Location detection failed. Please select location manually on the map.';
            break;
        }
        setGpsError(errMsg);
        toast.error(errMsg);
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  /**
   * Save Address to MongoDB (or set temporary location for guests)
   */
  const handleSubmitAddress = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.houseNo || !formData.street || !formData.area) {
      toast.error('Please fill in all required address fields!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        latitude: position[0],
        longitude: position[1],
        fullAddress: formData.fullAddress || `${formData.houseNo}, ${formData.street}, ${formData.area}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      };

      if (!isAuthenticated) {
        setActiveAddress(payload);
        toast.success('Delivery location set! Log in to save addresses permanently.');
        setIsLocationModalOpen(false);
        setSubmitting(false);
        return;
      }

      if (editingAddressId) {
        const res = await addressService.updateAddress(editingAddressId, payload);
        if (res.success) {
          toast.success('Address updated successfully!');
          await fetchAddresses();
          setActiveAddress(res.data);
          setIsLocationModalOpen(false);
        }
      } else {
        const res = await addressService.addAddress(payload);
        if (res.success) {
          toast.success('New delivery address saved!');
          await fetchAddresses();
          setActiveAddress(res.data);
          setIsLocationModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
              <FiMapPin className="text-primary" /> Select Delivery Location
            </h3>
            <p className="text-xs text-gray-500 font-medium">Choose address for 10-minute grocery delivery</p>
          </div>

          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: Map Picker vs Saved Addresses */}
        <div className="flex border-b border-gray-100 bg-gray-50/30 px-5 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('map')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'map'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            📍 Map Location Picker
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              🏠 Saved Addresses ({savedAddresses.length})
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {activeTab === 'saved' ? (
            /* Saved Addresses List */
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Your Saved Delivery Addresses</h4>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add New Address
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                  <FiMapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-800">No saved addresses found</p>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
                  >
                    Pick Location on Map
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
                          {addr.fullAddress || `${addr.houseNo}, ${addr.street}, ${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}`}
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
          ) : (
            /* Interactive Map Picker & Address Form */
            <div className="space-y-4">
              
              {/* GPS Error Alert */}
              {gpsError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center gap-2">
                  <FiAlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}

              {/* Location Search Bar & Detect Location Button */}
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

              {/* Leaflet + OpenStreetMap Container */}
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-2xs relative z-10">
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
                  <ResizeMap />
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

              {/* Detailed Address Form */}
              <form onSubmit={handleSubmitAddress} className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-1">
                  Complete Address Details
                </h4>

                {/* Address Type Pills */}
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

                {/* Recipient & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* House & Street */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">Flat / House No. *</label>
                    <input
                      type="text"
                      name="houseNo"
                      required
                      value={formData.houseNo}
                      onChange={handleInputChange}
                      placeholder="Flat 402, Block B"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">Street / Locality *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Golf Course Road"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Near Metro Station / Opposite Park"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
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
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default LocationModal;
