import React from "react";
import { Chart } from "react-google-charts";

const PieGraph = ({ companies, balance }) => {
  let data = companies.map((company) => [company.name, company.cur_price]);

  data = [["Company", "Current Amount"], ["Cash", balance], ...data];

  const options = {
    title: "Invested Company",
    pieHole: 0.4,
    is3D: false,
  };

  return (
    <Chart
      chartType="PieChart"
      data={data}
      options={options}
      width={"75%"}
      height={"400px"}
    />
  );
};

export default PieGraph;
