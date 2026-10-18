export type Dress = {
  id: number;
  name: string;
  price: number;
  image: string;
  categories: string[];
};

export const categories = [
  "All Dresses",
  "Wedding Wear",
  "Maxis & Gowns",
  "Formal Wear",
  "Ready to Wear",
  "Unstitched",
  "Winter Collection",
  "Summer Collection",
  "Embroidered Wear",
  "Festive Wear",
];

export const ORDER_SIZES = ["S", "M", "L", "XL"] as const;

const prices = [
  8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500,
  4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500,
  10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500,
  12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500,
  25000, 25500, 26000, 26500, 27000, 27500,
  10000, 10500, 11000, 11500, 12000, 12500,
];

const productNames = [
  "Magenta Embroidered Straight Suit",
  "Deep Blue Embroidered Sharara Suit",
  "Teal Ombre Embroidered Long Shirt",
  "Ivory Fine Embroidered Long Shirt",
  "Taupe Embroidered Straight Shirt",
  "Black and Silver Embroidered Gown",
  "Ivory Gold Embroidered Bridal Gown",
  "Lavender Floral Embroidered Suit",
  "Slate Blue Embroidered Gown",
  "Ivory Floral Embroidered Long Shirt",
  "Pastel Floral Long Shirt with Dupatta",
  "Plum Embroidered Girls’ Suit",
  "Pale Blue Embroidered Long Shirt",
  "Mustard Printed Tunic and Trouser Set",
  "Deep Teal Straight Suit",
  "Blush Pink Embroidered Long Gown",
  "Black Embellished Flared Gown",
  "Ivory Bridal Gown",
  "Ivory Printed Shirt and Trouser Set",
  "Rust Embroidered Shirt and Trouser Set",
  "Ivory and Black Embroidered Suit",
  "Chocolate Embroidered Suit",
  "Black and White Embroidered Lehenga",
  "Burgundy Embroidered Gown",
  "Dusty Rose Embroidered Long Shirt",
  "Plum Embroidered Suit with Dupatta",
  "Sage Grey Embroidered Long Shirt",
  "Olive Green Draped Gown",
  "Aqua Suit with Embroidered Waistcoat",
  "Ivory Embroidered Anarkali Gown",
  "Champagne Embroidered Long Shirt",
  "Black Suit with Patterned Shawl",
  "Mustard Tunic and Trouser Set",
  "Powder Blue Shirt and Trouser Set",
  "Pastel Floral Shirt with Dupatta",
  "Purple Embellished Long Shirt with Dupatta",
  "Pink Printed Maxi Dress",
  "Ivory Floral Embroidered Shirt",
  "Ivory Gold Embroidered Formal Suit",
  "Yellow Embroidered Shirt with Printed Trousers",
  "Blue and White Printed Tunic with Dupatta",
  "Navy Embroidered Suit with Shawl",
  "Rose Embroidered Suit with Dupatta",
  "Sage Floral Printed Maxi Dress",
];

const productCategories: Record<number, string[]> = {
  1: ["Ready to Wear", "Embroidered Wear", "Summer Collection", "Festive Wear"],
  2: ["Ready to Wear", "Embroidered Wear", "Festive Wear"],
  3: ["Ready to Wear", "Embroidered Wear"],
  4: ["Formal Wear", "Embroidered Wear"],
  5: ["Ready to Wear", "Embroidered Wear"],
  6: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns", "Festive Wear"],
  7: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns"],
  8: ["Ready to Wear", "Embroidered Wear", "Summer Collection"],
  9: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns"],
  10: ["Ready to Wear", "Embroidered Wear"],
  11: ["Ready to Wear", "Maxis & Gowns", "Summer Collection"],
  12: ["Ready to Wear"],
  13: ["Ready to Wear", "Embroidered Wear", "Summer Collection"],
  14: ["Ready to Wear", "Summer Collection", "Festive Wear"],
  15: ["Ready to Wear", "Summer Collection"],
  16: ["Formal Wear", "Embroidered Wear", "Maxis & Gowns", "Festive Wear"],
  17: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns", "Festive Wear"],
  18: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns"],
  19: ["Ready to Wear", "Embroidered Wear"],
  20: ["Ready to Wear", "Embroidered Wear"],
  21: ["Ready to Wear", "Embroidered Wear"],
  22: ["Ready to Wear", "Embroidered Wear", "Winter Collection"],
  23: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns", "Festive Wear"],
  24: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns", "Festive Wear"],
  25: ["Formal Wear", "Embroidered Wear"],
  26: ["Ready to Wear", "Embroidered Wear", "Festive Wear"],
  27: ["Formal Wear", "Embroidered Wear"],
  28: ["Formal Wear", "Embroidered Wear", "Maxis & Gowns", "Festive Wear"],
  29: ["Ready to Wear", "Embroidered Wear"],
  30: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns"],
  31: ["Ready to Wear", "Embroidered Wear", "Formal Wear"],
  32: ["Ready to Wear", "Winter Collection"],
  33: ["Ready to Wear", "Festive Wear"],
  34: ["Ready to Wear", "Summer Collection"],
  35: ["Ready to Wear", "Embroidered Wear", "Summer Collection"],
  36: ["Ready to Wear"],
  37: ["Ready to Wear", "Maxis & Gowns", "Summer Collection"],
  38: ["Ready to Wear", "Embroidered Wear", "Summer Collection"],
  39: ["Wedding Wear", "Formal Wear", "Embroidered Wear", "Maxis & Gowns", "Festive Wear"],
  40: ["Ready to Wear", "Summer Collection", "Festive Wear"],
  41: ["Ready to Wear", "Embroidered Wear", "Summer Collection"],
  42: ["Ready to Wear", "Embroidered Wear", "Winter Collection"],
  43: ["Ready to Wear", "Embroidered Wear", "Festive Wear"],
  44: ["Ready to Wear", "Maxis & Gowns", "Summer Collection"],
};

const specialImages: Record<number, string> = {
  6: "/suit6..jpg",
  7: "/suit7..jpg",
  12: "/suit12..jpg",
  13: "/suit13..jpg",
  14: "/suit14..jpg",
  15: "/suit15..jpg",
  20: "/suit20..jpg",
};

export const dresses: Dress[] = Array.from({ length: 44 }, (_, index) => {
  const id = index + 1;

  return {
    id,
    name: productNames[index],
    price: prices[index],
    image: specialImages[id] || `/suit${id}.jpg`,
    categories: productCategories[id] ?? ["Ready to Wear"],
  };
});
