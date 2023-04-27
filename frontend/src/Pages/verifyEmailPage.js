const React = require("react");
const ReactRouter = require("react-router-dom");

// Components
import { VerifyEmailComponent } from "../Components/verifyEmail/verifyEmail";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/verifyEmailPage.css";

export const VerifyEmailPage = () => {
    const theme = useTheme().theme;

    const {token} = ReactRouter.useParams();

    return (
        <div className={`verifyEmailPage ${theme}`}>
            <VerifyEmailComponent token={token}/>
        </div>
    )
}