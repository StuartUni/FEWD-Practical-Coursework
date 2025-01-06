import React, { useEffect, useState } from "react";
// Manage the user's itinerary
const Itinerary = () => {
    const [itinerary, setItinerary] = useState([]);
    // Load the itinerary from localStorage
    useEffect(() => {
        
        const savedItinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
        setItinerary(savedItinerary);
    }, []);
    // Remove a talk from the itinerary
    const removeFromItinerary = (talkId) => {
        
        const updatedItinerary = itinerary.filter((talk) => talk.id !== talkId);
        setItinerary(updatedItinerary);
        localStorage.setItem("itinerary", JSON.stringify(updatedItinerary));
    };

    return (
        <div>
            <h1>Your Itinerary</h1>
            {itinerary.length === 0 ? (
                <p>You have no talks in your itinerary.</p>
            ) : (
                <ul>
                    {itinerary.map((talk) => (
                        <li key={talk.id}>
                            <h2>{talk.title}</h2>
                            <p>Speaker: {talk.speaker}</p>
                            <p>Time: {talk.time}</p>
                            <button onClick={() => removeFromItinerary(talk.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Itinerary;