const User = require("../utils/User");

const deleteUser = async function (req, res) {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).send({ status: false, msg: "Please provide a valid user ID" });
        }

        const existingUser = User.getById(id);

        if (!existingUser) {
            return res.status(404).send({ status: false, msg: "User not found" });
        }

        User.remove(id);

        res.status(200).send({ status: true, msg: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports = deleteUser;
