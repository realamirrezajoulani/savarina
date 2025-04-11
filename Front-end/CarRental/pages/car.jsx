import React, { useEffect, useContext, useState } from 'react';
import { NavbarDefault } from '../Components/Navbar/Navbar';
import { Footer } from '../Components/Footer/Footer';
import Card from '../Components/Card/Card';
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaFilter } from "react-icons/fa";
import AuthContext from "../context/authContext";
import {
    Drawer,
    Button,
    Spinner,
    Alert,
    IconButton,
} from "@material-tailwind/react";
const Car = () => {
    const authContext = useContext(AuthContext)
    const [carData, setCarData] = useState([])
    const [loaderCar, setLoaderCar] = useState(true)
    const [openSidebarPhone, setOpenSidebarPhone] = useState(false)

    const [filters, setFilters] = useState({
        price: null,
        carStatus: null,
        location: null,
        brand: null
    });


    useEffect(() => {
        fetchCarInSlider()
    }, [])

    const fetchCarInSlider = async () => {
        const response = await fetch(`${authContext.baseUrl}/vehicles`);

        const allCar = await response.json();



        if (response.status === 200) {
            setLoaderCar(false)
            setCarData(allCar)
        }
    }

    const filteredCars = carData.filter(car => {
        return (
            (!filters.price || car.hourly_rental_rate <= filters.price) &&
            (!filters.carStatus || car.status === filters.carStatus) &&
            (!filters.location || car.location === filters.location) &&
            (!filters.brand || car.brand === filters.brand)
        );
    });
    return (
        <>
            <NavbarDefault />
            <div className="container mx-auto lg:w-[80%] w-[90%] md:py-24 pb-12 md:min-h-[1000px]">
                <div className="flex items-center justify-between py-8">
                    <h3 className="titleSlider lalezar mr-3">لیست خودرو ها</h3>
                    <p className='lalezar hidden md:block'>+{carData.length} خودرو موجود است.</p>
                    <Button className='block md:hidden p-3' onClick={() => setOpenSidebarPhone(true)}><FaFilter /></Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-3">
                    <div className="col-span-1 hidden lg:block">
                        <Sidebar setFilters={setFilters} openSidebarPhone={openSidebarPhone} />
                    </div>
                    <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-8 pt-7">

{
                    loaderCar ? (<Spinner className="h-8 w-8 mx-auto mt-16" />)
                    : (
                        filteredCars.length > 0 ? (
                            filteredCars.map((dataCar) => <Card key={dataCar.id} {...dataCar} />)
                        ) : (
                            <Alert color="blue-gray-900" className="col-span-3 text-center h-14">
                                هیچ خودرویی پیدا نشد! 😢
                            </Alert>
                        )
                    )
}
                        
                    </div>
                </div>
                

            </div>
            <Footer />

            <Drawer
                placement="right"
                open={openSidebarPhone}
                onClose={() => setOpenSidebarPhone(false)}
                className="p-4"
            >
                <IconButton
                    variant="text"
                    color="blue-gray"
                    onClick={() => setOpenSidebarPhone(false)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </IconButton>
                <Sidebar setFilters={setFilters} />
            </Drawer>
        </>
    );
}


export default Car;
