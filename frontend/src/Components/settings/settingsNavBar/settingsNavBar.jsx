const React = require("react");
import { NavLink } from "react-router-dom";

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import "./settingsNavBar.css";

export const SettingsNavBar = (props) => {
    const theme = useTheme();

    return (
        <div className={`settingsNavBar ${theme.theme}`}>
            <NavLink to="/settings/account" className={({isActive}) => (isActive ? "active" : "none")}>Account</NavLink>
            <NavLink to="/settings/theme" className={({isActive}) => (isActive ? "active" : "none")}>Theme</NavLink>
            <NavLink to="/settings/privacy" className={({isActive}) => (isActive ? "active" : "none")}>Privacy</NavLink>
            <NavLink to="/settings/notifications" className={({isActive}) => (isActive ? "active" : "none")}>Notifications</NavLink>
            <NavLink to="/settings/about" className={({isActive}) => (isActive ? "active" : "none")}>About</NavLink>
        </div>
    )
};