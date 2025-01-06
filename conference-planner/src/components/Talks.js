
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StarDisplay from "./StarDisplay"; 
import { ClipLoader } from "react-spinners"; 
// Talks component
const Talks = () => {
    const [talks, setTalks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [session, setSession] = useState("");
    const [filteredTalks, setFilteredTalks] = useState([]);
    const [loading, setLoading] = useState(true); 

    // Add a talk to the itinerary
    const addToItinerary = (talk) => {
        // Get the itinerary from localStorage
        const itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];

        // Check for time conflicts
        const conflict = itinerary.some((t) => t.time === talk.time);
        if (conflict) {
            alert("You already have a talk scheduled at this time!");
            return;
        }

        // Add the talk to the itinerary
        itinerary.push(talk);
        localStorage.setItem("itinerary", JSON.stringify(itinerary));

        alert(`"${talk.title}" has been added to your itinerary!`);
    };

    // Fetch the talks from the server
    useEffect(() => {
        const fetchTalks = async () => {
            try {
                const response = await fetch("http://localhost:3001/talks");
                const data = await response.json();
                setTalks(data);
                setFilteredTalks(data);
            } catch (error) {
                console.error("Failed to fetch talks:", error);
            } finally {
                setLoading(false); 
            }
        };

        fetchTalks();
    }, []);

    // Filter the talks based on the search term and session
    useEffect(() => {
        const filtered = talks.filter((talk) => {
            const matchesTitleOrSpeaker =
                talk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                talk.speaker.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSession = session === "" || talk.session === session;
            return matchesTitleOrSpeaker && matchesSession;
        });
        setFilteredTalks(filtered);
    }, [searchTerm, session, talks]);

    
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <ClipLoader size={50} color={"#007bff"} />
            </div>
        );
    }
    // Render the talks list
    return (
        <div className="container">
            <h1 className="my-4">Talks</h1>

            {/* Search and Filter */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title or speaker..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        onChange={(e) => setSession(e.target.value)}
                        value={session}
                    >
                        <option value="">All Sessions</option>
                        <option value="A">Session A</option>
                        <option value="B">Session B</option>
                        <option value="C">Session C</option>
                    </select>
                </div>
            </div>

            {/* Talks List */}
            <div className="row">
                {filteredTalks.map((talk) => (
                    <div className="col-md-4 mb-4" key={talk.id}>
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{talk.title}</h5>
                                <p className="card-text">Speaker: {talk.speaker}</p>
                                <p className="card-text">Time: {talk.time}</p>
                                <div>
                                    <StarDisplay ratings={talk.ratings} />
                                </div>
                                <Link to={`/talks/${talk.id}`} className="btn btn-primary mt-3">
                                    View Details
                                </Link>
                                <button
                                    onClick={() => addToItinerary(talk)}
                                    className="btn btn-secondary mt-2"
                                >
                                    Add to Itinerary
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Talks;