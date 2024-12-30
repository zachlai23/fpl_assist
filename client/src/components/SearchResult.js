import React from 'react';

import "./SearchResult.css";

export const SearchResult = ({result, onSelect }) => {
    return <div className="search-result" onClick={() => onSelect(result)}>{result}</div>;
}