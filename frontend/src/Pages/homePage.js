const React = require("react");

// Components
import { TopBar } from "../Components/topBar/topBar";
import { SearchBar } from "../Components/homePage/searchBar/searchBar";
import "./Styles/homePage.css";

export const HomePage = (props) => {

    return (
        <div className="homePage">
            <TopBar/>
            <SearchBar/>
        </div>
    );
};