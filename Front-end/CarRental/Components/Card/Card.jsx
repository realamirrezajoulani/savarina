import React from 'react';
import { FaAngleLeft } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { GrStatusGood } from "react-icons/gr";
import { MdCalendarMonth } from "react-icons/md";
import { Link } from 'react-router-dom';

const Card = (props) => {

    return (
        <div class="relative pb-3 flex w-60 md:w-64 h-max flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md mx-auto">
            <Link to={'/car/' + props.id}>
                <div class="relative mx-4 -mt-6 h-28 md:h-40 overflow-hidden rounded-xl shadow-lg shadow-blue-gray-500/40">
                    <img src={props.local_image_address} alt={props.model} className='h-full w-full cursor-pointer' />
                </div>
            </Link>
            <div class="p-6">
                <h5 class="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                    {props.brand} {props.model}
                </h5>
                <p class=" hidden md:block font-sans text-lg font-light leading-relaxed text-inherit antialiased lalezar">
                    {props.hourly_rental_rate.toLocaleString()} <sub className='text-sm'>تومان</sub> در هر ساعت
                </p>
                <div className="flex flex-col gap-y-3 mt-4">
                    <p className='font-bold text-sm lg:text-lg'><GrStatusGood className='inline' /> وضعیت : {props.status}</p>
                    <p className='font-bold text-sm lg:text-lg'><MdCalendarMonth className='inline' /> سال ساخت : {props.year}</p>
                </div>
            </div>
            <div class="p-2 md:ml-20 pt-0 w-full md:px-4 flex items-center justify-start gap-x-3">
                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-xs lg:text-md'>
                    <FaLocationDot className='inline' /> {props.location}
                </button>
                <button className='lg:px-4 px-2 lg:py-2 py-1 bg-blue-gray-100 rounded-lg shadow-md font-bold text-xs lg:text-md'>
                    تحویل در محل
                </button>
            </div>
        </div>
    );
}


export default Card;