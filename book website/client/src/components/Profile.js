import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Profile() {
    const [userBooks, setUserBooks] = useState([]);
    const [message, setMessage] = useState('');
    const { username } = useParams(); 
    const [isLoading, setLoadingStates] = useState({
        goal: false,
        progress: false,
    });
    const navigate = useNavigate(); 

    const fetchUserBooks = async () => {
        try {
            const response = await fetch('http://localhost:3000/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (data.userBooks) {
                setUserBooks(data.userBooks);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error fetching user books:', error);
        }
    };

    useEffect(() => {
        if (username) {
            fetchUserBooks();
        }
    }, [username]); // Run effect whenever username changes

    const handleGoalSubmit = async (bookId, pageCount, goalDate) => {
        if (pageCount === 0) {
            alert('Sorry, this book has no recorded page count.');
            return;
        }
        const goalDateObj = new Date(goalDate);

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if goalDate is earlier than today
        if (goalDateObj <= today) {
            alert('Goal date has to be in the future.');
            return;
        }
        setLoadingStates((prev) => ({ ...prev, goal: true }));
        try {
            const response = await fetch('http://localhost:3000/update-goal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, bookId, goalDate }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to update goal');
            } else {
                fetchUserBooks();
            }
        } catch (error) {
            console.error('Error updating goal date:', error);
            setMessage('An error occurred while updating the goal date.');
        } finally {
            setLoadingStates((prev) => ({ ...prev, goal: false }));
        }
    };

    const handlePagesReadSubmit = async (bookId, pageCount, pagesRead) => {
        if (pageCount === 0) {
            alert('Sorry, this book has no recorded page count.');
            return;
        }
        if (pagesRead> pageCount) {
            alert('Your input exceeds the total page count.');
            return;
        }

        setLoadingStates((prev) => ({ ...prev, progress: true }));
        try {
            const response = await fetch('http://localhost:3000/update-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, bookId, pagesRead }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to update progress');
            } else {
                fetchUserBooks();
            }
        } catch (error) {
            console.error('Error updating pages read:', error);
            setMessage('An error occurred while updating pages read.');
        } finally {
            setLoadingStates((prev) => ({ ...prev, progress: false }));
        }
    };  

    const handleUnsave = async (isbn, username) => {
        console.log('Unsave request:', isbn, username); 
        try {
            const response = await fetch('http://localhost:3000/unsave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isbn, username }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to unsave the item.');
            }

            setUserBooks((prevBooks) => prevBooks.filter((book) => book.isbn !== isbn));
    
            navigate(`/profile/${username}`); 
        } catch (error) {
            console.error('Error unsaving item:', error);
        }
    };    
    
    const joinGroup = (isbn) => {
        navigate(`/joingroup/${isbn}/${username}`); 
    };

    const backToHome = () => {
        navigate(`/home`); 
    };
    
    return (
        <div className="container">
            <h1 className="text-center mb-3">{username}'s Profile</h1>
            <div className="d-flex justify-content-center mb-4">
                <button onClick={backToHome} className="btn btn-secondary">
                    Back To Home
                </button>
            </div>
            <h2>Saved Books:</h2>
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
                {userBooks.length === 0 ? (
                    <p className="text-center">
                        {message}
                    </p>
                ) : (
                    userBooks.map((book) => {
                        // Calculate daily reading goal
                        const today = new Date();
                        const goalDate = book.goalDate ? new Date(book.goalDate) : null;
                        const daysLeft = goalDate
                            ? Math.ceil((goalDate - today) / (1000 * 60 * 60 * 24))
                            : null;
                        const pagesRemaining = book.pageCount - book.pagesRead;
                        const dailyGoal =
                            daysLeft && pagesRemaining > 0 ? Math.ceil(pagesRemaining / daysLeft) : null;
    
                        return (
                            <div className="col mb-3" key={book.isbn}>
                                <div className="card h-100">
                                    <img
                                        src={
                                            book.image ||
                                            "https://fakeimg.pl/128x128?text=No+Image"
                                        }
                                        className="card-img-top small-image"
                                        alt={`Thumbnail for ${book.title}`}
                                    />
                                    <div className="card-body d-flex flex-column">
                                        <h3 className="card-title"><strong>{book.title}</strong> by {book.authors ? book.authors.join(", ") : "Unknown"}</h3>
                                        <br />
                                        {/* Join Group Button */}
                                        <button
                                            onClick={() => joinGroup(book.isbn)}
                                            className="btn btn-info mt-2"
                                        >
                                            Join Group
                                        </button>
                                        <br />
                                        <p className="card-text mb-1">                                            
                                            <strong>Progress:</strong>{" "}
                                            {book.pagesRead != null ? book.pagesRead : "0"}{" out of "}
                                            {book.pageCount != null ? book.pageCount : "Unknown"}
                                        </p>
    
                                        {/* Goal Date and Daily Reading Info */}
                                        {goalDate && (
                                            <p className="card-text mb-1">
                                                <strong>Goal Date:</strong> {goalDate.toDateString()}
                                                <br />
                                                {daysLeft > 0 && (
                                                    <>
                                                        <strong>Days Left:</strong> {daysLeft}
                                                        <br />
                                                        <strong>Reading Goal:</strong> {dailyGoal} pages/day
                                                    </>
                                                )}
                                                {daysLeft <= 0 && (
                                                    <strong>Goal date has passed. Keep going!</strong>
                                                )}
                                            </p>
                                        )}
    
                                        {/* Progress Bar */}
                                        <div className="progress mb-2">
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{
                                                    width: `${Math.min(
                                                        (book.pagesRead / book.pageCount) * 100 || 0,
                                                        100
                                                    )}%`,
                                                }}
                                                aria-valuenow={book.pagesRead || 0}
                                                aria-valuemin="0"
                                                aria-valuemax={book.pageCount || 1}
                                            >
                                                {book.pageCount > 0
                                                    ? `${Math.floor((book.pagesRead / book.pageCount) * 100)}%`
                                                    : "0%"}
                                            </div>
                                        </div>
    
                                        {/* Pages Read Form */}
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const pagesRead = e.target.pagesRead.value;
                                                handlePagesReadSubmit(book.isbn, book.pageCount, parseInt(pagesRead, 10));
                                                e.target.reset();
                                            }}
                                        >
                                            <div className="mb-3">
                                                <label htmlFor="pagesRead" className="form-label">
                                                <strong>Update Pages Read:</strong>
                                                </label>
                                                <input
                                                    type="number"
                                                    id="pagesRead"
                                                    name="pagesRead"
                                                    className="form-control"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-secondary"
                                                disabled={isLoading.progress}>Update Pages Read</button>
                                        </form>
                                        <br />
                                        {/* Goal Form */}
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const goalDate = e.target.goalDate.value;
                                                handleGoalSubmit(book.isbn, book.pageCount, goalDate);
                                                e.target.reset();
                                            }}
                                        >
                                            <div className="mb-3">
                                                <label htmlFor="goalDate" className="form-label">
                                                <strong>Set/Change Goal Date:</strong>
                                                </label>
                                                <input
                                                    type="date"
                                                    id="goalDate"
                                                    name="goalDate"
                                                    className="form-control"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-primary mb-2"
                                                disabled={isLoading.goal}> Update Goal</button>
                                        </form>
                                        <br/>
                                        {/* Unsave Button */}
                                        <button onClick={() => handleUnsave(book.isbn, book.username)} className="btn btn-danger">
                                            Unsave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );    
}

export default Profile;