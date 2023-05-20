const React = require("react");

// Components
import { AccountSettingsForm } from "../../Components/settings/accountSettingsForm/accountSettingsForm";
import { AccountSettingsDangerZone } from "../../Components/settings/accountSettingsDangerZone/accountSettingsDangerZone";
import { SettingsNavBar } from "../../Components/settings/settingsNavBar/settingsNavBar";
import { TopBar } from "../../Components/topBar/topBar";
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/Settings/accountSettings.css";

export const AccountSettingsPage = (props) => {
    const theme = useTheme().theme;

    return (
        <div className={`accountSettingsPage ${theme}`}>
            <TopBar/>

            <SettingsNavBar/>
            <AccountSettingsForm/>
            <AccountSettingsDangerZone/>
        </div>
    )
};