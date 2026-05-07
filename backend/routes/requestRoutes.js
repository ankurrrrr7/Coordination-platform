const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getRequestById,
  acceptRequest,
  updateRequestStatus,
  deleteRequest,
  updateVolunteerLocation
} = require('../controllers/requestController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Create help request (auth required)
router.post('/', verifyToken, createRequest);

// Get all requests (public)
router.get('/', getAllRequests);

// Get single request (public)
router.get('/:id', getRequestById);

// Accept request (volunteer only)
router.put('/:id/accept', verifyToken, checkRole('volunteer', 'admin'), acceptRequest);

// Update volunteer location (assigned volunteer)
router.put('/:id/volunteer-location', verifyToken, updateVolunteerLocation);

// Update status (assigned volunteer or admin)
router.put('/:id/status', verifyToken, updateRequestStatus);

// Delete request (admin only)
router.delete('/:id', verifyToken, checkRole('admin'), deleteRequest);

module.exports = router;
