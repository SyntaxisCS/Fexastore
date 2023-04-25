const React = require("react");
const axios = require("axios");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import { UploadCard } from "../uploadCard/uploadCard";
import "./uploadList.css";

export const UploadList = (props) => {
    // URLs
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const theme = useTheme().theme;

    // States
    const [uploads, setUploads] = React.useState([]);

    const getUploads = (userId) => {
        console.log(backendURL);

        if (!userId) {
            return null;
        }

        axios.get(`${backendURL}/u${userId}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setUploads(response.data);
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 404) {
                // Nothing found
                setUploads([]);
            } else {
                console.error(err);
                setUploads([]);
            }
        });
    };

    React.useEffect(() => {
        getUploads(props.userId);
    }, []);

    return (
        <div className={`uploadList ${theme}`}>
            <div className={`uploadBar ${theme}`}>
                <hr/>
                <span>{`${uploads.length} results`}</span>
            </div>

            {uploads.length > 0 ? uploads.map((file, index) => {
                <UploadCard key={index} title={file.title} uploader={file.uploader_id} useCase={[]} tags={[]} date={file.updated_date} fileSize={file.file_size}/>
            }) : <h3 className="emptyProfile">No uploads yet! Stingy stingy!</h3>}
        </div>
    );
};