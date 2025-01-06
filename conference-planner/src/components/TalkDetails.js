import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import StarDisplay from "./StarDisplay"; 
import { BASE_URL } from "../config";

// TalkDetails component
const TalkDetails = ({ isAuthenticated }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [talk, setTalk] = useState(null);
    const [comment, setComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editComment, setEditComment] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    // Fetch the talk details
    const fetchTalkDetails = async () => {
        try {
            const response = await fetch(`${BASE_URL}/talks/${id}`);
            const data = await response.json();
            setTalk(data);
        } catch (err) {
            setError("Failed to fetch talk details.");
            console.error(err);
        }
    };
    // Fetch the talk details on component mount
    useEffect(() => {
        fetchTalkDetails();
    }, [id]);
    // Handle the rating submission
    const handleRatingSubmit = async (rating) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            setMessage("You must be logged in to rate this talk.");
            return;
        }
        // Send the rating request
        try {
            const response = await fetch(`${BASE_URL}/talks/${id}/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating }),
            });
            // Check if the rating was submitted successfully
            if (response.ok) {
                fetchTalkDetails(); 
                setMessage("Rating submitted successfully!");
            } else {
                setMessage("Failed to submit rating.");
            }
        } catch (err) {
            console.error("Error submitting rating:", err);
        }
    };
    // Handle the comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem("token");
        try {
            const response = await fetch(`${BASE_URL}/talks/${id}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ comment }),
            });
            if (response.ok) {
                fetchTalkDetails(); 
                setComment(""); 
            } else {
                console.error("Failed to submit comment");
            }
        } catch (err) {
            console.error("Error submitting comment:", err);
        }
    };
    // Handle the comment edit
    const handleEditComment = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const response = await fetch(`${BASE_URL}/talks/${id}/comments/${editingCommentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ comment: editComment }),
            });
            if (response.ok) {
                fetchTalkDetails(); 
                setEditingCommentId(null); 
                setEditComment(""); 
            } else {
                setMessage("Failed to edit comment.");
            }
        } catch (err) {
            console.error(err);
        }
    };
    // Handle the comment deletion
    const handleDeleteComment = async (commentId) => {
        const token = sessionStorage.getItem("token");
        try {
            const response = await fetch(`${BASE_URL}/talks/${id}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                fetchTalkDetails(); 
            } else {
                setMessage("Failed to delete comment.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (error) return <p>{error}</p>;
    if (!talk) return <p>Loading...</p>;
    // Get the current username from the session storage
    const currentUsername = sessionStorage.getItem("username");
    // Render the talk details
    return (
        <div>
            <button onClick={() => navigate("/talks")} style={{ marginBottom: "20px" }}>
                Back to Talks
            </button>
            <h1>{talk.title}</h1>
            <p><strong>Speaker:</strong> {talk.speaker}</p>
            <p><strong>Description:</strong> {talk.description}</p>
            <p><strong>Average Rating:</strong> <StarDisplay ratings={talk.ratings} /></p>

            <h2>Comments</h2>
            <div className="comments-section">
                {talk.comments && talk.comments.length > 0 ? (
                    talk.comments.map((c) => (
                        <div className="comment-card" key={c.id || c.timestamp}>
                            <div className="comment-header">
                                <strong>{c.username}</strong>
                                <span>{new Date(c.timestamp).toLocaleString()}</span>
                            </div>
                            {editingCommentId === c.id ? (
                                <div>
                                    <textarea
                                        value={editComment}
                                        onChange={(e) => setEditComment(e.target.value)}
                                        className="edit-textarea"
                                    />
                                    <button className="edit-btn" onClick={handleEditComment}>Save</button>
                                    <button className="cancel-btn" onClick={() => setEditingCommentId(null)}>Cancel</button>
                                </div>
                            ) : (
                                <div className="comment-body">
                                    <p>{c.comment}</p>
                                    {c.username === currentUsername && (
                                        <div className="comment-actions">
                                            <button
                                                className="edit-btn"
                                                onClick={() => {
                                                    setEditingCommentId(c.id);
                                                    setEditComment(c.comment);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteComment(c.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>

            {isAuthenticated && (
                <div className="add-comment-section">
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add your comment..."
                            required
                            className="add-comment-textarea"
                        />
                        <button type="submit" className="submit-btn">Submit Comment</button>
                    </form>

                    <h3>Rate this Talk</h3>
                    <StarRating totalStars={5} onRate={handleRatingSubmit} />
                </div>
            )}
            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
    );
};

export default TalkDetails;