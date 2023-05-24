import { useAuth0 } from "@auth0/auth0-react";

import { PastCompetitions } from "components";

const MyPage = () => {
  const { user, isAuthenticated } = useAuth0();
  return (
    <>
      <h1>My Page</h1>
      {isAuthenticated ? (
        <div>
          <h2>Username: {user.name}</h2>
          <h2>Email adress: {user.email}</h2>
          <br></br>
          <h1>Past Competitions</h1>
          <PastCompetitions user={user.name} />
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
