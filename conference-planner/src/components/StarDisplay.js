import React from "react";
import { FaStar } from "react-icons/fa";
// StarDisplay component
const StarDisplay = ({ ratings }) => {
    if (!ratings || ratings.length === 0) return "No ratings yet";
    // Filter out invalid ratings
    const validRatings = ratings
        .filter((r) => r && typeof r.rating === "number")
        .map((r) => r.rating);
    // If there are no valid ratings, return a message
    if (validRatings.length === 0) return "No ratings yet";
    // Calculate the average rating
    const averageRating = validRatings.reduce((acc, rating) => acc + rating, 0) / validRatings.length;
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    // Display the stars
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {[...Array(5)].map((_, index) => (
                <FaStar
                    key={index}
                    color={index < fullStars || (hasHalfStar && index === fullStars) ? "gold" : "gray"}
                />
            ))}
            <span style={{ marginLeft: "8px" }}>({averageRating.toFixed(1)})</span>
        </div>
    );
};

export default StarDisplay;