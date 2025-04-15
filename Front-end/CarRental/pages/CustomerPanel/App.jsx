import React , {useState} from "react";

import Sidebar from "../../Components/SidebarCustomer/Sidebar";
import Header from "../../Components/HeaderAdmin/Header";
import { Outlet } from "react-router-dom";
import "../AdminPanel/App.css";

export default function CustomerPanel() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Header toggleSidebar={toggleSidebar} />
        <div className="py-10">
          <Outlet />
        </div>
      </div>
    </>
  );
}
