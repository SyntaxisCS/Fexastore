const React = require("react");

// Components
import defaultLogo from "../../../Assets/Images/default-logo.png";
import {formatDate} from "../../../Utils/dateBeautifier";
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

    React.useEffect(() => {
        // useCase
        if (props.useCase.length < 1) {
            setUseCase(["No Use Case Provided"]);
        } else {
            setUseCase(props.useCase);
        }

        // tags
        if (props.tags.length < 1) {
            setTags(["No Tags Provided"]);
        } else {
            setTags(props.tags);
        }

    },[]);

    return (
        <div className="uploadCard">
        <img src={defaultLogo} alt="logo" />
            <div className="uploadInfo">
                <h1 className="uploadTitle">{props.title ? props.title : "Title"}</h1>
                <p className="uploadName">{props.uploader ? props.uploader : "username"}</p>

                
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
        <p className="fileSize">{props.fileSize ? props.fileSize : "69.420 TB"}</p>
        <button className="downloadButton">Download</button>
    </div>
    );
};