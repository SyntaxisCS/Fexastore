const React = require("react");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import "./aboutSettings.css";

export const AboutSettings = (props) => {
    // Utils
    const theme = useTheme().theme;

    return (
        <div className={`aboutSettings ${theme}`}>
            <div className="header">
                <h1>Fexastore</h1>
                <p className="version">Version 0.0.30</p>
            </div>
            
            <div className="specialThanks">
                <h3 className="specialThanksTitle">Special Thanks</h3>
                <p className="specialThanksDescription">Amazing people who Fexastore wouldn't exist without</p>

                <p title="Artist that designed the color scheme and logo of fexastore">ongraphic24h (fiverr)</p>
                <p title="Our hosting provider">DigitalOcean</p>

                <p className="specialThanksFooter">{"Made with ❤️ by SyntaxisCS"}</p>
            </div>
        </div>
    )
}