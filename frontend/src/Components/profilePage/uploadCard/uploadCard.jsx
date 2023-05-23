const React = require("react");
const axios = require("axios");

// Components
import defaultLogo from "../../../Assets/Images/default-logo.png";
import {formatDate} from "../../../Utils/dateBeautifier";
import {useNavigate} from "react-router-dom";
import {fileSizeWrapper} from "../../../Utils/fileSizeBeautifier";
import { useTheme } from "../../../Utils/Themes/theme";
import "./uploadCard.css";

export const UploadCard = (props) => {
    // URLs
    const backendURL = process.env.backendURL;

    // Utils
    const theme = useTheme().theme;
    const navigate = useNavigate();

    // States
    const [useCase, setUseCase] = React.useState([]);
    const [tags, setTags] = React.useState([]);

    const randomColorGenerator = (index) => {

        let randomNumber = (index * Math.random() * (2 * 1)).toFixed(0);

        if (randomNumber > 3) {
            randomNumber = 2;
        } else if (randomNumber < 1) {
            randomNumber = Math.floor(Math.random() * (3 - 1));
        }

        switch(randomNumber.toString()) {
            case "1":
                return "purple";
          
            case "2":
                return "pink";
          
            case "3":
                return "gradient";

            default:
                return "purple"; // default color
        }
          
    };

    const handleDeleteClick = () => {
        deleteAPICall();
    };

    const groupPageClick = () => {
        navigate(`/upload/${props.groupId}`);
    }

    const deleteAPICall = () => {
        const fileId = props.id;

        axios.delete(`${backendURL}/uploads/s${fileId}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(success => {
            console.info(success.data);
            window.location.reload();
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 404) {
                // Upload does not exist
                console.warn("No uploads found with that id");
            } else {
                console.error(err);
            }
        });
    };

    React.useEffect(() => {
        // useCase
        if (!props.useCase || props.useCase.length < 1) {
            setUseCase(["No Use Case Provided"]);
        } else {
            setUseCase(props.useCase);
        }

        // tags
        if (!props.tags || props.tags.length < 1) {
            setTags(["No Tags Provided"]);
        } else {
            setTags(props.tags);
        }

    },[]);

    return (
        <div className="uploadCard">
        <img src={defaultLogo} alt="logo" />

        {props.owner ? <div className="deleteButton" onClick={handleDeleteClick}><i className="bx bx-trash-alt"/></div> : <div style={{display: "none"}}/>}

            <div className="uploadInfo">
                <h1 className="uploadTitle" onClick={groupPageClick}>{props.title ? props.title : "Title"}</h1>
                <p className="uploadName">{props.uploader ? props.uploader : "username"}</p>
                <p className="uploadDescription">{props.description ? props.description : ""}</p>
                
                <div className="tagWrapper">
                    <div className="useCase">
                        <h3>Use Case</h3>
                            <div className="tagContainer">
                            {useCase.map((item, index) => (
                                <p key={index} className={randomColorGenerator(index)}>{item}</p>
                            ))}
                        </div>
                    </div>
                    <div className="tags">
                        <h3>Tags</h3>
                            <div className="tagContainer">
                            {tags.map((item, index) => (
                                <p key={index} className={randomColorGenerator(index)}>{item}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
    
        <p className="uploadDate">{props.date ? formatDate(props.date) : "m/d/y"}</p>
        <p className="fileSize">{props.fileSize ? fileSizeWrapper(props.fileSize) : "0 KB"}</p>
        <button className="downloadButton">Download</button>
    </div>
    );
};