const React = require("react");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import {useNavigate} from "react-router-dom";
import "./searchBar.css";

export const SearchBar = () => {
    const theme = useTheme().theme;
    const navigate = useNavigate();

    const [query, setQuery] = React.useState("");

    const handleQueryChange = (event) => {
        let target = event.target;

        if (target.name === "search") {
            let newEdit = {...query};
            newEdit = target.value;
            setQuery(newEdit);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate(`?q=${query}`);
    };

    return (
        <form className={`searchBar ${theme}`} onSubmit={handleSubmit}>
            <input type="text" name="search" placeholder="search" maxLength="100" onChange={handleQueryChange}/>
        </form>
    );
};