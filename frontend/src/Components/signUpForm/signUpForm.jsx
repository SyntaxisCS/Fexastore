const React = require("react");

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

    const handleSubmit = (event) => {
        console.info(`Contacting server...`);
        event.preventDefault();

        // prepare inputs
        
    };

    const handleLogin = (user) => {
        auth.login(user);
        navigate("/");
    };

    const loginClick = () => {
        navigate("/login");
    };

    const apiCall = (x) => {
        let callBody = {

        };

        axios.post(backendURL + "/users/create", callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            // User created, now login

            let login = {
                email: response.data.email,
                password: callBody.password
            };

            axios.post(backendURL + "/users/login", login, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }).then(response => {

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
            {/*Email*/}
            <label htmlFor="email">Email address</label>
            <input type="email" name="email" onChange={handleInputChange} required/>

            {/*Username*/}
            <label htmlFor="username">Username</label>
            <input type="text" name="username" onChange={handleInputChange} required/>

            {/* Password */}
            <label htmlFor="password">Password</label>
            <div className={`passwordInput ${theme}`}>
                <input type={passwordType.inputType} name="password" onChange={handleInputChange} required/>
                <i className={`bx ${passwordType.eye ? "bx-hide" : "bx-show-alt"}`} onClick={handlePasswordType}/>
            </div>

            <label htmlFor="passwordConfirm">Confirm Password</label>
            <div className={`passwordInput ${theme}`}>
                <input type={confirmPasswordType.inputType} name="confirmPassword" onChange={handleInputChange} required/>
                <i className={`bx ${confirmPasswordType.eye ? "bx-hide" : "bx-show-alt"}`} onClick={handleConfirmPasswordType}/>
            </div>

            <button type="submit" onClick={handleSubmit}>Sign Up</button>

            <div className={`alternativeSignup ${theme}`}>
                <hr/>
                <button><i class='bx bxl-github'/>Sign Up with Github</button>
                <button><i class='bx bxl-google'/>Sign Up with Google</button>
                <button><i class='bx bxl-github'/>Sign Up with SimpleLogin</button>
            </div>

            <div className={`loginText ${theme}`}>
                <hr/>
                <p>Existing User? <a onClick={loginClick}>Login</a></p>
            </div>
        </form>
    )
}