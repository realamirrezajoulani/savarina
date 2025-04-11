import React, { useState, useContext, useEffect, useMemo } from "react";
import { NavbarDefault } from "../Components/Navbar/Navbar";
import { Footer } from "../Components/Footer/Footer";
import AuthContext from "../context/authContext";
// import { Spinner, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import {
    Option,
    Card,
    Button,
    Stepper,
    CardBody,
    Select,
    Typography,
    IconButton,
} from "@material-tailwind/react";
import { Alert } from "@material-tailwind/react";
import { Spinner } from "@material-tailwind/react";
import swal from "sweetalert";
import { MdOutlineArrowCircleDown, MdDelete, MdOutlinePayment } from "react-icons/md";
import { FaPencil } from "react-icons/fa6";
const Cart = () => {
    const authContext = useContext(AuthContext);
    const [loader, setLoader] = useState(false);
    const [rentalData, setRentalData] = useState([]);
    const [paymentInput, setPaymentInput] = useState("پرداخت اینترنتی");
    // const [priceTotal, setPriceTotal] = useState(0);

    let totalHelp = 0

    useEffect(() => {
        getAllRentals();
    }, []);

    const getAllRentals = async () => {
        const responseRental = await fetch(`${authContext.baseUrl}/rentals`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization": `Bearer ${authContext.user.access_token}`,
                "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`,
            },
        });
        const data = await responseRental.json();

        // console.log(data);


        if (responseRental.status === 200) {
            setLoader(true)

            const RentalNew = data.filter((rental) => rental.invoice.status == "ایجاد شده")

            setRentalData(RentalNew);
        } else {
            swal({
                title: data.detail,
                icon: "error",
                buttons: "تلاش مجدد",
            })
        }
    };

    const handleRemove = async (id) => {
        const responseDeleteRental = await fetch(`${authContext.baseUrl}/rentals/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization": `Bearer ${authContext.user.access_token}`,
                "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
            },
        });

        console.log(responseDeleteRental);

        console.log(id);



        if (responseDeleteRental.status === 200) {
            setRentalData(rentalData.filter((rental) => rental.id !== id));
        } else {
            alert("حذف با مشکل مواجه شد!");
        }
    };

    const handleFullPayment = async () => {


        const resLoginAdmin = await fetch(`${authContext.baseUrl}/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'accept': 'application/json'
            },
            body: 'username=amirj&password=StringStringString1@',
        });



        if (resLoginAdmin.status === 200) {
            resLoginAdmin.json().then(async (dataLogin) => {

                const objPayment = {
                    "payment_datetime": "1404/01/12 20:05:04",
                    "payment_method": paymentInput,
                    "transaction_id": null,
                    "amount": Number(priceTotal - (priceTotal * 10 / 100)),
                    "payment_status": paymentInput == "پرداخت اینترنتی" ? "تایید شده" : "در انتظار تایید",
                    "invoice_id": rentalData[0].invoice.id
                }

                console.log(objPayment);



                const responsePaymentCreate = await fetch(`${authContext.baseUrl}/payments`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                        "Authorization": `Bearer ${dataLogin.access_token}`,
                        "Authorization-Refresh": `Bearer ${dataLogin.refresh_token}`
                    },
                    body: JSON.stringify(objPayment)
                });

                console.log(responsePaymentCreate);



                if (responsePaymentCreate.status === 200) {
                    swal({
                        title: "با موفقیت پرداخت انجام شد",
                        icon: "success",
                        buttons: "اوکی",
                    })
                } else {
                    swal({
                        title: "ارسال پرداخت شما به مشکل خورد...",
                        icon: "error",
                        buttons: "تلاش مجدد",
                    })
                }

            })


        };
    }

    const priceTotal = useMemo(() => {
        return rentalData.reduce((sum, rent) => sum + rent.total_amount, 0);
    }, [rentalData]);



    return (
        <>
            <NavbarDefault />
            {/* <div className="container mx-auto lg:w-[80%] w-[90%] md:py-28 pb-12 min-h-screen">
                <h3 className="text-3xl font-bold text-gray-800 mb-6 text-right titleSlider lalezar">
                    سبد اجارات
                </h3>

                {loader ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner className="h-12 w-12 text-blue-500" />
                        <span className="ml-3 text-lg text-gray-700">لطفاً صبر کنید...</span>
                    </div>
                ) : rentalData.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">هیچ اجاره‌ای یافت نشد</p>
                ) : (
                    <>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {rentalData.map((rental) => (
                                <Card key={rental.id} className="flex flex-col md:flex-row shadow-lg">
                                    
                                    <CardHeader className="w-full md:w-1/3 h-40">
                                        <img
                                            src={rental.vehicle.local_image_address}
                                            alt={rental.vehicle.brand}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </CardHeader>

                                    
                                    <CardBody className="w-full md:w-2/3 flex flex-col justify-between p-4">
                                        <div>
                                            <Typography variant="h5" color="blue-gray">
                                                {rental.vehicle.brand} {rental.vehicle.model}
                                            </Typography>
                                            <Typography color="gray" className="mt-1">
                                                رنگ: {rental.vehicle.color} | پلاک: {rental.vehicle.plate_number}
                                            </Typography>
                                            <Typography color="gray">
                                                مکان: {rental.vehicle.location}
                                            </Typography>
                                            <Typography color="gray">
                                                از <span className="font-bold">{rental.rental_start_date}</span> تا{" "}
                                                <span className="font-bold">{rental.rental_end_date}</span>
                                            </Typography>
                                            <Typography variant="h6" color="black" className="mt-2">
                                                مبلغ کل: {rental.total_amount.toLocaleString()} تومان
                                            </Typography>
                                        </div>

                                        
                                        <div className="flex justify-end mt-4">
                                            <Button
                                                color="red"
                                                variant="outlined"
                                                ripple="light"
                                                onClick={() => handleRemove(rental.id)}
                                            >
                                                حذف
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        
                        <div className="flex justify-center mt-8">
                            <Button
                                color="green"
                                ripple="light"
                                className="w-full max-w-xs text-lg py-3"
                                onClick={handleFullPayment}
                            >
                                پرداخت کامل
                            </Button>
                        </div>
                    </>
                )}
            </div> */}





            <section className="container mx-auto lg:w-[80%] w-[90%] py-20 px-8">

                <div className="mt-8 grid lg:gap-x-6 gap-y-6 lg:grid-cols-12 grid-cols-6">

                    <div className="col-span-8 space-y-6">
                        <Card className="border border-gray-300 !rounded-md shadow-sm">
                            <CardBody className="p-4 flex gap-4 flex-col md:flex-row items-center justify-between">
                                <div className="flex !justify-between w-full">
                                    <div>
                                        <Typography color="blue-gray" className="!font-semibold">
                                            تاریخ سفارش
                                        </Typography>
                                        <Typography className="text-gray-600 font-normal">
                                            ۱ آوریل ۲۰۲۳
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography color="blue-gray" className="!font-semibold">
                                            شماره سفارش
                                        </Typography>
                                        <Typography className="text-gray-600 font-normal">
                                            #۱۲۳۴۵۶۷۸۹
                                        </Typography>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <Button
                                        variant="outlined"
                                        className="mr-auto border-gray-200 flex items-center justify-center gap-2 w-full md:max-w-fit shadow-lg"
                                    >
                                        دانلود فاکتور
                                        <MdOutlineArrowCircleDown className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="border border-gray-300 !rounded-md shadow-sm">
                            <CardBody className="md:px-2 pb-14">
                                {
                                    loader ? (
                                        rentalData.length ? (
                                            rentalData.map((rent) => (
                                                <div key={rent.id} className="relative space-y-10 flex flex-wrap justify-center gap-x-4 md:justify-start items-start">
                                                    <img src={rent.vehicle.local_image_address} className="h-[140px] rounded-lg" alt={rent.vehicle.model} />
                                                    <div className="-translate-y-6 space-y-1 md:text-start text-center w-auto">
                                                        <Typography variant="h6" color="blue-gray">
                                                            {rent.vehicle.model} {rent.vehicle.brand}
                                                        </Typography>
                                                        <Typography className="font-normal text-gray-600">پلاک : {rent.vehicle.plate_number}</Typography>
                                                        <Typography className="font-normal text-gray-600">موقعیت : {rent.vehicle.location}</Typography>
                                                        <Typography className="font-normal text-gray-600">رنگ : {rent.vehicle.color}</Typography>
                                                    </div>
                                                    <Typography className="absolute left-0 bottom-7 text-sm text-gray-600">{rent.total_amount} <sub>تومان</sub></Typography>
                                                    <button className=" absolute left-0 -top-7 border-2 rounded-md border-solid border-blue-gray-100 p-1 text-lg cursor-pointer" onClick={() => handleRemove(rent.id)}><MdDelete /></button>
                                                </div>
                                            ))
                                        ) : (
                                            <Alert>محصولی وجود ندارد...</Alert>
                                        )
                                    ) : (
                                        <Spinner className="mx-auto" />
                                    )

                                }
                            </CardBody>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 col-span-full space-y-6">
                        <Card className="border border-gray-300 !rounded-md shadow-sm">
                            <CardBody className="p-4">
                                <Typography color="blue-gray" className="!font-semibold">
                                    جزئیات پرداخت
                                </Typography>
                                <div className="my-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-gray-600 font-normal">مجموع اجارات</Typography>
                                        <Typography className="text-gray-600 font-normal">{priceTotal.toLocaleString()} <sub>تومان</sub></Typography>
                                    </div>
                                </div>
                                <div className="my-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-gray-600 font-normal">تخفیفات</Typography>
                                        <Typography className="text-gray-600 font-normal">0%</Typography>
                                    </div>
                                </div>
                                <div className="my-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-gray-600 font-normal">مالیات</Typography>
                                        <Typography className="text-gray-600 font-normal">10%</Typography>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-300 pt-4">
                                    <Typography color="blue-gray" className="!font-semibold">
                                        مجموع سفارش
                                    </Typography>
                                    <Typography color="blue-gray" className="!font-semibold">
                                        {(priceTotal - (priceTotal * 10 / 100)).toLocaleString()} تومان
                                    </Typography>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="border border-gray-300 !rounded-md shadow-sm">
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <Typography color="blue-gray" className="!font-semibold">
                                        مشخصات فردی
                                    </Typography>
                                    <IconButton size="sm" variant="outlined" className="border-gray-300 !rounded-md">
                                        <FaPencil className="h-3.5 w-3.5 text-gray-900" />
                                    </IconButton>
                                </div>
                                {
                                    rentalData.length ? (

                                        <div className="space-y-2 mt-4">
                                            <Typography className="text-gray-600 font-normal">{rentalData[0].customer.address}</Typography>
                                            <Typography className="text-gray-600 font-normal">{rentalData[0].customer.email}</Typography>
                                            <Typography className="text-gray-600 font-normal">+98 {rentalData[0].customer.phone}   </Typography>
                                        </div>
                                    ) : (<></>)
                                }
                            </CardBody>
                        </Card>
                        <Card className="border border-gray-300 !rounded-md shadow-sm">
                            <CardBody className="p-4 w-auto mx-auto">
                                <Select label="" value={paymentInput} onChange={(val) => setPaymentInput(val)}>
                                    <Option value="انتقال وجه کارت به کارت">انتقال وجه کارت به کارت</Option>
                                    <Option value="انتقال وجه ساتنا">انتقال وجه ساتنا</Option>
                                    <Option value="انتقال وجه پایا">انتقال وجه پایا</Option>
                                    <Option value="پرداخت اینترنتی">پرداخت اینترنتی</Option>
                                    <Option value="سایر">سایر</Option>
                                </Select>

                                <button
                                    className="overflow-hidden mx-auto relative w-56 p-2 h-12 bg-blue-gray-900 text-white border-none rounded-md text-xl  cursor-pointer z-10 group mt-4"
                                    onClick={handleFullPayment}
                                >
                                    ادامه سفارش
                                    <span
                                        className="absolute w-60 h-32 -top-8 -left-2 bg-blue-gray-400 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-right"
                                    ></span>
                                    <span
                                        className="absolute w-60 h-32 -top-8 -left-2 bg-blue-gray-600 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-right"
                                    ></span>
                                    <span
                                        className="absolute w-60 h-32 -top-8 -left-2 bg-blue-gray-800 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-right"
                                    ></span>
                                    <span
                                        className="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute top-2.5 left-12 z-10"
                                    >
                                        <MdOutlinePayment className="inline" /> پرداخت فاکتور
                                    </span>
                                </button>

                            </CardBody>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Cart;
