import { useAuth0 } from "@auth0/auth0-react";

import { PastCompetitions } from "components";

import { GlobalContext } from "context";
import { useContext } from "react";

const MyPage = () => {
  const { user, isAuthenticated } = useAuth0();
  const context = useContext(GlobalContext);

  return (
    <>
      <h1>My Page</h1>
      {isAuthenticated || context.isGuest ? (
        <div>
          <h2>Username: {user ? user.name : "Guest"}</h2>
          <h2>
            Email adress:{" "}
            {user ? user.email : "myportfoliodummyemail@gmail.com"}
          </h2>
          <br></br>
          <h1>Past Competitions</h1>
          <PastCompetitions />
        </div>
      ) : (
        <div>
          <h2>You are not logged in yet</h2>
        </div>
      )}
    </>
  );
};

export default MyPage;
