const React = require("react");

// Components
import {useTheme} from "../../../Utils/Themes/theme";
import "./privacySettings.css";

export const PrivacySettings = (props) => {
    // Utils
    const theme = useTheme().theme;

    return (
        <div className={`privacySettings ${theme}`}>

        </div>
    )
};