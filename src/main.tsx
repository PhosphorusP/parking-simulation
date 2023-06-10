import React from "react";
import ReactDOM from "react-dom/client";
import MyApp from "./App";
import "./index.css";
import { App, ConfigProvider, theme } from "antd";
import { SocketProvider } from "./socket";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  //<React.StrictMode>
  <SocketProvider>
    <ConfigProvider
      autoInsertSpaceInButton={false}
      theme={{
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
    >
      <App>
        <MyApp />
      </App>
    </ConfigProvider>
  </SocketProvider>
  //</React.StrictMode>,
);
