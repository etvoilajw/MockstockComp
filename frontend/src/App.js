import { BrowserRouter as Router } from "react-router-dom";

import { GlobalContextProvider } from "context";

import Navbar from "./components/Navbar/Navbar";

import CustomRoutes from "views/CustomRoutes";

const App = () => {
  return (
    <GlobalContextProvider>
      <Router>
        <Navbar />
        <CustomRoutes />
      </Router>
    </GlobalContextProvider>
  );
};

export default App;
