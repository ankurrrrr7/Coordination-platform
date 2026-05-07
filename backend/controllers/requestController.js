const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

// Create a new help request
const createRequest = async (req, res) => {
  try {
    const { title, type, description, location } = req.body;

    // Validate input
    if (!title || !type || !description || !location) {
      return res.status(400).json({
        message: 'Please provide title, type, description, and location'
      });
    }

    // Create request
    const helpRequest = await HelpRequest.create({
      title,
      type,
      description,
      location,
      createdBy: req.user.id
    });

    // Populate user info
    await helpRequest.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Help request created successfully',
      data: helpRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all help requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single help request by ID
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const helpRequest = await HelpRequest.findById(id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    res.status(200).json({
      data: helpRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Volunteer accepts a help request
const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerLocation } = req.body;

    // Check if request exists
    const helpRequest = await HelpRequest.findById(id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    // Check if already accepted
    if (helpRequest.status !== 'pending') {
      return res.status(400).json({
        message: 'Request is no longer available for acceptance'
      });
    }

    // Update request
    helpRequest.status = 'accepted';
    helpRequest.assignedTo = req.user.id;
    
    // Store volunteer location if provided
    if (volunteerLocation && volunteerLocation.coordinates) {
      helpRequest.volunteerLocation = {
        coordinates: {
          latitude: volunteerLocation.coordinates.latitude,
          longitude: volunteerLocation.coordinates.longitude
        },
        timestamp: new Date()
      };
    }
    
    await helpRequest.save();

    // Populate updated fields
    await helpRequest.populate('createdBy', 'name email');
    await helpRequest.populate('assignedTo', 'name email');

    res.status(200).json({
      message: 'Request accepted successfully',
      data: helpRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'accepted', 'resolved'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Use: pending, accepted, or resolved'
      });
    }

    const helpRequest = await HelpRequest.findById(id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    // Only assigned volunteer or admin can update status
    if (
      req.user.role !== 'admin' &&
      helpRequest.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'You do not have permission to update this request'
      });
    }

    helpRequest.status = status;
    await helpRequest.save();

    await helpRequest.populate('createdBy', 'name email');
    await helpRequest.populate('assignedTo', 'name email');

    res.status(200).json({
      message: 'Request status updated successfully',
      data: helpRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete help request (admin only)
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const helpRequest = await HelpRequest.findById(id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    await HelpRequest.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Help request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update volunteer location
const updateVolunteerLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { coordinates } = req.body;

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({
        message: 'Please provide valid coordinates (latitude and longitude)'
      });
    }

    const helpRequest = await HelpRequest.findById(id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    // Only assigned volunteer can update their location
    if (helpRequest.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not assigned to this request'
      });
    }

    // Update volunteer location
    helpRequest.volunteerLocation = {
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      },
      timestamp: new Date()
    };

    await helpRequest.save();

    await helpRequest.populate('createdBy', 'name email');
    await helpRequest.populate('assignedTo', 'name email');

    res.status(200).json({
      message: 'Volunteer location updated successfully',
      data: helpRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  acceptRequest,
  updateRequestStatus,
  deleteRequest,
  updateVolunteerLocation
};
