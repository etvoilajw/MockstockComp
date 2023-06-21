import React, { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { useAuth0 } from "@auth0/auth0-react";

import * as CONSTANTS from "constants/Constants";

export const Context = createContext({});

export const Provider = (props) => {
  const { children } = props;
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [userId, setUserId] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [userInventory, setUserInventory] = useState({});

  const [isGuest, setIsGuest] = useState(false);
  const [guestToken, setGuestToken] = useState("");

  // Idea to get user information.
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    // To get user data, we need to check that it is authenticated first
    if (isAuthenticated || isGuest) {
      const callGetUserData = async () => {
        const token = isGuest ? guestToken : await getAccessTokenSilently();
        await fetch(CONSTANTS.API_URL + CONSTANTS.API_USER_CHECK, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: user.name, email: user.email }),
          signal: signal,
        })
          .then(async (response) => {
            const userResponse = await response.json();
            setUserId(userResponse["userId"]);
            setUserBalance(userResponse["balance"]);
            setUserInventory(userResponse["userInventory"]);
          })
          .catch((error) => {
            console.log(error);
          });
      };
      callGetUserData();
    }
  }, [isAuthenticated, isGuest]);

  // Create a context object
  const globalContext = {
    userId,
    setUserId,
    userBalance,
    setUserBalance,
    userInventory,
    setUserInventory,
    isGuest,
    setIsGuest,
    guestToken,
    setGuestToken,
  };

  // pass the value in provider and return
  return <Context.Provider value={globalContext}>{children}</Context.Provider>;
};

export const { Consumer } = Context;

Provider.propTypes = {
  uhsRateTable: PropTypes.array,
};
