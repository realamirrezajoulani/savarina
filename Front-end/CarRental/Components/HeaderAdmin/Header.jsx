import React, { useContext } from 'react';
import { AiOutlineBell } from 'react-icons/ai';
import { TbLogout2 } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import { CgMenuRight } from "react-icons/cg";
import AuthContext from '../../context/authContext';
import './Header.css';

export default function Header({ toggleSidebar }) {
    const authContext = useContext(AuthContext);

    return (
        <div className='header'>
            <div className='flex'>
                <button className="menu-btn" onClick={toggleSidebar}>
                    <CgMenuRight size={24} />
                </button>

                <div className="admin-profile">
                    <img src="/img/1.jpg" alt="Admin Profile" />
                    <div>
                        <h1>سبحان موسی زاده</h1>
                        <h3 className="text-sm">برنامه نویس فرانت اند</h3>
                    </div>
                </div>
            </div>

            <div className='header-left-section'>
                <div className="search-box">
                    <input type="text" placeholder='جست و جو کنید ...' />
                    <button><FaSearch /></button>
                </div>

                <button className='header-left-icon'><AiOutlineBell /></button>
                <button className='header-left-icon' onClick={() => authContext.LogOut()}><TbLogout2  /></button>
            </div>
        </div>
    );
}
