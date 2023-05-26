const mimeTypeToFileType = (mimeType) => {
    switch(mimeType) {
        // Text Files
        case "text/plain":
            return "txt";

        case "text/csv":
            return "csv";

        case "application/json":
            return "json";

        // Application FIles
        case "application/pdf":
            return "pdf";
        
        default:
            return null;
    }
};

const fileTypeToMimeType = (fileType) => {
    switch(fileType) {
        // Text Files
        case "txt":
            return "text/plain";

        case "csv":
            return "text/csv";

        case "json":
            return "application/json";

        // Application FIles
        case "pdf":
            return "application/pdf";
        
        default:
            return null;
    }
}

module.exports = {
    mimeTypeToFileType,
    fileTypeToMimeType
};