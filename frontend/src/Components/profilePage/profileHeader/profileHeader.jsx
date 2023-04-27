const React = require("react");
const axios = require("axios");

// Components
const {useAuth} = require("../../../Utils/Authentication/auth");
import defaultAvatar from "../../../Assets/Images/default-avatar.png";
import "./profileHeader.css";

export const ProfileHeader = (props) => {
    // URLs
    const backendURL = process.env.backendURL;

    // Utils
    const auth = useAuth();

    // States
    const [user, setUser] = React.useState(null);
    const [userName, setUserName] = React.useState(null);
    const [userNameShow, setUserNameShow] = React.useState(false);


    const handleName = (firstName, lastName) => {
        if (firstName) {
            if (lastName) {
                setUserName(`${firstName} ${lastName}`);
                setUserNameShow(true);
            } else {
                setUserName(firstName);
                setUserNameShow(true);
                console.log(user.avatar_url);
            }
        } else {
            setUserName(null);
            setUserNameShow(false);
        }
    };

    React.useEffect(() => {
        setUser(props.user);
        handleName(props.user.first_name, props.user.last_name);
    }, [props.user]);

    return (
        <div className="profileHeader">
            <div className="leftPane">
                <img src={user ? user.avatar_url : defaultAvatar} className="userAvatar"/>
                <div className="userInfo">
                    <h1 className="userUsername">{user ? user.username : "Username"}</h1>
                    <p className={`userName ${userNameShow ? "show" : "hidden"}`}>{userName}</p>
                </div>
            </div>
        </div>
    );
};