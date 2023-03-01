const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");


// Create and helper functions
function bodyHasDeliverTo(req, res, next){
    const { data: { deliverTo } = {} } = req.body;
    if(!!deliverTo && deliverTo !== "") return next();
    next({
        status: 400,
        message: "Order must include a deliverTo."
    });
};
function bodyHasMobileNumber(req, res, next){
    const { data: { mobileNumber } = {} } = req.body;
    if(!!mobileNumber && mobileNumber !== "") return next();
    next({
        status: 400,
        message: "Order must include a mobileNumber."
    });
};
function bodyHasDishes(req, res, next){
    const { data: { dishes } = {} } = req.body;
    if(!!dishes) return next();
    next({
        status: 400,
        message: "Order must include a dish."
    });
};
function dishesPropertyIsValid(req, res, next){
    const { data: { dishes } = {} } = req.body;
    if(Array.isArray(dishes) && dishes.length !== 0) return next();
    next({
        status: 400,
        message: "Order must include at least one dish."
    });
};
function dishesHaveQuantity(req, res, next){
    const { data: { dishes } = {} } = req.body;
    for(let index = 0; index < dishes.length; index++){
        if(!dishes[index].quantity || dishes[index].quantity <= 0 || !Number.isInteger(dishes[index].quantity)){
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
            })
        }
    }
    next();
};

function create(req, res, next){
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes,
        status: "pending"
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

function destroy(req, res, next){
    const { orderId } = req.params;
    const index = orders.findIndex(order => order.id === orderId);
    if(res.locals.order.status !== "pending") {
        return next({ status: 400, message: "An order cannot be deleted unless it is pending."});
    }
    orders.splice(index, 1);
    res.sendStatus(204);
};

function list(req, res){
    res.json({ data: orders });
};

// Order Exists middleware function
function orderExists(req, res, next){
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if(!!foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found ${orderId}`
    });
};

// Read
function read(req, res){
    res.json({ data: res.locals.order })
};

// Update and helper functions
function update(req, res, next){
    const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
    const order = res.locals.order;
    const origDeliverTo = order.deliverTo;
    const origMobileNumber = order.mobileNumber;
    const origDishes = order.dishes;
    const origStatus = order.status;
    if
    (
        origDeliverTo !== deliverTo ||
        origMobileNumber !== mobileNumber ||
        origDishes !== dishes ||
        origStatus !== status
    ) {
        order.deliverTo = deliverTo;
        order.mobileNumber = mobileNumber;
        order.dishes = dishes;
        order.status = status;
    }
    res.json({ data: order });
};

function validateId(req, res, next){
    const { data: { id } = {} } = req.body;
    const { orderId } = req.params;
    if(!id || id === orderId){
        res.locals.orderId = orderId;
        return next();
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
};
function validateStatus(req, res, next){
    const { data: { status } = {} } = req.body;
    if( !status || status === "" || (status !== "pending" && status !== "preparing" && status !== "out-for-delivery")) {
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
        });
    } else if( status === "delivered" ){
        return next({
            status: 400,
            message: "A delivered order cannot be changed."
        });
    }
    next();
};

module.exports = {
    create: [
        bodyHasDeliverTo, 
        bodyHasMobileNumber,
        bodyHasDishes,
        dishesPropertyIsValid,
        dishesHaveQuantity,
        create
    ],
    delete: [orderExists, destroy],
    list,
    read: [orderExists, read],
    update: [
        orderExists,
        bodyHasDeliverTo,
        bodyHasMobileNumber,
        bodyHasDishes,
        dishesPropertyIsValid,
        dishesHaveQuantity,
        validateId,
        validateStatus,
        update,
    ],
}

