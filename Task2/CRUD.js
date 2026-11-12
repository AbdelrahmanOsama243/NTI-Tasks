const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'data.json');
let products = [];

function readProductsFromFile() {
    const data = fs.readFileSync(filePath, 'utf8');
    products = JSON.parse(data);
    return products;
}

function readProductById(id) {
    const productId = parseInt(id);
    const product = products.find(p => p.id === productId);
    return product || null;
}

function writeProductById(id, updatedProduct) {
    const productId = parseInt(id);
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex] = { id: productId, ...updatedProduct };
        writeProductsToFile(products);
        return products[productIndex];
    }
    return !Boolean(fs.existsSync(filePath));
}

function writeProductsToFile(list) {
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
    return Boolean(fs.existsSync(filePath));
}

module.exports = {
    readProductsFromFile,
    readProductById,
    writeProductById,
    writeProductsToFile
};