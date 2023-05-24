import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import { MenuItems } from "./MenuItems";
import { PersonalItems } from "./PersonalItems";

export default function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [isOpen, setOpen] = useState(false);

  return (
    <nav>
      <div className="nav--container">
        <img
          src={require("../../assets/images/msclogo.PNG")}
          className="nav--logo"
          alt="logo"
        />
        {/* add link to logo */}
        <div className="nav--menu">
          <img
            src={require("../../assets/images/hamburger.png")}
            className="menu--icon"
          />
        </div>
        {isAuthenticated ? (
          <div className="nav--personal">
            <ul className="nav--items">
              {PersonalItems.map((item, index) => {
                return (
                  <li key={index}>
                    <NavLink to={item.url} className={item.cName}>
                      {item.title}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            <button
              className="nav--button"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              LOG OUT
            </button>
          </div>
        ) : (
          <div className="nav--public">
            <ul className="nav--items">
              {MenuItems.map((item, index) => {
                return (
                  <li key={index}>
                    <NavLink className={item.cName} to={item.url}>
                      {item.title}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            <button className="nav--button" onClick={() => loginWithRedirect()}>
              LOG IN
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
