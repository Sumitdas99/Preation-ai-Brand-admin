import { createBrowserRouter } from "react-router-dom";
import publicRoutes from "./PublicRoutes";
import privateRoutes from "./PrivateRoutes";
import NotFound from "../pages/NotFound";

const routers = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  // {
  //   path: "*",
  //   element: <NotFound />,
  // },
]);

export default routers;

