const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chats
// @desc    Get all chats for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'username email avatar status lastSeen')
    .populate('lastMessage', 'content messageType createdAt sender')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username'
      }
    })
    .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chats
// @desc    Create a new chat (direct or group)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { participantId, isGroupChat, name, participantIds } = req.body;

    if (isGroupChat) {
      // Group chat creation
      if (!name || !participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
        return res.status(400).json({ 
          message: 'Group name and at least 2 participants are required for group chat' 
        });
      }

      // Verify all participants exist
      const participants = await User.find({ _id: { $in: participantIds } });
      if (participants.length !== participantIds.length) {
        return res.status(400).json({ message: 'Some participants not found' });
      }

      const chat = new Chat({
        name,
        isGroupChat: true,
        participants: [...participantIds, req.user._id],
        admin: req.user._id
      });

      await chat.save();
      await chat.populate('participants', 'username email avatar status lastSeen');

      res.status(201).json({
        message: 'Group chat created successfully',
        chat
      });
    } else {
      // Direct chat creation
      if (!participantId) {
        return res.status(400).json({ message: 'Participant ID is required' });
      }

      // Check if participant exists
      const participant = await User.findById(participantId);
      if (!participant) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if chat already exists between these users
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: [req.user._id, participantId], $size: 2 }
      }).populate('participants', 'username email avatar status lastSeen');

      if (existingChat) {
        return res.json({
          message: 'Chat already exists',
          chat: existingChat
        });
      }

      // Create new direct chat
      const chat = new Chat({
        isGroupChat: false,
        participants: [req.user._id, participantId]
      });

      await chat.save();
      await chat.populate('participants', 'username email avatar status lastSeen');

      res.status(201).json({
        message: 'Direct chat created successfully',
        chat
      });
    }
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chats/:id
// @desc    Get specific chat details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'username email avatar status lastSeen')
      .populate('admin', 'username email avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chats/:id
// @desc    Update chat (name, description, etc.)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For group chats, only admin can update
    if (chat.isGroupChat && chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only group admin can update chat details' });
    }

    // Update fields
    if (name !== undefined) chat.name = name;
    if (description !== undefined) chat.description = description;

    await chat.save();
    await chat.populate('participants', 'username email avatar status lastSeen');

    res.json({
      message: 'Chat updated successfully',
      chat
    });
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chats/:id/participants
// @desc    Add participant to group chat
// @access  Private
router.post('/:id/participants', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Only group chats can add participants
    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Cannot add participants to direct chat' });
    }

    // Check if current user is admin
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can add participants' });
    }

    // Check if user to add exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add participant
    chat.addParticipant(userId);
    await chat.save();
    await chat.populate('participants', 'username email avatar status lastSeen');

    res.json({
      message: 'Participant added successfully',
      chat
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/chats/:id/participants/:userId
// @desc    Remove participant from group chat
// @access  Private
router.delete('/:id/participants/:userId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Only group chats can remove participants
    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Cannot remove participants from direct chat' });
    }

    // Check if current user is admin or removing themselves
    const isAdmin = chat.admin.toString() === req.user._id.toString();
    const isSelfRemoval = req.params.userId === req.user._id.toString();

    if (!isAdmin && !isSelfRemoval) {
      return res.status(403).json({ message: 'Only admin can remove other participants' });
    }

    // Remove participant
    chat.removeParticipant(req.params.userId);
    await chat.save();
    await chat.populate('participants', 'username email avatar status lastSeen');

    res.json({
      message: 'Participant removed successfully',
      chat
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;