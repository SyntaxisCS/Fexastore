const React = require("react");

// Components
const {NavLink} = require("react-router-dom");
const {useTheme} = require("../../Utils/Themes/theme");
import fexaStoreLight from "../../Assets/Images/fexastoreHorizontalLight.svg";
import fexaStoreDark from "../../Assets/Images/fexastoreHorizontalDark.svg";
import defaultAvatar from "../../Assets/Images/default-avatar.png";
import "./topBar.css";

export const TopBar = () => {
    const theme = useTheme().theme;
    const userAvatar = null;
    const username = null;
    const [showDropdown, setShowDropdown] = React.useState(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <div className={`topBar ${theme}`}>
            <NavLink to="/" className="logo"><img src={theme === "lightTheme" ? fexaStoreLight : fexaStoreDark}/></NavLink>
            
            <div className="rightLinks">
                <NavLink to="/bookmarks" title="Bookmarks"><i className="bx bx-bookmark"/></NavLink>

                <NavLink to="/upload" title="Upload"><i className="bx bx-upload"/></NavLink>

                <div className="dropdown">
                    <div className="userAvatar" onClick={toggleDropdown} title={username ? username : "Username"}>
                        <img src={userAvatar ? userAvatar : defaultAvatar} alt="User avatar" />
                    </div>
                    {showDropdown && (
                        <div className="dropdownContent">
                        <NavLink to="/profile"><i className="bx bx-user"/> Profile</NavLink>
                        <NavLink to="/settings"><i className="bx bx-cog"/> Settings</NavLink>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 