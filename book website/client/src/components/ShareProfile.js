import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

function ShareProfile() {
  const { isbn, username, shareduser } = useParams(); 
  const [userBooks, setUserBooks] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchSharingStatus = async () => {
        try {
            const response = await fetch('http://localhost:3000/profile-sharing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shareduser }),
            });

            const data = await response.json();

            if (data.userBooks) {
                setUserBooks(data.userBooks);
            } else {
                setMessage(data.message || "No books shared yet.");
            }
        } catch (error) {
            console.error('Error fetching user books:', error);
            setMessage("Error loading profile data.");
        }
    };
    fetchSharingStatus();
  }, [shareduser]);

  const backToGroup = () => {
    navigate(`/joingroup/${isbn}/${username}`); 
};
  
  return (
    <div className="container">
        <h1 className="text-center mb-3">{shareduser}'s Profile</h1>
        <div className="d-flex justify-content-center mb-4">
            <button onClick={backToGroup} className="btn btn-secondary">
                Back To Group
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
                                    src={book.image || "https://fakeimg.pl/128x128?text=No+Image"}
                                    className="card-img-top small-image"
                                    alt={`Thumbnail for ${book.title || 'No Title Available'}`}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h3 className="card-title">
                                        <strong>{book.title}</strong> by {book.authors ? book.authors.join(", ") : "Unknown"}
                                    </h3>
                                    <br />
                                    <p className="card-text mb-1">
                                        <strong>Goal Date:</strong>{" "}
                                        {goalDate ? goalDate.toDateString() : "Not Specified."}
                                    </p>
                                    {goalDate && daysLeft > 0 && (
                                        <>
                                            <p className="card-text">
                                                <strong>Days Left:</strong> {daysLeft}
                                            </p>
                                            <p className="card-text">
                                                <strong>Reading Goal:</strong> {dailyGoal} pages/day
                                            </p>
                                        </>
                                    )}
                                    <div className="progress mb-2">
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{
                                                width: `${book.pageCount > 0 ? (book.pagesRead / book.pageCount) * 100 : 0}%`,
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

export default ShareProfile;