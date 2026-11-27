import { slugify } from "../utils/slugify.js";

const u = (id, w = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const cat = (name, description, id, type = "category", order = 0) => ({ name, slug: slugify(name), type, description, image: id ? u(id) : "", active: true, order });

export const categories = [
  cat("Men", "Everyday fits in earthy tones", "photo-1503342217505-b0a15ec3261c", "category", 1),
  cat("Women", "Soft layers, sharp lines", "photo-1490481651871-ab68de25d43d", "category", 2),
  cat("Outerwear", "Jackets built for cold evenings", "photo-1551028719-00167b16eac5", "category", 3),
  cat("Essentials", "Tees and basics you wear on repeat", "photo-1521572163474-6864f9cf17ab", "category", 4),
  cat("Autumn Edit", "Layers for cooler days", "", "collection", 1),
];

const desc = (n) => `${n} is cut for a relaxed fit and finished with soft, breathable fabric. It pairs easily with the rest of the olive range and keeps its shape after repeated washes.`;
const P = (name, category, price, tag, id, fabric = "100% organic cotton", collectionName = "") => ({
  name, category, price, tag, img: u(id), fabric, collectionName, description: desc(name),
  sizes: ["S", "M", "L", "XL"],
  colors: [{ name: "Olive", hex: "#6b7f3a" }, { name: "Charcoal", hex: "#1f2418" }, { name: "Sand", hex: "#d9d2b6" }],
});

export const products = [
  P("Moss Oversized Hoodie", "Men", 2499, "New", "photo-1503342217505-b0a15ec3261c", undefined, "Autumn Edit"),
  P("Sage Linen Shirt", "Women", 1899, "Bestseller", "photo-1434389677669-e08b4cac3105"),
  P("Field Utility Jacket", "Outerwear", 4999, "New", "photo-1551028719-00167b16eac5", "Water-resistant cotton blend", "Autumn Edit"),
  P("Classic White Tee", "Essentials", 899, "", "photo-1521572163474-6864f9cf17ab"),
  P("Everyday Denim", "Men", 2799, "", "photo-1542272604-787c3835535d"),
  P("Garden Party Dress", "Women", 3299, "Limited", "photo-1445205170230-053b83016050"),
  P("Street Layer Set", "Women", 3799, "", "photo-1512436991641-6745cdb1723f"),
  P("Trail Shell Coat", "Outerwear", 5499, "Bestseller", "photo-1523398002811-999ca8dec234", "Water-resistant cotton blend"),
];

const page = (type, key, title, subtitle, items, order = 0) => ({ type, key, title, subtitle, items, published: true, order });

export const content = [
  page("home", "hero", "Wear the colour of calm.", "Olive-toned layers, soft fabrics and clean cuts. New season pieces are in."),
  page("home", "features", "Why shop with us", "", [
    { icon: "bi-truck", title: "Free shipping", text: "On every order above ₹1,999." },
    { icon: "bi-arrow-repeat", title: "30-day returns", text: "Does not fit? Send it back, no questions." },
    { icon: "bi-flower1", title: "Organic fabrics", text: "Cotton and linen from certified farms." },
    { icon: "bi-shield-check", title: "Secure payment", text: "UPI, cards and cash on delivery." },
  ]),
  { ...page("home", "banner", "Get 15% off your first order", "Join the list for drops, restocks and early sales."), image: u("photo-1441986300917-64674bd600d8", 1600) },

  page("policy", "terms", "Terms & Conditions", "The rules for using Olive Wear and buying from us.", [
    { title: "Using this website", text: "By browsing or buying from Olive Wear you agree to these terms. You must be 18 or older, or have a parent or guardian's permission, to place an order." },
    { title: "Orders and pricing", text: "Prices are in Indian rupees and include GST. We may cancel an order if an item is out of stock or a price was listed in error, and you will get a full refund." },
    { title: "Payments", text: "Payments are processed by secure third-party gateways. We never store your full card details." },
    { title: "Shipping and delivery", text: "Delivery dates are estimates. Delays caused by couriers, weather or incorrect addresses are outside our control." },
    { title: "Returns and refunds", text: "You can return unworn items with tags within 30 days of delivery. Innerwear and sale items marked final cannot be returned." },
    { title: "Content and ownership", text: "All photos, text and designs on this site belong to Olive Wear. Please do not copy or reuse them without written permission." },
    { title: "Changes to these terms", text: "We may update these terms from time to time. The date at the top of this page shows the latest version." },
  ], 1),
  page("policy", "privacy", "Privacy Policy", "What we collect, why we collect it and how you stay in control.", [
    { title: "What we collect", text: "Your name, email, phone number, delivery address and order history. We also collect basic device and browsing data to keep the site working." },
    { title: "How we use it", text: "To process orders, send delivery updates, answer your questions and improve our products. We send offers only if you subscribe." },
    { title: "Who we share it with", text: "Couriers, payment gateways and support tools, only as much as they need to do their job. We never sell your data." },
    { title: "Cookies", text: "We use cookies to remember your cart and understand how people use the site. You can turn them off in your browser settings." },
    { title: "Your choices", text: "You can ask to see, correct or delete your data at any time by emailing us. You can unsubscribe from marketing mail with one click." },
    { title: "Security", text: "We use encrypted connections and limit access to personal data. No system is perfectly secure, so we also encourage strong passwords." },
    { title: "Contact us", text: "Questions about privacy? Write to privacy@olivewear.com and we will reply within 3 working days." },
  ], 2),
  page("policy", "shipping", "Shipping Policy", "How and when your order reaches you.", [
    { title: "Processing time", text: "Orders are packed and shipped within 24 hours on working days." },
    { title: "Delivery time", text: "Metro cities receive orders in 2-4 days. The rest of India takes 4-7 days." },
    { title: "Shipping charges", text: "Shipping is free on orders above ₹1,999. Below that, a flat fee of ₹79 applies." },
    { title: "Tracking", text: "We email and text a tracking link as soon as your order ships." },
  ], 3),
  page("policy", "returns", "Returns & Refunds", "Easy returns within 30 days.", [
    { title: "Return window", text: "You can return an item within 30 days of delivery if it is unworn and has its tags." },
    { title: "How to return", text: "Start a return from your order page. Pickup from your address is free." },
    { title: "Refunds", text: "Refunds reach your original payment method within 5-7 working days after we receive the item." },
    { title: "Exchanges", text: "Need another size? Choose exchange while returning and we will ship the new size at no cost." },
  ], 4),

  page("sizeguide", "size-guide", "Size guide", "All measurements are in inches. If you are between sizes, pick the larger one for a relaxed fit.", [
    { title: "T-shirts and shirts (chest)", text: "S: 36-38 | M: 38-40 | L: 40-42 | XL: 42-44" },
    { title: "Hoodies and jackets (chest)", text: "S: 38-40 | M: 40-42 | L: 42-44 | XL: 44-46" },
    { title: "Jeans (waist)", text: "S: 28-30 | M: 30-32 | L: 32-34 | XL: 34-36" },
    { title: "How to measure", text: "Wrap a soft tape around the fullest part of your chest or the narrowest part of your waist. Keep it snug but not tight." },
  ]),

  { ...page("lookbook", "autumn-edit", "Autumn Edit", "Layers, linen and olive tones for cooler days.", [
    { title: "Moss on moss", text: "Oversized hoodie with relaxed denim.", image: u("photo-1503342217505-b0a15ec3261c") },
    { title: "Field day", text: "Utility jacket over a plain white tee.", image: u("photo-1551028719-00167b16eac5") },
    { title: "Garden walk", text: "Soft dress with a linen layer.", image: u("photo-1445205170230-053b83016050") },
  ]), image: u("photo-1490481651871-ab68de25d43d", 1200) },
];
