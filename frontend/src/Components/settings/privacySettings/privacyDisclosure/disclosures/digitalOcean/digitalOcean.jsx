const React = require("react");

// Components
import { useNavigate } from "react-router";
import { useTheme } from "../../../../../../Utils/Themes/theme";
import "./digitalOcean.css";

export const PrivacyDisclosureDigitalOcean = (props) => {
    // Utils
    const theme = useTheme().theme;
    const navigate = useNavigate();

    // Functions
    const backClick = () => {
        navigate("/settings/privacy/disclosure");
    };

    return (
        <div className={`privacyDisclosureDigitalOcean ${theme}`}>
            <div className="backButtonWrapper" onClick={backClick}>
                <i className='bx bx-chevron-left'/>
                <p>Back</p>
            </div>

            <div className="header">
                <h1>DigitalOcean</h1>
                <p>Our hosting provider</p>

                <p>DigitalOcean is our amazing hosting provider of both our frontend and backend servers as well as our storage and Postgres databases.</p>

                <p className="visit">If you wish to check them out, or vet them yourself you can check them out here → <a target="_blank" href="https:digitalocean.com">digitalocean.com</a></p>
            </div>
        </div>
    )
};