const mongoose = require('mongoose');

// Database Connection
const connect = mongoose.connect("mongodb+srv://wustl_inst:wustl_pass@cluster0.u3zue.mongodb.net/booksitedb?retryWrites=true&w=majority&appName=Cluster0");

connect.then(() => {
    console.log("Database connected successfully");
}).catch((error) => {
    console.error("Database connection error:", error);
});

// User Schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false // Make sure the password is not included in query results
    }
});

// Book Schema
const BookSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true
    },
    isbn: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    authors: {
        type: [String],
        required: true
    },
    link: {
        type: String,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: "https://fakeimg.pl/128x128?text=No+Image" // Default image if not provided
    },
    goalDate: {
        type: Date,
        required: false, // Make it optional if the goalDate can be updated
        default: null
    },
    pagesRead: {
        type: Number,
        required: false,
        default: 0 // Default to 0 pages read
    },
    pagesPerDay: {
        type: Number,
        required: false,
        default: 0 // Default to 0 pages per day
    },
    completed: {
        type: Boolean,
        required: false,
        default: false // Default to incomplete progress
    }
});

// Group Schema
const GroupSchema = new mongoose.Schema({
    isbn: {
        type: String,
        required: true,
    },
    members: [
        {
            username: {
                type: String,
                required: true,
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
            pagesRead: {
                type: Number,
                default: 0,
            },
            goalDate: {
                type: Date,
                required: false, // Make it optional if the goalDate can be updated
                default: null
            },
            shareProfile: {
                type: Boolean,
                required: true,
                default: false
            },
        },
    ],
});

// Model Collection Creation
const userCollection = mongoose.model('users', UserSchema);
const bookCollection = mongoose.model('books', BookSchema);
const groupCollection = mongoose.model('groups', GroupSchema);

module.exports = { userCollection, bookCollection, groupCollection };
