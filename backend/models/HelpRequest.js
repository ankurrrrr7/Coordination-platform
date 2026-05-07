const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    type: {
      type: String,
      enum: ['food', 'medical', 'rescue'],
      required: [true, 'Please specify a request type']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    location: {
      text: {
        type: String,
        required: [true, 'Please provide a location']
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'resolved'],
      default: 'pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    volunteerLocation: {
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      timestamp: Date
    },
    image: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
