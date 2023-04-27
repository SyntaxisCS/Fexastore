const React = require("react");
const axios = require("axios");

// Components
import defaultLogo from "../../../Assets/Images/default-logo.png";
import {formatDate} from "../../../Utils/dateBeautifier";
import {fileSizeWrapper} from "../../../Utils/fileSizeBeautifier";
import "./uploadCard.css";

export const UploadCard = (props) => {

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

    };

    const apiCall = () => {

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

        {props.owner ? <div className="deleteButton"><i className="bx bx-trash-alt"/></div> : <div style={{display: "none"}}/>}

            <div className="uploadInfo">
                <h1 className="uploadTitle">{props.title ? props.title : "Title"}</h1>
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