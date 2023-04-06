const React = require("react");

// Components
import "./pagination.css";

export const Pagination = ({pageCount, onPageChange}) => {
    const handlePageClick = (event, page) => {
        onPageChange(page);
    };

    return (
        <nav>
            <ul className="pagination">
                {[...Array(pageCount).keys()].map((page) => (
                    <li key={page} className="pageItem">
                        <button className="pageLink" onClick={(event) => handlePageClick(event, page)}>
                            {page + 1}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

/*
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Result = ({ data }) => {
  return (
    <div className="result">
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </div>
  );
};

const Pagination = ({ pageCount, onPageChange }) => {
  const handlePageClick = (event, page) => {
    onPageChange(page);
  };

  return (
    <nav>
      <ul className="pagination">
        {[...Array(pageCount).keys()].map((page) => (
          <li key={page} className="page-item">
            <button className="page-link" onClick={(event) => handlePageClick(event, page)}>
              {page + 1}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const SearchResults = () => {
  const { query } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/search?q=${query}&page=${currentPage}`);
      setSearchResults(response.data.results);
      setPageCount(Math.ceil(response.data.totalCount / resultsPerPage));
    };
    fetchData();
  }, [query, currentPage]);

  const renderedResults = searchResults.map((result) => <Result key={result.id} data={result} />);

  const handlePageChange = (page) => {
    setCurrentPage(page + 1);
  };

  return (
    <>
      <div className="search-results">
        <h2>Search Results for "{query}"</h2>
        {renderedResults}
        <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
      </div>
    </>
  );
};

export default SearchResults;

*/