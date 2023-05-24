import { useState, useEffect, Fragment, useContext } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { Container, Grid } from "@mui/material";

import * as CONSTANTS from "constants/Constants";

import { GlobalContext } from "../context";
import { LoadingSpinner, CustomCard } from "components";
import { DashboardGraph, PieGraph } from "components";

const Dashboard = () => {
  const { getAccessTokenSilently } = useAuth0();

  const context = useContext(GlobalContext);
  const [userBalance, setUserBalance] = useState(0);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [isValueLoading, setIsValueLoading] = useState(false);
  const [sharesHasError, setDashboardHasError] = useState(false);
  const [sharesErrorMessage, setDashboardErrorMessage] = useState("");
  const [userShares, setUserShares] = useState([]);
  const [shareValue, setShareValue] = useState(0);
  const [userId, setUserId] = useState(context.userId);

  useEffect(() => {
    setUserId(context.userId);
  }, [context]);

  // Load invested companies
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    setIsValueLoading(true);
    // get invested companies information

    const getDashboard = async () => {
      if (userId) {
        const token = await getAccessTokenSilently();
        //setDashboardHasError(false);
        await fetch(CONSTANTS.API_URL + CONSTANTS.API_VALUE_STOCK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: context.userId }),
          signal: signal,
        })
          .then(async (response) => {
            const shareValue = await response.json();
            setShareValue(shareValue["total_share_value"].toFixed(2));
            setIsValueLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };
    getDashboard();
  }, [userId]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    setIsShareLoading(true);
    // get some top companies information
    const getInvestedCompanies = async () => {
      if (userId) {
        const token = await getAccessTokenSilently();
        setDashboardHasError(false);
        await fetch(CONSTANTS.API_URL + CONSTANTS.API_INVESTED_STOCK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: context.userId }),
          signal: signal,
        })
          .then(async (response) => {
            const userShares = await response.json();
            setUserShares(userShares["data"]);
            setIsShareLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };
    getInvestedCompanies();
  }, [userId]);

  useEffect(() => {
    setUserBalance(context.userBalance.toFixed(2));
  }, [context.userBalance]);

  return (
    <Fragment>
      {isValueLoading || isShareLoading ? (
        <LoadingSpinner />
      ) : (
        <Fragment>
          {/* Placeholder Graph */}

          <div>
            <h1>Your portfolio</h1>
            {/* <DashboardGraph /> */}
          </div>

          <div>
            <h2>Your Current Balance: ${userBalance}</h2>
            <h2>Your Total Share Value: ${shareValue}</h2>
            <h2>Your Total Combined Value: ${+userBalance + +shareValue}</h2>
          </div>

          <div>
            <h1>
              {userShares.length !== 0
                ? "Your Invested Companies"
                : "You have no investments"}
            </h1>
            {sharesHasError && <p>{sharesErrorMessage}</p>}
            {userShares.length !== 0 ? (
              <PieGraph companies={userShares} balance={context.userBalance} />
            ) : (
              ""
            )}
            {/* <p>{userShares.length !== 0 ? "First company:" : ""}</p> */}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Dashboard;
