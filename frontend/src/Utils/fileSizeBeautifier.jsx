const fileSizeWrapper = (sizeInKB) => {
    if (sizeInKB < 1000) {

        return `${sizeInKB.toFixed(2)} KB`;

    } else if (sizeInKB < 1000 * 1000) {

        return `${(sizeInKB / 1000).toFixed(2)} MB`;
    
    } else if (sizeInKB < 1000 * 1000 * 1000) {

        return `${(sizeInKB / (1000 * 1000)).toFixed(2)} GB`;

    } else {
        
        return `${(sizeInKB / (1000 * 1000 * 1000)).toFixed(2)} TB`;

    }
};

module.exports = {fileSizeWrapper};