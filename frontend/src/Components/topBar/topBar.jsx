const React = require("react");
const axios = require("axios");

// Components
const {NavLink, useNavigate} = require("react-router-dom");
const {useTheme} = require("../../Utils/Themes/theme");
const {useAuth} = require("../../Utils/Authentication/auth");
import fexaStoreLight from "../../Assets/Images/fexastoreHorizontalLight.svg";
import fexaStoreDark from "../../Assets/Images/fexastoreHorizontalDark.svg";
import defaultAvatar from "../../Assets/Images/default-avatar.png";
import "./topBar.css";

export const TopBar = () => {
    // URLS
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const auth = useAuth();
    const navigate = useNavigate();
    const theme = useTheme().theme;

    // States
    const [avatar, setAvatar] = React.useState(null);
    const username = null;
    const [showDropdown, setShowDropdown] = React.useState(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogOut = () => {
        auth.logout();
        navigate("/login");
    };

    const getUserAvatar = () => {
        axios.get(`${backendURL}/users/avatar/${auth.user ? auth.user.uuid : "undefined"}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setAvatar(response.data);
        }, err => {
            console.warn(err);
        });
    };

    React.useEffect(() => {
        getUserAvatar();
    }, []);

    return (
        <div className={`topBar ${theme}`}>
            <NavLink to="/" className="logo"><img src={theme === "lightTheme" ? fexaStoreLight : fexaStoreDark}/></NavLink>
            
            <div className="rightLinks">
                <NavLink to="/bookmarks" title="Bookmarks" className={({isActive}) => (isActive ? "active" : "none")}><i className="bx bx-bookmark"/></NavLink>

                <NavLink to="/upload" title="Upload" className={({isActive}) => (isActive ? "active" : "none")}><i className="bx bx-upload"/></NavLink>

                <div className="dropdown">
                    <div className="userAvatar" onClick={toggleDropdown} title={username ? username : "Username"}>
                        <img src={avatar ? avatar : defaultAvatar} alt="User avatar" />
                    </div>
                    {showDropdown && (
                        <div className="dropdownContent">
                            <NavLink to={`/profile/${auth.user ? auth.user.username : "undefined"}`} className={({isActive}) => (isActive ? "active" : "none")}><i className="bx bx-user"/> Profile</NavLink>
                            <NavLink to="/settings/account"className={({isActive}) => (isActive ? "active" : "none")}><i className="bx bx-cog"/> Settings</NavLink>
                            <a onClick={handleLogOut} className="logOut"><i className="bx bx-log-out"/> Log Out</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 