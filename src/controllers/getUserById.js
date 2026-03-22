const User = require("../utils/User");

const getUserById = async function (req, res) {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).send({ status: false, msg: "Please provide a valid user ID" });
        }

        const user = User.getById(id);

        if (!user) {
            return res.status(404).send({ status: false, msg: "User not found" });
        }

        res.status(200).send({ status: true, msg: "User details", data: user });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports = getUserById;
