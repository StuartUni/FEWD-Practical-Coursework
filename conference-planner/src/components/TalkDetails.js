// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import StarRating from "./StarRating"; // Import the StarRating component

// const TalkDetails = ({ isAuthenticated }) => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [talk, setTalk] = useState(null);
//     const [comment, setComment] = useState("");
//     const [rating, setRating] = useState(0); // State for star rating
//     const [message, setMessage] = useState("");
//     const [error, setError] = useState(null);

//     // Helper function to calculate average rating
//     const calculateAverageRating = (ratings) => {
//         if (!ratings || ratings.length === 0) return "No ratings yet";
//         const validRatings = ratings
//             .filter((r) => r && typeof r.rating === "number")
//             .map((r) => r.rating);

//         if (validRatings.length === 0) return "No ratings yet";

//         const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
//         return (sum / validRatings.length).toFixed(1);
//     };

//     // Fetch talk details
//     useEffect(() => {
//         const fetchTalkDetails = async () => {
//             try {
//                 const response = await fetch(`http://localhost:3001/talks/${id}`);
//                 const data = await response.json();
//                 setTalk(data);
//             } catch (err) {
//                 setError("Failed to fetch talk details.");
//                 console.error(err);
//             }
//         };

//         fetchTalkDetails();
//     }, [id]);

//     // Handle Rating Submission
//     const handleRatingSubmit = async (rating) => {
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//             setMessage("You must be logged in to rate this talk.");
//             return;
//         }

//         try {
//             const response = await fetch(`http://localhost:3001/talks/${id}/rate`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`, // Protected route
//                 },
//                 body: JSON.stringify({ rating }),
//             });

//             if (response.ok) {
//                 const updatedTalk = await response.json();
//                 setTalk(updatedTalk);
//                 setMessage("Rating submitted successfully!");
//             } else {
//                 const errorData = await response.json();
//                 setMessage(errorData.message || "Failed to submit rating.");
//             }
//         } catch (err) {
//             console.error("Error submitting rating:", err);
//             setMessage("Error submitting rating. Please try again.");
//         }
//     };

//     if (error) return <p>{error}</p>;
//     if (!talk) return <p>Loading...</p>;

//     return (
//         <div>
//             <button onClick={() => navigate("/talks")} style={{ marginBottom: "20px" }}>
//                 Back to Talks
//             </button>
//             <h1>{talk.title}</h1>
//             <p><strong>Speaker:</strong> {talk.speaker}</p>
//             <p><strong>Description:</strong> {talk.description}</p>
//             <p><strong>Average Rating:</strong> {calculateAverageRating(talk.ratings)}</p>

//             <h2>Comments</h2>
//             {talk.comments && talk.comments.length > 0 ? (
//                 <ul>
//                     {talk.comments.map((c, index) => (
//                         <li key={index}>
//                             <strong>User {c.username}:</strong> {c.comment} <br />
//                             <em>{new Date(c.timestamp).toLocaleString()}</em>
//                         </li>
//                     ))}
//                 </ul>
//             ) : (
//                 <p>No comments yet.</p>
//             )}

//             {isAuthenticated ? (
//                 <div>
//                     {/* Comment Form */}
//                     <form
//                         onSubmit={async (e) => {
//                             e.preventDefault();
//                             const token = sessionStorage.getItem("token");
//                             try {
//                                 const response = await fetch(`http://localhost:3001/talks/${id}/comment`, {
//                                     method: "POST",
//                                     headers: {
//                                         "Content-Type": "application/json",
//                                         Authorization: `Bearer ${token}`,
//                                     },
//                                     body: JSON.stringify({ comment }),
//                                 });
//                                 if (response.ok) {
//                                     const updatedTalk = await response.json();
//                                     setTalk(updatedTalk);
//                                     setComment(""); // Clear the comment input
//                                 } else {
//                                     console.error("Failed to submit comment");
//                                 }
//                             } catch (err) {
//                                 console.error("Error submitting comment:", err);
//                             }
//                         }}
//                     >
//                         <textarea
//                             value={comment}
//                             onChange={(e) => setComment(e.target.value)}
//                             placeholder="Add your comment..."
//                             required
//                         />
//                         <button type="submit">Submit Comment</button>
//                     </form>

//                     {/* Star Rating */}
//                     <h3>Rate this Talk</h3>
//                     <StarRating
//                         totalStars={5}
//                         onRate={handleRatingSubmit}
//                     />
//                 </div>
//             ) : (
//                 <p style={{ color: "gray" }}>Login to post a comment or rate this talk.</p>
//             )}

//             {message && <p style={{ color: "green" }}>{message}</p>}
//         </div>
//     );
// };

// export default TalkDetails;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StarRating from "./StarRating"; // For user rating
import StarDisplay from "./StarDisplay"; // For average rating display

const TalkDetails = ({ isAuthenticated }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [talk, setTalk] = useState(null);
    const [comment, setComment] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    // Fetch talk details
    useEffect(() => {
        const fetchTalkDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/talks/${id}`);
                const data = await response.json();
                setTalk(data);
            } catch (err) {
                setError("Failed to fetch talk details.");
                console.error(err);
            }
        };

        fetchTalkDetails();
    }, [id]);

    // Handle Rating Submission
    const handleRatingSubmit = async (rating) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            setMessage("You must be logged in to rate this talk.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/talks/${id}/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating }),
            });

            if (response.ok) {
                const updatedTalk = await response.json();
                setTalk(updatedTalk);
                setMessage("Rating submitted successfully!");
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || "Failed to submit rating.");
            }
        } catch (err) {
            console.error("Error submitting rating:", err);
            setMessage("Error submitting rating. Please try again.");
        }
    };

    if (error) return <p>{error}</p>;
    if (!talk) return <p>Loading...</p>;

    return (
        <div>
            <button onClick={() => navigate("/talks")} style={{ marginBottom: "20px" }}>
                Back to Talks
            </button>
            <h1>{talk.title}</h1>
            <p><strong>Speaker:</strong> {talk.speaker}</p>
            <p><strong>Description:</strong> {talk.description}</p>
            <p>
                <strong>Average Rating:</strong>{" "}
                <StarDisplay ratings={talk.ratings} />
            </p>

            <h2>Comments</h2>
            {talk.comments && talk.comments.length > 0 ? (
                <ul>
                    {talk.comments.map((c, index) => (
                        <li key={index}>
                            <strong>User {c.username}:</strong> {c.comment} <br />
                            <em>{new Date(c.timestamp).toLocaleString()}</em>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No comments yet.</p>
            )}

            {isAuthenticated ? (
                <div>
                    {/* Comment Form */}
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const token = sessionStorage.getItem("token");
                            try {
                                const response = await fetch(`http://localhost:3001/talks/${id}/comment`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ comment }),
                                });
                                if (response.ok) {
                                    const updatedTalk = await response.json();
                                    setTalk(updatedTalk);
                                    setComment("");
                                } else {
                                    console.error("Failed to submit comment");
                                }
                            } catch (err) {
                                console.error("Error submitting comment:", err);
                            }
                        }}
                    >
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add your comment..."
                            required
                        />
                        <button type="submit">Submit Comment</button>
                    </form>

                    {/* Star Rating */}
                    <h3>Rate this Talk</h3>
                    <StarRating totalStars={5} onRate={handleRatingSubmit} />
                </div>
            ) : (
                <p style={{ color: "gray" }}>Login to post a comment or rate this talk.</p>
            )}

            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
    );
};

export default TalkDetails;