import React, { useEffect, useContext, useState } from 'react';
import { NavbarDefault } from '../Components/Navbar/Navbar';
import { Footer } from '../Components/Footer/Footer';
import DefaultAccordion from '../Components/FAQs/FAQs';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from "../context/authContext";
import swal from "sweetalert";
import {
    Timeline,
    TimelineItem,
    TimelineConnector,
    TimelineHeader,
    TimelineIcon,
    TimelineBody,
    Typography,
    Carousel,
    Button,
    Input,
    Textarea
} from "@material-tailwind/react";

import { Rating } from "@material-tailwind/react";
import { LiaTelegram } from "react-icons/lia";
import { AiOutlineInstagram } from "react-icons/ai";
import { FaLocationDot, FaBookOpen } from "react-icons/fa6";
import { IoIosApps, IoIosTimer } from "react-icons/io";
import { PiStarFill, PiStarBold } from "react-icons/pi";
import { Spinner } from "@material-tailwind/react";

const CarPage = () => {
    const authContext = useContext(AuthContext)
    const { carId } = useParams()
    const [singleCarData, setSingleCarData] = useState([])
    const [isLoginUser, setIsLoginUser] = useState(false)
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        authContext.isLogin() && setIsLoginUser(true)
        getOneCar()
    }, [])

    const getOneCar = async () => {
        const response = await fetch(`${authContext.baseUrl}/vehicles/${carId}`);

        const carRes = await response.json();



        if (response.status === 200) {
            setSingleCarData(carRes)
        }
    }



    const RentalHandle = async () => {

        if (isLoginUser) {

            setLoading(true)

            const responseInvoices = await fetch(`${authContext.baseUrl}/invoices`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "Authorization": `Bearer ${authContext.user.access_token}`,
                    "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                },
            });

            const ResInvoices = await responseInvoices.json();


            if (responseInvoices.status === 200) {


                let invoicesUser = ResInvoices.find((inv) => inv.status == "ایجاد شده")

                let invoicesId = invoicesUser && invoicesUser.id


                if (!invoicesUser) {
                    console.log("Create invoices...");

                    const bodyInvoicesPost = {
                        "total_amount": 0,
                        "tax": 0,
                        "discount": 0,
                        "final_amount": 0,
                        "status": "ایجاد شده"
                    }

                    const responseInvoicesPost = await fetch(`${authContext.baseUrl}/invoices`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "accept": "application/json",
                            "Authorization": `Bearer ${authContext.user.access_token}`,
                            "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                        },
                        body: JSON.stringify(bodyInvoicesPost)
                    });

                    const ResInvoicesPost = await responseInvoicesPost.json();

                    if (responseInvoicesPost.status === 200) {
                        invoicesId = ResInvoicesPost.id
                    }

                }

                // ? Create Rental

                console.log("Create Rental...");

                const bodyCreateRental = {
                    "rental_start_date": "1404/03/03",
                    "rental_end_date": "1404/07/07",
                    "total_amount": 1000,
                    "customer_id": authContext.user.ID,
                    "vehicle_id": singleCarData.id,
                    "invoice_id": invoicesId
                }


                const responseCreateRental = await fetch(`${authContext.baseUrl}/rentals`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                        "Authorization": `Bearer ${authContext.user.access_token}`,
                        "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                    },
                    body: JSON.stringify(bodyCreateRental)
                });

                if (responseCreateRental.status === 200) {


                    // const responsePut = await fetch(`${authContext.baseUrl}/vehicles/${singleCarData.id}`, {
                    //     method: "PATCH",
                    //     headers: {
                    //         "Content-Type": "application/json",
                    //         "accept": "application/json",
                    //         "Authorization": `Bearer ${authContext.user.access_token}`,
                    //         "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                    //     },
                    //     body: JSON.stringify({ "status": "اجاره شده" }),
                    // });

                    // if (responsePut.status === 200) {

                    // }
                    setLoading(false)
                    swal({
                        title: "با موفقیت به سبد اجارات شما اضافه شد",
                        icon: "success",
                        buttons: "باشه",
                    })
                    getOneCar()




                }

            }


        } else {
            swal({
                title: "برای اجاره ابتدا وارد شوید",
                icon: "success",
                buttons: "صفحه ورود",
            }).then((value) => {
                navigate("/login");
            });
        }

    }
    return (
        <>
            <NavbarDefault />
            <div className="container mx-auto lg:w-[80%] w-[90%] pt-24">
                <Carousel className="rounded-xl w-full overflow-hidden mb-14">
                    <img
                        src={singleCarData.local_image_address}
                        alt="image 1"
                        className="max-h-[600px] w-full object-cover"
                    />
                </Carousel>
                <div className="lg:mb-16 mb-4 container mx-auto grid lg:gap-x-8 gap-y-8 grid-cols-1 lg:grid-cols-3 gap-x-4 w-full relative">
                    <div className=" col-span-1 md:col-span-2 shadow-lg rounded-xl py-9 px-7 h-max flex flex-col gap-y-10">
                        <h1 className='text-3xl'>{singleCarData.brand} {singleCarData.model}<sub className='text-lg'>(۲۰۱۹ - {singleCarData.year})</sub></h1>
                        <div className='flex items-center justify-start gap-x-2'>
                            <span>نظرات کاربران : <PiStarFill className='inline mx-0 text-lg text-yellow-600' /><PiStarFill className='inline mx-0 text-lg text-yellow-600' /><PiStarFill className='inline mx-0 text-lg text-yellow-600' /><PiStarFill className='inline mx-0 text-lg text-yellow-600' /><PiStarBold className='inline mx-0 text-lg' /></span>
                        </div>

                        <div className="w-full">
                            <Timeline>
                                <TimelineItem>
                                    <TimelineConnector />
                                    <TimelineHeader>
                                        <TimelineIcon className="p-2">
                                            <FaLocationDot />
                                        </TimelineIcon>
                                        <Typography variant="h5" color="blue-gray">
                                            <p>محل خودرو و تحویل</p>
                                        </Typography>
                                    </TimelineHeader>
                                    <TimelineBody className="pb-8">
                                        <Typography color="gary" className="font-blod mt-3 text-gray-600">
                                            استان {singleCarData.location}
                                        </Typography>
                                        <Typography color="gary" className="font-blod mt-3 text-gray-600">
                                            وضعیت خودرو : {singleCarData.status}
                                        </Typography>
                                    </TimelineBody>
                                </TimelineItem>
                                <TimelineItem>
                                    <TimelineConnector />
                                    <TimelineHeader>
                                        <TimelineIcon className="p-2">
                                            <FaBookOpen />
                                        </TimelineIcon>
                                        <Typography variant="h5" color="blue-gray">
                                            <p>شرایط اجاره و کنسلی</p>
                                        </Typography>
                                    </TimelineHeader>
                                    <TimelineBody className="pb-8">
                                        <Typography color="gary" className="font-normal text-gray-600">
                                            🔴 گواهینامه معتبر. <br />
                                            🟠 افراد بالای ۲۴ سال. 🚻<br />
                                            🔘 مدارک شغلی و سکونتی. 📜<br />
                                            🟤 چک یا سفته به مبلغ ماشین. 📝<br />
                                            🟣 بیمه‌نامه اجاره فقط طرح الماس 🗒<br />
                                            ⚪️ ودیعه نقدی به مبلغ: ۷ میلیون تومان 💵<br />
                                            🔵 تحویل خودرو در کرج مهرشهر رایگان میباشد 🆓<br />
                                            🟢 تحویل یکطرفه درب منزل کرج (۲۵۰ت)🏛<br />
                                            🟡تحویل یکطرفه درب منزل در داخل تهران (۵۰۰ت)🏡<br />
                                            🟣 تحویل یکطرفه فرودگاه امام خمینی (۶۵۰ت) ✈️<br />
                                            🟥 ساعت تحویل درب منزل از ۹:۳۰ الی ۱۸:۰۰ میباشد ⏰️<br />
                                            ⛔️ محدودیت مسافت هر ۱ روز ۲۰۰ کیلومتر میباشد⛔️<br />
                                            شرایط لغو رزرو:<br />
                                            در روزهای عادی:<br />
                                            یک روز مانده به روز تحویل: ٪۲۵ مبلغ اجاره<br />
                                            از زمان رزرو تا ۲ روز قبل از روز تحویل: ٪۱۵ مبلغ اجاره<br />
                                            از زمان رزرو تا ۳ روز قبل از روز تحویل: ٪۵ مبلغ اجاره<br />
                                            بیشتر از ۳ روز مانده به روز تحویل: بدون جریمه<br />
                                            <br />
                                            <br />
                                            در تعطیلات:<br />
                                            یک روز مانده به روز تحویل: ٪۵۰ مبلغ اجاره<br />
                                            از زمان رزرو تا ۲ روز قبل از روز تحویل: ٪۲۵ مبلغ اجاره<br />
                                            از زمان رزرو تا ۳ روز قبل از روز تحویل: ٪۱۰ مبلغ اجاره<br />
                                            بیشتر از ۳ روز مانده به روز تحویل: ٪۵ مبلغ اجاره<br />

                                            تعطیلات نوروز: ( رزروهای۲۵ اسفند تا ۱۵ فروردین<br />
                                            از زمان رزرو تا ۷ روز مانده به روز تحویل ۳۰٪ مبلغ اجاره<br />
                                            کمتر از ۷ روز مانده به روز تحویل ۵۰٪ مبلغ اجاره<br />
                                        </Typography>
                                    </TimelineBody>
                                </TimelineItem>
                                <TimelineItem>
                                    <TimelineHeader>
                                        <TimelineIcon className="p-2">
                                            <IoIosTimer />
                                        </TimelineIcon>
                                        <Typography variant="h5" color="blue-gray">
                                            <p>محدودیت مسافت و زمان</p>
                                        </Typography>
                                    </TimelineHeader>
                                    <TimelineBody>
                                        <Typography color="gary" className="font-normal text-gray-600">
                                            محدودیت مسافت: ۶۰۰ کیلومتر برای 3 روز<br />

                                            هزینه هر کیلومتر اضافه: ۶,۰۰۰ تومان<br />

                                            جریمه هر ساعت دیرکرد در بازتحویل: ۵۰,۰۰۰ تومان
                                        </Typography>
                                    </TimelineBody>
                                </TimelineItem>
                                <TimelineItem>
                                    <TimelineHeader className='mt-5'>
                                        <TimelineIcon className="p-2">
                                            <IoIosApps />
                                        </TimelineIcon>
                                        <Typography variant="h5" color="blue-gray">
                                            <p>دسته‌بندی‌ها</p>
                                        </Typography>
                                    </TimelineHeader>
                                    <TimelineBody>
                                        <Typography color="gary" className="font-normal text-gray-600">
                                            <div class="p-2 pt-0 w-full flex items-center justify-start gap-3 flex-wrap">
                                                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-sm lg:text-md'>
                                                    {singleCarData.location}
                                                </button>
                                                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-sm lg:text-md'>
                                                    تحویل در محل
                                                </button>
                                                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-sm lg:text-md'>
                                                    ارزان
                                                </button>
                                                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-sm lg:text-md'>
                                                    رزرو خودرو
                                                </button>
                                                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-sm lg:text-md'>
                                                    ایران
                                                </button>
                                                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-sm lg:text-md'>
                                                    اجاره خودرو
                                                </button>
                                                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-sm lg:text-md'>
                                                    نو
                                                </button>
                                            </div>
                                        </Typography>
                                    </TimelineBody>
                                </TimelineItem>
                            </Timeline>
                            <h3 className="titleSlider lalezar mr-3 mt-16">ارتباط با ما</h3>
                            <form
                                action="#"
                                className="flex flex-col gap-4 w-full mt-10"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Typography
                                            variant="small"
                                            className="mb-2 text-right font-medium !text-gray-900"
                                        >
                                            نام
                                        </Typography>
                                        <Input
                                            color="gray"
                                            size="lg"
                                            name="first-name"
                                            className="focus:border-t-gray-900"
                                            containerProps={{
                                                className: "min-w-full",
                                            }}
                                            labelProps={{
                                                className: "hidden",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Typography
                                            variant="small"
                                            className="mb-2 text-right font-medium !text-gray-900"
                                        >
                                            نام خانوادگی
                                        </Typography>
                                        <Input
                                            color="gray"
                                            size="lg"
                                            name="last-name"
                                            className="focus:border-t-gray-900"
                                            containerProps={{
                                                className: "!min-w-full",
                                            }}
                                            labelProps={{
                                                className: "hidden",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Typography
                                        variant="small"
                                        className="mb-2 text-right font-medium !text-gray-900"
                                    >
                                        ایمیل
                                    </Typography>
                                    <Input
                                        color="gray"
                                        size="lg"
                                        name="email"
                                        className="focus:border-t-gray-900"
                                        containerProps={{
                                            className: "!min-w-full",
                                        }}
                                        labelProps={{
                                            className: "hidden",
                                        }}
                                    />
                                </div>
                                <div>
                                    <Typography
                                        variant="small"
                                        className="mb-2 text-right font-medium !text-gray-900"
                                    >
                                        متن نظر
                                    </Typography>
                                    <Textarea
                                        rows={6}
                                        color="gray"
                                        name="message"
                                        className="focus:border-t-gray-900"
                                        containerProps={{
                                            className: "!min-w-full",
                                        }}
                                        labelProps={{
                                            className: "hidden",
                                        }}
                                    />
                                </div>
                                <Button className="w-full" color="gray">
                                    ارسال نظرات
                                </Button>
                            </form>
                        </div>
                    </div>
                    <div className=" col-span-1 md:col-span-1 shadow-lg rounded-xl sticky max-h-max top-20 left-0">
                        <div
                            class="relative rounded-xl overflow-hidden flex flex-col items-center shadow-lg bg-white font-Roboto-light"
                        >
                            <div class="h-24 w-full bg-blue-gray-900"></div>
                            <div class="top-16 z-10 flex items-center flex-col gap-4 px-5 py-5">
                                <div class="-mt-20">
                                    <svg
                                        fill="#000000"
                                        xmlns="http://www.w3.org/2000/svg"
                                        version="1.1"
                                        class="icon w-[4.7rem]"
                                        viewBox="0 0 1024 1024"
                                    >
                                        <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
                                        <g
                                            stroke-linejoin="round"
                                            stroke-linecap="round"
                                            id="SVGRepo_tracerCarrier"
                                        ></g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path
                                                fill="#9DC6AF"
                                                d="M947.8 554.1c0 242-196.2 438.2-438.2 438.2S71.4 796.1 71.4 554.1c0-134.6 60.7-255.1 156.3-335.5 76.2-64.1 174.5-102.7 281.9-102.7 242 0 438.2 196.2 438.2 438.2z"
                                            ></path>
                                            <path
                                                fill="#191919"
                                                d="M509.6 1005.2c-60.9 0-120-11.9-175.6-35.5-53.7-22.7-102-55.3-143.4-96.7-41.4-41.4-74-89.7-96.7-143.4C70.4 674 58.4 615 58.4 554.1c0-133.5 58.7-259.4 160.9-345.4 39.8-33.5 84.6-59.6 133.1-77.6 50.2-18.7 103.1-28.1 157.2-28.1 60.9 0 120 11.9 175.6 35.5 53.7 22.7 102 55.3 143.4 96.7 41.4 41.4 74 89.7 96.7 143.4 23.5 55.6 35.5 114.7 35.5 175.6s-11.9 120-35.5 175.6c-22.7 53.7-55.3 102-96.7 143.4-41.4 41.4-89.7 74-143.4 96.7-55.6 23.4-114.7 35.3-175.6 35.3z m0-876.3c-51 0-100.8 8.9-148.1 26.5-45.7 17-87.9 41.6-125.4 73.1-96.4 81.1-151.7 199.7-151.7 325.6 0 57.4 11.2 113.1 33.4 165.5 21.4 50.6 52.1 96.1 91.1 135.1s84.5 69.7 135.1 91.1c52.4 22.2 108.1 33.4 165.5 33.4 57.4 0 113.1-11.2 165.5-33.4 50.6-21.4 96.1-52.1 135.1-91.1s69.7-84.5 91.1-135.1c22.2-52.4 33.4-108.1 33.4-165.5 0-57.4-11.2-113.1-33.4-165.5-21.4-50.6-52.1-96.1-91.1-135.1s-84.5-69.7-135.1-91.1c-52.3-22.3-108-33.5-165.4-33.5z"
                                            ></path>
                                            <path
                                                fill="#66A37F"
                                                d="M158.2 290H861v26H158.2zM91.1 406.6h837v26h-837zM77.1 523.1h865v26h-865zM77.1 639.6h865v26h-865zM132.8 756.2h753.6v26H132.8z"
                                            ></path>
                                            <path
                                                fill="#D39E33"
                                                d="M535.5 362.5c-29.8 20.9-201.8-2.7-309.4-49.7-0.1 4.1-0.4 8.1-0.4 12.2v279c0 216.6 119.8 393.8 266.3 393.8S758.3 820.6 758.3 604V351.6L554.8 234.8l-19.3 127.7z"
                                            ></path>
                                            <path
                                                fill="#0C0C0C"
                                                d="M491.9 1010.7c-154 0-279.3-182.5-279.3-406.8v-279c0-2.7 0.1-5.2 0.2-7.6 0.1-1.7 0.2-3.3 0.2-4.8l0.4-19.4 17.8 7.8c48.1 21 115.7 39.5 180.6 49.4 62.2 9.5 98.5 7.7 111.8 3.5l21.2-139.7 226.4 130V604c0 224.2-125.3 406.7-279.3 406.7zM238.6 332v272c0 51.7 6.9 101.9 20.5 149.3 13.1 45.5 31.7 86.4 55.5 121.5 23.5 34.7 50.7 61.9 80.8 80.9 30.7 19.3 63.2 29.1 96.5 29.1s65.8-9.8 96.5-29.1c30.1-18.9 57.3-46.1 80.8-80.9 23.7-35.1 42.4-76 55.5-121.5 13.6-47.4 20.5-97.6 20.5-149.3V359.1L564.8 255.5l-17.4 114.4-4.6 3.2c-9.6 6.7-27 10-53.1 10h-0.1c-22.6 0-50.8-2.5-81.7-7.2-59.4-9-121.2-25.1-169.3-43.9z"
                                            ></path>
                                            <path
                                                fill="#FAFCFB"
                                                d="M559 800.6L516.9 812H475l-37.8-11.5v-23H435L290.7 952.3c58.7 28.9 126.6 45.4 199 45.4 77.2 0 149.2-18.7 210.5-51.2L559 777.6v23z"
                                            ></path>
                                            <path
                                                fill="#141414"
                                                d="M489.7 1010.7c-71.7 0-142.5-16.2-204.8-46.8-3.6-1.8-6.1-5-7-8.9-0.8-3.9 0.2-7.9 2.7-11L425 769.3c2.5-3 6.1-4.7 10-4.7h2.2c7.2 0 13 5.8 13 13v13.3l26.7 8.1h38.2l30.9-8.4v-13c0-5.5 3.4-10.4 8.6-12.2 5.1-1.9 10.9-0.3 14.4 3.9l141.2 168.9c2.5 3 3.5 7 2.8 10.8-0.8 3.8-3.2 7.2-6.7 9-65.1 34.5-140 52.7-216.6 52.7z m-178.3-63.1c55 24.3 116.2 37.1 178.3 37.1 66.8 0 132.1-14.6 190-42.4l-111.1-133c-1.6 1.8-3.7 3.1-6.2 3.8l-42.1 11.5c-1.1 0.3-2.3 0.5-3.4 0.5H475c-1.3 0-2.6-0.2-3.8-0.6L433.4 813c-2.8-0.9-5.2-2.6-6.8-4.9L311.4 947.6z"
                                            ></path>
                                            <path
                                                fill="#191919"
                                                d="M509.6 1005.2c-60.9 0-120-11.9-175.6-35.5-53.7-22.7-102-55.3-143.4-96.7-41.4-41.4-74-89.7-96.7-143.4C70.4 674 58.4 615 58.4 554.1c0-133.5 58.7-259.4 160.9-345.4 39.8-33.5 84.6-59.6 133.1-77.6 50.2-18.7 103.1-28.1 157.2-28.1 60.9 0 120 11.9 175.6 35.5 53.7 22.7 102 55.3 143.4 96.7 41.4 41.4 74 89.7 96.7 143.4 23.5 55.6 35.5 114.7 35.5 175.6s-11.9 120-35.5 175.6c-22.7 53.7-55.3 102-96.7 143.4-41.4 41.4-89.7 74-143.4 96.7-55.6 23.4-114.7 35.3-175.6 35.3z m0-876.3c-51 0-100.8 8.9-148.1 26.5-45.7 17-87.9 41.6-125.4 73.1-96.4 81.1-151.7 199.7-151.7 325.6 0 57.4 11.2 113.1 33.4 165.5 21.4 50.6 52.1 96.1 91.1 135.1s84.5 69.7 135.1 91.1c52.4 22.2 108.1 33.4 165.5 33.4 57.4 0 113.1-11.2 165.5-33.4 50.6-21.4 96.1-52.1 135.1-91.1s69.7-84.5 91.1-135.1c22.2-52.4 33.4-108.1 33.4-165.5 0-57.4-11.2-113.1-33.4-165.5-21.4-50.6-52.1-96.1-91.1-135.1s-84.5-69.7-135.1-91.1c-52.3-22.3-108-33.5-165.4-33.5z"
                                            ></path>
                                            <path
                                                fill="#FAFCFB"
                                                d="M562.5 799.9l-45.8 14.5H471l-41.1-14.5V651h132.6z"
                                            ></path>
                                            <path
                                                fill="#141414"
                                                d="M516.7 827.4H471c-1.5 0-2.9-0.3-4.3-0.7l-41.2-14.5c-5.2-1.8-8.7-6.7-8.7-12.3V651c0-7.2 5.8-13 13-13h132.7c7.2 0 13 5.8 13 13v148.9c0 5.7-3.7 10.7-9.1 12.4l-45.9 14.5c-1.2 0.4-2.5 0.6-3.8 0.6z m-43.4-26h41.4l34.9-11V664H442.9v126.7l30.4 10.7z"
                                            ></path>
                                            <path
                                                fill="#FAFCFB"
                                                d="M729.9 407.5a42.8 52.2 0 1 0 85.6 0 42.8 52.2 0 1 0-85.6 0Z"
                                            ></path>
                                            <path
                                                fill="#141414"
                                                d="M772.7 472.7c-30.8 0-55.8-29.3-55.8-65.2 0-36 25-65.2 55.8-65.2s55.8 29.3 55.8 65.2c0 35.9-25 65.2-55.8 65.2z m0-104.5c-16.4 0-29.8 17.6-29.8 39.2s13.4 39.2 29.8 39.2 29.8-17.6 29.8-39.2-13.4-39.2-29.8-39.2z"
                                            ></path>
                                            <path
                                                fill="#EEA7F9"
                                                d="M715.4 487.3a45.4 31.1 0 1 0 90.8 0 45.4 31.1 0 1 0-90.8 0Z"
                                            ></path>
                                            <path
                                                fill="#111111"
                                                d="M760.8 531.4c-32.7 0-58.4-19.4-58.4-44.1 0-24.7 25.6-44.1 58.4-44.1s58.4 19.4 58.4 44.1c-0.1 24.7-25.7 44.1-58.4 44.1z m0-62.2c-15.3 0-32.4 7.7-32.4 18.1 0 8.5 13.8 18.1 32.4 18.1 15.3 0 32.4-7.7 32.4-18.1-0.1-8.5-13.9-18.1-32.4-18.1z"
                                            ></path>
                                            <path
                                                fill="#EEA7F9"
                                                d="M180.4 487.3a45.4 31.1 0 1 0 90.8 0 45.4 31.1 0 1 0-90.8 0Z"
                                            ></path>
                                            <path
                                                fill="#111111"
                                                d="M225.8 531.4c-32.7 0-58.4-19.4-58.4-44.1 0-24.7 25.6-44.1 58.4-44.1s58.4 19.4 58.4 44.1c0 24.7-25.7 44.1-58.4 44.1z m0-62.2c-15.3 0-32.4 7.7-32.4 18.1 0 8.5 13.8 18.1 32.4 18.1 15.3 0 32.4-7.7 32.4-18.1 0-8.5-13.9-18.1-32.4-18.1z"
                                            ></path>
                                            <path
                                                fill="#FAFCFB"
                                                d="M168.3 407.5a42.8 52.2 0 1 0 85.6 0 42.8 52.2 0 1 0-85.6 0Z"
                                            ></path>
                                            <path
                                                fill="#141414"
                                                d="M211.1 472.7c-30.8 0-55.8-29.3-55.8-65.2 0-36 25-65.2 55.8-65.2s55.8 29.3 55.8 65.2c-0.1 35.9-25.1 65.2-55.8 65.2z m0-104.5c-16.4 0-29.8 17.6-29.8 39.2s13.4 39.2 29.8 39.2 29.8-17.6 29.8-39.2c-0.1-21.6-13.4-39.2-29.8-39.2z"
                                            ></path>
                                            <path
                                                fill="#FAFCFB"
                                                d="M535.5 321.1c-29.8 14.1-201.8-1.8-309.4-33.6-0.1 2.8-0.4 5.5-0.4 8.2v188.7c0 146.5 119.8 266.3 266.3 266.3s266.3-119.8 266.3-266.3V313.8l-203.3-79-19.5 86.3z"
                                            ></path>
                                            <path
                                                fill="#141414"
                                                d="M491.9 763.7c-74.3 0-144.4-29.1-197.3-82-52.9-52.9-82-123-82-197.3V295.7c0-2 0.1-4 0.3-5.6 0.1-1.1 0.1-2.1 0.2-3l0.5-16.8 16.2 4.8c48.4 14.3 116.2 26.8 181.5 33.6 58.8 6.1 97.6 5.6 113.2 2.4l21-93.8L771.2 305v179.6c0 74.3-29.1 144.4-82 197.3s-123 81.8-197.3 81.8zM238.6 304.5v179.9c0 67.4 26.4 130.9 74.4 178.9s111.5 74.4 178.9 74.4 130.9-26.4 178.9-74.4 74.4-111.5 74.4-178.9V322.7l-181-70.3-17.4 77.8-5.7 2.7c-23.8 11.3-100.6 4.9-132.4 1.6-59.9-6.2-122-17.2-170.1-30z"
                                            ></path>
                                            <path
                                                fill="#D39E33"
                                                d="M491.7 29.4c-143.7 0-261.4 115.4-265.9 258.1 107.6 31.8 279.6 47.7 309.4 33.6l19.4-86.3 203.3 79v-18C758 149.3 638.1 29.4 491.7 29.4z"
                                            ></path>
                                            <path
                                                fill="#0C0C0C"
                                                d="M489.2 339.3c-29.4 0-62.6-2.9-80.9-4.8-66.8-6.9-136.4-19.8-186.2-34.5l-9.6-2.8 0.3-10c2.2-72.5 32.3-140.5 84.6-191.4 52.5-51.1 121.5-79.2 194.2-79.2 74.3 0 144.4 29.1 197.3 82 52.9 52.9 82 123 82 197.3v37l-207-80.4-17.4 77.8-5.7 2.7c-10.1 4.7-29.8 6.3-51.6 6.3z m-249.9-61.5C286.8 291 350 302.3 411 308.6c58.8 6.1 97.6 5.6 113.2 2.4l21-93.8L745 294.8c-0.2-67-26.7-130.2-74.4-177.9-48-48-111.5-74.4-178.9-74.4-66 0-128.5 25.5-176.1 71.8-45.1 43.8-71.9 101.6-76.3 163.5z"
                                            ></path>
                                            <path
                                                fill="#0F0F0F"
                                                d="M374.6 432.9m-28.9 0a28.9 28.9 0 1 0 57.8 0 28.9 28.9 0 1 0-57.8 0Z"
                                            ></path>
                                            <path
                                                fill="#0F0F0F"
                                                d="M609.1 432.9m-28.9 0a28.9 28.9 0 1 0 57.8 0 28.9 28.9 0 1 0-57.8 0Z"
                                            ></path>
                                            <path
                                                fill="#FAFCFB"
                                                d="M559.1 508.5c0 37-30.3 67.2-67.2 67.2-37 0-67.2-30.3-67.2-67.2"
                                            ></path>
                                            <path
                                                fill="#141414"
                                                d="M491.9 588.7c-44.2 0-80.2-36-80.2-80.2 0-7.2 5.8-13 13-13s13 5.8 13 13c0 29.9 24.3 54.2 54.2 54.2 29.9 0 54.2-24.3 54.2-54.2 0-7.2 5.8-13 13-13s13 5.8 13 13c0 44.2-36 80.2-80.2 80.2z"
                                            ></path>
                                        </g>
                                    </svg>
                                </div>

                                <div class="flex items-center flex-col">
                                    <p title="name/نام" class="text-black font-Roboto-md">محمد کاظمی</p>
                                    <p title="bio/بیوگرافی" class="text-xs text-gray-500 font-medium mt-2">
                                        از دی 99 عضو <span className='lalezar'>سوارینا</span> است.
                                    </p>
                                </div>
                                <div class="flex items-center flex-col mt-4">
                                    <p title="name/نام" class="text-black font-Roboto-md text-3xl lalezar">{Number(singleCarData.hourly_rental_rate).toLocaleString()}<sup className='text-xs text-blue-gray-600'>تومان</sup></p>
                                    <p title="bio/بیوگرافی" class="text-xs text-gray-500 font-medium">
                                        در هر ساعت
                                    </p>
                                </div>

                                <div class="flex items-center gap-3 mt-4">
                                    <button
                                        class="bg-gray-200/65 hover:bg-gray-200 transition-colors p-2 rounded-full"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke-width="1.5"
                                            stroke="currentColor"
                                            class="w-5 h-5"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                                            ></path>
                                        </svg>
                                    </button>
                                    <button
                                        class="bg-gray-200/65 hover:bg-gray-200 transition-colors p-2 rounded-full"
                                    >
                                        <LiaTelegram className='text-lg' />
                                    </button>
                                    <button
                                        class="bg-gray-200/65 hover:bg-gray-200 transition-colors p-2 rounded-full"
                                    >
                                        <AiOutlineInstagram className='text-lg' />
                                    </button>
                                </div>

                                {
                                    singleCarData.status == "موجود" ? (
                                        <div class="flex items-center flex-col mt-4">
                                            <p title="name/نام" class="text-black font-Roboto-md text-xs text-center">هزینه را بعد از پذیرش درخواست توسط میزبان پرداخت خواهید کرد.</p>
                                            <Button className='w-full mt-3' onClick={RentalHandle}>
                                                {loading ? <Spinner className="inline h-4 w-4" /> : "ادامه"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div class="flex items-center flex-col mt-4">
                                            <p title="name/نام" class="text-black font-Roboto-md text-xs text-center">هزینه را بعد از پذیرش درخواست توسط میزبان پرداخت خواهید کرد.</p>
                                            <Button className='w-full mt-3'>این خودرو موجود نمی باشد.</Button>
                                        </div>
                                    )
                                }


                            </div>
                        </div>

                    </div>
                </div>
                <DefaultAccordion />
            </div>
            <Footer />
        </>
    );
}


export default CarPage;