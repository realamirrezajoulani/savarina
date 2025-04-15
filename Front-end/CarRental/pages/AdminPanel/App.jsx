import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/SidebarAdmin/Sidebar";
import Header from "../../Components/HeaderAdmin/Header";
import "./App.css";

export default function App() {
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
