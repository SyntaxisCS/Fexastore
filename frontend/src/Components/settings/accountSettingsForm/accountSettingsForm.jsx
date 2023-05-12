const React = require("react");
const axios = require("axios");

// Components
import { useAuth } from "../../../Utils/Authentication/auth";
import { useTheme } from "../../../Utils/Themes/theme";
import "./accountSettingsForm.css";

export const AccountSettingsForm = (props) => {
    // URLs
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const auth = useAuth();
    const theme = useTheme().theme;

    // States
    const [accountSettingsState, setAccountSettingsState] = React.useState({username:"",firstName:"",lastName:"",email:"",oldPassword:"",newPassword:"",newPasswordConfirm:""});
    const [user, setUser] = React.useState(null);

    const [avatarBuffer, setAvatarBuffer] = React.useState(null); // file buffer
    const [avatarImage, setAvatarImage] = React.useState(null); // file source (url or DataURL)

    // Success States
    const [accountInfoSuccess, setAccountInfoSuccess] = React.useState("Following items changed: ");
    const [emailChangeSuccess, setEmailChangeSuccess] = React.useState("");
    const [passwordChangeSuccess, setPasswordChangeSuccess] = React.useState("");

    // Error States
    const [accountInfoError, setAccountInfoError] = React.useState("");
    const [emailChangeError, setEmailChangeError] = React.useState("");
    const [passwordChangeError, setPasswordChangeError] = React.useState("");

    // Functions
    const handleInputChange = (event) => {
        let newEdit = {...accountSettingsState};
        let target = event.target;

        newEdit[target.name] = target.value;

        setAccountSettingsState(newEdit);
    };

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
    
        setAvatarBuffer(file);
    };

    const handleSaveChanges = () => {
        const {username, firstName, lastName} = accountSettingsState;

        // Check if any of the fields have changed
        if (avatarBuffer || username !== user.username || firstName !== user.first_name || lastName !== user.last_name) {
            // Call the appropriate functions based on which fields have changed
            if (avatarBuffer) {
                changeAvatar();
            }
            
            if (username !== user.username) {
                changeUsername(username);
            }

            if (firstName !== user.first_name) {
                changeFirstName(firstName);
            }

            if (lastName !== user.last_name) {
                changeLastName(lastName);
            }

        } else {
            setAccountInfoError("No changes made");
        }
    };

    const handleChangeEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // check if email is an email
        if (!emailRegex.test(accountSettingsState.email)) {
            // invalid
            setEmailChangeError("That is not a valid email");
        } else {
            // valid
            changeEmail(accountSettingsState.email);
        }
    };

    const handleChangePassword = () => {
        // check if password confirm matches password main
        if (accountSettingsState.newPassword !== accountSettingsState.newPasswordConfirm) {
            setPasswordChangeError("New passwords do not match")
        } else {
            // check password meets standards
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{10,}$/;
            if (!passwordRegex.test(accountSettingsState.newPassword)) {
                // invalid
                // 1 lowercase, 1 uppercase, 1 number, 1 special, 10 characters minimum
                setAccountInfoError("New passwords must be at least 10 characters long, and have at least 1 lowercase character, 1 capital character, 1 special character, and 1 number");
            } else {
                // valid, change password
                changePassword(accountSettingsState.oldPassword, accountSettingsState.newPassword);
            }
        }
    };

    // Api Calls
    const changeAvatar = (avatarBuffer) => {
        const formData = new FormData();
        formData.append("avatar", avatarBuffer);

        axios.post(`${backendURL}/users/change/avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true
        }).then(response => {
            let newEdit = accountInfoSuccess;

            setAccountInfoSuccess(newEdit + "avatar ");
        }, err => {
            console.error(err);
        });
    };

    const changeUsername = (username) => {
        // api call to change username
        let callBody = {
            username
        };

        axios.put(`${backendURL}/users/change/username`, callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            let newEdit = accountInfoSuccess;

            setAccountInfoSuccess(newEdit + "username ");
        }, err => {
            console.error(err);
        });
    };

    const changeFirstName = (firstName) => {
        // api call to change first name
        let callBody = {
            firstName
        };

        axios.put(`${backendURL}/users/change/firstname`, callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            let newEdit = accountInfoSuccess;

            setAccountInfoSuccess(newEdit + "first name ");
        }, err => {
            console.error(err);
        });
    };

    const changeLastName = (lastName) => {
        // api call to change last name
        let callBody = {
            lastName
        };

        axios.put(`${backendURL}/users/change/lastname`, callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            let newEdit = accountInfoSuccess;

            setAccountInfoSuccess(newEdit + "last name ");
        }, err => {
            console.error(err);
        });
    };

    const changeEmail = (email) => {
        // api call to start email change request
        let callBody = {
            email
        };

        axios.put(`${backendURL}/users/change/email`, callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setEmailChangeSuccess("Email request sent! Please check your current email");
        }, err => {
            console.error(err);
        });
    };

    const changePassword = (oldPassword, newPassword) => {
        // api call to change password
        let callBody = {
            oldPassword: oldPassword,
            newPassword: newPassword
        };

        axios.put(`${backendURL}/users/change/password`, callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setPasswordChangeSuccess("Password Changed Successfully! No further action necessary")
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 403) {
                setPasswordChangeError(errResponse.data.error)
            } else {
                console.warn(errResponse);
                setPasswordChangeError(errResponse.data.error);
            }
        });
    };

    const getUser = () => {
    
        axios.get(`${backendURL}/users/id/${auth.user.uuid}`, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        }).then(response => {
            setUser(response.data);
            setAvatarImage(response.data.avatar_url);
            setAccountSettingsState({
                firstName: response.data.first_name,
                lastName: response.data.last_name,
                username: response.data.username,
                email: response.data.email,
            });
        }, err => {
            console.error(err);
        });
    };
    
    React.useEffect(() => {
        getUser();
    }, []);

    return (
        <form className={`accountSettingsForm ${theme}`}>
            <div className="avatarUpload">
                <label htmlFor="avatarUpload">
                    {avatarImage ? (
                        <img src={avatarImage} alt="Avatar" />
                    ) : (
                        <div className="avatarPlaceholder">
                            <i className="bx bx-camera"/>
                            <span>Upload Avatar</span>
                        </div>
                    )}
                </label>
                <input type="file" id="avatarUpload" accept="image/*" onChange={handleFileUpload} style={{display: "none"}}/>
            </div>

            {/* Username */}
            <label htmlFor="username">Username</label>
            <input type="text" name="username" onChange={handleInputChange} value={accountSettingsState.username || ""}/>

            {/* First Name */}
            <label htmlFor="firstName">First Name</label>
            <input type="text" name="firstName" onChange={handleInputChange} value={accountSettingsState.firstName || ""}/>
        
            {/* Last Name */}
            <label htmlFor="lastName">Last Name</label>
            <input type="text" name="lastName" onChange={handleInputChange} value={accountSettingsState.lastName || ""}/>

            {accountInfoSuccess !== "Following items changed: " ? <p className="accountInfoSuccessText">{accountInfoSuccess}</p> : <p style={{display:"none"}}/>}
            {accountInfoError !== "" ? <p className="accountInfoErrorText">{accountInfoError}</p> : <p style={{display:"none"}}/>}

            <button type="button" onClick={handleSaveChanges}>Save Changes</button>

            {/* Email */}
            <label htmlFor="email">Email</label>
            <input type="email" name="email" value={accountSettingsState.email || ""} onChange={handleInputChange}/>

            {emailChangeSuccess !== "" ? <p className="emailChangeSuccessText">{emailChangeSuccess}</p> : <p style={{display:"none"}}/>}
            {emailChangeError !== "" ? <p className="emailChangeErrorText">{emailChangeError}</p> : <p style={{display:"none"}}/>}

            <button type="button" onClick={handleChangeEmail}>Submit Request</button>

            {/* Password */}

            <label htmlFor="oldPassword">Current Password</label>
            <div className="passwordInput">
                <input type="password" name="oldPassword" onChange={handleInputChange}/>
            </div>

            <label htmlFor="newPassword">New Password</label>
            <div className="passwordInput">
                <input type="password" name="newPassword" onChange={handleInputChange}/>
            </div>

            <label htmlFor="newPasswordConfirm">Confirm New Password</label>
            <div className="passwordInput">
                <input type="password" name="newPasswordConfirm" onChange={handleInputChange}/>
            </div>

            {passwordChangeSuccess !== "" ? <p className="passwordChangeSuccessText">{passwordChangeSuccess}</p> : <p style={{display:"none"}}/>}
            {passwordChangeError !== "" ? <p className="passwordChangeErrorText">{passwordChangeError}</p> : <p style={{display:"none"}}/>}

            <button type="button" onClick={handleChangePassword}>Change Password</button>
        </form>
    )
};