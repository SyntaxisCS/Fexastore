const React = require("react");

// Components
import { ProfileHeader } from "../Components/profilePage/profileHeader/profileHeader";
import { UploadList } from "../Components/profilePage/uploadList/uploadList";
import { TopBar } from "../Components/topBar/topBar";
import "./Styles/profilePage.css";


export const ProfilePage = () => {
    return (
        <div className="profilePage">
            <TopBar/>
            <ProfileHeader/>
            <UploadList/>
        </div>
    );
};