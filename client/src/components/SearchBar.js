import React, {useState} from 'react';

import {FaSearch} from "react-icons/fa"
import "./SearchBar.css";

export const SearchBar = ({ setResults, onPlayerSelect }) => {
    const [input, setInput] = useState("");

    const fetchData = (value) => {
        fetch(`http://localhost:5000/api/players`)
            .then((response) => response.json())    
            .then(json=> {
                const results = json.filter((user) => {
                    return (
                        value && 
                        user && 
                        user.toLowerCase().includes(value.toLowerCase())
                    ); 
                });
                setResults(results);
            })
            .catch((error) => console.error('Error fetching data:', error));
    };

    const handleChange = (value) => {
        setInput(value);
        fetchData(value);
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            fetch(`http://localhost:5000/api/players`)
                .then((response) => response.json())
                .then((json) => {
                    const matchedPlayer = json.find(
                        (user) =>
                            user &&
                            user.toLowerCase() === input.trim().toLowerCase()
                    );
                    if (matchedPlayer) {
                        onPlayerSelect(matchedPlayer);
                    } else {
                        alert("No matching plaeyr found");
                    }
                })
                .catch((error) => console.error("Error fetching data:", error));
        }
    };

    return (
        <div className="input-wrapper">
            <FaSearch id="search-icon" />
            <input placeholder="Search for player..." value={input} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown}/>
        </div>
    )
}