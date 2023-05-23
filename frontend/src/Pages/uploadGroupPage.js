const React = require("react");
const ReactRouter = require("react-router-dom");

// Components
import { TopBar } from "../Components/topBar/topBar";
import { UploadGroup } from "../Components/uploadPages/uploadGroup/uploadGroup";

// Utils
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/uploadGroupPage.css";


export const UploadGroupPage = (props) => {
    // URLs
    const backendURL = process.env.backendURL;
    
    // Utils
    const theme = useTheme().theme;
    const {groupId} = ReactRouter.useParams();

    return (
        <div className={`uploadGroupPage ${theme}`}>
            <TopBar/>

            <UploadGroup groupId={groupId}/>
        </div>
    );
};