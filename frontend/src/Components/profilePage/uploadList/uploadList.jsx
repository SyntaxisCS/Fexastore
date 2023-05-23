const React = require("react");
const axios = require("axios");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import { UploadCard } from "../uploadCard/uploadCard";
import { useAuth } from "../../../Utils/Authentication/auth";
import "./uploadList.css";

export const UploadList = (props) => {
    // URLs
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const theme = useTheme().theme;
    const auth = useAuth();

    // States
    const [uploads, setUploads] = React.useState([]);

    const getUploads = (userId) => {

        if (!userId) {
            return null;
        }

        axios.get(`${backendURL}/uploads/u${userId}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            let results = [];

            response.data.forEach(upload => {
                let newUpload = {...upload};

                // convert tags and use case from strings to arrays
                if (newUpload.tags) {
                    newUpload.tags = upload.tags.split(",");
                }

                if (newUpload.use_case) {
                    newUpload.use_case = upload.use_case.split(",");
                }

                results.push(newUpload);
            });

            setUploads(results);
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
        getUploads(props.user.uuid);
    }, []);

    return (
        <div className={`uploadList ${theme}`}>
            <div className={`uploadBar ${theme}`}>
                <hr/>
                <span>{`${uploads.length} results`}</span>
            </div>

            {uploads.length > 0 ? uploads.map((file, index) => {
                return (<UploadCard key={index} id={file.id} groupId={file.upload_group_id} title={file.title} uploader={props.user.username} useCase={file.use_case} tags={file.tags} date={file.updated_date} fileSize={file.file_size} owner={props.user.uuid === auth.user.uuid ? true : false}/>)
            }) : <h3 className="emptyProfile">No uploads yet! Stingy stingy!</h3>}
        </div>
    );
};