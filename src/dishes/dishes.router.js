const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// Handle the route for /dishes
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

// Handle the route for /dishes/:dishId
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed);

module.exports = router;
