const React = require("react");

// Components
import {useNavigate} from "react-router-dom";
import { useTheme } from "../../../../Utils/Themes/theme";
import "./privacyDisclosure.css";

export const PrivacyDisclosure = (props) => {
    // Utils
    const theme = useTheme().theme;
    const navigate = useNavigate();

    // Functions
    const backClick = () => {
        navigate("/settings/privacy");
    };

    const digitalOceanClick = () => {
        navigate("/settings/privacy/disclosure/digitalocean");
    };

    const oAuthClick = () => {
        navigate("/settings/privacy/disclosure/oauth");
    };

    return (
        <div className={`privacyDisclosure ${theme}`}>
            <div className="backButtonWrapper" onClick={backClick}>
                <i className='bx bx-chevron-left'/>
                <p>Back</p>
            </div>

            <div class="buttonList">
                <div class="buttonWrapper" onClick={digitalOceanClick}>
                    <p>DigitalOcean</p>
                    <i class="bx bx-chevron-right"></i>
                </div>
                <div class="buttonWrapper">
                    <p>___ Analytics</p>
                    <i class="bx bx-chevron-right"></i>
                </div>
                <div class="buttonWrapper" onClick={oAuthClick}>
                    <p>OAuth (Google, Github, SimpleLogin)</p>
                    <i class="bx bx-chevron-right"></i>
                </div>
            </div>
        </div>
    )
}