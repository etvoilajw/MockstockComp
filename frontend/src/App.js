import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { GlobalContextProvider } from "context";

import FooterContainer from "./components/Footer/FooterContainer";
import Navbar from "./components/Navbar/Navbar";
import {
  Dashboard,
  Developers,
  Home,
  MarketNews,
  MyPage,
  StockBrowser,
  Leaderboard,
} from "views";

const App = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <GlobalContextProvider>
      <Router>
        <Navbar />
        <div>
          {isAuthenticated ? (
            <Routes>
              <Route exact path="/" element={<Dashboard />} />
              <Route exact path="/dashboard" element={<Dashboard />} />
              <Route exact path="/leaderboard" element={<Leaderboard />} />
              <Route exact path="/market-news" element={<MarketNews />} />
              <Route exact path="/browse" element={<StockBrowser />} />
              <Route exact path="/my-page" element={<MyPage />} />
            </Routes>
          ) : (
            <div>
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/about" element={<Home />} />
                <Route exact path="/developers" element={<Developers />} />
              </Routes>
            </div>
          )}
          <FooterContainer />
          {/* TODO: add route to Footer links */}
        </div>
      </Router>
    </GlobalContextProvider>
  );
};

export default App;
