const Chat = require('../models/Chat');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const Crop = require('../models/Crop');

// Get or create chat between buyer and farmer
exports.getOrCreateChat = async (req, res) => {
  try {
    const { farmerId, cropId } = req.body;
    const buyerId = req.user.id;

    // Check if chat already exists
    let chat = await Chat.findOne({ farmer: farmerId, buyer: buyerId })
      .populate('farmer', 'fullName phone')
      .populate('buyer', 'fullName phone')
      .populate('crop', 'cropName pricePerUnit unit');

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        farmer: farmerId,
        buyer: buyerId,
        crop: cropId,
        messages: []
      });

      chat = await Chat.findById(chat._id)
        .populate('farmer', 'fullName phone')
        .populate('buyer', 'fullName phone')
        .populate('crop', 'cropName pricePerUnit unit');
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error in getOrCreateChat:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat',
      error: error.message
    });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'farmer') {
      query.farmer = userId;
    } else if (userRole === 'buyer') {
      query.buyer = userId;
    }

    const chats = await Chat.find(query)
      .populate('farmer', 'fullName phone')
      .populate('buyer', 'fullName phone')
      .populate('crop', 'cropName pricePerUnit unit')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error in getUserChats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chats',
      error: error.message
    });
  }
};

// Get single chat with messages
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await Chat.findById(chatId)
      .populate('farmer', 'fullName phone')
      .populate('buyer', 'fullName phone')
      .populate('crop', 'cropName pricePerUnit unit');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is part of this chat
    if (userRole === 'farmer' && chat.farmer._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    if (userRole === 'buyer' && chat.buyer._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Mark messages as read
    if (userRole === 'farmer') {
      chat.unreadCount.farmer = 0;
    } else if (userRole === 'buyer') {
      chat.unreadCount.buyer = 0;
    }
    await chat.save();

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error in getChatById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat',
      error: error.message
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is part of this chat
    if (userRole === 'farmer' && chat.farmer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    if (userRole === 'buyer' && chat.buyer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Add message
    const newMessage = {
      sender: userId,
      senderModel: userRole === 'farmer' ? 'Farmer' : 'Buyer',
      message: message,
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message;
    chat.lastMessageTime = new Date();

    // Increment unread count for the other user
    if (userRole === 'farmer') {
      chat.unreadCount.buyer += 1;
    } else {
      chat.unreadCount.farmer += 1;
    }

    await chat.save();

    // Populate the chat for response
    const updatedChat = await Chat.findById(chatId)
      .populate('farmer', 'fullName phone')
      .populate('buyer', 'fullName phone')
      .populate('crop', 'cropName pricePerUnit unit');

    res.status(200).json({
      success: true,
      data: updatedChat
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Delete/Archive chat
exports.archiveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is part of this chat
    if (userRole === 'farmer' && chat.farmer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    if (userRole === 'buyer' && chat.buyer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    chat.status = 'archived';
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Chat archived successfully'
    });
  } catch (error) {
    console.error('Error in archiveChat:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving chat',
      error: error.message
    });
  }
};
