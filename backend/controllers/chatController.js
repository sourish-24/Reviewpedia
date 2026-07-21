import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { cloudinaryInstance } from '../middlewares/uploadMiddleware.js';

// Get all conversations for a user
export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'username _id profilePic')
            .sort({ updatedAt: -1 });

        res.json({ success: true, conversations });
    } catch (err) {
        next(err);
    }
};

// Create or fetch conversation with a specific user
export const createOrGetConversation = async (req, res, next) => {
    try {
        const { targetUsername } = req.body;
        const currentUserId = req.user.id;

        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) return res.status(404).json({ error: { message: "User not found" }});

        // Check if conversation already exists (handles backwards compatibility with unsorted)
        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, targetUser._id], $size: 2 }
        }).populate('participants', 'username _id profilePic');

        if (!conversation) {
            // To prevent race conditions (like React StrictMode sending 2 rapid requests),
            // we use an atomic findOneAndUpdate with an exact sorted array match and upsert.
            const p1 = currentUserId.toString();
            const p2 = targetUser._id.toString();
            const sortedParticipants = [p1, p2].sort();

            conversation = await Conversation.findOneAndUpdate(
                { participants: sortedParticipants },
                { 
                    $setOnInsert: { 
                        lastMessage: "Conversation started",
                        lastMessageAt: Date.now()
                    }
                },
                { new: true, upsert: true }
            );
            
            // Populate after upsert
            conversation = await Conversation.findById(conversation._id).populate('participants', 'username _id profilePic');
        }

        res.json({ success: true, conversation });
    } catch (err) {
        next(err);
    }
};

// Get messages for a specific conversation
export const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate('sender', 'username _id profilePic')
            .sort({ createdAt: 1 });

        res.json({ success: true, messages });
    } catch (err) {
        next(err);
    }
};

// Upload media for chat
export const uploadChatMedia = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: { message: "No file uploaded" } });
        }
        
        let mediaType = 'none';
        if (req.file.mimetype.startsWith('image/')) mediaType = 'image';
        else if (req.file.mimetype.startsWith('video/')) mediaType = 'video';

        res.json({ 
            success: true, 
            mediaUrl: req.file.path,
            mediaType 
        });
    } catch (err) {
        next(err);
    }
};

// Send a new message
export const sendMessage = async (req, res, next) => {
    try {
        const { conversationId, text, mediaUrl, mediaType, receiverId, location } = req.body;
        const senderId = req.user.id;

        const message = await Message.create({
            conversationId,
            sender: senderId,
            text,
            mediaUrl,
            mediaType,
            location
        });

        const populatedMessage = await message.populate('sender', 'username _id profilePic');

        // Update the conversation's last message
        let lastMsgText = text;
        if (!text && mediaUrl) lastMsgText = `[Attached ${mediaType}]`;
        if (!text && location) lastMsgText = `[Shared Location]`;
        
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: lastMsgText,
            lastMessageAt: Date.now()
        });

        // Emit via socket.io to the receiver's room
        const io = req.app.get('io');
        if (io && receiverId) {
            io.to(receiverId.toString()).emit('receive_message', populatedMessage);
        }

        res.json({ success: true, message: populatedMessage });
    } catch (err) {
        next(err);
    }
};

// Delete a conversation and all its messages + media
export const deleteConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user.id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ error: { message: "Conversation not found" } });

        // Ensure user is a participant
        if (!conversation.participants.includes(currentUserId)) {
            return res.status(403).json({ error: { message: "Not authorized to delete this conversation" } });
        }

        // Find all messages in the conversation to delete media
        const messages = await Message.find({ conversationId });
        for (const msg of messages) {
            if (msg.mediaUrl) {
                try {
                    // Extract public ID from Cloudinary URL (assumes folder structure is present)
                    const parts = msg.mediaUrl.split('/');
                    const filename = parts.pop().split('.')[0];
                    const folder = parts.pop();
                    const publicId = `${folder}/${filename}`;
                    
                    await cloudinaryInstance.uploader.destroy(publicId, { 
                        resource_type: msg.mediaType === 'video' ? 'video' : 'image' 
                    });
                } catch (cloudinaryErr) {
                    console.error("Error deleting media from Cloudinary:", cloudinaryErr);
                }
            }
        }

        // Delete all messages
        await Message.deleteMany({ conversationId });

        // Delete the conversation itself
        await Conversation.findByIdAndDelete(conversationId);

        res.json({ success: true, message: "Conversation deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// Delete a single message and its media
export const deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const currentUserId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: { message: "Message not found" } });

        // Ensure user is the sender of the message
        if (message.sender.toString() !== currentUserId) {
            return res.status(403).json({ error: { message: "Not authorized to delete this message" } });
        }

        // Delete from Cloudinary if media exists
        if (message.mediaUrl) {
            try {
                const parts = message.mediaUrl.split('/');
                const filename = parts.pop().split('.')[0];
                const folder = parts.pop();
                const publicId = `${folder}/${filename}`;
                
                await cloudinaryInstance.uploader.destroy(publicId, { 
                    resource_type: message.mediaType === 'video' ? 'video' : 'image' 
                });
            } catch (cloudinaryErr) {
                console.error("Error deleting message media from Cloudinary:", cloudinaryErr);
            }
        }

        const conversationId = message.conversationId;

        // Delete message document
        await Message.findByIdAndDelete(messageId);

        // Fetch the new last message for the conversation
        const remainingMessages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(1);

        let newLastMessage = "Conversation started";
        if (remainingMessages.length > 0) {
            const lastMsg = remainingMessages[0];
            newLastMessage = lastMsg.text || `[Attached ${lastMsg.mediaType}]`;
        }

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newLastMessage,
            lastMessageAt: remainingMessages.length > 0 ? remainingMessages[0].createdAt : Date.now()
        });

        // Emit via socket to inform other client
        const conversation = await Conversation.findById(conversationId);
        const receiverId = conversation.participants.find(p => p.toString() !== currentUserId);

        const io = req.app.get('io');
        if (io && receiverId) {
            io.to(receiverId.toString()).emit('message_deleted', { messageId, conversationId });
        }

        res.json({ success: true, message: "Message deleted successfully", conversationId, newLastMessage });
    } catch (err) {
        next(err);
    }
};
