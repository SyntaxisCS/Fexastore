const nameFromKey = (key, files) => {

    files.forEach(file => {

        if (file.do_key === key) {
            return {original: file.original_file_name, system: file.system_file_name};
        }

    });

    return "No provided files matched with the key provided";

};

module.exports = {
    nameFromKey
}