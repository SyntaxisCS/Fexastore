const React = require("react");
const axios = require("axios");

// Components
import "./signUpForm.css";

// Utils
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Utils/Authentication/auth";
import { useTheme } from "../../Utils/Themes/theme";

export const SignUpForm = () => {
    // URLS
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const auth = useAuth();
    const theme = useTheme().theme;
    const navigate = useNavigate();

    // States
    const [signUpState, setSignUpState] = React.useState({});
    const [passwordType, setPasswordType] = React.useState({inputType: "password", eye: true});
    const [confirmPasswordType, setConfirmPasswordType] = React.useState({inputType: "password", eye: true});
    const [formError, setFormError] = React.useState("");
    const [avatarImage, setAvatarImage] = React.useState(null);
    const [avatar, setAvatar] = React.useState(null);

    const handleInputChange = (event) => {
        let newEdit = {...signUpState};
        let target = event.target;

        newEdit[target.name] = target.value;

        setSignUpState(newEdit);
    };

    const handlePasswordType = () => {
        if (passwordType.inputType === "password") {
            let newEdit = {...passwordType};
            newEdit.inputType = "text";
            newEdit.eye = false;
            setPasswordType(newEdit);
        } else {
            let newEdit = {...passwordType};
            newEdit.inputType = "password";
            newEdit.eye = true;
            setPasswordType(newEdit);
        }
    };

    const handleConfirmPasswordType = () => {
        if (confirmPasswordType.inputType === "password") {
            let newEdit = {...confirmPasswordType};
            newEdit.inputType = "text";
            newEdit.eye = false;
            setConfirmPasswordType(newEdit);
        } else {
            let newEdit = {...confirmPasswordType};
            newEdit.inputType = "password";
            newEdit.eye = true;
            setConfirmPasswordType(newEdit);
        }
    };

    const handleFileUpload = (event) => {
        event.preventDefault();
        let file = event.target.files[0];
        console.log(file);
        if (!file) {
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          alert("File size should not exceed 2MB.");
          return;
        }

        
        let displayReader = new FileReader();
        displayReader.readAsDataURL(file);
    
        displayReader.onload = () => {
            setAvatarImage(displayReader.result);
        };

        setAvatar(file);
    };

    const handleSubmit = (event) => {
        console.info(`Contacting server...`);
        event.preventDefault();

        // prepare inputs
        // password
        // 1 lowercase, 1 uppercase, 1 number, 1 special, 10 characters minimum
        apiCall(signUpState.username, signUpState.firstName, signUpState.lastName, signUpState.email, signUpState.password, avatar);
    };

    const handleLogin = (user) => {
        auth.login(user);
        navigate("/");
    };

    const loginClick = () => {
        navigate("/login");
    };

    const apiCall = (username, firstName, lastName, email, password, avatar) => {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("username", username);
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("password", password);
        formData.append("avatar", avatar);

        axios.post(backendURL + "/users/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true
        }).then(response => {
            // User created, now login
            let login = {
                email,
                password
            };

            axios.post(backendURL + "/users/login", login, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }).then(response => {
                handleLogin(response.data);
            }, err => {
                let errResponse = err.response;

                if (errResponse.status === 401) {
                    // Password is incorrect
                    setFormError("Password is incorrect");
                } else if (errResponse.status === 404) {
                    // User does not exist
                    setFormError("That account does not exist");
                } else {
                    console.error(err);

                    // Other server error
                    setFormError("Error during login. Please try again later");
                }
            });
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 500) {
                // Could not create user
                setFormError("Error during account creation. Please try again later.");
            } else {
                setFormError("Error during account creation. Please try again later.");
            }
        });
    };

    return (
        <form className={`signUpForm ${theme}`} onSubmit={handleSubmit}>
            <div className="avatarUpload">
            <label htmlFor="avatar-upload">
                {avatarImage ? (
                <img src={avatarImage} alt="Avatar" />
                ) : (
                <div className="avatarPlaceholder">
                    <i className="bx bx-camera"></i>
                    <span>Upload Avatar</span>
                </div>
                )}
            </label>
            <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
            />
            </div>
    
            {/*Email*/}
            <label htmlFor="email">Email address</label>
            <input type="email" name="email" onChange={handleInputChange} required />
    
            {/*Username*/}
            <label htmlFor="username">Username</label>
            <input type="text" name="username" onChange={handleInputChange} required />
    
            {/*First Name*/}
            <label htmlFor="firstName">First Name</label>
            <input type="text" name="firstName" placeholder="optional" onChange={handleInputChange} />
    
            {/*Last Name*/}
            <label htmlFor="lastName">Last Name</label>
            <input type="text" name="lastName" placeholder="optional" onChange={handleInputChange} />
    
            {/* Password */}
            <label htmlFor="password">Password</label>
            <div className={`passwordInput ${theme}`}>
            <input type={passwordType.inputType} name="password" onChange={handleInputChange} required />
            <i className={`bx ${passwordType.eye ? "bx-hide" : "bx-show-alt"}`} onClick={handlePasswordType}></i>
            </div>
    
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <div className={`passwordInput ${theme}`}>
            <input type={confirmPasswordType.inputType} name="confirmPassword" onChange={handleInputChange} required />
            <i className={`bx ${confirmPasswordType.eye ? "bx-hide" : "bx-show-alt"}`} onClick={handleConfirmPasswordType}></i>
            </div>
    
            <button type="submit" onClick={handleSubmit}>
            Sign Up
            </button>
    
            <div className={`alternativeSignup ${theme}`}>
            <hr />
            <button>
                <i class="bx bxl-github" />
                Sign Up with Github
            </button>
            <button>
                <i class="bx bxl-google" />
                Sign Up with Google
            </button>
            <button>
                <i class="bx bxl-github" />
                Sign Up with SimpleLogin
            </button>
            </div>
    
            <div className={`loginText ${theme}`}>
            <hr />
            <p>
                Existing User? <a onClick={loginClick}>Login</a>
            </p>
            </div>
        </form>      
    )
}