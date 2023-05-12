const React = require("react");

// Components
import { PrivacySettings } from "../../Components/settings/privacySettings/privacySettings";
import { SettingsNavBar } from "../../Components/settings/settingsNavBar/settingsNavBar";
import { TopBar } from "../../Components/topBar/topBar";
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/Settings/privacySettings.css";

export const PrivacySettingsPage = (props) => {
    const theme = useTheme().theme;

    return (
        <div className={`privacySettingsPage ${theme}`}>
            <TopBar/>
            <SettingsNavBar/>
            <PrivacySettings/>
        </div>
    )
}