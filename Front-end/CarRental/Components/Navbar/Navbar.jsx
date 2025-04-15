import React, { useState, useEffect, useContext } from "react";
import {
    Navbar,
    MobileNav,
    Button,
    IconButton,
} from "@material-tailwind/react";
import { BsCart2 } from "react-icons/bs";
import { RiMenu2Line } from "react-icons/ri";
import { FaRegUser, FaCar, FaUserAlt } from "react-icons/fa";
import { IoSettingsSharp, IoLogOut, IoCloseOutline } from "react-icons/io5";
import { IoIosHelpCircle } from "react-icons/io";
import { Link } from "react-router-dom";
import AuthContext from "../../context/authContext";
export function NavbarDefault() {
    const [openNav, setOpenNav] = useState(false);
    const [openDropDown, setOpenDropDown] = useState(false);

    useEffect(() => {
        window.addEventListener(
            "resize",
            () => window.innerWidth >= 960 && setOpenNav(false),
        );
    }, []);

    // ! Login

    const authContext = useContext(AuthContext)

    const [isLoginUser, setIsLoginUser] = useState(false)

    useEffect(() => {

        authContext.isLogin() && setIsLoginUser(true)

    }, [])

    // ! Logout

    const LogoutHandler = async () => {
        const checkLogOut = await authContext.LogOut()
        if (checkLogOut) {
            setIsLoginUser(false)
        }
    }

    const navList = (
        <ul className="text-blue-gray-900 mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
            <li>
                <p className="text-sm cursor-pointer">صفحه اصلی</p>
            </li>
            <li>
                <p className="text-sm cursor-pointer"> اجاره خودرو</p>
            </li>
            <li>
                <p className="text-sm cursor-pointer">ویژگی های سوارینا</p>
            </li>
            <li>
                <p className="text-sm cursor-pointer">وبلاگ</p>
            </li>
            <li>
                <p className="text-sm cursor-pointer">ارتباط با ما</p>
            </li>
        </ul>
    )


    return (
        <>
            <header className="hidden lg:block w-full fixed top-0 lg:top-3 left-0 mx-auto z-50">
                <Navbar className="w-full lg:w-[80%] px-4 py-2 lg:px-8 mx-auto  shadow-lg bgNavbar">
                    <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
                        <div className="flex items-center justify-between">
                            <img src="../logoBrandCarRental.ico" alt="Logo_img" className="w-9 h-9" />
                            <Link to={'/'}>
                                <p
                                    className="mr-2 cursor-pointer py-1.5 font-medium lalezar text-3xl text-gray-900"
                                >
                                    سوارینا
                                </p>
                            </Link>

                        </div>
                        <div className="hidden lg:block">
                            {navList}
                        </div>
                        <div className="flex items-center gap-x-1">

                            {
                                isLoginUser ? (
                                    <div className=" relative flex gap-x-2 items-center justify-start">

                                        <Link to={'/cart'}>
                                            <Button
                                                variant="filled"
                                                size="sm"
                                                className="hidden lg:inline-block p-3 text-lg rounded-full"
                                            >
                                                <span><BsCart2 /></span>
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="filled"
                                            size="sm"
                                            className="hidden lg:inline-block p-3 text-lg rounded-full"
                                            onClick={() => setOpenDropDown(prev => !prev)}
                                        >
                                            <span><FaRegUser /></span>
                                        </Button>


                                        {
                                            openDropDown && (
                                                <ul className=" absolute -bottom-52 -left-20 w-40 p-2 bg-white shadow-lg rounded-lg">
                                                    <Link to={authContext.user.role == "SuperAdmin" || authContext.user.role == "Admin" ? "/p-admin/" : "/c-admin/"}>
                                                        <li className="px-2 py-3 cursor-pointer hover:bg-blue-gray-100 rounded-md"><FaUserAlt className="inline ml-1" /> پنل کاربری</li>
                                                    </Link>
                                                    <li className="px-2 py-3 cursor-pointer hover:bg-blue-gray-100 rounded-md"> <IoSettingsSharp className="inline ml-1" /> تنظیمات</li>
                                                    <li className="px-2 py-3 cursor-pointer hover:bg-blue-gray-100 rounded-md"><IoIosHelpCircle className="inline ml-1" /> راهنما</li>
                                                    <hr className="my-2" />
                                                    <li className="px-2 py-3 cursor-pointer hover:bg-blue-gray-100 rounded-md" onClick={LogoutHandler}><IoLogOut className="inline ml-1" /> خروج</li>
                                                </ul>

                                            )
                                        }

                                        {/* <Link to={'/p-admin/'}>
                                            <Button
                                                variant="filled"
                                                size="sm"
                                                className="hidden lg:inline-block py-2 px-5 text-sm"
                                            >
                                                <span><FaRegUser className="inline ml-2" />پنل کاربری</span>
                                            </Button>
                                        </Link>
                                        <span className=" cursor-pointer" onClick={LogoutHandler}><TbLogout2 className="inline mx-2" />خروج</span> */}
                                    </div>
                                ) : (

                                    <Link to={'/login'}>
                                        <Button
                                            variant="filled"
                                            size="sm"
                                            className="hidden lg:inline-block py-2 px-5 text-sm"
                                        >
                                            <span><FaRegUser className="inline ml-2" />ورود / ثبت نام</span>

                                        </Button>

                                    </Link>
                                )
                            }
                        </div>
                        <IconButton
                            variant="text"
                            className="mr-auto flex items-center justify-center lg:hidden"
                            ripple={false}
                            onClick={() => setOpenNav(!openNav)}
                        >
                            {openNav ? (
                                <IoCloseOutline className="text-2xl" />
                            ) : (
                                <RiMenu2Line className="text-2xl" />
                            )}
                        </IconButton>
                    </div>
                </Navbar>
            </header>


            <div className="lg:hidden w-full fixed bottom-3 z-50 mx-auto">
                <div
                    className="border mx-auto p-2 w-max bgNavbar flex shadow-2xl rounded-xl backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                >
                    <Link to={'/'}>
                        <div className="group relative px-3 cursor-pointer">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-blue-gray-200 hover:text-blue-gray-900 transition-colors duration-300"
                            >
                                <svg
                                    className="group-hover:scale-110 transition-transform duration-300"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                                        stroke-width="2"
                                        stroke="currentColor"
                                    ></path>
                                </svg>
                            </div>
                            <span
                                className="absolute -top-12 left-[50%] -translate-x-[50%] z-20 origin-bottom scale-0 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 before:absolute before:bottom-[-5px] before:left-[50%] before:-translate-x-[50%] before:border-[6px] before:border-transparent before:border-t-white"
                            >
                                خانه
                            </span>
                        </div>
                    </Link>

                    <Link to={'/blogList'}>
                        <div className="group relative px-3 cursor-pointer">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-blue-gray-200 hover:text-blue-gray-900 transition-colors duration-300"
                            >
                                <svg
                                    className="group-hover:scale-110 transition-transform duration-300"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                                        stroke-linejoin="round"
                                        stroke-linecap="round"
                                        stroke-width="2"
                                        stroke="currentColor"
                                    ></path>
                                </svg>
                            </div>
                            <span
                                className="absolute -top-12 left-[50%] -translate-x-[50%] z-20 origin-bottom scale-0 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 before:absolute before:bottom-[-5px] before:left-[50%] before:-translate-x-[50%] before:border-[6px] before:border-transparent before:border-t-white"
                            >
                                وبلاگ
                            </span>
                        </div>
                    </Link>

                    {
                        authContext.isLogin() ? (
                            <Link to={'/cart'}>
                                <div className="group relative px-3 cursor-pointer">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-blue-gray-200 hover:text-blue-gray-900 transition-colors duration-300">
                                        <BsCart2 className="text-xl" />
                                    </div>
                                    <span className="absolute -top-12 left-[50%] -translate-x-[50%] z-20 origin-bottom scale-0 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 before:absolute before:bottom-[-5px] before:left-[50%] before:-translate-x-[50%] before:border-[6px] before:border-transparent before:border-t-white">
                                        لیست اجارات
                                    </span>
                                </div>
                            </Link>
                        ) : (<></>)
                    }



                    <Link to={authContext.isLogin() ? (authContext.user?.role === "Admin" || authContext.user?.role === "SuperAdmin" ? "/p-admin/" : "/c-admin/") : "/login"}>
                        <div className="group relative px-3 cursor-pointer">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-blue-gray-200 hover:text-blue-gray-900 transition-colors duration-300">
                                <svg className="group-hover:scale-110 transition-transform duration-300" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor"></path>
                                </svg>
                            </div>
                            <span className="absolute -top-12 left-[50%] -translate-x-[50%] z-20 origin-bottom scale-0 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 before:absolute before:bottom-[-5px] before:left-[50%] before:-translate-x-[50%] before:border-[6px] before:border-transparent before:border-t-white">
                                حساب کاربری
                            </span>
                        </div>
                    </Link>


                    <Link to={'/carList'}>
                        <div className="group relative px-3 cursor-pointer">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-blue-gray-200 hover:text-blue-gray-900 transition-colors duration-300"
                            >
                                <FaCar className="text-xl" />
                            </div>
                            <span
                                className="absolute -top-12 left-[50%] -translate-x-[50%] z-20 origin-bottom scale-0 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 before:absolute before:bottom-[-5px] before:left-[50%] before:-translate-x-[50%] before:border-[6px] before:border-transparent before:border-t-white"
                            >
                                خودرو
                            </span>
                        </div>
                    </Link>
                </div>
            </div>


        </>
    );
}