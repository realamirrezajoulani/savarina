import Error404 from "./pages/404";
import Blog from "./pages/blog";
import Car from "./pages/car";
import CarPage from "./pages/carPage";
import Index from "./pages/index";
import Login from "./pages/login";
import Singup from "./pages/singup";

// ? Admin Panel

import PAdminPrivate from "./Components/Private/PAdminPrivate";
import AdminPanel from "./pages/AdminPanel/App";
import AdminDashboard from "./ComponentsPanel/AdminDashboard/AdminDashboard";

import Customers from "./ComponentsPanel/Customers/Customers";
import Vehicles from "./ComponentsPanel/Vehicles/Vehicles";
import VehicleInsurances from "./ComponentsPanel/VehicleInsurances/VehicleInsurances";
import Invoices from "./ComponentsPanel/Invoices/Invoices";
import Rentals from "./ComponentsPanel/Rentals/Rentals";
import Comments from "./ComponentsPanel/Comments/Comments";
import Payments from "./ComponentsPanel/Payments/Payments";
import Posts from "./ComponentsPanel/Posts/Posts";
import Admins from "./ComponentsPanel/Admins/Admins";
import Cart from "./pages/Cart";
import BlogList from "./pages/BlogList";

// ? Customer Panel

import CustomerPanel from "./pages/CustomerPanel/App";
import CustomerDashboard from "./ComponentsPanel/CustomerDashboard/CustomerDashboard";

import Account from "./ComponentsPanel/Account/Account.jsx";
import InvoicesOld from "./ComponentsPanel/invoicesOld/invoicesOld.jsx";
import MyComments from "./ComponentsPanel/MyComments/MyComments.jsx";
import Setting from "./ComponentsPanel/Setting/Setting.jsx";


const routes = [
  { path: "/", element: <Index /> },
  { path: "/login", element: <Login /> },
  { path: "/singup", element: <Singup /> },
  { path: "/blog/:postId", element: <Blog /> },
  { path: "/car/:carId", element: <CarPage /> },
  { path: "/carList", element: <Car /> },
  { path: "/blogList", element: <BlogList /> },
  { path: "/cart", element: <Cart /> },
  { path: "*", element: <Error404 /> },

  {
    path: "/p-admin/*",
    element: (
      <PAdminPrivate>
        <AdminPanel />
      </PAdminPrivate>
    ),
    children: [
      { path: "", element: <AdminDashboard /> },
      { path: "admins", element: <Admins /> },
      { path: "customers", element: <Customers /> },
      { path: "vehicles", element: <Vehicles /> },
      { path: "vehicleInsurances", element: <VehicleInsurances /> },
      { path: "invoices", element: <Invoices /> },
      { path: "rentals", element: <Rentals /> },
      { path: "payments", element: <Payments /> },
      { path: "posts", element: <Posts /> },
      { path: "comments", element: <Comments /> },
    ],
  },
  {
    path: "/c-admin/*",
    element: (
        <CustomerPanel />
    ),
    children: [
      { path: "", element: <CustomerDashboard /> },
      { path: "account", element: <Account /> },
      { path: "invoicesOld", element: <InvoicesOld /> },
      { path: "mycomments", element: <MyComments /> },
      { path: "setting", element: <Setting /> }
    ],
  },

];

export default routes;
