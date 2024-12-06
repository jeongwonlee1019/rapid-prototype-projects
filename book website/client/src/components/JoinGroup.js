import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function JoinGroup() {
    const { isbn, username } = useParams(); 
    const [groupInfo, setGroupInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [book, setBook] = useState(null);
    const [isSharingEnabled, setIsSharingEnabled] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Profile is private.");
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchGroupInfo = async () => {
            try {
                const response = await fetch(`http://localhost:3000/joingroup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isbn, username }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch group information');
                }

                const data = await response.json();
                setGroupInfo(data.group);
                setBook(data.book);
                const member = data.group.members.find(member => member.username === username);
                if (member) {
                    setIsSharingEnabled(member.shareProfile);
                }
            } catch (error) {
                console.error('Error fetching group information:', error);
                setErrorMessage('Could not load group details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroupInfo();
    }, [isbn, username]);

    // Update the status message whenever `isSharingEnabled` changes
    useEffect(() => {
        if (isSharingEnabled) {
            setStatusMessage("Profile is shared.");
        } else {
            setStatusMessage("Profile is private.");
        }
    }, [isSharingEnabled]);

    const backToProfile = () => {
        navigate(`/profile/${username}`);  // Navigate with username as part of the URL
    };
    
    const handleToggle = async () => {
        const newStatus = !isSharingEnabled;
        setIsSharingEnabled(newStatus);
    
        try {
          const response = await fetch("http://localhost:3000/toggle-sharing", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username, isbn: isbn, isSharingEnabled: newStatus }),
          });
    
          const result = await response.json();
          if (!result.success) {
            alert("Failed to update sharing status!");
            setIsSharingEnabled(!newStatus); // Revert the toggle
          }
          navigate(`/joingroup/${isbn}/${username}`);

        } catch (error) {
          console.error("Error updating sharing status:", error);
          alert("Failed to update sharing status!");
          setIsSharingEnabled(!newStatus); 
        }
      };
    
    const onProfileClick = (member) => {
        if (!member.shareProfile) {
            alert("The user has disabled the sharing.");
        } else {
            navigate(`/profile-sharing/${isbn}/${username}/${member.username}`);
        }
    };

    return (
        <div className="container mt-4">
            {isLoading ? (
                <p>Loading group information...</p>
            ) : errorMessage ? (
                <p className="text-danger">{errorMessage}</p>
            ) : (
                <>
                    <button onClick={backToProfile}>Back To Profile</button>
                    <h1 className="text-center">
                        <br/>
                        Group for <strong>{book.title}</strong> by {book.authors ? book.authors.join(", ") : "Unknown"}
                    </h1>
                    <div className="mt-4">
                        {groupInfo ? (
                            <>
                                <h2>Group Details</h2>
                                <p>
                                    <strong>Total Members:</strong> {groupInfo.members?.length || 0}
                                </p>
                                <h3 className="mt-4">Members List</h3>
                                <p>Click on a member's username to view their profile.</p>
                                {groupInfo.members?.length > 0 ? (
                                    <table className="table table-bordered mt-3">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Username</th>
                                                <th>Pages Read</th>
                                                <th>Goal Date</th>
                                                <th>Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupInfo.members.map((member, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <strong 
                                                                style={{ cursor: 'pointer', color: '#007bff' }} 
                                                                onClick={() => onProfileClick(member)}
                                                            >
                                                                {member.username}
                                                            </strong>
                                                        </td>
                                                        <td>{member.pagesRead}</td>
                                                        <td>{member.goalDate ? new Date(member.goalDate).toLocaleDateString() : "No goal set"}</td>
                                                        <td>
                                                            <div
                                                                className="progress-bar"
                                                                role="progressbar"
                                                                style={{
                                                                    background: `linear-gradient(
                                                                        to right, 
                                                                        #007bff ${Math.min((member.pagesRead / book.pageCount) * 100 || 0, 100)}%, 
                                                                        #d3d3d3 ${Math.min((member.pagesRead / book.pageCount) * 100 || 0, 100)}%
                                                                    )`,
                                                                    width: "100%",
                                                                }}
                                                                aria-valuenow={member.pagesRead || 0}
                                                                aria-valuemin="0"
                                                                aria-valuemax={book.pageCount || 1}
                                                            >
                                                                {book.pageCount > 0
                                                                    ? `${Math.floor((member.pagesRead / book.pageCount) * 100)}%`
                                                                    : "0%"}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No members in this group yet.</p>
                                )}
                            </>
                        ) : (
                            <p>No group information available for this book.</p>
                        )}
                    </div>
                </>
            )}
            <div>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={isSharingEnabled}
                        onChange={handleToggle}
                    />
                    <span className="slider round"></span>
                </label>
                <p>{statusMessage}</p>
                <style>{`
                    .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                    }
                    .switch input {
                    display: none;
                    }
                    .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.4s;
                    border-radius: 24px;
                    }
                    .slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 2px;
                    bottom: 2px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                    }
                    input:checked + .slider {
                    background-color: #4caf50;
                    }
                    input:checked + .slider:before {
                    transform: translateX(26px);
                    }
                `}</style>
            </div>
        </div>
    );
}

export default JoinGroup;