import React, { useContext } from "react";
import AuthContext from "../../context/authContext";
import { Typography, Card } from "@material-tailwind/react";

const CustomerDashboard = () => {
    const authContext = useContext(AuthContext);
    
    const userName = authContext.user?.name || "کاربر عزیز";

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            
            <img 
                src="/carReantal/hello.png"
                alt="لوگوی سایت"
                className="w-44 h-44 mb-6"
            />

            
            <Card className="shadow-none text-center">
                <Typography variant="h4" color="blue-gray" className="mb-2 lalezar">
                    خوش آمدید، {userName}! 👋
                </Typography>
                <Typography variant="paragraph" color="gray">
                    به پنل کاربری خود خوش آمدید. از طریق منوی سایت، به بخش‌های مختلف دسترسی داشته باشید.
                </Typography>
            </Card>
        </div>
    );
};

export default CustomerDashboard;
