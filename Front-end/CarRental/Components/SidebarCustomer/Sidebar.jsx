import React, { useContext, useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { FiUsers } from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";
import { GoHistory } from "react-icons/go";
import { CiViewList } from "react-icons/ci";
import { IoBookOutline, IoSettingsOutline, IoClose } from "react-icons/io5";

import "../SidebarAdmin/Sidebar.css";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {

  return (
    <div className={`sidebar__Wrapper ${isSidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar">
        <button className="close-btn" onClick={toggleSidebar}>
          <IoClose size={24} />
        </button>
        <h1 className="sidebar-title">
          <div className="flex items-center justify-start mx-auto">
            <img src="../logoBrandCarRental.ico" alt="Logo_img" className="w-9 h-9" />
            <Link to={'/'}>
              <p
                className="mr-2 cursor-pointer py-1.5 font-medium lalezar text-3xl text-gray-900"
              >
                سوارینا
              </p>
            </Link>

          </div>
        </h1>

        <ul className="sidebar-links">
          <li>
            <NavLink to="">
              <AiOutlineHome className="icon" />
              صفحه اصلی
            </NavLink>
          </li>
          <li>
            <NavLink to="account">
              <FiUsers className="icon" />
              اطلاعات شخصی
            </NavLink>
          </li>
          <li>
            <NavLink to="invoicesOld">
              <GoHistory className="icon" />
              تاریخچه فاکتور
            </NavLink>
          </li>
          <li>
            <Link to="/cart">
              <CiViewList className="icon" />
              لیست اجارات
            </Link>
          </li>
          <li>
            <NavLink to="mycomments">
              <IoBookOutline className="icon" />
              کامنت ها
            </NavLink>
          </li>
          <li>
            <NavLink to="setting">
              <IoSettingsOutline className="icon" />
              تنظیمات
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}
