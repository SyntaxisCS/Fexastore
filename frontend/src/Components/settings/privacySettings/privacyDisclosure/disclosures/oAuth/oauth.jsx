const React = require("react");

// Components
import { useNavigate } from "react-router";
import { useTheme } from "../../../../../../Utils/Themes/theme";
import "./oauth.css";

export const PrivacyDisclosureOauth = (props) => {
    // Utils
    const theme = useTheme().theme;
    const navigate = useNavigate();

    // Functions
    const backClick = () => {
        navigate("/settings/privacy/disclosure");
    };

    return (
        <div className={`privacyDisclosureOauth ${theme}`}>
            <div className="backButtonWrapper" onClick={backClick}>
                <i className='bx bx-chevron-left'/>
                <p>Back</p>
            </div>

            <div className="header">
                <h1>OAuth</h1>
                <p>Alternative Log In</p>

                <p>We use OAuth to provide our users an alternative way to sign up and use their accounts. Currently we provide oauth account through Google (due to popularity), Github and SimpleLogin.</p>
            </div>
        </div>
    );
};