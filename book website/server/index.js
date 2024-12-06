const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userCollection, bookCollection, groupCollection } = require('./config');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// User signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Regex for username and password
    const usernameRegex = /^[a-zA-Z0-9]{2,10}$/;
    const passwordRegex = /^[a-zA-Z0-9]{3,16}$/;

    // Validate username
    if (!username || !usernameRegex.test(username)) {
        return res.json({
            success: false,
            message:
                'Username must be 2-10 characters long and contain only letters and numbers.',
        });
    }
    // Validate password
    if (!password || !passwordRegex.test(password)) {
        return res.json({
            success: false,
            message:
                'Password must be 3-16 characters long and contain only letters and numbers.',
        });
    }

    const existingUser = await userCollection.findOne({ name: username });
    if (existingUser) {
        return res.json({ success: false, message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userCollection.create({ name: username, password: hashedPassword });
    return res.json({ success: true, message: 'Signup successful!' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: 'Username and password are required.' });
    }

    const user = await userCollection.findOne({ name: username }).select('+password');
    console.log('Fetched user:', user);

    if (!user) {
        return res.json({ success: false, message: 'User not found.' });
    }

    if (!user.password) {
        return res.json({ success: false, message: 'Password not set for this user.' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Incorrect password.' });
        }

        const token = jwt.sign({ username: user.name }, 'your-secret-key', { expiresIn: '1h' });
        return res.json({ success: true, message: 'Login successful!', token });
    } catch (error) {
        console.error('Error during password comparison:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

app.post('/profile', async (req, res) => {
    const { username } = req.body;

    try {
        const books = await bookCollection.find({ username });
        const today = new Date();

        const userBooksPromises = books.map(async (book) => {
            const diffInDays = Math.ceil((new Date(book.goalDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)); // Calculate days until goal date
            let pagesPerDay = book.pagesPerDay;

            if (diffInDays <= 0) {
                book.completed = true;
                pagesPerDay = 0; // No pages to read if the goal date is passed
            } else {
                pagesPerDay = Math.ceil((book.pageCount - book.pagesRead) / diffInDays);
            }

            return {
                username: book.username,
                isbn: book.isbn,
                title: book.title,
                authors: book.authors,
                link: book.link,
                pageCount: book.pageCount,
                image: book.image || "https://fakeimg.pl/128x128?text=No+Image",
                goalDate: book.goalDate,
                completed: book.completed,
                pagesRead: book.pagesRead || 0,
                pagesPerDay: pagesPerDay,
            };
        });

        // Wait for all promises to resolve
        const userBooks = await Promise.all(userBooksPromises);

        if (userBooks.length > 0) {
            res.status(200).json({ userBooks: userBooks });
        } else {
            res.status(404).json({ success: false, message: 'No books saved yet.' });
        }
    } catch (error) {
        console.error('Error fetching books or progress:', error);
        res.status(500).json({ message: 'Error fetching books or progress data' });
    }
});

// save book
app.post('/save-book', async (req, res) => {
    const { username, book } = req.body;

    try {
        const user = await userCollection.findOne({ name: username });
        if (!user) return res.json({ success: false, message: 'User not found.' });
        
        // Check if the book is already saved in the user's savedBooks array
        const existingBook = await bookCollection.findOne({ username: username, isbn: book.isbn });
        if (existingBook) {
            return res.json({ success: false, message: 'Book already saved.' });
        }
        await bookCollection.create({ username: username, isbn: book.isbn, title: book.title, authors: book.authors, link: book.link, pageCount: book.pageCount , image: book.image, goalDate: null, pagesRead: 0, pagesPerDay: 0, completed: false
        });

        res.json({ success: true, message: 'Book saved successfully.' });
    } catch (error) {
        console.error('Error saving book:', error);
        res.json({ success: false, message: 'Error saving book.', error });
    }
});

app.post('/unsave', async (req, res) => {
    const { isbn, username } = req.body; 

    try {
        await bookCollection.deleteOne({ isbn: isbn, username: username });
        await groupCollection.updateOne(
            { isbn: isbn, "members.username": username },
            { $pull: { "members": { username: username } } } 
        );
        
        res.status(200).json({ message: 'Item unsaved successfully.' });
    } catch (error) {
        console.error('Error unsaving item:', error);
        res.status(500).json({ message: 'Failed to unsave the item.' });
    }
});

app.post('/update-goal', async (req, res) => {
    const { username, bookId, goalDate } = req.body;
    

    try {
        const book = await bookCollection.findOne({ username: username, isbn: bookId });

        book.goalDate = goalDate;
        await book.save();

        const isMember = await groupCollection.findOne({ 
            isbn: bookId, 
            "members.username": username 
        });
        
        if (isMember) {
            await groupCollection.updateOne(
                { isbn: bookId, "members.username": username },  // Find the group
                {
                    $set: { 
                        "members.$.goalDate": book.goalDate  // Update the goal
                    }
                });
            }

        return res.json({ success: true, message: 'Goal updated!' });

    } catch (error) {
        console.error('Error updating goal:', error);
        return res.status(500).json({ success: false, message: 'Error updating goal', error: error.message });
    }
});

app.post('/update-progress', async (req, res) => {
    const { username, bookId, pagesRead } = req.body;

    try {
        const book = await bookCollection.findOne({ username: username, isbn: bookId });

        if (pagesRead < 0 || pagesRead > book.pageCount) {
            return res.status(400).json({ message: 'Invalid page read count' });
        }
        book.pagesRead = pagesRead;
        await book.save();

        const isMember = await groupCollection.findOne({ 
            isbn: bookId, 
            "members.username": username 
        });
        
        if (isMember) {
            await groupCollection.updateOne(
                { isbn: bookId, "members.username": username },  // Find the group
                {
                    $set: { 
                        "members.$.pagesRead": book.pagesRead  // Update the pagesRead
                    }
                });
            }
        return res.json({ success: true, message: 'Progress updated!'});

    } catch (error) {
        console.error('Error updating progress:', error);
        return res.status(500).json({ success: false, message: 'Error updating progress', error: error.message });
    }
});

app.post('/joingroup', async (req, res) => {
    const { isbn, username } = req.body; 
    try {
        const group = await groupCollection.findOne({ isbn: isbn });
        const book = await bookCollection.findOne({ isbn: isbn, username: username });
        
        // Check if the group exists
        if (!group) {
            const newGroup = await groupCollection.create({
                isbn: isbn,
                members: [
                    { username: username, joinedAt: new Date(), pagesRead: book.pagesRead, goalDate: book.goalDate}
                ]
            });
            return res.json({group: newGroup, book: book }); 
        } else {
            // Check if the user is already a member
            const isMember = group.members.some(member => member.username === username);

            if (!isMember) {
                await groupCollection.updateOne(
                    { isbn: isbn },  // Look for a group by ISBN
                    {
                        $addToSet: {  // Add user to members array
                            members: {
                                username: username,
                                joinedAt: new Date(),
                                pagesRead: book.pagesRead,
                                goalDate: book.goalDate
                            }
                        }
                    }
                );
            }
            const updatedGroup = await groupCollection.findOne({ isbn: isbn });
            return res.json({ group: updatedGroup, book: book });
        }
    } catch (error) {
        console.error('Error joining group:', error);
        return res.status(500).json({ message: 'An error occurred while joining the group.' });
    }
});

app.post('/toggle-sharing', async (req, res) => {
    const { username, isbn, isSharingEnabled } = req.body; 
    try {
        const result = await groupCollection.updateOne(
            { isbn: isbn, "members.username": username }, 
            {
                $set: { "members.$.shareProfile": isSharingEnabled }
            }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ success: true, message: 'Sharing status updated successfully.' });
        } else {
            return res.status(400).json({ success: false, message: 'No matching document found or no changes made.' });
        }
    } catch (error) {
        console.error('Error toggling sharing status:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while updating sharing status.' });
    }
});

app.post('/profile-sharing', async (req, res) => {
    const { shareduser } = req.body; 
    try {
        const books = await bookCollection.find({ username: shareduser });
        const today = new Date();

        const userBooksPromises = books.map(async (book) => {
            const diffInDays = Math.ceil((new Date(book.goalDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)); // Calculate days until goal date
            let pagesPerDay = book.pagesPerDay;

            if (diffInDays <= 0) {
                book.completed = true;
                pagesPerDay = 0; // No pages to read if the goal date is passed
            } else {
                pagesPerDay = Math.ceil((book.pageCount - book.pagesRead) / diffInDays);
            }

            return {
                username: book.username,
                isbn: book.isbn,
                title: book.title,
                authors: book.authors,
                link: book.link,
                pageCount: book.pageCount,
                image: book.image || "https://fakeimg.pl/128x128?text=No+Image",
                goalDate: book.goalDate,
                completed: book.completed,
                pagesRead: book.pagesRead || 0,
                pagesPerDay: pagesPerDay,
            };
        });
        const userBooks = await Promise.all(userBooksPromises);

        if (userBooks.length > 0) {
            res.status(200).json({ userBooks: userBooks });
        } else {
            res.status(404).json({ success: false, message: 'No books saved yet.' });
        }
    } catch (error) {
        console.error('Error fetching books or progress:', error);
        res.status(500).json({ message: 'Error fetching books or progress data' });
    }
});

// Serve React app
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
