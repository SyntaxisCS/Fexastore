const React = require("react");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import "./result.css";

export const Result = (props) => {
    const theme = useTheme().theme;

    return (
        <div className={`result ${theme}`}>
            <h3 className="title">{props.title}</h3>
            <p className="author">{props.author}</p>
            <p className="group">{props.groupName ? props.groupName : "none"}</p>
            <p className="fileSize">{props.fileSize}</p>
        </div>
    )
};