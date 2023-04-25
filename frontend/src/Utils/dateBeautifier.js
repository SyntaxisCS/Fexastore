const {DateTime} = require("luxon");

const formatDate = (dateString) => {
    if (!dateString) {
        return "m/d/y";
    }

    const date = DateTime.fromFormat(dateString, "yyyy-MM-dd HH:mm:ss.SSS");
    const difference = DateTime.local().diff(date, ["days"]).toObject();

    if (difference.days < 3) {
        return `${Math.ceil(difference.days)} day${difference.days > 1 ? "s" : ""} ago`;
    } else {
        return date.toFormat("M/d/yy");
    }
};


module.exports = {formatDate};