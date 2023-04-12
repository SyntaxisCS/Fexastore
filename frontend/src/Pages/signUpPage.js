const React = require("react");

// Utils
const {useNavigate} = require("react-router-dom");

// Components
import { SignUpForm } from "../Components/signUpForm/signUpForm";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/signUpPage.css";

export const SignUpPage = (props) => {
    const theme = useTheme().theme;

    return (
        <div className="signUpPage">
            <SignUpForm/>
        </div>
    )
}