import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import "react-alice-carousel/lib/alice-carousel.css";
import CryptoContext from "./CryptoContext";
import { reportWebVitals } from "./utils/performance";

ReactDOM.render(
  <React.StrictMode>
    <CryptoContext>
      <App />
    </CryptoContext>
  </React.StrictMode>,
  document.getElementById("root")
);

// Monitor Web Vitals for performance tracking
reportWebVitals((metric) => {
  console.log('Web Vitals:', metric);
  // You can send this data to your analytics service
});
