import Address from '../models/Address.js';

/**
 * @desc    Get all saved addresses for current user
 * @route   GET /api/addresses
 * @access  Private
 */
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching saved addresses',
    });
  }
};

/**
 * @desc    Add a new delivery address with map coordinates
 * @route   POST /api/addresses
 * @access  Private
 */
export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      houseNo,
      street,
      area,
      city,
      state,
      pincode,
      landmark,
      latitude,
      longitude,
      fullAddress,
      addressType,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !houseNo || !street || !area || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required address fields',
      });
    }

    // Check if user has any existing addresses
    const existingCount = await Address.countDocuments({ user: req.user.id });
    const shouldBeDefault = existingCount === 0 || Boolean(isDefault);

    // If setting as default, unset previous default addresses for this user
    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const constructedFullAddress = fullAddress || `${houseNo}, ${street}, ${area}, ${city}, ${state} - ${pincode}`;

    const address = await Address.create({
      user: req.user.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      houseNo: houseNo.trim(),
      street: street.trim(),
      area: area.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark ? landmark.trim() : '',
      latitude: latitude ? Number(latitude) : 28.4595,
      longitude: longitude ? Number(longitude) : 77.0266,
      fullAddress: constructedFullAddress,
      addressType: addressType || 'home',
      isDefault: shouldBeDefault,
    });

    return res.status(201).json({
      success: true,
      message: 'Address added successfully!',
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error adding new address',
      error: error.message,
    });
  }
};

/**
 * @desc    Update saved address
 * @route   PUT /api/addresses/:id
 * @access  Private
 */
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    Object.assign(address, req.body);

    if (req.body.houseNo || req.body.street || req.body.area || req.body.city || req.body.state || req.body.pincode) {
      address.fullAddress = `${address.houseNo}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`;
    }

    const updatedAddress = await address.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully!',
      data: updatedAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating address',
    });
  }
};

/**
 * @desc    Delete saved address
 * @route   DELETE /api/addresses/:id
 * @access  Private
 */
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    await address.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting address',
    });
  }
};

/**
 * @desc    Set address as default
 * @route   PUT /api/addresses/:id/set-default
 * @access  Private
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    await Address.updateMany({ user: req.user.id }, { isDefault: false });

    address.isDefault = true;
    await address.save();

    return res.status(200).json({
      success: true,
      message: 'Default address updated successfully!',
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error setting default address',
    });
  }
};
