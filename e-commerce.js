class Shippaple{
    getName() {}
    getWeight() {}
}

class Product {
    constructor(name, price, quantity){
        this.name = name; 
        this.price = price;
        this.quantity = quantity;
        this.expired= false;
        this.shippaple = false;
        this.weight =0;
    }
    getName() {
        return this.name;
    }

    getWeight() {
        return this.weight;
    }
}

class ExpiredProduct extends Product{
    constructor(name, price, quantity, expirydate){
        super(name, price, quantity);
        this.expirydate = expirydate;
    }

    isExpired(){
        const today = new Date();
        return today > this.expirydate;
    }
}

class ShippapleProduct extends Product{
    constructor(name, price, quantity, weight){
        super(name, price, quantity);
        this.shippaple = true;
        this.weight = weight;
    }
}

class CartItem{
    constructor(product, quantity){
        this.product = product;
        this.quantity = quantity;
    }
    
    getTotalPrice() {
        return this.product.price * this.quantity;
    }
    getTotalWeight(){
        if(this.product.shippaple){
            return this.product.weight * this.quantity;
        }
        else{
            return 0;
        }
    }
}

class Cart {
    constructor(){
        this.items=[];
    }
    add(product, quantity){
        if(quantity <=0){
            throw new Error ("Quantity must be greater than zero");
        }

        if(product.quantity < quantity){
            throw new Error (`Not enough stock available for ${product.name}`);
        }

        if(product instanceof ExpiredProduct && product.isExpired()){
            throw new Error (`Product ${product.name} is expired and cannot be added to the cart`);
        }

        const alreadyInCart = this.items.find(item => item.product === product); 
        if(alreadyInCart){
            alreadyInCart.quantity += quantity;
        } else {
            this.items.push(new CartItem(product, quantity));
        }
        product.quantity -= quantity;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    CalculateShipping(){
        const ShippableItems = this.items.filter(item => item.product.shippaple);
        if(ShippableItems.length === 0){
            return 0;
        }
        else{
            return 30;
        }
    }
}

class Customer{
    constructor(name, balance){
        this.name = name;
        this.balance = balance;
    }

    bought(amount){
        if(this.balance < amount){
            throw new Error("Insufficient balance");
        }
        else{
            this.balance -= amount;
        }
    }
}

class ShippingService{
    static ship(items){
        console.log("- * Shipment notice **");
        let totalWeight = 0;
        items.forEach(item => {
            console.log(`${item.quantity} x ${item.product.getName()}         ${(item.getTotalWeight()*1000).toFixed(0)}g`);
            totalWeight += item.product.getWeight() * item.quantity;
        });
        console.log(`Total package weight ${(totalWeight).toFixed(1)}kg\n`);
    }
}

function CheckoutService (cart, customer) {
    if(cart.isEmpty()){
        throw new Error("Cart is empty");
    }

    const subtotal = cart.getSubtotal();
    const shippingCost = cart.CalculateShipping();
    const amount = subtotal + shippingCost;

    if(customer.balance < amount){
        throw new Error("Insufficient balance");
    }

    const shippableItems = cart.items.filter(item => item.product.shippaple);
    if(shippableItems.length > 0){
        ShippingService.ship(shippableItems);
    }

    customer.bought(amount);

    console.log("- * Checkout Receipt **");
    cart.items.forEach(item => {
        console.log(`${item.quantity} x ${item.product.getName()}         ${item.product.price* item.quantity}`);
    });
    console.log("---------------------------------");
    console.log(`Subtotal          ${subtotal}`);
    console.log(`Shipping          ${shippingCost}`);
    console.log(`Amount            ${amount}`);
}

function main(){
    const customer = new Customer("Nada Abdallah", 1000);

    const cheese = new ShippapleProduct("Cheese", 100, 5, 0.2);
    const biscuits = new ShippapleProduct("Biscuits", 150, 2, 0.7);
    const scratchCard = new Product("Mobile Scratch Card", 50, 10);
    const expiredMilk = new ExpiredProduct("Milk", 50, 1, new Date("2023-01-01"));

    const cart = new Cart();
    cart.add(cheese, 2);
    cart.add(biscuits, 1);
    cart.add(scratchCard, 1);
    //cart.add(expiredMilk, 1); // expired product, will throw an error

    CheckoutService(cart, customer);
}

main();