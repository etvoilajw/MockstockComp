import { useState, useEffect, Fragment, useContext } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { Container, Grid } from "@mui/material";

import * as CONSTANTS from "constants/Constants";

import { LoadingSpinner, CustomCard } from "components";
import { GlobalContext } from "../context";

const StockBrowser = () => {
  const { getAccessTokenSilently } = useAuth0();

  const [isPopularLoading, setIsPopularLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [popularStock, setPopularStock] = useState([]);
  const [searchedStock, setSearchedStock] = useState([]);
  const [popularHasError, setPopularHasError] = useState(false);
  const [searchHasError, setSearchHasError] = useState(false);
  const [popularErrorMessage, setPopularErrorMessage] = useState("");
  const [searchErrorMessage, setSearchErrorMessage] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const context = useContext(GlobalContext);

  // Load top companies
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    // get some top companies information
    const getTopCompanies = async () => {
      const token = await getAccessTokenSilently();
      setIsPopularLoading(true);
      setPopularHasError(false);
      await fetch(CONSTANTS.API_URL + CONSTANTS.API_POPULAR_STOCK, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: signal,
      })
        .then(async (response) => {
          const popularStock = await response.json();

          setPopularStock(popularStock["data"]);
          setIsPopularLoading(false);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
          setPopularHasError(true);
          setPopularErrorMessage("Something went wrong");
          setIsPopularLoading(false);
        });
    };
    getTopCompanies();
  }, []);

  const getSearchedCompanies = async () => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const token = await getAccessTokenSilently();
    setIsSearchLoading(true);
    setSearchHasError(false);
    await fetch(CONSTANTS.API_URL + CONSTANTS.API_SEARCH_STOCK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ input: searchText }),
      signal: signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status);
        const searchedStock = await response.json();

        setSearchedStock(searchedStock["data"]);
        setIsSearchLoading(false);
      })
      .catch((error) => {
        console.log(`error: ${error}`);
        setSearchHasError(true);
        setSearchErrorMessage("Something went wrong");
        setIsSearchLoading(false);
      });
  };

  //Enable or disable Search button whenever input keystroke is entered.
  //Enable only if input field length is at least 3.
  useEffect(() => {
    if (searchText.length > 2) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [searchText]);

  const onSubmitHandler = () => {
    if (!searchText) {
      return;
    }
    getSearchedCompanies();
  };

  const getUserInventory = (symbol) => {
    try {
      const shareHoldings = context.userInventory[1][symbol];
      if (!shareHoldings) {
        return 0;
      }
      return shareHoldings;
    } catch (e) {
      return 0;
    }
  };

  return (
    <Fragment>
      {popularHasError && <p>{popularErrorMessage}</p>}
      {isPopularLoading ? (
        <LoadingSpinner />
      ) : (
        // Else, draw a gird view with cards
        <Container maxWidth="md">
          <Grid container spacing={2}>
            {popularStock.map((company) => {
              return (
                // each item size 3, max 4 to fit per row
                <Grid item xs={3}>
                  <CustomCard
                    symbol={company.name}
                    curPrice={company.cur_price}
                    difference={company.difference}
                    getUserInventory={getUserInventory}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Container>
      )}
      <div>
        <input
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <button onClick={onSubmitHandler} disabled={isDisabled}>
          Search
        </button>
      </div>
      {/* If it is still fetching data, show a spinner */}
      {searchHasError && <p>{searchErrorMessage}</p>}
      {isSearchLoading ? (
        <LoadingSpinner />
      ) : (
        // Else, draw a gird view with cards
        <Container maxWidth="md">
          <Grid container spacing={2}>
            {searchedStock.map((company) => {
              return (
                // each item size 3, max 4 to fit per row
                <Grid item xs={3}>
                  <CustomCard
                    symbol={company.symbol}
                    name={company.name}
                    curPrice={company.cur_price}
                    difference={company.difference}
                    getUserInventory={getUserInventory}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Container>
      )}
    </Fragment>
  );
};

export default StockBrowser;
