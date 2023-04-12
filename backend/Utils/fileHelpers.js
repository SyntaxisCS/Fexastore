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

module.exports = {
    mimeTypeToFileType
};