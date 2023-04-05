const React = require("react");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import "./searchBar.css";

export const SearchBar = () => {
    const theme = useTheme().theme;

    const filterOptions = ["Filter 1", "Filter 2", "Filter 3"];

    const [query, setQuery] = React.useState({query: "", filters: []});
    const [selectedFilter, setSelectedFilter] = React.useState("");

    const handleQueryChange = (event) => {
        let target = event.target;

        if (target.name === "search") {
            let newEdit = {...query};
            newEdit.query = target.value;
            setQuery(newEdit);
        }
    };

    const handleFilterSelect = (event) => {
        setSelectedFilter(event.target.value);
    };

    const handleFilterAdd = () => {
        if (selectedFilter !== "") {
            let newEdit = {...query};

            newEdit.filters.push(selectedFilter);
            setQuery(newEdit);
            setSelectedFilter("");
        }
    };

    const handleFilterRemove = (filter) => {
        let newEdit = {...query};

        newEdit.filters.filter((f) => f !== filter);
        
        setQuery(newEdit);
    };

    return (
        <div className={`searchBar ${theme}`}>
            <input type="text" name="search" placeholder="search" max="255" onChange={handleQueryChange}/>
        </div>
    );
};