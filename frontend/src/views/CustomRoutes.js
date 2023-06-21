import { useAuth0 } from "@auth0/auth0-react";
import { GlobalContext } from "context";
import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import Leaderboard from "./Leaderboard";
import MarketNews from "./MarketNews";
import StockBrowser from "./StockBrowser";
import MyPage from "./MyPage";
import Home from "./Home";
import Developers from "components/Developers";
import FooterContainer from "components/Footer/FooterContainer";

const CustomRoutes = () => {
  const { isAuthenticated } = useAuth0();

  const context = useContext(GlobalContext);

  return (
    <div>
      {isAuthenticated || context.isGuest ? (
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
  );
};

export default CustomRoutes;
