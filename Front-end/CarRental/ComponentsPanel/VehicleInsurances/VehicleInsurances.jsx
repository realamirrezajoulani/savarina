import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/authContext";
import swal from "sweetalert";
import { Card, Typography, Spinner, Button, Input, Select, Option } from "@material-tailwind/react";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

const TABLE_HEAD = ["شرکت بیمه", "نوع بیمه", "شماره بیمه‌نامه", "تاریخ شروع", "تاریخ انقضا", "حق بیمه", "خودرو"];

const VehicleInsurances = () => {
    const authContext = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [insuranceData, setInsuranceData] = useState([]);
    const [loader, setLoader] = useState(true);

    const [formData, setFormData] = useState({
        insurance_company: "",
        insurance_type: "شخص ثالث",
        policy_number: "",
        start_date: "",
        expiration_date: "",
        premium: 0,
        vehicle_id: ""
    });

    useEffect(() => {
        getAllInsurances();
    }, []);

    const getAllInsurances = async () => {
        const response = await fetch(`${authContext.baseUrl}/vehicle_insurances` ,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization" : `Bearer ${authContext.user.access_token}`,
                "Authorization-Refresh" : `Bearer ${authContext.user.refresh_token}`
            },
        });
        const data = await response.json();

        if (response.status === 200) {
            console.log(data);
            
            setInsuranceData(data);
            setLoader(false)
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: ["premium"].includes(name)
                ? Number(value) || 0
                : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log(formData);
        

        const response = await fetch(`${authContext.baseUrl}/vehicle_insurances`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization" : `Bearer ${authContext.user.access_token}`,
                "Authorization-Refresh" : `Bearer ${authContext.user.refresh_token}`

            },
            body: JSON.stringify(formData),
        });

        if (response.status === 200) {
            setLoading(false);
            swal({
                title: "بیمه با موفقیت ثبت شد",
                icon: "success",
                buttons: "باشه",
            });
            getAllInsurances();
            setFormData({
                insurance_company: "",
                insurance_type: "شخص ثالث",
                policy_number: "",
                start_date: "",
                expiration_date: "",
                premium: 0,
                vehicle_id: ""
            });
        } else {
            setLoading(false);
            swal({
                title: "مشکلی در ارسال اطلاعات پیش آمد",
                icon: "error",
                buttons: "تلاش مجدد",
            });
        }
    };

    const showVehicleInfo = (vehicle) => {
        swal({
            title: `اطلاعات خودرو - ${vehicle.plate_number}`,
            text: `
            برند: ${vehicle.brand}
            مدل: ${vehicle.model}
            رنگ: ${vehicle.color}
            موقعیت: ${vehicle.location}
            سال ساخت: ${vehicle.year}
            کارکرد: ${vehicle.mileage} کیلومتر
            وضعیت: ${vehicle.status}
            نرخ اجاره ساعتی: ${vehicle.hourly_rental_rate.toLocaleString()} تومان
            مبلغ ودیعه: ${vehicle.security_deposit.toLocaleString()} تومان
            `,
            icon: "info",
            button: "بستن",
        });
    };

    const handleDelete = async (id) => {
        swal({
            title: "آیا مطمئن هستید؟",
            text: "این عملیات قابل بازگشت نیست!",
            icon: "warning",
            buttons: ["لغو", "حذف"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                const response = await fetch(`${authContext.baseUrl}/vehicle_insurances/${id}`, {
                    method: "DELETE",
                    "Authorization" : `Bearer ${authContext.user.access_token}`,
                    "Authorization-Refresh" : `Bearer ${authContext.user.refresh_token}`
                });

                if (response.status === 200) {
                    swal({title:"بیمه با موفقیت حذف شد!",  icon: "success" ,buttons: "باشه",});
                    getAllInsurances();
                } else {
                    swal({title:"خطا در حذف",  icon: "error" ,buttons: "باشه",});
                }
            }
        });
    };

    const handleEdit = (insurance) => {
        console.log(insurance);
        
    };

    return (

        <>
            {loader ? (
                <Spinner className="h-8 w-8 mx-auto mt-16" />
            ) : (
                <div className="container mx-auto p-6">

                    <Card className="w-full max-w-xl mx-auto p-6 mb-16 bg-white shadow-lg rounded-md">
                        <Typography variant="h5" className="text-center text-gray-900 font-bold mb-4">
                            ثبت اطلاعات بیمه خودرو
                        </Typography>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">نام شرکت بیمه</Typography>
                                <Input color="gray" size="lg" name="insurance_company" value={formData.insurance_company} onChange={handleChange} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">نوع بیمه</Typography>
                                <Select name="insurance_type" value={formData.insurance_type} onChange={(val) => setFormData({ ...formData, insurance_type: val })}>
                                    <Option value="شخص ثالث">شخص ثالث</Option>
                                    <Option value="بدنه خودرو">بدنه خودرو</Option>
                                    <Option value="حوادث سرنشین">حوادث سرنشین</Option>
                                </Select>
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">شماره بیمه‌نامه</Typography>
                                <Input color="gray" size="lg" name="policy_number" value={formData.policy_number} onChange={handleChange} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">تاریخ شروع</Typography>
                                    <Input type="text" color="gray" size="lg" name="start_date" value={formData.start_date} onChange={handleChange} />
                                </div>
                                <div>
                                    <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">تاریخ انقضا</Typography>
                                    <Input type="text" color="gray" size="lg" name="expiration_date" value={formData.expiration_date} onChange={handleChange} />
                                </div>
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">حق بیمه (تومان)</Typography>
                                <Input type="number" color="gray" size="lg" name="premium" value={formData.premium} onChange={handleChange} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">شناسه وسیله نقلیه</Typography>
                                <Input color="gray" size="lg" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} />
                            </div>

                            <Button type="submit" className="w-full bg-blue-gray-900 text-white">
                                {loading ? <Spinner className="inline h-4 w-4" /> : "ثبت اطلاعات بیمه"}
                            </Button>
                        </form>
                    </Card>


                    <Card className="h-full w-full overflow-scroll">
                        <Typography variant="h5" className="text-center text-gray-900 font-bold mb-4">
                            لیست بیمه‌ها
                        </Typography>

                        <table className="w-full min-w-max table-auto text-right">
                            <thead>
                                <tr>
                                    {TABLE_HEAD.map((head) => (
                                        <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography className="font-normal leading-none opacity-70">{head}</Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {insuranceData.map((insurance, index) => (
                                    <tr key={insurance.id}>
                                        <td className="p-4">{insurance.insurance_company}</td>
                                        <td className="p-4">{insurance.insurance_type}</td>
                                        <td className="p-4">{insurance.policy_number}</td>
                                        <td className="p-4">{insurance.start_date}</td>
                                        <td className="p-4">{insurance.expiration_date}</td>
                                        <td className="p-4">{insurance.premium.toLocaleString()}</td>
                                        <td className="p-4">
                                            <Button size="sm" onClick={() => showVehicleInfo(insurance.vehicle)}>نمایش</Button>
                                        </td>
                                        <button className='p-2 ml-2 pl-3 rounded-full bg-blue-gray-900 text-white text-xl'  onClick={() => handleEdit(insurance)}><FaEdit /></button>
                                                                                                <button className='p-2 rounded-full bg-blue-gray-900 text-white text-xl' onClick={() => handleDelete(insurance.id)}><MdDelete /></button>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </Card>
                </div>
            )
            }
        </>

    );
};

export default VehicleInsurances;
