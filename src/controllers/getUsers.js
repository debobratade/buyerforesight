const User = require("../utils/User");

const getUsers = async function (req, res) {
    try {
        const { search, sort, order } = req.query;

        const users = User.getAll({ search, sort, order });

        if (!users.length) {
            return res.status(404).send({ status: false, msg: "No users found" });
        }

        res.status(200).send({ status: true, msg: "Users list", data: { total: users.length, users } });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports = getUsers;
