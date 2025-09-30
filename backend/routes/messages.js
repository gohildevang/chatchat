const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = file.mimetype.startsWith('image/') ? 'images' : 'files';
    const uploadDir = path.join(__dirname, `../../uploads/${uploadType}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and common file types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/zip', 'application/x-rar-compressed'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   GET /api/messages/:chatId
// @desc    Get messages for a specific chat
// @access  Private
router.get('/:chatId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Check if chat exists and user is participant
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender messageType')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username'
        }
      })
      .populate('reactions.user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read by current user
    const unreadMessages = messages.filter(msg => !msg.isReadBy(req.user._id));
    for (const message of unreadMessages) {
      message.markAsRead(req.user._id);
      await message.save();
    }

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { chatId, content, replyTo } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
      chat: chatId,
      content: content.trim(),
      messageType: 'text',
      replyTo: replyTo || undefined
    });

    await message.save();
    await message.populate('sender', 'username avatar');
    if (replyTo) {
      await message.populate('replyTo', 'content sender messageType');
    }

    // Update chat's last message and timestamp
    chat.lastMessage = message._id;
    await chat.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/upload
// @desc    Send message with file/image upload
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Determine message type and file info
    const isImage = req.file.mimetype.startsWith('image/');
    const messageType = isImage ? 'image' : 'file';
    const uploadType = isImage ? 'images' : 'files';
    
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `/uploads/${uploadType}/${req.file.filename}`
    };

    if (!isImage) {
      fileInfo.mimetype = req.file.mimetype;
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
      chat: chatId,
      content: content || '',
      messageType,
      [isImage ? 'image' : 'file']: fileInfo
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    // Update chat's last message and timestamp
    chat.lastMessage = message._id;
    await chat.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      data: message
    });
  } catch (error) {
    console.error('Upload message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id
// @desc    Edit a message
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only message sender can edit
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only text messages can be edited
    if (message.messageType !== 'text') {
      return res.status(400).json({ message: 'Only text messages can be edited' });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    await message.populate('sender', 'username avatar');

    res.json({
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only message sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete associated files if any
    if (message.file && message.file.path) {
      const filePath = path.join(__dirname, '../../', message.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (message.image && message.image.path) {
      const imagePath = path.join(__dirname, '../../', message.image.path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/:id/reactions
// @desc    Add reaction to a message
// @access  Private
router.post('/:id/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is participant in the chat
    const chat = await Chat.findById(message.chat);
    if (!chat.isParticipant(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.addReaction(req.user._id, emoji);
    await message.save();
    await message.populate('reactions.user', 'username');

    res.json({
      message: 'Reaction added successfully',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id/reactions
// @desc    Remove reaction from a message
// @access  Private
router.delete('/:id/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.removeReaction(req.user._id, emoji);
    await message.save();
    await message.populate('reactions.user', 'username');

    res.json({
      message: 'Reaction removed successfully',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;