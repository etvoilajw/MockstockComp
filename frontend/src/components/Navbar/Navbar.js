import { useAuth0 } from "@auth0/auth0-react";
import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";

import { MenuItems } from "./MenuItems";
import { PersonalItems } from "./PersonalItems";

import { GlobalContext } from "../../context";

export default function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const context = useContext(GlobalContext);

  const loginHandler = async () => {
    await fetch("https://dev-pbjz6n3k.au.auth0.com/oauth/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: process.env.REACT_APP_DUMMY_EMAIL,
        password: process.env.REACT_APP_DUMMY_EMAIL_PASSWORD,
        grant_type: "password",
        audience: "mock_stock_dev",
        client_id: process.env.REACT_APP_CLIENT_ID,
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
      }),
    })
      .then(async (response) => {
        const userResponse = await response.json();
        context.setGuestToken(userResponse["access_token"]);
        context.setIsGuest(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <nav>
      <div className="nav--container">
        <img
          src={require("../../assets/images/msclogo.PNG")}
          className="nav--logo"
          alt="logo"
        />
        {isAuthenticated || context.isGuest ? (
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
            <button className="nav--button" onClick={() => loginHandler()}>
              GUEST LOG IN
            </button>
            <button className="nav--button" onClick={() => loginWithRedirect()}>
              LOG IN
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
