const React = require("react");
const axios = require("axios");

// Utils
import {fileSizeWrapper} from "../../Utils/fileSizeBeautifier";

// Components
import { useTheme } from "../../Utils/Themes/theme";
import { useNavigate } from "react-router";
import "./uploadForm.css";

export const UploadForm = () => {
    // URL
    const frontendURL = process.env.frontendURL;
    const backendURL = process.env.backendURL;

    // Utils
    const theme = useTheme().theme;
    const navigate = useNavigate();

    // States
    const [uploadForm, setUploadForm] = React.useState({title:"", desc: "", useCase: "", tags: ""});
    const [files, setFiles] = React.useState([]);
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);

    // Functions
    const handleInputChange = (event) => {
        let newEdit = {...uploadForm};
        let target = event.target;

        newEdit[target.name] = target.value;

        setUploadForm(newEdit);
    };

    const preventSpace = (event) => {
        if (event.keyCode === 32) {
            event.preventDefault();
        }
    };

    // file upload
    const handleDrop = (event) => {
        event.preventDefault();
        setIsDraggingOver(false);
        const newFiles = Array.from(event.dataTransfer.files);
        setFiles([...files, ...newFiles]);
    };

    const handleFileInputChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setFiles([...files, ...newFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((file, i) => i !== index));
    };

    // file drag
    const handleDragOver = (event) => {
        event.preventDefault();

        setIsDraggingOver(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();

        setIsDraggingOver(false);
    };

    // Form Submit
    const handleSubmit = (event) => {
        event.preventDefault();

        // Check files
        if (checkFiles()) {
            apiCall();
        }
    };

    const checkFiles = () => {
        if (files.length > 10) {
            alert("Please upload no more than 10 files");
            return;
        }

        const cumFileSize = files.reduce((acc, file) => acc + file.size, 0);
        const maxSize = 1024 * 1024 * 500; // 500 MB

        if (cumFileSize > maxSize) {
            alert("Cumulative size of all files upload cannot go over 500 MB");
            return;
        }

        return true;
    };

    const apiCall = () => {
        const formData = new FormData();

        formData.append("title", uploadForm.title);
        formData.append("desc", uploadForm.desc);
        formData.append("useCase", uploadForm.useCase);
        formData.append("tags", uploadForm.tags);

        // files
        files.forEach((file) => {
            formData.append("files", file);
        });

        // api call
        axios.post(backendURL + "/uploads/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true
        }).then(response => {

        }, err => {

        });
    };

    return (
        <form className="uploadForm" onSubmit={handleSubmit}>
            <div className="uploadFormInputs">
                <label htmlFor="title">Title</label>
                <input type="text" name="title" onChange={handleInputChange}/>

                <label htmlFor="description">Description</label>
                <input type="text" name="description"/>

                <label htmlFor="useCase">Use Case</label>
                <input type="text" name="useCase"/>
                
                <label htmlFor="tags">Tags</label>
                <input type="text" name="tags" placeholder="single words seperated by commas" onChange={handleInputChange} onKeyDown={preventSpace}/>
            
                {/* Files */}
                <div className={`uploadDropbox ${isDraggingOver ? "drag":""}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
                    <p>Drag and drop files here or click to select files</p>
                    <input type="file" name="fileInput" multiple onChange={handleFileInputChange}/>
                </div>

                {
                    files.length > 0 ? (
                        <div className="fileStagingArea">
                            {files.map((file) => (
                                <div className="fileDetails" key={file.name} onClick={() => handleRemoveFile(files.indexOf(file))}>
                                    <p className="fileName">{file.name}</p>
                                    <p className="fileSize">{fileSizeWrapper(file.size)}</p>
                                </div>
                            ))}
                        </div>
                    ) : <div/>
                }

                <button type="submit">Upload</button>
            </div>
        </form>
    );
};