import Media from "../models/contact.model.js";

// Create a new message
export const createMessage = async (req, res) => {
    try {
        const { Name, Email, Message } = req.body;

        // Validate required fields
        if (!Name || !Email || !Message) {
            return res.status(400).json({ message: "Name, Email, and Message are required" });
        }

        const media = new Media({ Name, Email, Message });
        await media.save();
        res.status(201).json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all messages with pagination
export const getAllMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const totalMessages = await Media.countDocuments();
        const messages = await Media.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        
        res.status(200).json({
            messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasNextPage: page < Math.ceil(totalMessages / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread messages count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Media.countDocuments({ status: 'new' });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single message by ID
export const getMessageById = async (req, res) => {
    try {
        const message = await Media.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a message by ID
export const updateMessage = async (req, res) => {
    try {
        const { Name, Email, Message, status } = req.body;

        const updateData = {};
        if (Name) updateData.Name = Name;
        if (Email) updateData.Email = Email;
        if (Message) updateData.Message = Message;
        if (status) updateData.status = status;

        const updatedMessage = await Media.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark message as read
export const markAsRead = async (req, res) => {
    try {
        const updatedMessage = await Media.findByIdAndUpdate(
            req.params.id,
            { status: 'read' },
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a message by ID
export const deleteMessage = async (req, res) => {
    try {
        const deletedMessage = await Media.findByIdAndDelete(req.params.id);
        if (!deletedMessage) {
            return res.status(404).json({ message: "Message not found" });
        }
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
