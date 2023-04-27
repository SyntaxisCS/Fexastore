const uploadDupeChecker = (uploadArray) => {
    const seenGroupIds = {};
    return uploadArray.filter((upload, index, arr) => {
      if (seenGroupIds[upload.upload_group_id]) {
        // already seen this group id, remove this upload and add its file size to the first upload with the same group id
        const matchingUploadIndex = arr.findIndex((u) => u.upload_group_id === upload.upload_group_id);
        arr[matchingUploadIndex].file_size += upload.file_size;
        return false;
      } else {
        seenGroupIds[upload.upload_group_id] = true;
        return true;
      }
    });
  };
  
  module.exports = {uploadDupeChecker};
  