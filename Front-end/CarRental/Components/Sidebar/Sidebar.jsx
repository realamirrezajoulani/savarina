import React, { useState } from "react";
import {
    List,
    Card,
    ListItem,
    Accordion,
    Typography,
    AccordionBody
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { Slider } from "@material-tailwind/react";
import { FaAngleDown } from "react-icons/fa6";


export function Sidebar({ setFilters }) {
    const [open, setOpen] = useState(0);

    const handleOpen = (value) => {
        setOpen(open == value ? 0 : value);
    };

    const LIST_ITEM_STYLES = "select-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 hover:text-gray-900 focus:text-gray-900 active:text-gray-900 data-[selected=true]:text-gray-900 iransans text-xs";

    const status = [
        "همه حالات", "نو", "موجود", "آسیب‌دیده", "نامشخص", "اجاره شده", "در سرویس"
    ];
    const cities = [
        "همه شهر ها", "تهران", "مشهد", "اصفهان", "شیراز", "تبریز", "کیش", "قم", "اهواز",
        "رشت", "کرمان", "همدان", "یزد", "ارومیه", "بندرعباس", "بوشهر"
    ];

    const carBrands = [
        "همه برند ها", "تویوتا", "فورد", "هوندا", "بی ام و", "مرسدس بنز", "آودی", "شورلت", "نیسان",
        "فولکس‌واگن", "هیوندای", "کیا", "سابارو", "مازدا", "ولوا", "لند روور", "جیپ",
        "پورشه", "فيات", "لکسوس", "دوج", "اکورا", "اینفینیتی", "جی ام سی", "اسمارت",
        "منی", "رنو", "پوژو", "سیتروئن", "سئات", "اسکودا", "مازراتی", "فراری",
        "لامبورگینی", "بوگاتی", "تسلا", "سوزوکی", "اوپل", "میتسوبیشی", "ایزوزو",
        "دایو", "ام‌جی", "گریت وال", "بی‌وای‌دی", "چری", "جیلی", "فیسکِر",
        "رولز رویس", "بنتلی", "استون مارتین", "آلفا رومئو", "لادا", "دایهاتسو",
        "کریسلر", "پانتیاک", "سیان"
    ];

    return (
        <Card className="h-max w-full mx-auto py-6 px-3 overflow-hidden shadow-none">
            <div className="flex items-center justify-start">
                <img src="./logoBrandCarRental.ico" alt="Logo_img" className="w-9 h-9" />
                <Link to={'/'}>
                    <p
                        className="mr-2 cursor-pointer py-1.5 font-medium lalezar text-3xl text-gray-900"
                    >
                        سوارینا
                    </p>
                </Link>

            </div>
            <hr className="my-2 border-gray-200" />
            <List>
                <Accordion open={open === 1}>
                    <ListItem
                        selected={open === 1}
                        data-selected={open === 1}
                        onClick={() => handleOpen(1)}
                        className="p-3 select-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 hover:text-gray-900 focus:text-gray-900 active:text-gray-900 data-[selected=true]:text-gray-900"
                    >
                        <Typography className="ml-auto font-normal text-inherit">
                            قیمت
                        </Typography>
                        <FaAngleDown />
                    </ListItem>
                    <AccordionBody className="py-1">
                        <div className=" py-4 w-56 mx-auto">
                            <Slider defaultValue={50} />
                        </div>
                    </AccordionBody>
                </Accordion>
                <Accordion open={open == 2}>
                    <ListItem
                        selected={open == 2}
                        data-selected={open == 2}
                        onClick={() => handleOpen(2)}
                        className="px-3 py-[9px] select-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 hover:text-gray-900 focus:text-gray-900 active:text-gray-900 data-[selected=true]:text-gray-900"
                    >
                        <Typography className="ml-auto font-normal text-inherit">
                            وضعیت راننده
                        </Typography>
                        <FaAngleDown />
                    </ListItem>
                    <AccordionBody className="py-1">
                        <List className="p-0">

                            <ListItem className={`px-8 ${LIST_ITEM_STYLES} flex items-center justify-between`}>
                                <input type="radio" name="type" id="carWith" className="w-4 h-4 accent-blue-gray-900" />
                                <label htmlFor="carWith" className="w-full mr-2 cursor-pointer">با راننده</label>
                            </ListItem>
                            <ListItem className={`px-8 ${LIST_ITEM_STYLES} flex items-center justify-between`}>
                                <input type="radio" name="type" id="carWith2" className="w-4 h-4 accent-blue-gray-900" />
                                <label htmlFor="carWith2" className="w-full mr-2 cursor-pointer">بدون راننده</label>
                            </ListItem>
                        </List>
                    </AccordionBody>
                </Accordion>
                <Accordion open={open == 3}>
                    <ListItem
                        selected={open == 3}
                        data-selected={open == 3}
                        onClick={() => handleOpen(3)}
                        className="px-3 py-[9px] select-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 hover:text-gray-900 focus:text-gray-900 active:text-gray-900 data-[selected=true]:text-gray-900"
                    >
                        <Typography className="ml-auto font-normal text-inherit">
                            وضعیت خودرو
                        </Typography>
                        <FaAngleDown />
                    </ListItem>
                    <AccordionBody className="py-1">
                        {status.map((state, index) => (
                            <ListItem key={index} className={`px-8 ${LIST_ITEM_STYLES} flex items-center justify-between`}>
                                <input
                                    type="radio"
                                    name="city"
                                    id={`city-${index}`}
                                    className="w-4 h-4 accent-blue-gray-900"
                                    value={state}
                                    onChange={(e) => setFilters(prev => ({ ...prev, carStatus: e.target.value == "همه حالات" ? null : e.target.value }))}
                                />
                                <label htmlFor={`city-${index}`} className="w-full mr-2 cursor-pointer">
                                    {state}
                                </label>
                            </ListItem>
                        ))}
                    </AccordionBody>
                </Accordion>
                <Accordion open={open == 4}>
                    <ListItem
                        selected={open == 4}
                        data-selected={open == 4}
                        onClick={() => handleOpen(4)}
                        className="px-3 py-[9px] select-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 hover:text-gray-900 focus:text-gray-900 active:text-gray-900 data-[selected=true]:text-gray-900"
                    >
                        <Typography className="ml-auto font-normal text-inherit">
                            موقعیت
                        </Typography>
                        <FaAngleDown />
                    </ListItem>
                    <AccordionBody className="py-1">
                        <List className="p-0 pl-3">

                            <select
                                name="carLocation"
                                className="w-full p-2 border rounded-md bg-white text-gray-900 iransans mt-3"
                                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value == "همه شهر ها" ? null : e.target.value }))}>
                                {cities.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))}
                            </select>
                        </List>
                    </AccordionBody>
                </Accordion>
                <Accordion open={open == 5}>
                    <ListItem
                        selected={open == 5}
                        data-selected={open == 5}
                        onClick={() => handleOpen(5)}
                        className="px-3 py-[9px] select-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 hover:text-gray-900 focus:text-gray-900 active:text-gray-900 data-[selected=true]:text-gray-900"
                    >
                        <Typography className="ml-auto font-normal text-inherit">
                            برند خودرو
                        </Typography>
                        <FaAngleDown />
                    </ListItem>
                    <AccordionBody className="py-1 h-auto">
                        <List className="p-0 pl-3">

                            <select
                                name="carBrand"
                                className="w-full p-2 border rounded-md bg-white text-gray-900 iransans mt-3"
                                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value == "همه برند ها" ? null : e.target.value }))}>
                                {carBrands.map((brand, index) => (
                                    <option key={index} value={brand}>{brand}</option>
                                ))}
                            </select>


                        </List>
                    </AccordionBody>
                </Accordion>

            </List>


            <Typography
                variant="small"
                className="mt-5 font-medium text-gray-500 flex justify-center"
            >
                v 1.0.0
            </Typography>
        </Card>
    );
}



export default Sidebar;