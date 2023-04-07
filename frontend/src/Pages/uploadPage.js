const React = require("react");

// Components
import { TopBar } from "../Components/topBar/topBar";
import { UploadForm } from "../Components/uploadForm/uploadForm";
import "./Styles/uploadPage.css";

export const UploadPage = () => {

    return (
        <div className="uploadPage">
            <TopBar/>
            <h1 className="title">Want to provide data to developers?</h1>
            <UploadForm/>
            <p className="disclaimer">By uploading your files, you agree to allow us to store and distribute them to others in the community. While we will honor requests to remove files and will remove them from listing and delete them from our servers, please be aware that the internet is the internet - once uploaded, there is a chance someone else has already downloaded them, and they may no longer be private. Please carefully consider this before proceeding. We cannot guarantee the security of your data once it has been uploaded, and are not liable for any unauthorized access or disclosure.</p>
        </div>
    );
};