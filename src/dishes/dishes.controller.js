const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// Return a list of all dishes 
function list(req, res) {
    res.json({data: dishes});
}

// Create a new dish
function create(req, res, next) {

    // Grab the data from the request body
    const { data: { name, description, price, image_url } = {} } = req.body;
    
    // Check if the name is missing or empty
    if(!name || name == "") {
        return next({ status: 400, message: 'Dish must include a name' });
    }
    
    // Check if the description is missing or empty
    if (!description || description == "") {
        return next ({ status: 400, message: 'Dish must include a description' });
    }
    
    // Check if the price is missing, 0 or less, or not a number
    if (!price || price <= 0 || typeof price !== 'number') {
        return next ({ status: 400, message: 'Dish must include a price that is a number greater than 0' });
    }

    // Check if the image_url is missing or empty
    if (!image_url || image_url == "") {
        return next({ status: 400, message: 'Dish must include a image_url' });
    }

    // Format the new dish object
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url
    };

    // Push the new dish object to dishes data
    dishes.push(newDish);

    // Return a 201 status to the client along with the new dish object that was written
    res.status(201).json({ data: newDish });
}

// Function to check if the dish exists
function dishExists(req, res, next) {
    // Grab the dish ID from the request parameters
    const dishId = req.params.dishId;

    // Find the dish in the data with the matching id
    const foundDish = dishes.find((dish) => dish.id === dishId);

    // If the dish is found, set the res.locals.dish and return
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }

    // If the dish is not found, return a 404 response and message
    next({
      status: 404,
      message: `Dish id not found: ${req.params.dishId}`,
    });
}

// Read function returns the dish in the response if found in dishExists function
function read(req, res) {
    res.json({ data: res.locals.dish });
}

// Update function updates the dish in the data if found in dishExists function
function update(req, res, next) {
    // Grab the dishId from the request parameters
    const dishId = req.params.dishId;

    // Grab the dish from the res.locals that was set in dishExists
    const dish = res.locals.dish;

    // Grab the updated dish data from the request body
    const { data: { id, name, description, price, image_url } = {} } = req.body;

    // Validation checks
    // Check if the IDs from the request and data file exist and make sure they match
    if ((dishId && id) && (dishId !== id)) {
        return next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` });
    }
    
    // Check if the name is missing or empty
    if(!name || name == "") {
        return next({ status: 400, message: 'Dish must include a name' });
    }
    
    // Check if the description is missing or empty
    if (!description || description == "") {
        return next ({ status: 400, message: 'Dish must include a description' });
    }
    
    // Check if the price is missing, 0 or less, or not a number
    if (!price || price <= 0 || typeof price !== 'number') {
        return next ({ status: 400, message: 'Dish must include a price that is a number greater than 0' });
    }

    // Check if the image_url is missing or empty
    if (!image_url || image_url == "") {
        return next({ status: 400, message: 'Dish must include a image_url' });
    }

    // Update the dish object with the new data
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    // Return the updated dish object
    res.json({ data: dish });
}

// Export the functions
module.exports = {
    list,
    create,
    read: [dishExists, read],
    update: [dishExists, update]
  };
  