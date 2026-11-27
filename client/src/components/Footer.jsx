import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="site-footer py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-5">
            <Logo size={52} />
            <p className="text-muted-olive mt-3 mb-0">Calm colours, honest fabrics, made to be worn often.</p>
          </div>
          <div className="col-6 col-md-3">
            <h6>Shop</h6>
            <ul className="list-unstyled">
              <li><Link to="/#categories">Categories</Link></li>
              <li><Link to="/#shop">New arrivals</Link></li>
              <li><Link to="/lookbook">Lookbook</Link></li>
              <li><Link to="/size-guide">Size guide</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <h6>Help</h6>
            <ul className="list-unstyled">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
              <li><Link to="/shipping">Shipping</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary my-4" />
        <small className="text-muted-olive">© {new Date().getFullYear()} Olive Wear. All rights reserved.</small>
      </div>
    </footer>
  );
}
