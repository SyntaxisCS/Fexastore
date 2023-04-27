const {DateTime} = require("luxon");

const formatDate = (dateString) => {
    if (!dateString) {
        return "m/d/y";
    }

    const date = DateTime.fromISO(dateString);
    const difference = DateTime.local().diff(date, ["days"]).toObject();

    if (difference.days < 3) {
        const relative = date.toRelative();
        return relative;
    } else {
        return date.toFormat("M/d/yy");
    }
};

module.exports = {formatDate};
