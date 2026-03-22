const { Router } = require("express");
const { validateCreate, validateUpdate, validateListQuery } = require("../middleware/validate");

const getUsers = require("../controllers/getUsers");
const getUserById = require("../controllers/getUserById");
const createUser = require("../controllers/createUser");
const updateUser = require("../controllers/updateUser");
const deleteUser = require("../controllers/deleteUser");

const router = Router();

router.get("/", validateListQuery, getUsers);
router.get("/:id", getUserById);
router.post("/", validateCreate, createUser);
router.put("/:id", validateUpdate, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
