// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// const TalkDetails = ({ isAuthenticated }) => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [talk, setTalk] = useState(null);
//     const [rating, setRating] = useState("");
//     const [message, setMessage] = useState("");
//     const [error, setError] = useState(null);

//     const calculateAverageRating = (ratings) => {
//         if (!ratings || ratings.length === 0) return "No ratings yet";
//         const validRatings = ratings
//             .filter((r) => r && r.rating) // Ensure valid ratings
//             .map((r) => r.rating); // Extract the rating value
    
//         if (validRatings.length === 0) return "No ratings yet"; // Handle empty array after filtering
    
//         const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
//         return (sum / validRatings.length).toFixed(1);
//     };

//     useEffect(() => {
//         const fetchTalkDetails = async () => {
//             try {
//                 const response = await fetch(`http://localhost:3001/talks/${id}`);
//                 const data = await response.json();
//                 console.log("Fetched Talk Data:", data); // Debugging step
//                 setTalk(data);
//             } catch (err) {
//                 setError("Failed to fetch talk details.");
//                 console.error(err);
//             }
//         };

//         fetchTalkDetails();
//     }, [id]);

//     const handleRatingSubmit = async (e) => {
//         e.preventDefault();
    
//         const token = sessionStorage.getItem("token"); // Retrieve token
//         const userId = "user123"; // Replace this with the actual user ID from the session/token
    
//         try {
//             const response = await fetch(`http://localhost:3001/talks/${id}/rate`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ userId, rating: Number(rating) }),
//             });
    
//             if (response.ok) {
//                 setMessage("Rating submitted successfully!");
//                 const updatedTalk = await response.json();
//                 setTalk(updatedTalk); // Update talk with the new rating
//             } else {
//                 setMessage("Failed to submit rating. Please try again.");
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
//             <p><strong>Time:</strong> {talk.time}</p>
//             <p><strong>Session:</strong> {talk.session}</p>
//             <p><strong>Description:</strong> {talk.description}</p>
//             <p><strong>Tags:</strong> {talk.tags && Array.isArray(talk.tags) ? talk.tags.join(", ") : "No tags available"}</p>
//             <p><strong>Average Rating:</strong> {calculateAverageRating(talk.ratings)}</p>
    
//             {/* User Ratings and Comments */}
//             <h3>User Ratings:</h3>
//             <ul>
//                 {talk.ratings && talk.ratings.length > 0 ? (
//                     talk.ratings.map((r, index) => (
//                         <li key={index}>
//                             Rating: {r.rating} {r.comment ? `- "${r.comment}"` : ""}
//                         </li>
//                     ))
//                 ) : (
//                     <p>No ratings yet.</p>
//                 )}
//             </ul>
    
//             {isAuthenticated ? (
//                 <form onSubmit={handleRatingSubmit}>
//                     <input
//                         type="number"
//                         min="1"
//                         max="5"
//                         value={rating}
//                         onChange={(e) => setRating(e.target.value)}
//                         required
//                     />
//                     <button type="submit">Submit Rating</button>
//                 </form>
//             ) : (
//                 <p style={{ color: "gray" }}>Login to rate this talk.</p>
//             )}
//             {message && <p>{message}</p>}
//         </div>
//     );
// };

// const [comment, setComment] = useState("");
// const [comments, setComments] = useState([]);

// setTalk(data);
// setComments(data.comments || []); // Initialize comments

// <h2>Comments</h2>
// {comments.length === 0 ? (
//     <p>No comments yet. Be the first to comment!</p>
// ) : (
//     <ul>
//         {comments.map((c, index) => (
//             <li key={index}>
//                 <strong>User {c.userId}:</strong> {c.comment} <br />
//                 <em>{new Date(c.timestamp).toLocaleString()}</em>
//             </li>
//         ))}
//     </ul>
// )}

// {isAuthenticated ? (
//     <form
//         onSubmit={async (e) => {
//             e.preventDefault();
//             const token = sessionStorage.getItem("token");
//             try {
//                 const response = await fetch(`http://localhost:3001/talks/${id}/comment`, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({ comment }),
//                 });
//                 if (response.ok) {
//                     const { comments: updatedComments } = await response.json();
//                     setComments(updatedComments);
//                     setComment(""); // Clear input
//                 } else {
//                     console.error("Failed to submit comment");
//                 }
//             } catch (err) {
//                 console.error("Error submitting comment:", err);
//             }
//         }}
//     >
//         <textarea
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             placeholder="Add your comment..."
//             required
//         />
//         <button type="submit">Submit Comment</button>
//     </form>
// ) : (
//     <p style={{ color: "gray" }}>Login to post a comment.</p>
// )}
// export default TalkDetails;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TalkDetails = ({ isAuthenticated }) => {
    // Define hooks within the component
    const { id } = useParams();
    const navigate = useNavigate();
    const [talk, setTalk] = useState(null);
    const [comment, setComment] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    // Helper function to calculate average rating
    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return "No ratings yet";
        const validRatings = ratings
            .filter((r) => r && typeof r.rating === "number")
            .map((r) => r.rating);

        if (validRatings.length === 0) return "No ratings yet";

        const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
        return (sum / validRatings.length).toFixed(1);
    };

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
            <p><strong>Average Rating:</strong> {calculateAverageRating(talk.ratings)}</p>

            <h2>Comments</h2>
            {talk.comments && talk.comments.length > 0 ? (
                <ul>
                    {talk.comments.map((c, index) => (
                        <li key={index}>
                            <strong>User {c.userId}:</strong> {c.comment} <br />
                            <em>{new Date(c.timestamp).toLocaleString()}</em>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No comments yet.</p>
            )}

            {isAuthenticated ? (
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
                                setComment(""); // Clear the comment input
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
            ) : (
                <p style={{ color: "gray" }}>Login to post a comment.</p>
            )}
        </div>
    );
};

export default TalkDetails;