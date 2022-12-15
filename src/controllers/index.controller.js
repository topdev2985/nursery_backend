const Test = require('../models/test');

const test = async (req, res) => {
    const test = await Test.findOne();
    if (test) {
        res.status(200).json({
            message: "ok",
            test
        })
    }
    else {
        res.status(200).json({
            message: "bad guy"
        })
    }
}

module.exports = {
    test
}