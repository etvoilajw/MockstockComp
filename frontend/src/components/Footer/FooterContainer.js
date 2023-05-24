import React from "react";
import { Link } from "react-router-dom";

import { FooterItems } from "./FooterItems";

export default function FooterContainer() {
  return (
    <footer>
      <div className="footer--container">
        <img
          src={require("../../assets/images/msclogo.PNG")}
          className="footer--logo"
          alt="logo"
        />
        <div className="footer--info">
          <ul className="footer--items">
            {FooterItems.map((item, index) => {
              return (
                <li key={index}>
                  <Link to={item.url} className={item.cName}>
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="container">
        <small className="copyrights">
          &copy; 2022 codecampers | All rights reserved
        </small>
      </div>
    </footer>
  );
}
