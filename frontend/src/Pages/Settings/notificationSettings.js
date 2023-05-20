const React = require("react");

// Components
import { NotificationSettings } from "../../Components/settings/notificationSettings/notificationSettings";
import { SettingsNavBar } from "../../Components/settings/settingsNavBar/settingsNavBar";
import { TopBar } from "../../Components/topBar/topBar";
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/Settings/notificationSettings.css";

export const NotificationSettingsPage = (props) => {
    const theme = useTheme().theme;

    return (
        <div className={`notificationSettingsPage ${theme}`}>
            <TopBar/>

            <SettingsNavBar/>
            <NotificationSettings/>
        </div>
    );
};