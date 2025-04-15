import React, { useEffect, useState, useContext } from "react";
import { Input, Button, Spinner, Typography, Select, Option } from "@material-tailwind/react";
import swal from "sweetalert";
import AuthContext from "../../context/authContext";

const Account = () => {
    const authContext = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [userData, setUserData] = useState({
        first_name: "",
        last_name: "",
        gender: "",
        birthday: "",
        national_id: "",
        phone: "",
        username: "",
        email: "",
        address: ""
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const response = await fetch(`${authContext.baseUrl}/customers/${authContext.user.ID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization": `Bearer ${authContext.user.access_token}`,
                "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
            },
        });

        const data = await response.json();
        if (response.status === 200) {
            setUserData(data);
        } else {
            swal({
                title: "متاسفانه در دریافت اطلاعات به مشکل خوردیم",
                icon: "error",
                buttons: "تلاش مجدد",
            })
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: name === "phone" ? Number(value) : value,
        });
    };

    const handleUpdate = async () => {
        if (userData.password && userData.password !== userData.confirm_password) {
            swal({
                title: "رمز عبور و تأیید آن یکسان نیست!",
                icon: "error",
                buttons: "متوجه شدم",
            });
            return;
        }

        swal({
            title: "آیا از ویرایش اطلاعات مطمئن هستید؟",
            text: "پس از ویرایش دیگر امکان بازگشت وجود ندارد!",
            icon: "warning",
            buttons: ["لغو", "بله، ویرایش کن!"],
            dangerMode: true,
        }).then(async (willUpdate) => {
            if (willUpdate) {
                setUpdating(true);

                const updatedData = { ...userData };
                if (!updatedData.password) {
                    delete updatedData.password;
                    delete updatedData.confirm_password;
                }

                const response = await fetch(`${authContext.baseUrl}/customers/${authContext.user.ID}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                        "Authorization": `Bearer ${authContext.user.access_token}`,
                        "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                    },
                    body: JSON.stringify(updatedData),
                });

                if (response.status === 200) {
                    swal({
                        title: "اطلاعات شما با موفقیت ویرایش شد.",
                        icon: "success",
                        buttons: "اوکی",
                    });
                    fetchUserData();
                } else {
                    swal({
                        title: "متاسفانه در ویرایش اطلاعات به مشکل خوردیم",
                        icon: "error",
                        buttons: "تلاش مجدد",
                    });
                }

                setUpdating(false);
            }
        });
    };


    return (
        <div className="container mx-auto lg:w-[60%] w-full py-16 px-4">


            {loading ? (
                <div className="flex justify-center mt-6">
                    <Spinner className="h-7 w-7" />
                </div>
            ) : (

                <>
                    <div className="flex flex-col items-center">

                        <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg">
                            <img src="/img/1.jpg" alt="Profile" className="w-full h-full object-cover" />
                        </div>

                    </div>
                    <div className="mt-6 w-full space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">نام</Typography>
                                <Input color="gray" size="lg" name="first_name" value={userData.first_name} onChange={handleChange} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">نام خانوادگی</Typography>
                                <Input color="gray" size="lg" name="last_name" value={userData.last_name} onChange={handleChange} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">جنسیت</Typography>
                                <Select name="gender" value={userData.gender} onChange={(val) => setUserData({ ...userData, gender: val })}>
                                    <Option value="مرد">مرد</Option>
                                    <Option value="زن">زن</Option>
                                    <Option value="سایر">سایر</Option>
                                </Select>
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">سال تولد</Typography>
                                <Input color="gray" size="lg" name="birthday" value={userData.birthday} onChange={handleChange} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">کد ملی</Typography>
                                <Input color="gray" size="lg" name="national_id" value={userData.national_id} onChange={handleChange} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">شماره موبایل</Typography>
                                <Input color="gray" size="lg" type="number" name="phone" value={userData.phone} onChange={handleChange} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">نام کاربری</Typography>
                                <Input color="gray" size="lg" name="username" value={userData.username} onChange={handleChange} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">ایمیل</Typography>
                                <Input color="gray" size="lg" type="email" name="email" value={userData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">آدرس</Typography>
                            <Input color="gray" size="lg" name="address" value={userData.address} onChange={handleChange} className="w-full" />
                        </div>

                        <hr className="mb-6 mt-20 border-gray-300" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">رمز عبور</Typography>
                                <Input color="gray" size="lg" type="password" name="password" value={userData.password} onChange={handleChange} placeholder="*********" />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">تأیید رمز عبور</Typography>
                                <Input color="gray" size="lg" type="password" name="confirm_password" value={userData.confirm_password} onChange={handleChange} placeholder="*********" />
                            </div>
                        </div>


                        <div className="text-center mt-6">
                            <Button onClick={handleUpdate} disabled={updating} className="w-full max-w-xs bg-blue-gray-900 ">
                                {updating ? <Spinner className="h-5 w-5" /> : "ویرایش اطلاعات"}
                            </Button>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default Account;
