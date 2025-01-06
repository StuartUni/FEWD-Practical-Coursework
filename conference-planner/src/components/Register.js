import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { BASE_URL } from "../config";

// Register component
const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); 
    // Handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if the passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        // Check if the password meets the requirements
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:<>?~]).{8,}$/.test(password)) {
            setError("Password must be 8+ characters, include uppercase, lowercase, number, and special character.");
            return;
        }
        // Reset the error and message
        setError(""); 
        // Send the registration request
        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            // Check if the registration was successful
            const data = await response.json();

            if (response.ok) {
                setMessage("Registration successful! Redirecting to login...");
                setUsername("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setTimeout(() => navigate("/login"), 2000); 
            } else {
                setError(data.message || "Registration failed.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
    };
    // Render the registration form
    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        pattern="^\w{4,20}$"
                        title="4-20 characters, letters, numbers, and underscores only"
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
};

export default Register;