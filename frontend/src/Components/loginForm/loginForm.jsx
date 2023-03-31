const React = require("react");
const axios = require("axios");
const validator = require("validator");

// Utils
const {useAuth} = require("../../Utils/Authentication/auth");
const {useNavigate} = require("react-router-dom");
import {useTheme} from "../../Utils/Themes/theme";
import "./loginForm.css";

export const LoginForm = () => {
    // URLS
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    const auth = useAuth();
    const theme = useTheme().theme;
    const navigate = useNavigate();

    // States
    const [loginState, setLoginState] = React.useState({email:"",password:""});
    const [passwordType, setPasswordType] = React.useState({inputType:"password", eye: true});
    const [formError, setFormError] = React.useState("");

    const handleInputChange = (event) => {
        let newEdit = {...loginState};
        let target = event.target;

        newEdit[target.name] = target.value;

        setLoginState(newEdit);
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

    const handleSubmit = (event) => {
        console.info(`Logging in...`);
        event.preventDefault();
        
        // prepare inputs
        checkInputs(loginState.email, loginState.password);
    };

    const handleLogin = (user) => {
        auth.login(user);
        navigate("/");
    };

    const signUpClick = () => {
        navigate("/signup");
    };

    const forgotPasswordClick = () => {
        navigate("/forgotpassword");
    };

    const checkInputs = (email, password) => {
        if (email != "" && password != "") {
            const trimmedEmail = email.trim();
            const trimmedPassword = password.trim();


            // Email
            if (!validator.isEmail(trimmedEmail)) {
               setFormError("Invalid email address");

               // Stop function
               return null; 
            }

            // Escape and Encode Email and password
            const encodedEmail = encodeURIComponent(trimmedEmail);
            const encodedPassword = encodeURIComponent(trimmedPassword);

            apiCall(encodedEmail, encodedPassword);

        } else {
            setFormError("Please fill out all of the required fields");
        }
    };

    const apiCall = (email, password) => {
        let callBody = {
            email: email,
            password: password
        };

        axios.post(`${backendURL}/users/login`, callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            // Clear any form errors
            setFormError("");

            handleLogin(response.data);
        }, err => {
            let errReponse = err.response;

            if (errReponse.status === 401) {
                // Password is incorrect
                setFormError("Password is incorrect");
            } else if (errReponse.status === 404) {
                // User does not exist
                setFormError("That account does not exist");
            } else {
                console.error(err);
                // Other server error
                setFormError("Error during login. Please try again later");
            }
        });
    };

    return (
        <div className={`loginForm ${theme}`}>
            {/*Email*/}
            <label htmlFor="email">Email address</label>
            <input type="text" name="email" onChange={handleInputChange}/>

            {/*Password*/}
            <label htmlFor="password">Password <span className={`forgotText ${theme}`} onClick={forgotPasswordClick}>Forgot?</span></label> 

            <div className={`passwordInput ${theme}`}>
                <input type={passwordType.inputType} name="password" onChange={handleInputChange}/>
                <i className={`bx ${passwordType.eye ? "bx-hide" : "bx-show-alt"}`} onClick={handlePasswordType}/>
            </div>

            {formError === "" ? <p className="errorText hidden">error</p> : <p className="errorText">{formError}</p>}

            <button type="submit" onClick={handleSubmit}>Login</button>

            {/*Login with SSO (Google, Github)*/}

            <div className={`alternativeLogin ${theme}`}>
                <hr/>
                <button><i class='bx bxl-google'/>Login with Github</button>
                <button><i class='bx bxl-github'/>Login with Google</button>
            </div>

            <div className={`signUpText ${theme}`}>
                <hr/>
                <p>New User? <a onClick={signUpClick}>Signup</a></p>
            </div>

        </div>
    );
};