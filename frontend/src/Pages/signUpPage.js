const React = require("react");

// Utils
const {useNavigate} = require("react-router-dom");

// Components
import { SignUpForm } from "../Components/signUpForm/signUpForm";
import { useTheme } from "../Utils/Themes/theme";
import fexaStoreLight from "../Assets/Images/fexastoreHorizontalLight.svg";
import fexaStoreDark from "../Assets/Images/fexastoreHorizontalDark.svg";
import "./Styles/signUpPage.css";

export const SignUpPage = (props) => {
    const theme = useTheme().theme;

    const homeClick = () => {
        navigate("/");
    };

    return (
        <div className="signUpPage">
            <div className={`logo ${theme}`} onClick={homeClick}>
                <img src={theme === "lightTheme" ? fexaStoreLight : fexaStoreDark}/>
            </div>

            <div className={`header ${theme}`}>
                <h1>Care to join us?</h1>
            </div>

            <SignUpForm/>
        </div>
    )
}