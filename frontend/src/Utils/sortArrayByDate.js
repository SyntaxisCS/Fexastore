const {DateTime} = require("luxon");

const sortArrayByDate = (array) => {
    if (typeof array != Array) {
        return null;
    }

    const sortedArray = array.sort((a, b) => {
        const dateA = DateTime.fromFormat(a.date, "yyyy-MM-dd HH:mm:ss.SSS");
        const dateB = DateTime.fromFormat(b.date, "yyyy-MM-dd HH:mm:ss.SSS");

        if (dateA > dateB) {
            return -1;
        } else if (dateA < dateB) {
            return 1;
        } else {
            return 0;
        }
    });

    return sortedArray;
};

module.exports = {sortArrayByDate};