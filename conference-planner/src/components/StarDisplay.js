import React from "react";
import { FaStar } from "react-icons/fa";

const StarDisplay = ({ ratings }) => {
    if (!ratings || ratings.length === 0) return "No ratings yet";

    const validRatings = ratings
        .filter((r) => r && typeof r.rating === "number")
        .map((r) => r.rating);

    if (validRatings.length === 0) return "No ratings yet";

    const averageRating = validRatings.reduce((acc, rating) => acc + rating, 0) / validRatings.length;
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

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