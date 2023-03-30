const React = require("react");

// Components
import { LoginForm } from "../Components/loginForm/loginForm";
import { useTheme } from "../Utils/Themes/theme";
import fexaStoreLight from "../Assets/Images/fexastoreHorizontalLight.svg";
import fexaStoreDark from "../Assets/Images/fexastoreHorizontalDark.svg";
import "./Styles/loginPage.css";

export const LoginPage = (props) => {
    const theme = useTheme().theme;


    return (
        <div className="loginPage">
            <div className={`logo ${theme}`}>
                <img src={theme === "lightTheme" ? fexaStoreLight : fexaStoreDark}/>
            </div>

            <div className={`header ${theme}`}>
                <h1>Welcome back</h1>
            </div>
            <LoginForm/>
        </div>
    )
};