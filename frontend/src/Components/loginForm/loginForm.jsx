const React = require("react");
const axios = require("axios");
const validator = require("validator");

// Utils
const {useAuth} = require("../../Utils/Authentication/auth");
const {useNavigate} = require("react-router-dom");
import {useTheme} from "../../Utils/Themes/theme";
import "./loginForm.css";

export const LoginForm = () => {
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
            newEdit.inputTYpe = "password";
        }
    };

    const handleSubmit = (event) => {
        console.info(`Logging in...`);
        event.preventDefault();
        // prepare inputs
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

    const apiCall = () => {

    };

    return (
        <div className={`loginForm ${theme}`}>
            <div className={`header ${theme}`}>
                <h1>Login</h1>
            </div>

            <label htmlFor="email">Email</label>
            <input type="text" name="email" onChange={handleInputChange}/>

            <label htmlFor="password">Password</label>
            <div className={`passwordInput ${theme}`}>
                <input type={passwordType.inputType} name="password" onChange={handleInputChange}/>
                <i className={`bx ${passwordType.eye ? "bx-hide" : "bx-show-alt"}`} onChange={handleInputChange}/>
            </div>

            <p className={`forgotText ${theme}`} onClick={forgotPasswordClick}/>

            {formError === "" ? <p className="errorText hidden">error</p> : <p className="errorText">{formError}</p>}

            <button type="submit">Login</button>
        </div>
    );
};