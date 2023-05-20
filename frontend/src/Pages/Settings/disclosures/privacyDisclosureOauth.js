const React = require("react");

// Components
import { PrivacyDisclosureOauth } from "../../../Components/settings/privacySettings/privacyDisclosure/disclosures/oAuth/oauth";
import { SettingsNavBar } from "../../../Components/settings/settingsNavBar/settingsNavBar";
import { TopBar } from "../../../Components/topBar/topBar";
import { useTheme } from "../../../Utils/Themes/theme";
import "../../Styles/Settings/disclosures/privacyDisclosureOauth.css";

export const PrivacyDisclosureOAuthPage = (props) => {
    const theme = useTheme();

    return (
        <div className={`privacyDisclosureOauthPage ${theme}`}>
            <TopBar/>

            <SettingsNavBar/>
            <PrivacyDisclosureOauth/>
        </div>
    );
};