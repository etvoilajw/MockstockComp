//import { useState, useEffect, Fragment, useContext } from "react";

//import { useAuth0 } from "@auth0/auth0-react";

//import * as CONSTANTS from "constants/Constants";

//import { GlobalContext } from "../context";

import { Line } from "react-chartjs-2";
import { Chart as chartjs } from "chart.js/auto";



const DashboardGraph = () => {

  const DATASET = [
    {
      id: 1,
      date: "01-01-2022",
      value: 150,
      investment: 120
    },
    {
      id: 2,
      date: "02-01-2022",
      value: 170,
      investment: 120,
    },
    {
      id: 3,
      date: "03-01-2022",
      value: 180,
      investment: 150
    },
    {
      id: 4,
      date: "04-01-2022",
      value: 150,
      investment: 150
    },
    {
      id: 5,
      date: "05-01-2022",
      value: 100,
      investment: 150
    },
  ];



  return (
    <div>
      <Line
        data={{
          labels: DATASET.map((data) => data.date),
          datasets: [
            {
              label: "Your portfolio",
              data: DATASET.map((data) => data.value),
              borderColor: "red",
            },
            {
              label: "Your investment",
              data: DATASET.map((data) => data.investment),
              borderColor: "grey",
              borderDash: [10,5]
            },
          ],
        }}
        height={400}
        width={600}
        options={{
          maintainAspectRatio: false,
        }}
      />
    </div>
  );
};

export default DashboardGraph;
