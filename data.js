// Facts about the restaurant. Change these for each client.

const SHOP_TZ = "America/Chicago";

const HOURS = {
    Monday: [7, 15],
    Tuesday: [7, 15],
    Wednesday: [7, 15],
    Thursday: [7, 15],
    Friday: [7, 15],
    Saturday: [8, 16],
    Sunday: [8, 16]
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SHOP = {
    name: "Zay's Dine",
    phone: "(555) 123-4567",
    email: "hello@example.com",
    address: "123 Main Street, Round Rock, TX",
    hoursText: "Mon to Fri 7 AM to 3 PM, Sat and Sun 8 AM to 4 PM.",
    services: []
};
// Sample menu. Names, prices and labels are placeholders for the demo.
// For a real client, every ingredient and dietary label must come from the restaurant.
const MENU = [
    {
        name: "Honey Oat Latte", category: "Coffee", price: 5.5, hot: true, tags: ["vegetarian"],
        desc: "Double espresso, steamed oat milk, and a drizzle of honey.",
        details: "Espresso, oat milk, honey, a pinch of cinnamon."
    },
    {
        name: "Flat White", category: "Coffee", price: 4.75, hot: true, tags: ["vegetarian"],
        desc: "Velvety microfoam over a double shot.",
        details: "Espresso, steamed whole milk."
    },
    {
        name: "Cardamom Mocha", category: "Coffee", price: 5.75, hot: true, tags: ["vegetarian"],
        desc: "Dark chocolate, espresso, and warm cardamom.",
        details: "Espresso, chocolate, steamed milk, cardamom."
    },

    {
        name: "Avocado Toast", category: "Brunch", price: 12, hot: true, tags: ["vegetarian"],
        desc: "Sourdough, smashed avocado, and a soft poached egg.",
        details: "Sourdough, avocado, egg, lemon, chilli flakes."
    },
    {
        name: "Shakshuka", category: "Brunch", price: 13, hot: true, tags: ["vegetarian", "spicy"],
        desc: "Eggs baked in a spiced tomato and pepper sauce.",
        details: "Eggs, tomato, peppers, cumin, paprika, bread to share."
    },
    {
        name: "Chilli Honey Chicken and Waffle", category: "Brunch", price: 14.5, hot: true, tags: ["spicy"],
        desc: "Crispy chicken on a golden waffle with chilli honey.",
        details: "Chicken, waffle, chilli honey, butter."
    },
    {
        name: "Smoked Salmon Bagel", category: "Brunch", price: 13.5, hot: false, tags: [],
        desc: "Cream cheese, smoked salmon, capers, and red onion.",
        details: "Bagel, cream cheese, salmon, capers, red onion."
    },

    {
        name: "Butter Croissant", category: "Pastries", price: 3.75, hot: false, tags: ["vegetarian"],
        desc: "Flaky, buttery, and baked fresh each morning.",
        details: "Flour, butter, yeast, milk."
    },
    {
        name: "Cinnamon Roll", category: "Pastries", price: 4.5, hot: true, tags: ["vegetarian"],
        desc: "Warm, soft, and glazed with cream cheese icing.",
        details: "Flour, butter, cinnamon, sugar, cream cheese icing."
    },
    {
        name: "Lemon Tart", category: "Pastries", price: 5, hot: false, tags: ["vegetarian"],
        desc: "Sharp lemon curd in a crisp shortcrust shell.",
        details: "Flour, butter, lemon, eggs, sugar."
    },

    {
        name: "Iced Vanilla Latte", category: "Cold Drinks", price: 5.5, hot: false, tags: ["vegetarian"],
        desc: "Espresso, cold milk, and vanilla over ice.",
        details: "Espresso, milk, vanilla syrup, ice."
    },
    {
        name: "Cold Brew", category: "Cold Drinks", price: 4.5, hot: false, tags: ["vegetarian"],
        desc: "Slow-steeped for 16 hours. Smooth and strong.",
        details: "Coffee, filtered water, ice."
    }
];
// One special per day. "dish" must match a dish name in MENU exactly. Sample prices.
const SPECIALS = {
    Monday: { dish: "Flat White", deal: 4.0 },
    Tuesday: { dish: "Avocado Toast", deal: 10.5 },
    Wednesday: { dish: "Cardamom Mocha", deal: 4.75 },
    Thursday: { dish: "Butter Croissant", deal: 3.0 },
    Friday: { dish: "Iced Vanilla Latte", deal: 4.5 },
    Saturday: { dish: "Shakshuka", deal: 11.5 },
    Sunday: { dish: "Cinnamon Roll", deal: 3.75 }
};
// Words that mean each menu category in the chat assistant.
const CATEGORY_KEYS = {
    "Coffee": ["coffee", "espresso"],
    "Brunch": ["brunch", "breakfast", "eggs"],
    "Pastries": ["pastr", "bakery", "sweet", "dessert"],
    "Cold Drinks": ["cold drink", "iced", "drinks"]
};