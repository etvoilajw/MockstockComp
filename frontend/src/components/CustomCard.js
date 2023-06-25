import { Fragment, useState, useContext } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, Typography } from "@mui/material";
import CardActionArea from "@material-ui/core/CardActionArea";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import { Line } from "react-chartjs-2";

import * as CONSTANTS from "constants/Constants";
import { GlobalContext } from "../context";
import { LoadingSpinner } from "components";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: "65%",
    height: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  btndiv: {
    display: "flex",
    gap: "15px",
  },
}));

const CustomCard = ({
  symbol,
  name = null,
  curPrice,
  difference,
  getUserInventory,
}) => {
  const { getAccessTokenSilently } = useAuth0();

  const context = useContext(GlobalContext);
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [candleData, setCandleData] = useState([]);
  const [numShares, setNumShares] = useState(1);
  const [transactionMessage, setTransactionMessage] = useState("");
  const [shareHoldings, setShareHoldings] = useState(getUserInventory(symbol));

  // Historical price
  const getStockCandle = async () => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const token = context.isGuest
      ? context.guestToken
      : await getAccessTokenSilently();
    setIsLoading(true);

    await fetch(
      CONSTANTS.API_URL +
        CONSTANTS.API_STOCK_CANDLE +
        `?company_name=${symbol}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: signal,
      }
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status);
        // Historical price within a certain period
        // 1 month for now(temporary, fixed to 1 month term)
        // Add to select term by user
        const stockCandle = await response.json();

        setCandleData({
          close_price: stockCandle["close_price"],
          timestamp: stockCandle["timestamp"].map((date) =>
            new Date(date * 1000).toLocaleDateString("en-US")
          ),
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(`error: ${error}`);
        setIsLoading(false);
      });
  };

  const buyButtonHandler = async () => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    if (context.userBalance < curPrice * numShares) {
      return alert("Not enough balance!");
    }

    const token = context.isGuest
      ? context.guestToken
      : await getAccessTokenSilently();
    setIsLoading(true);
    await fetch(CONSTANTS.API_URL + CONSTANTS.API_BUY_STOCK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: symbol,
        shares: numShares,
        userId: context.userId,
      }),
      signal: signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status);
        const transactionResponse = await response.json();
        context.setUserBalance((+transactionResponse["balance"]).toFixed(2));
        setShareHoldings(transactionResponse["userInventory"]);
        let userInventoryCopy = { ...context.userInventory };
        // case of userInventory being empty
        // competition id temporarily set as 1
        if (Object.keys(userInventoryCopy).length === 0) {
          userInventoryCopy = {
            1: { symbol: transactionResponse["userInventory"] },
          };
        }
        // userInventory already exists
        else {
          userInventoryCopy[context.currentCompetitionId][symbol] =
            transactionResponse["userInventory"];
        }
        context.setUserInventory(userInventoryCopy);
        setTransactionMessage("purchase successful!");
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        if (error.message === "400") {
          setTransactionMessage("Not enough balance!");
        } else if (error.message === "401") {
          setTransactionMessage("Missing an input!");
        } else if (error.message === "402") {
          setTransactionMessage("Share needs to be greater than 0");
        } else {
          setTransactionMessage("Oops! Something went wrong!");
        }
        setIsLoading(false);
      });
  };

  const sellButtonHandler = async () => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const token = context.isGuest
      ? context.guestToken
      : await getAccessTokenSilently();
    setIsLoading(true);
    await fetch(CONSTANTS.API_URL + CONSTANTS.API_SELL_STOCK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: symbol,
        shares: numShares,
        userId: context.userId,
      }),
      signal: signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status);
        const transactionResponse = await response.json();
        context.setUserBalance((+transactionResponse["balance"]).toFixed(2));
        setShareHoldings(transactionResponse["userInventory"]);
        let userInventoryCopy = { ...context.userInventory };
        userInventoryCopy[context.currentCompetitionId][symbol] =
          transactionResponse["userInventory"];
        context.setUserInventory(userInventoryCopy);
        setTransactionMessage("sell successful!");
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        if (error.message === "400") {
          setTransactionMessage("You do not have any shares for this company!");
        } else if (error.message === "401") {
          setTransactionMessage("You don't have enough shares!");
        } else if (error.message === "402") {
          setTransactionMessage(
            "Share needs to be getUserInventorygreater than 0"
          );
        } else if (error.message === "403") {
          setTransactionMessage("Missing input");
        } else {
          setTransactionMessage("Oops! Something went wrong!");
        }
        setIsLoading(false);
      });
  };

  return (
    <Fragment>
      <Card variant="outlined">
        <CardActionArea
          onClick={() => {
            setOpen(true);
            getStockCandle();
            setTransactionMessage("");
          }}
        >
          <CardContent>
            <Typography variant="h5" component="div">
              {symbol}
            </Typography>
            {name ? (
              <Typography variant="h5" component="div">
                {name}
              </Typography>
            ) : null}
            <Typography variant="body2">
              ${curPrice}
              <br />
              {/* Stock price dropped */}
              {difference < 0
                ? `-$${parseFloat(Math.abs(difference)).toFixed(2)}`
                : difference === 0
                ? "$0.0"
                : // Stock price increased
                  `+$${parseFloat(difference).toFixed(2)}`}
            </Typography>
            <Typography>{shareHoldings}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <h2 id="transition-modal-title">{name}</h2>
            <h5>{symbol}</h5>
            <div className="container-fluid">
              {!isLoading ? (
                <Line
                  options={{
                    responsive: true,
                  }}
                  data={{
                    labels: candleData["timestamp"],
                    datasets: [
                      {
                        label: symbol,
                        data: candleData["close_price"],
                      },
                    ],
                  }}
                />
              ) : (
                <LoadingSpinner />
              )}
            </div>
            <p id="transition-modal-description">Current price: ${curPrice}</p>
            <p>Your cash balance: ${context.userBalance}</p>
            <p>Currently you have {shareHoldings} shares</p>
            <div className={classes.btndiv}>
              <input
                type="number"
                step="any"
                placeholder="number of shares"
                value={numShares}
                onChange={(e) => {
                  setNumShares(e.target.value);
                }}
                min={1}
              ></input>
              <button onClick={buyButtonHandler}>Buy</button>
              <button onClick={sellButtonHandler}>Sell</button>
            </div>
            {transactionMessage}
          </div>
        </Fade>
      </Modal>
    </Fragment>
  );
};

export default CustomCard;
