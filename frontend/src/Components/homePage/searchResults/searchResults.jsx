const React = require("react");
import ReactPaginate from "react-paginate";

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import { useLocation } from "react-router-dom";
import "./searchResults.css";
import { Result } from "../result/result";
import { Pagination } from "./Pagination/pagination";

export const SearchResults = () => {
    // Utils
    const theme = useTheme().theme;
    const location = useLocation();

    // States
    const [searchResults, setSearchResults] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageCount, setPageCount] = React.useState(1);
    const resultsPerPage = 10;

    // Variables
    const searchQuery = new URLSearchParams(location.search).get("q");
    const renderedResults = searchResults.map((result) => {<Result key={result.key}></Result>});

    // Functions
    const apiCall = () => {

    };

    const handlePageChange = (page) => {
        setCurrentPage(page + 1);
    };

    React.useEffect(() => {
        console.log(searchQuery);
    }, [searchQuery]);

    return (
        <div className="searchResults">
            <h2>{searchQuery}</h2>
            {renderedResults ? renderedResults : <div style={{display:"none"}}/>}

            <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
        </div>
    );
};