const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// Return as list of all orders
function list(req, res) {
    res.json({ data: orders });
}

// Create a new order
function create(req, res, next) {

    // Grab the data from the request body
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    
    // Validation checks
    // Check if deliverTo is missing or empty
    if(!deliverTo || deliverTo == "") {
        return next({ status: 400, message: 'Order must include a deliverTo' });
    }
    
    // Check if the mobileNumber is missing or empty
    if (!mobileNumber || mobileNumber == "") {
        return next ({ status: 400, message: 'Order must include a mobileNumber' });
    }

    // Check if dishes is missing
    if (!dishes) {
        return next ({ status: 400, message: 'Order must include a dish' });
    }

    // Check if dishes is not ar array or empty
    if (!Array.isArray(dishes) || dishes.length == 0) {
        return next ({ status: 400, message: 'Order must include at least one dish' });
    }

    // Iterate through the dishes checking for quantity
    for ( let index = 0; index < dishes.length; index++) {

        // Check if each dish has a quantity, if it is more than 0, and is a number
        if (!dishes[index].quantity || dishes[index].quantity <= 0 || typeof dishes[index].quantity !== 'number') {
            return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
      }
    }

    // Format the order data object
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: 'pending',
        dishes: dishes
    };

    // Push the new order object
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

// Check if the order exists
function orderExists(req, res, next) {
    // Grab the order ID from the request parameters
    const orderId = req.params.orderId;

    // Find the order using the the order ID from the request params
    const foundOrder = orders.find((order) => order.id === orderId);

    // If the order is found, set the res.locals.order and return
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }

    // If the order is not found, return a 404
    next({
      status: 404,
      message: `Order id not found: ${req.params.orderId}`,
    });
}

// Read function returns the order in the response if found in orderExists function
function read(req, res) {
    res.json({ data: res.locals.order });
}

// Update function updates the dish if found in dishExists function
function update(req, res, next) {
    // Grab the order ID from the request parameters
    const orderId = req.params.orderId;

    // Grab the order from the res.locals that was set in orderExists
    const order = res.locals.order;

    // Grab the updated order data from the request body
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    // Validation checks
    // Check if the IDs from the request and data file exist and make sure they match
    if ((orderId && id) && (orderId !== id)) {
        return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}` });
    }
    
    // Check if deliverTo is missing or empty
    if(!deliverTo || deliverTo == "") {
        return next({ status: 400, message: 'Order must include a deliverTo' });
    }
    
    // Check if mobileNumber is missing or empty
    if (!mobileNumber || mobileNumber == "") {
        return next ({ status: 400, message: 'Order must include a mobileNumber' });
    }
    
    // Check if status is missing or empty
    if (!status || status == "") {
        return next({ status: 400, message: 'Order must have a status of pending, preparing, out-for-delivery, delivered' });
    }
    
    // If the status is anything other than pending, preparing, or out-for-delivery send an error message
    if (status !== 'pending' && status !== 'preparing' && status !== 'out-for-delivery') {
        return next({ status: 400, message: 'Order must have a status of pending, preparing, out-for-delivery, delivered' });
    }

    // If the status is delivered throw an error message that it cannot be changed
    if (status === 'delivered') {
        return next({ status: 400, message: 'A delivered order cannot be changed' });
    }

    // Check if the dishes exist
    if (!dishes) {
        return next ({ status: 400, message: 'Order must include a dish' });
    }

    // Check if dishes is an array, and is not empty
    if (!Array.isArray(dishes) || dishes.length == 0) {
        return next ({ status: 400, message: 'Order must include at least one dish' });
    }

    // Iterate through the dishes to check their quantity
    for ( let index = 0; index < dishes.length; index++) {
        // Make sure the quantity for each dish exists, is > 0, and is a number
        if (!dishes[index].quantity || dishes[index].quantity <= 0 || typeof dishes[index].quantity !== 'number') {
            return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
        }
    }

    // Update the order object
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    // Return the updated order object
    res.json({ data: order });
}

// Function to destroy (delete) or order
function destroy(req, res, next) {
    // Grab the order ID from the request parameters
    const orderId = req.params.orderId;

    // Find index of order using findIndex and orderId
    const index = orders.findIndex((order) => order.id === orderId);

    // Get the order from res.locals.order so we can check the status
    const order = res.locals.order;

    // If the order status is not pending we cannot delete it
    if (order.status !== 'pending') {
        return next({ status: 400, message: 'An order cannot be deleted unless it is pending' });
    }

    // Delete the order
    if (index > -1) {
      orders.splice(index, 1);
    }

    // Send 204 response code on successful deletion
    res.sendStatus(204);
}

// Export the functions
module.exports = {
    list,
    create,
    read: [orderExists, read],
    update: [orderExists, update],
    delete: [orderExists, destroy]
  };