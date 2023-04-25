const React = require("react");

// Components
import defaultAvatar from "../../../Assets/Images/default-avatar.png";
import "./profileHeader.css";

export const ProfileHeader = () => {
    return (
        <div className="profileHeader">
            <div className="leftPane">
                <img src={defaultAvatar} className="userAvatar"/>
                <div className="userInfo">
                    <h1 className="userUsername">Username</h1>
                    <p className="userName">John Doe</p>
                </div>
            </div>
        </div>
    );
};