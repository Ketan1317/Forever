import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// GateWay Initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Global variables
const currency = "usd";
const deliveryCharge = 10;

// Placing order using COD method
const placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { items, amount, address } = req.body;

        if (!items || !amount || !address) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const newOrder = await orderModel.create({
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
        }); // create the order in db

        await userModel.findByIdAndUpdate(userId, { cartData: {} }); // Reset the Cart after Placing the order

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Placing order using Stripe method
const placeOrderStripe = async (req, res) => {
    try {
        console.log("I am in Stripe")
        const userId = req.user._id;
        const { items, amount, address } = req.body;

        const { origin } = req.headers;

        const newOrder = await orderModel.create({
            userId,
            items,
            amount,
            address,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now(),
        });



        const line_items = items.map((item) => ({ // It is an array describing what the customer is buying.
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100,  // Amounts are in the smallest unit of the currency (e.g., cents for USD, so $10.50 is 1050)
            },
            quantity: item.quantity,
        }));
        console.log("Line items created")


        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charges",
                },
                unit_amount: deliveryCharge * 100,
            },
            quantity: 1,
        });
        console.log("Pushed")


        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,  //Where the customer goes after a successful payment
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`, //Where the customer goes if they cancel
            line_items, //The products and delivery charge.
            mode: "payment", // It indicates One-time Payment
            locale: "auto", // Ensure proper localization
        });
        console.log("session created :", session.url)

        res.json({ success: true, session_url: session.url });
        // The frontend redirects the user to session.url, where Stripe displays a payment form.
        // Customer Pays:
        // The customer enters their card details or uses a digital wallet. Stripe processes the payment.

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  try {
    const { orderId, success } = req.query; // Use req.query instead of req.body
    if (success === "true") {
      const userId = req.user._id;
      await orderModel.findByIdAndUpdate(orderId, { payment: true }, { new: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Placing order using Razorpay method
const placeOrderRazorpay = async (req, res) => { };

// All orders Data for admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// All orders Data for fuckin user
const userOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await orderModel.find({ userId });
        // if there are not prev orders
        if (!orders || orders.length === 0) {
            return res.json({ success: true, orders: [] });
        }

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Get user orders error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update the Order Status from admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!updatedOrder) {
            return res.json({ success: false, message: "Order not found" });
        }
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.error("Get user orders error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

export {
    allOrders,
    placeOrder,
    updateStatus,
    userOrders,
    placeOrderRazorpay,
    placeOrderStripe,
    verifyStripe,
};