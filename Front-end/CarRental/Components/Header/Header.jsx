import React, { useState , useEffect } from 'react';
import { Button, Typography, Input } from "@material-tailwind/react";
import { FiSearch } from "react-icons/fi";

const Header = () => {

  
  return (
    <header className=' relative'>
      <div className="absolute inset-x-0 lg:top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center md:mt-10 py-14 lg:py-24 container mx-auto lg:w-[80%] w-[90%]">
        <div className="container mx-auto px-4 text-start">
          <Typography className="inline-flex text-xs  rounded-full border-dashed border-[2.5px] border-blue-gray-900 py-1 px-4 font-medium text-blue-gray-600">
            با بیش از 1000 ماشین در سراسر کشور
          </Typography>
          <Typography
            variant="h1"
            color="blue-gray"
            className="mx-auto my-6 w-full leading-snug  !text-2xl lg:max-w-3xl lg:!text-4xl"
          >
            اجاره خودرو در ایران با
            <span className="lalezar text-3xl lg:text-4xl text-blue-gray-900 mr-2 lg:mr-2">
              سوارینا
            </span>
          </Typography>
          <Typography
            variant="lead"
            className="mx-auto w-full !text-gray-600 lg:text-lg text-xs"
          >
            سوییچ رنت این امکان را فراهم نموده است تا خدمات کرایه ماشین بدون راننده را چه در ایران و چه در هر نقطه دیگر از جهان با شرایط آسان در اختیار شما قرار دهد. با اجاره ماشین بدون راننده افراد خیلی آزادانه می توانند به هر کجا که
          </Typography>
          <Button className='rounded-full py-4 px-9 mt-5'>شروع جستجو</Button>

        </div>
        <div className="flex gap-x-6 w-full justify-end items-center">
          <img src="./carReantal/42.jpg" alt="carReantalf1"  className='max-h-96 w-56 object-cover rounded-lg'/>
          <div className='flex flex-col gap-y-6'>
            <img src="./carReantal/43.jpg" alt="carReantalf2" className='h-44 w-56 object-cover rounded-lg' />
            <img src="./carReantal/44.jpg" alt="carReantalf3" className='max-h-96 object-cover rounded-lg' />
          </div>
        </div>

      </div>
        <div className="lg:absolute lg:bottom-14 lg:left-0 w-full px-3">

      <div className='lg:rounded-full lg:w-[60%] px-4 py-4 lg:px-8 mx-auto lg:shadow-lg bgNavbar flex items-center justify-evenly gap-7 overflow-hidden flex-wrap lg:flex-nowrap pb-12 lg:pb-4'>
      <Input label="تاریخ گرفتن خودرو" />
      <Input label="تاریخ پس دادن خودرو " />
      <Input label="محل تحویل" />
      <button className='rounded-full text-xl p-3 bg-blue-gray-900 text-white'><FiSearch /></button>
      </div>

        </div>
    </header>
  );
}


export default Header;