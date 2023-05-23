const React = require("react");
const axios = require("axios");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import { useNavigate } from "react-router-dom";
import "./uploadGroup.css";

export const UploadGroup = (props) => {
    // URLs
    const backendURL = process.env.backendURL;

    // Utils
    const theme = useTheme().theme;
    const navigate = useNavigate();
    const {groupId} = props;

    // States
    const [groupState, setGroupState] = React.useState(null);
    const [files, setFiles] = React.useState(null);

    const getFileGroup = () => {
        if (!groupId) {
            console.warn("No group id provided");
            navigate("/");
        } else {
            axios.get(`${backendURL}/uploads/m${groupId}`, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }).then(response => {
                let groupArray = response.data;

                // get group only info
                let groupInfo = groupArray[0];
                let groupEdit = {...groupState};

                // get group info from one of the files
                groupEdit.title = groupInfo.title
                groupEdit.description = groupInfo.description;
                groupEdit.creationDate = groupInfo.creation_date;
                groupEdit.updatedDate = groupInfo.updated_date;
                groupEdit.numberOfFiles = groupInfo.num_of_files_in_group;
                groupEdit.uploaderId = groupInfo.uploader_id;
                groupEdit.tags = groupInfo.tags;
                groupEdit.useCase = groupInfo.use_case;
                groupEdit.groupFileSize = 0;

                // Get Group File Size
                groupArray.forEach(file => {
                    groupEdit.groupFileSize += file.file_size;
                });

                // set states
                setGroupState(groupEdit);
                setFiles(groupArray);

            }, err => {
                let errResponse = err.response;

                if (errResponse.status === 404) {
                    console.error("No files with that group id");
                } else {
                    console.error(errResponse.message);
                }
            });
        }
    };

    React.useEffect(() => {
        getFileGroup();
    }, []);

    return (
        <div className={`uploadGroup ${theme}`}>

        </div>
    )
}