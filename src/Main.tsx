import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./React/routes";
import "./output.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.log("Root not initialized");
}
const root = ReactDOM.createRoot(rootElement);
root.render(<RouterProvider router={router} />);
