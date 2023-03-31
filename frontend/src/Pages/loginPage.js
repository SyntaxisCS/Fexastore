const React = require("react");

// Utils
const {useNavigate} = require("react-router-dom");

// Components
import { LoginForm } from "../Components/loginForm/loginForm";
import { useTheme } from "../Utils/Themes/theme";
import fexaStoreLight from "../Assets/Images/fexastoreHorizontalLight.svg";
import fexaStoreDark from "../Assets/Images/fexastoreHorizontalDark.svg";
import "./Styles/loginPage.css";

export const LoginPage = (props) => {
    const theme = useTheme().theme;
    const navigate = useNavigate();

    const homeClick = () => {
        navigate("/");
    };

    return (
        <div className="loginPage">
            <div className={`logo ${theme}`} onClick={homeClick}>
                <img src={theme === "lightTheme" ? fexaStoreLight : fexaStoreDark}/>
            </div>

            <div className={`header ${theme}`}>
                <h1>Welcome back</h1>
            </div>
            <LoginForm/>
        </div>
    )
};