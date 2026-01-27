import React from "react";
import { Link } from "react-router-dom";
import { LocalizedLink } from "./LocalizedLink";
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Micro-Store</h3>
          <p>Powered by Hygraph CMS</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><LocalizedLink to="/">Home</LocalizedLink></li>
            <li><LocalizedLink to="/collection">Collection</LocalizedLink></li>
            <li><LocalizedLink to="/blog">Blog</LocalizedLink></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>About</h4>
          <p>This is a demo storefront built with React, Vite, and Hygraph.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Micro-Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

