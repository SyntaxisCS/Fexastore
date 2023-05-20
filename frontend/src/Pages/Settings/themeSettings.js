const React = require("react");

// Components
import { TopBar } from "../../Components/topBar/topBar";
import { ThemeSelector } from "../../Components/settings/themeSelector/themeSelector";
import { SettingsNavBar } from "../../Components/settings/settingsNavBar/settingsNavBar";
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/Settings/themeSettings.css";

export const ThemeSettingsPage = (props) => {
    const theme = useTheme().theme;

    return (
        <div className={`themeSettingsPage ${theme}`}>
            <TopBar/>
            <SettingsNavBar/>
            <ThemeSelector/>
        </div>
    )
};