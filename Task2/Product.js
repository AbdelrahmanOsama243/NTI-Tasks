class product {
    constructor(id, title, price, description, category, image='', rating=0) {
        {
            this.id = id;
            this.title = title;
            this.price = price;
            this.description = description;
            this.category = category;
            this.image = image;
            this.rating = rating;
        }
    }
}
module.exports = product;