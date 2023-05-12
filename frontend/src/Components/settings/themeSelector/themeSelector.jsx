const React = require("react");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import "./themeSelector.css";

export const ThemeSelector = (props) => {
    // Utils
    const theme = useTheme();
    const [currentTheme, setCurrentTheme] = React.useState(null);

    const handleThemeChange = (event) => {
        const selectedValue = event.target.value;

        switch(selectedValue) {
            case "lightTheme":
                theme.changeTheme("light");
            break;

            case "darkTheme":
                theme.changeTheme("dark");
            break;

            default:
                theme.changeTheme("light");
            break;
        };
    };

    return (
        <div className={`themeSelector ${theme}`}>
            <h1 className={`title ${theme}`}>What theme would you like for Fexastore?</h1>
            <select value={theme.theme ? theme.theme : "lightTheme"} onChange={handleThemeChange}>
                <option value="lightTheme">Light</option>
                <option value="darkTheme">Dark</option>
            </select>
        </div>
    )
};