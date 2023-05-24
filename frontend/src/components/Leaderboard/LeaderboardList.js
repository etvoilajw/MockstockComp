import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LeaderboardItem from "./LeaderboardItem";
import { useAuth0 } from "@auth0/auth0-react";

import * as CONSTANTS from "../../constants/Constants";
import { LoadingSpinner } from "../../components";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const LeaderboardList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [competitionResult, setCompetitionResult] = useState({});

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const getCompetitionData = async () => {
      const token = await getAccessTokenSilently();
      setIsLoading(true);

      await fetch(CONSTANTS.API_URL + CONSTANTS.API_COMP_DATA, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(response.status);
          const competitionData = await response.json();

          setCompetitionResult(competitionData["competitionData"]);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
          setIsLoading(false);
        });
    };
    getCompetitionData();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return isLoading ? (
    <LoadingSpinner />
  ) : (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{ maxWidth: { sm: 650 }, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label={"Competition seasons"} />
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {Object.keys(competitionResult).map((competition, index) => (
            <Tab label={index + 1} {...a11yProps(index + 1)} />
          ))}
        </Tabs>
      </Box>
      {Object.keys(competitionResult).map((competition, index) => (
        <TabPanel value={value} index={index}>
          <LeaderboardItem data={competitionResult[competition]} />
        </TabPanel>
      ))}
    </Box>
  );
};

export default LeaderboardList;
