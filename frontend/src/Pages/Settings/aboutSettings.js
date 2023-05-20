const React = require("react");

// Components
import { AboutSettings } from "../../Components/settings/aboutSettings/aboutSettings";
import { SettingsNavBar } from "../../Components/settings/settingsNavBar/settingsNavBar";
import { TopBar } from "../../Components/topBar/topBar";
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/Settings/aboutSettings.css";

export const AboutSettingsPage = (props) => {
    const theme = useTheme().theme;

    return (
        <div className={`aboutSettingsPage ${theme}`}>
            <TopBar/>

            <SettingsNavBar/>
            <AboutSettings/>
        </div>
    )
};