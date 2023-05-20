const React = require("react");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import "./notificationSettings.css";

export const NotificationSettings = (props) => {
    // Utils
    const theme = useTheme().theme;

    return (
        <div className={`notificationSettings ${theme}`}>
            <div className="toggleWrapper">
                <div className="toggleContainer">
                    <div className="toggleTitle">Necessary Notifications</div>
                    <div className="toggleSwitch">
                        <input type="checkbox" name="neccessaryToggle" checked/>
                        <label htmlFor="neccessaryToggle"></label>
                    </div>
                </div>
                <p className="description">Account related (email change, password change, deletion, etc)</p>
            </div>
        </div>
    )
}