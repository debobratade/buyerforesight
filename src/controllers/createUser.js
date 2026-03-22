const User = require("../utils/User");

const createUser = async function (req, res) {
    try {
        const { name, email, age, role } = req.body;

        const existingUser = User.getByEmail(email);

        if (existingUser) {
            return res.status(409).send({ status: false, msg: "Email is already in use" });
        }

        const user = User.create({ name, email, age, role });

        res.status(201).send({ status: true, msg: "User created successfully", data: user });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports = createUser;
