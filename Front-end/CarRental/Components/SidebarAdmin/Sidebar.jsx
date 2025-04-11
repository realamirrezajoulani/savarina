import React, { useContext, useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { FiUsers } from "react-icons/fi";
import { RiAdminLine, RiSecurePaymentFill } from "react-icons/ri";
import { FaCarSide, FaRegCommentDots } from "react-icons/fa";
import { SiCodefactor } from "react-icons/si";
import { MdCarRental } from "react-icons/md";
import { FaRegComments } from "react-icons/fa6";
import { IoBookOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { NavLink, Link } from "react-router-dom";
import AuthContext from "../../context/authContext";
import "./Sidebar.css";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
    const authContext = useContext(AuthContext);
    const [isLoginUser, setIsLoginUser] = useState(false);

    useEffect(() => {
        setIsLoginUser(authContext.user.role !== "Admin");
    }, []);

    return (
        <div className={`sidebar__Wrapper ${isSidebarOpen ? "open" : "closed"}`}>
            <div className="sidebar">
                <button className="close-btn" onClick={toggleSidebar}>
                    <IoClose size={24} />
                </button>
                <h1 className="sidebar-title">
                    <div className="flex items-center">
                        <img src="../logoBrandCarRental.ico" alt="Logo_img" className="w-9 h-9" />
                        <Link to={'/'}>
                            <p className="mr-2 font-medium text-3xl text-gray-900 lalezar">سوارینا</p>
                        </Link>
                    </div>
                </h1>

                <ul className="sidebar-links">
                    <li><NavLink to=""><AiOutlineHome className="icon" /> صفحه اصلی</NavLink></li>
                    {isLoginUser && <li><NavLink to="admins"><RiAdminLine className="icon" /> ادمین ها</NavLink></li>}
                    <li><NavLink to="customers"><FiUsers className="icon" /> مشتریان</NavLink></li>
                    <li><NavLink to="vehicles"><FaCarSide className="icon" /> خودرو ها</NavLink></li>
                    <li><NavLink to="vehicleInsurances"><IoBookOutline className="icon" /> بیمه خودرو</NavLink></li>
                    <li><NavLink to="invoices"><SiCodefactor className="icon" /> فاکتور</NavLink></li>
                    <li><NavLink to="rentals"><MdCarRental className="icon" /> اجارات</NavLink></li>
                    <li><NavLink to="payments"><RiSecurePaymentFill className="icon" /> پرداختی ها</NavLink></li>
                    {isLoginUser && <li><NavLink to="posts"><FaRegComments className="icon" /> وبلاگ</NavLink></li>}
                    <li><NavLink to="comments"><FaRegCommentDots className="icon" /> کامنت ها</NavLink></li>
                </ul>
            </div>
        </div>
    );
}
