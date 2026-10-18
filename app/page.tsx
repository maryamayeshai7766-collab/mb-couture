

"use client";

import { useMemo, useState } from "react";

type Dress = {
  id: number;
  name: string;
  price: number;
  image: string;
  categories: string[];
};

const categories = [
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

const prices = [
  8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500,
  4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500,
  10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500,
  12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500,
  25000, 25500, 26000, 26500, 27000, 27500,
  10000, 10500, 11000, 11500, 12000, 12500,
];

// Categories are based on the visible style and silhouette in each local photo.
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

function getCategories(id: number): string[] {
  return productCategories[id] ?? ["Ready to Wear"];
}

// Kuch files ke actual names mein double dot hai.
const specialImages: Record<number, string> = {
  6: "/suit6..jpg",
  7: "/suit7..jpg",
  12: "/suit12..jpg",
  13: "/suit13..jpg",
  14: "/suit14..jpg",
  15: "/suit15..jpg",
  20: "/suit20..jpg",
};

const dresses: Dress[] = Array.from({ length: 44 }, (_, index) => {
  const id = index + 1;

  return {
    id,
    name: `MB Couture Design ${id}`,
    price: prices[index],
    image: specialImages[id] || `/suit${id}.jpg`,
    categories: getCategories(id),
  };
});

const money = (price: number) =>
  `Rs. ${price.toLocaleString("en-PK")}`;

export default function HomePage() {
  const [activeCategory, setActiveCategory] =
    useState("All Dresses");

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);

  const filteredDresses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return dresses.filter((dress) => {
      const matchesCategory =
        activeCategory === "All Dresses" ||
        dress.categories.includes(activeCategory);

      const matchesSearch =
        dress.name.toLowerCase().includes(query) ||
        dress.categories.some((category) =>
          category.toLowerCase().includes(query)
        ) ||
        String(dress.id).includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const cartTotal = dresses.reduce(
    (total, dress) =>
      total + dress.price * (cart[dress.id] || 0),
    0
  );

  function addToCart(id: number) {
    setCart((previous) => ({
      ...previous,
      [id]: (previous[id] || 0) + 1,
    }));
  }

  function removeFromCart(id: number) {
    setCart((previous) => {
      const updated = { ...previous };

      if ((updated[id] || 0) <= 1) {
        delete updated[id];
      } else {
        updated[id] -= 1;
      }

      return updated;
    });
  }

  function orderOnWhatsApp(dress?: Dress) {
    const phone = "923001234567"; // Apna WhatsApp number yahan likhein.

    const message = dress
      ? `Assalam-o-Alaikum MB Couture! I want to order ${dress.name}, ${money(dress.price)}. Please share availability and delivery details.`
      : `Assalam-o-Alaikum MB Couture! My order:\n${dresses
          .filter((item) => cart[item.id])
          .map(
            (item) =>
              `${item.name} x ${cart[item.id]} = ${money(
                item.price * cart[item.id]
              )}`
          )
          .join("\n")}\nTotal: ${money(cartTotal)}\nPlease confirm availability and delivery details.`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main>
      <div className="announcement">
        ELEGANCE IN EVERY THREAD — DISCOVER MB COUTURE
      </div>

      <header className="header">
        <a className="brand" href="#">
          <span>MB COUTURE</span>
          <small>THE DESIGNER SHOP</small>
        </a>

        <nav>
          <a href="#">Home</a>
          <a href="#categories">Categories</a>
          <a href="#collection">Collection</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <button
          className="cart-button"
          onClick={() => setShowCart(!showCart)}
        >
          🛍 Cart ({cartCount})
        </button>
      </header>

      {showCart && (
        <section className="cart-panel">
          <div className="cart-heading">
            <h2>Your Shopping Bag</h2>
            <button
              className="close-button"
              onClick={() => setShowCart(false)}
            >
              ✕
            </button>
          </div>

          {cartCount === 0 ? (
            <p>Your cart is empty. Explore our collection.</p>
          ) : (
            <>
              {dresses
                .filter((dress) => cart[dress.id])
                .map((dress) => (
                  <div className="cart-item" key={dress.id}>
                    <div>
                      <strong>{dress.name}</strong>
                      <p>
                        {money(dress.price)} × {cart[dress.id]}
                      </p>
                    </div>

                    <div className="quantity">
                      <button
                        onClick={() => removeFromCart(dress.id)}
                      >
                        −
                      </button>
                      <span>{cart[dress.id]}</span>
                      <button onClick={() => addToCart(dress.id)}>
                        +
                      </button>
                    </div>
                  </div>
                ))}

              <h3 className="cart-total">
                Total: {money(cartTotal)}
              </h3>

              <button
                className="primary-button full-button"
                onClick={() => orderOnWhatsApp()}
              >
                Order on WhatsApp
              </button>
            </>
          )}
        </section>
      )}

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">MADE FOR YOUR MOMENTS</span>
          <h1>
            The Art of Dressing.
            <br />
            <em>Timeless Style.</em>
            <br />
            Modern Elegance.
          </h1>

          <p>
            Discover thoughtfully designed Eastern wear that
            celebrates tradition, beautiful details and your
            individual style.
          </p>

          <a className="primary-button" href="#collection">
            EXPLORE COLLECTION ↗
          </a>
        </div>

        <div className="hero-image">
          <img
            src="/suit1.jpg"
            alt="MB Couture Eastern designer outfit"
          />
          <div className="image-caption">
            <span>THE NEW COLLECTION</span>
            <strong>Elegance in every detail</strong>
          </div>
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-heading">
          <span className="eyebrow">EXPLORE OUR WORLD</span>
          <h2>Shop By Category</h2>
          <p>Find the perfect Eastern outfit for every occasion.</p>
        </div>

        <div className="category-grid">
          {categories.slice(1).map((category, index) => (
            <button
              className="category-card"
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setSearch("");
                document
                  .getElementById("collection")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="category-number">
                0{index + 1}
              </span>
              <h3>{category}</h3>
              <span className="category-link">
                EXPLORE CATEGORY ↗
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="section-heading">
          <span className="eyebrow">MADE FOR YOUR MOMENTS</span>
          <h2>Our Collection</h2>
          <p>
            Explore occasion wear, everyday essentials and
            timeless Eastern designs.
          </p>
        </div>

        <div className="collection-controls">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dresses or categories..."
            aria-label="Search dresses"
          />

          <div className="filters">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <p className="results-count">
          Showing {filteredDresses.length} of 44 dresses
        </p>

        <div className="product-grid">
          {filteredDresses.map((dress) => (
            <article className="product-card" key={dress.id}>
              <div className="product-image">
                <img
                  src={dress.image}
                  alt={dress.name}
                  loading={dress.id > 8 ? "lazy" : "eager"}
                  onError={(event) => {
                    const image = event.currentTarget;
                    image.style.display = "none";
                    image.parentElement?.classList.add(
                      "image-unavailable"
                    );
                  }}
                />
                <span className="product-brand">MB COUTURE</span>
              </div>

              <div className="product-info">
                <div className="product-categories">
                  {dress.categories.join(" · ")}
                </div>

                <h3>{dress.name}</h3>
                <p className="product-price">
                  {money(dress.price)}
                </p>

                <button
                  className="add-button"
                  onClick={() => addToCart(dress.id)}
                >
                  ADD TO CART
                </button>

                <button
                  className="buy-button"
                  onClick={() => orderOnWhatsApp(dress)}
                >
                  BUY IT NOW ↗
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredDresses.length === 0 && (
          <div className="empty-results">
            <h3>No dresses found</h3>
            <p>Try another search or category.</p>
            <button
              className="primary-button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All Dresses");
              }}
            >
              SHOW ALL DRESSES
            </button>
          </div>
        )}
      </section>

      <section className="story-section" id="about">
        <div className="story-image">
          <img
            src="/suit33.jpg"
            alt="MB Couture occasion wear"
            loading="lazy"
          />
        </div>

        <div className="story-content">
          <span className="eyebrow">OUR STORY</span>
          <h2>
            Designed With Care.
            <br />
            <em>Made To Be Remembered.</em>
          </h2>
          <p>
            MB Couture brings together contemporary style and
            timeless Eastern elegance. Our collections celebrate
            traditional craftsmanship, graceful silhouettes and
            memorable occasions.
          </p>
          <p>
            From everyday outfits to wedding celebrations, discover
            styles designed to help you express yourself with
            confidence.
          </p>
          <a className="primary-button" href="#collection">
            VIEW OUR COLLECTION ↗
          </a>
        </div>
      </section>

      <footer id="contact">
        <div className="footer-grid">
          <div>
            <a className="brand footer-brand" href="#">
              <span>MB COUTURE</span>
              <small>THE DESIGNER SHOP</small>
            </a>
            <p>Elegant Eastern styles for every occasion.</p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <a href="#">Home</a>
            <a href="#categories">Categories</a>
            <a href="#collection">Collection</a>
            <a href="#about">About Us</a>
          </div>

          <div>
            <h3>Our Categories</h3>
            {categories.slice(1).map((category) => (
              <a
                href="#collection"
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </a>
            ))}
          </div>
        </div>

        <div className="copyright">
          © 2026 MB COUTURE — THE DESIGNER SHOP
        </div>
      </footer>

      <style jsx global>{`
        :root {
          --cream: #f8f3eb;
          --paper: #fffdf9;
          --brown: #4b382b;
          --muted: #827466;
          --gold: #b18a4b;
          --line: #e7dccb;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--paper);
          color: var(--brown);
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          cursor: pointer;
        }

        .announcement {
          background: var(--brown);
          color: white;
          text-align: center;
          padding: 11px 16px;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 19px 6%;
          background: rgba(255, 253, 249, 0.97);
          border-bottom: 1px solid var(--line);
        }

        .brand {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex-shrink: 0;
        }

        .brand span {
          font-family: Georgia, serif;
          font-size: 23px;
          letter-spacing: 3px;
          font-weight: 700;
        }

        .brand small {
          color: var(--gold);
          font-size: 9px;
          letter-spacing: 3px;
        }

        nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 23px;
        }

        nav a {
          font-size: 12px;
          transition: color 0.2s;
        }

        nav a:hover,
        footer a:hover {
          color: var(--gold);
        }

        .cart-button {
          border: 1px solid var(--line);
          padding: 10px 13px;
          background: transparent;
          color: var(--brown);
          white-space: nowrap;
          font-size: 12px;
        }

        .hero {
          min-height: 550px;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          background: var(--cream);
          padding: 55px 8%;
          align-items: center;
          gap: 45px;
        }

        .hero-content {
          max-width: 540px;
        }

        .eyebrow {
          display: block;
          color: var(--gold);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          margin-bottom: 20px;
        }

        h1,
        h2 {
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 400;
        }

        .hero h1 {
          font-size: clamp(36px, 4.5vw, 61px);
          line-height: 1.18;
          margin: 0 0 23px;
        }

        em {
          color: var(--gold);
          font-weight: 400;
        }

        .hero-content p,
        .section-heading p,
        .story-content p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.9;
        }

        .hero-content p {
          max-width: 440px;
          margin-bottom: 30px;
        }

        .primary-button {
          display: inline-block;
          border: 1px solid var(--brown);
          background: var(--brown);
          color: white;
          padding: 15px 21px;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-align: center;
          transition: 0.2s;
        }

        .primary-button:hover {
          background: var(--gold);
          border-color: var(--gold);
        }

        .hero-image {
          position: relative;
          min-height: 410px;
          height: 100%;
          max-height: 520px;
          background: #e7dccb;
        }

        .hero-image img,
        .story-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .image-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 30px 22px 20px;
          color: white;
          background: linear-gradient(transparent, #2a1c16c9);
        }

        .image-caption span {
          font-size: 9px;
          letter-spacing: 2px;
        }

        .image-caption strong {
          font-family: Georgia, serif;
          font-size: 21px;
          font-weight: 400;
        }

        .categories-section,
        .collection-section {
          padding: 85px 6%;
        }

        .section-heading {
          text-align: center;
          margin-bottom: 40px;
        }

        .section-heading .eyebrow {
          margin-bottom: 13px;
        }

        .section-heading h2,
        .story-content h2 {
          font-size: clamp(30px, 3vw, 42px);
          margin: 0 0 12px;
        }

        .section-heading p {
          margin: 0;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
        }

        .category-card {
          min-height: 165px;
          text-align: left;
          padding: 23px;
          background: var(--cream);
          color: var(--brown);
          border: 1px solid var(--line);
          transition: 0.25s;
        }

        .category-card:hover {
          border-color: var(--gold);
          transform: translateY(-3px);
        }

        .category-number {
          color: var(--gold);
          font-size: 10px;
          letter-spacing: 2px;
        }

        .category-card h3 {
          font-family: Georgia, serif;
          font-size: 21px;
          font-weight: 400;
          margin: 19px 0;
        }

        .category-link {
          font-size: 9px;
          letter-spacing: 1px;
        }

        .collection-section {
          background: #faf7f1;
        }

        .collection-controls {
          max-width: 900px;
          margin: 0 auto;
        }

        .collection-controls input {
          width: 100%;
          padding: 15px 17px;
          border: 1px solid var(--line);
          background: white;
          outline: none;
          color: var(--brown);
          margin-bottom: 20px;
        }

        .collection-controls input:focus {
          border-color: var(--gold);
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }

        .filter-button {
          padding: 10px 13px;
          border: 1px solid var(--line);
          background: white;
          color: var(--brown);
          font-size: 11px;
        }

        .filter-button.active,
        .filter-button:hover {
          background: var(--brown);
          border-color: var(--brown);
          color: white;
        }

        .results-count {
          margin: 30px 0 18px;
          color: var(--muted);
          font-size: 12px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 25px 16px;
        }

        .product-card {
          min-width: 0;
          background: white;
          border: 1px solid #eee7dc;
        }

        .product-image {
          height: 310px;
          position: relative;
          background: #eee5d9;
          overflow: hidden;
        }

        .product-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }

        .product-card:hover .product-image img {
          transform: scale(1.035);
        }

        .product-image.image-unavailable::after {
          content: "Add your dress photo";
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: #77634d;
          font-size: 12px;
        }

        .product-brand {
          position: absolute;
          bottom: 10px;
          left: 10px;
          padding: 7px 9px;
          background: #fffdf0e8;
          color: var(--brown);
          font-size: 8px;
          letter-spacing: 1.5px;
        }

        .product-info {
          padding: 16px 13px;
        }

        .product-categories {
          min-height: 26px;
          color: var(--gold);
          font-size: 10px;
          line-height: 1.5;
        }

        .product-info h3 {
          font-family: Georgia, serif;
          font-size: 17px;
          font-weight: 400;
          margin: 7px 0 10px;
        }

        .product-price {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 15px;
        }

        .add-button,
        .buy-button {
          width: 100%;
          padding: 12px 8px;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .add-button {
          border: 1px solid var(--brown);
          background: var(--brown);
          color: white;
        }

        .add-button:hover {
          background: var(--gold);
          border-color: var(--gold);
        }

        .buy-button {
          margin-top: 7px;
          border: 1px solid var(--line);
          background: white;
          color: var(--brown);
        }

        .buy-button:hover {
          border-color: var(--gold);
        }

        .empty-results {
          text-align: center;
          padding: 55px 15px;
        }

        .empty-results p {
          color: var(--muted);
          margin-bottom: 24px;
        }

        .story-section {
          display: grid;
          grid-template-columns: 0.85fr 1fr;
          gap: 65px;
          align-items: center;
          padding: 85px 10%;
        }

        .story-image {
          height: 440px;
          background: var(--cream);
        }

        .story-content p {
          margin: 18px 0;
        }

        .story-content .primary-button {
          margin-top: 10px;
        }

        footer {
          background: var(--brown);
          color: white;
          padding: 55px 7% 0;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.3fr;
          gap: 50px;
          padding-bottom: 40px;
        }

        .footer-brand span {
          font-size: 22px;
        }

        .footer-grid p {
          color: #d7c9b7;
          font-size: 12px;
          line-height: 1.8;
        }

        .footer-grid h3 {
          font-size: 12px;
          letter-spacing: 1px;
          margin: 0 0 18px;
        }

        .footer-grid > div:not(:first-child) a {
          display: block;
          color: #d7c9b7;
          font-size: 12px;
          margin: 11px 0;
        }

        .copyright {
          border-top: 1px solid #ffffff25;
          text-align: center;
          padding: 20px 0;
          color: #d7c9b7;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .cart-panel {
          position: fixed;
          top: 85px;
          right: 20px;
          z-index: 50;
          width: min(420px, calc(100% - 30px));
          max-height: 75vh;
          overflow-y: auto;
          padding: 22px;
          background: white;
          border: 1px solid var(--line);
          box-shadow: 0 12px 40px #00000020;
        }

        .cart-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .cart-heading h2 {
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .close-button {
          border: 0;
          background: transparent;
          color: var(--brown);
          font-size: 20px;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }

        .cart-item strong {
          font-size: 12px;
        }

        .cart-item p {
          font-size: 12px;
          color: var(--muted);
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .quantity button {
          width: 28px;
          height: 28px;
          background: var(--cream);
          border: 1px solid var(--line);
        }

        .cart-total {
          font-size: 16px;
          margin: 22px 0;
        }

        .full-button {
          width: 100%;
          cursor: pointer;
        }

        @media (max-width: 1000px) {
          .header {
            flex-wrap: wrap;
            justify-content: center;
          }

          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .hero {
            padding: 45px 5%;
            gap: 25px;
          }

          .product-image {
            height: 280px;
          }

          .story-section {
            padding: 65px 6%;
            gap: 35px;
          }
        }

        @media (max-width: 700px) {
          .announcement {
            font-size: 8px;
            letter-spacing: 1px;
          }

          .header {
            position: relative;
            gap: 16px;
            padding: 17px 5%;
          }

          .brand span {
            font-size: 20px;
          }

          nav {
            order: 3;
            width: 100%;
            gap: 15px;
          }

          nav a {
            font-size: 11px;
          }

          .hero {
            grid-template-columns: 1fr;
            padding: 42px 6%;
          }

          .hero-image {
            min-height: 350px;
            height: 400px;
          }

          .hero h1 {
            font-size: 39px;
          }

          .categories-section,
          .collection-section {
            padding: 58px 5%;
          }

          .category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .category-card {
            min-height: 145px;
            padding: 16px;
          }

          .category-card h3 {
            font-size: 18px;
          }

          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px 10px;
          }

          .product-image {
            height: 240px;
          }

          .product-info {
            padding: 12px 9px;
          }

          .product-info h3 {
            font-size: 15px;
          }

          .product-categories {
            min-height: 36px;
          }

          .filter-button {
            padding: 9px 10px;
          }

          .story-section {
            grid-template-columns: 1fr;
            padding: 55px 6%;
            gap: 30px;
          }

          .story-image {
            height: 350px;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 30px 20px;
          }

          .footer-grid > div:first-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 380px) {
          .product-image {
            height: 200px;
          }

          .product-info h3 {
            font-size: 14px;
          }

          .brand span {
            font-size: 17px;
          }

          nav {
            gap: 11px;
          }
        }
      `}</style>
    </main>
  );
}
