const React = require("react");

// Components
import { PrivacyDisclosureDigitalOcean } from "../../../Components/settings/privacySettings/privacyDisclosure/disclosures/digitalOcean/digitalOcean";
import { SettingsNavBar } from "../../../Components/settings/settingsNavBar/settingsNavBar";
import { TopBar } from "../../../Components/topBar/topBar";
import { useTheme } from "../../../Utils/Themes/theme";
import "../../Styles/Settings/disclosures/privacyDisclosureDigitalOcean.css";

export const PrivacyDisclosureDigitalOceanPage = (props) => {
    const theme = useTheme();

    return (
        <div className={`privacyDisclosureDigitalOceanPage ${theme}`}>
            <TopBar/>

            <SettingsNavBar/>
            <PrivacyDisclosureDigitalOcean/>
        </div>
    );
};