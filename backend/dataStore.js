const users = [];
let userIdCounter = 1;
const products = [
    { id: 1, name: 'Laptop', quantity: 50, price: 1200 },
    { id: 2, name: 'Mouse', quantity: 200, price: 25 },
    { id: 3, name: 'Keyboard', quantity: 150, price: 75 }
];
let productIdCounter = 4;
const sales = [];
let saleIdCounter = 1;
module.exports = {
    users,
    userIdCounter,
    products,
    productIdCounter,
    sales,
    saleIdCounter
};
