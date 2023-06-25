import React, { useState, useEffect, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import * as CONSTANTS from "constants/Constants";
import { GlobalContext } from "context";
import { LoadingSpinner } from "components";

const PastCompetitions = () => {
  const context = useContext(GlobalContext);
  const { getAccessTokenSilently } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const [pastCompetitionResult, setPastCompetitionResult] = useState({});

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const getPastCompetitionData = async () => {
      const token = context.isGuest
        ? context.guestToken
        : await getAccessTokenSilently();
      setIsLoading(true);

      await fetch(
        CONSTANTS.API_URL +
          CONSTANTS.API_USER_PAST_COMP_DATA +
          `?user_id=${context.userId}`,
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
          const pastCompetitionData = await response.json();
          setPastCompetitionResult(pastCompetitionData["pastCompetitionData"]);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
          setIsLoading(false);
        });
    };
    getPastCompetitionData();
  }, []);

  return isLoading ? (
    <LoadingSpinner />
  ) : (
    <>
      {Object.keys(pastCompetitionResult).map((competition, index) => (
        <>
          <h3>Competition number {competition}</h3>
          <p>Rank: {pastCompetitionResult[competition]["rank"]}</p>
          <p>
            Portfolio value: $
            {pastCompetitionResult[competition]["total_value"]}
          </p>
        </>
      ))}
    </>
  );
};

export default PastCompetitions;
