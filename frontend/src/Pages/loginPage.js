const React = require("react");

// Components
import { LoginForm } from "../Components/loginForm/loginForm";

export const LoginPage = (props) => {
    return (
        <div className="loginPage">
            <LoginForm/>
        </div>
    )
};