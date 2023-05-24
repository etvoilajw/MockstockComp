import CircularProgress from "@mui/material/CircularProgress";

import "assets/css/LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <CircularProgress size={"25rem"} />
    </div>
  );
};

export default LoadingSpinner;
