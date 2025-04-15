import React, { useState } from "react";
import { Switch, Card, Typography } from "@material-tailwind/react";

const Setting = () => {
    const [settings, setSettings] = useState({
        privacy: true,
        notifications: false,
        emailUpdates: true,
        darkMode: false,
        twoFactorAuth: true,
    });
    const handleSwitch = (name) => {
        setSettings((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    return (
        <div className="container mx-auto lg:w-[50%] w-full py-16 px-4">
            <Typography variant="h4" className="text-center mb-6">
                تنظیمات حساب
            </Typography>

            <Card className="p-6 space-y-4 shadow-md">
                <div className="flex justify-between items-center">
                    <Typography variant="h6">حریم خصوصی</Typography>
                    <Switch checked={settings.privacy} onChange={() => handleSwitch("privacy")} />
                </div>

                <div className="flex justify-between items-center">
                    <Typography variant="h6">دریافت اعلان‌ها</Typography>
                    <Switch checked={settings.notifications} onChange={() => handleSwitch("notifications")} />
                </div>

                <div className="flex justify-between items-center">
                    <Typography variant="h6">دریافت ایمیل‌های بروزرسانی</Typography>
                    <Switch checked={settings.emailUpdates} onChange={() => handleSwitch("emailUpdates")} />
                </div>

                <div className="flex justify-between items-center">
                    <Typography variant="h6">حالت تاریک</Typography>
                    <Switch checked={settings.darkMode} onChange={() => handleSwitch("darkMode")} />
                </div>

                <div className="flex justify-between items-center">
                    <Typography variant="h6">احراز هویت دو مرحله‌ای</Typography>
                    <Switch checked={settings.twoFactorAuth} onChange={() => handleSwitch("twoFactorAuth")} />
                </div>
            </Card>
        </div>
    );
};

export default Setting;
