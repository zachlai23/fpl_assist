import React from 'react'
import { SearchResult } from "./SearchResult";

import "./SearchResultList.css"

export const SearchResultList = ({ results, onSelect }) => {
    return (
     <div className="results-list">
        {results.map((result, id) => {
            return <SearchResult result={result} key={id} onSelect={onSelect} />;
        })}
    </div>
    );
};