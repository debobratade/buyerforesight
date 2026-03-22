const User = require("../utils/User");

const updateUser = async function (req, res) {
    try {
        const id = Number(req.params.id);

        if (!id || isNaN(id)) {
            return res.status(400).send({ status: false, msg: "Please provide a valid user ID" });
        }

        const existingUser = User.getById(id);

        if (!existingUser) {
            return res.status(404).send({ status: false, msg: "User not found" });
        }

        const allowed = ["name", "email", "age", "role"];
        const fields = Object.fromEntries(
            allowed.filter(k => k in req.body).map(k => [k, req.body[k]])
        );

        if (Object.keys(fields).length === 0) {
            return res.status(400).send({ status: false, msg: "Please provide at least one field to update" });
        }

        if (fields.email) {
            const emailTaken = User.getByEmail(fields.email);
            if (emailTaken && emailTaken.id !== id) {
                return res.status(409).send({ status: false, msg: "Email is already in use" });
            }
        }

        const updated = User.update(id, fields);

        res.status(200).send({ status: true, msg: "User updated successfully", data: updated });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

module.exports = updateUser;
