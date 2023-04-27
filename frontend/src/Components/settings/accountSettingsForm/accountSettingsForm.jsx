const React = require("react");
const axios = require("axios");

// Components
import { useAuth } from "../../../Utils/Authentication/auth";
import { useTheme } from "../../../Utils/Themes/theme";
import "./accountSettingsForm.css";

export const AccountSettingsForm = (props => {
    // URLs
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const auth = useAuth();
    const theme = useTheme().theme;

    // States
    const [accountSettingsState, setAccountSettingsState] = React.useState({});
    const [user, setUser] = React.useState(null);

    const [avatar, setAvatar] = React.useState(null); // file buffer
    const [avatarImage, setAvatarImage] = React.useState(null); // file source (url or DataURL)

    const handleInputChange = (event) => {
        let newEdit = {...accountSettingsState}
        let target = event.target;

        newEdit[target.name] = target.value;

        setAccountSettingsState(newEdit);
    }

    const handleFileUpload = (event) => {
        event.preventDefault();

        let file = event.target.files[0];

        if (!file) {
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("File size should not exceed 2 MB.");
            return;
        }

        let displayReader = new FileReader();
        displayReader.readAsDataURL(file);

        displayReader.onload = () => {
            setAvatarImage(displayReader.result);
        };

        setAvatar(file);
    }

    const getUser = () => {

        axios.get(`${backendURL}/users/id/${auth.user.uuid}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setUser(response.data);
            setAvatarImage(response.data.avatar_url);
        }, err => {
            console.error(err);
        })
    };

    React.useEffect(() => {
        getUser();
    }, []);

    return (
        <form className={`accountSettingsForm ${theme}`}>
            <div className="avatarUpload">
                <label htmlFor="avatar-upload">
                    {avatarImage ? (
                        <img src={avatarImage} alt="Avatar" />
                    ) : (
                        <div className="avatarPlaceholder">
                            <i className="bx bx-camera"/>
                            <span>Upload Avatar</span>
                        </div>
                    )}
                </label>
                <input type="file" id="avatar-upload" accept="image/*" onChange={handleFileUpload} style={{display: "none"}}/>
            </div>

            {/*Username*/}
            <label htmlFor="username">Username</label>
            <input type="text" name="username" onChange={handleInputChange} required/>

            {/* First Name */}
            <label htmlFor="firstName">First Name</label>
            <input type="text" name="firstName" onChange={handleInputChange}/>

            {/* Last Name */}
            <label htmlFor="lastName">Last Name</label>
            <input type="text" name="lastName" onChange={handleInputChange}/>
        </form>
    )
});