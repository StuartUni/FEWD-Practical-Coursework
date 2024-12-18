import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Talks = ({ isAuthenticated }) => {
    const [talks, setTalks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [session, setSession] = useState("");
    const [filteredTalks, setFilteredTalks] = useState([]);

    const calculateAverageRating = (ratings) => {
        if (!Array.isArray(ratings) || ratings.length === 0) return "No ratings yet";
    
        // Extract only valid numeric ratings
        const validRatings = ratings
            .filter((r) => r && typeof r.rating === "number" && !isNaN(r.rating))
            .map((r) => r.rating);
    
        if (validRatings.length === 0) return "No ratings yet";
    
        const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
        return (sum / validRatings.length).toFixed(1);
    };

    // Fetch talks from the API on component mount
    useEffect(() => {
        const fetchTalks = async () => {
            try {
                const response = await fetch("http://localhost:3001/talks");
                const data = await response.json();
                console.log("Fetched Talks Data:", data); // Debugging API response

                // Ensure the API response is an array
                if (Array.isArray(data)) {
                    setTalks(data);
                    setFilteredTalks(data);
                } else {
                    console.error("API did not return an array:", data);
                    setTalks([]);
                    setFilteredTalks([]);
                }
            } catch (error) {
                console.error("Failed to fetch talks:", error);
                setTalks([]);
                setFilteredTalks([]);
            }
        };

        fetchTalks();
    }, []);

    // Filter talks when search term or session changes
    useEffect(() => {
        const filtered = talks.filter((talk) => {
            const matchesTitleOrSpeaker = talk.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          talk.speaker?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSession = session === "" || talk.session === session;
            return matchesTitleOrSpeaker && matchesSession;
        });

        setFilteredTalks(filtered);
    }, [searchTerm, session, talks]);

    return (
        <div>
            <h1>Talks</h1>
            
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search by title or speaker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Session Filter */}
            <select onChange={(e) => setSession(e.target.value)} value={session}>
                <option value="">All Sessions</option>
                <option value="A">Session A</option>
                <option value="B">Session B</option>
                <option value="C">Session C</option>
            </select>
            
            {/* Talks List */}
            <ul>
                {filteredTalks.length > 0 ? (
                    filteredTalks.map((talk) => (
                        <li key={talk.id}>
                            <h2>
                                <Link to={`/talks/${talk.id}`}>{talk.title}</Link>
                            </h2>
                            <p>Speaker: {talk.speaker}</p>
                            <p>Time: {talk.time}</p>
                            <p>Average Rating: {calculateAverageRating(talk.ratings)}</p>
                            {isAuthenticated ? (
                                <div>
                                    <button>Rate Talk</button>
                                    <button>Comment</button>
                                </div>
                            ) : (
                                <p style={{ color: "gray" }}>
                                    Login to rate or comment on this talk.
                                </p>
                            )}
                        </li>
                    ))
                ) : (
                    <p>No talks found. Try adjusting your search or filters.</p>
                )}
            </ul>
        </div>
    );
};

export default Talks;