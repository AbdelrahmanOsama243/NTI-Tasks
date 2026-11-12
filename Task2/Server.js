const express = require('express');
const Products = require('./Routes');
const PORT = 3000;
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to the Product API');
});
app.use('/api', Products);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}/api`);
});
