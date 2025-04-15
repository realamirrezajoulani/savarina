import React, { useEffect, useContext, useState } from 'react';
import CardSlider from '../Slider/Slider';
import AuthContext from "../../context/authContext";

const CarSlider = () => {
    const authContext = useContext(AuthContext)
    const [carData , setCarData] = useState([])


    useEffect(() => {
        fetchCarInSlider()
    }, [])

    const fetchCarInSlider = async()=>{
        const response = await fetch(`${authContext.baseUrl}/vehicles`);

        const allCar = await response.json();

        // console.log(allCar, response.status);

        if(response.status ===200){
            setCarData(allCar)
        }
    }

    return (
        <CardSlider title="خودرو"  data={carData} />
    );
}


export default CarSlider;