const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Chat name cannot exceed 50 characters']
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  chatImage: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
chatSchema.index({ participants: 1, updatedAt: -1 });

// Virtual to get participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => participant.toString() === userId.toString());
};

// Method to add participant
chatSchema.methods.addParticipant = function(userId) {
  if (!this.isParticipant(userId)) {
    this.participants.push(userId);
  }
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    participant => participant.toString() !== userId.toString()
  );
};

module.exports = mongoose.model('Chat', chatSchema);