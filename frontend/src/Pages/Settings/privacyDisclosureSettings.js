const React = require("react");

// Components
import { PrivacyDisclosure } from "../../Components/settings/privacySettings/privacyDisclosure/privacyDisclosure";
import { SettingsNavBar } from "../../Components/settings/settingsNavBar/settingsNavBar";
import { TopBar } from "../../Components/topBar/topBar";
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/Settings/privacyDisclosureSettings.css";

export const PrivacyDisclosureSettingsPage = (props) => {
    const theme = useTheme().theme;

    return (
        <div className={`privacyDisclosureSettingsPage ${theme}`}>
            <TopBar/>

            <SettingsNavBar/>
            <PrivacyDisclosure/>
        </div>
    )
}