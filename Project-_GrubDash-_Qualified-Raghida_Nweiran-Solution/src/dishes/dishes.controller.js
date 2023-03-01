const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Create & helper functions 
function bodyHasDescription(req, res, next){
    const { data: { description } = {} } = req.body;
    if(!!description && description !== "") return next();
    next({
        status: 400,
        message: "Dish must include a description."
    });
};
function bodyHasName(req, res, next){
    const { data: { name } = {} } = req.body;
    if(!!name && name !== "") return next();
    next({
        status: 400,
        message: "Dish must include a name."
    });
};
function bodyHasPrice(req, res, next){
    const { data: { price } = {} } = req.body;
    if(!!price) return next();
    next({
        status: 400,
        message: "Dish must include a price."
    });
};
function priceIsValid(req, res, next){
    const { data: { price } = {} } = req.body;
    if((parseInt(price) > 0) && (typeof(price) === "number")) return next();
    next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0."
    });
};
const bodyHasImageUrl = (req, res, next) => {
    const { data: { image_url } = {} } = req.body;
    if(!!image_url && image_url !== "") return next();
    next({
        status: 400,
        message: "Dish must include a image_url."
    });
};

function create(req, res, next){
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

// Dish Exists middleware function
function dishExists(req, res, next){
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if(!!foundDish){
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found ${dishId}`,
    });
};

// List function
function list(req, res){
    res.json({ data: dishes })
};

// Read
function read(req, res){
    res.json({ data: res.locals.dish });
};

// Update
function update(req, res, next){
    const { data: { name, description, price, image_url } = {} } = req.body;
    const dish = res.locals.dish;
    const origName = dish.name;
    const origDescription = dish.description;
    const origPrice = dish.price;
    const origImageUrl = dish.image_url;
    if
    (
        origName !== name || 
        origDescription !== description || 
        origPrice !== parseInt(price) ||
        origImageUrl !== image_url
    ) {
        dish.name = name;            
        dish.description = description;
        dish.price = price;
        dish.image_url = image_url;
    }
    res.json({ data: dish });
};

function validateId(req, res, next){
    const { data: { id } = {} } = req.body;
    const { dishId } = req.params;
    if(!id || id === dishId){
        res.locals.dishId = dishId;
        return next();
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
}

module.exports = {
    create: [
        bodyHasName, 
        bodyHasDescription, 
        bodyHasPrice, 
        priceIsValid, 
        bodyHasImageUrl, 
        create
    ],
    list,
    read : [dishExists, read],
    update: [
        dishExists,
        bodyHasName,
        bodyHasDescription,
        bodyHasPrice,
        priceIsValid,
        bodyHasImageUrl, 
        validateId,
        update
    ],
};