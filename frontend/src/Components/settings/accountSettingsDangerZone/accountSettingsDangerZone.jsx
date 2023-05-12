const React = require("react");


// Components
import { useAuth } from "../../../Utils/Authentication/auth";
import { useTheme } from "../../../Utils/Themes/theme";
import "./accountSettingsDangerZone.css";

export const AccountSettingsDangerZone = (props) => {
    // URLs
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const auth = useAuth();
    const theme = useTheme().theme;

    const downloadAccountData = () => {

    };

    const handleAccountDeletion = () => {

    };

    return (
        <div className={`dangerZonePanel ${theme}`}>
            <h3>Download Account Data</h3>
            <p>Get sent an email with a zip file containing all information related to your account including account information and a copy of any uploaded files. Note: This action does not delete or alter any account information, it merely sends a copy to you for your records. If you wish to any information relating to your account please see below for "Delete Account"</p>
            <button className="downloadDataBtn" onClick={downloadAccountData}>Send</button>

            <h3>Delete Account</h3>
            <p>Immediately delete your account. Once you click "delete" our servers will immediately start processing the deletion of your account. This is an irreversable account and cannot be stopped once started. Be careful.</p>
            <button className="deleteBtn" onClick={handleAccountDeletion}>Delete</button>
        </div>
    );
}