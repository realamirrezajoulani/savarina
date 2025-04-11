import React from 'react';
import { Link } from 'react-router-dom';
import { FaAngleLeft } from "react-icons/fa6";

const About = () => {
    return (
        <section className='container mx-auto lg:w-[80%] w-[90%] mb-28'>
            <div className="container mx-auto md:mb-10 text-center lg:my-2 text-blue-gray-900 md:flex items-center justify-center gap-x-10 relative">
                <img src="./carReantal/Car-rental-bro.png" alt="CarPoster" className="w-full md:w-[300px] lg:w-[550px]" />
                <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                    <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
                </div>
                <div>
                    <h3 className="lalezar text-3xl text-right">اجاره خودرو بدون راننده</h3>
                    <p className="text-right mt-4 leading-7 max-w-[400px]">سوییچ رنت این امکان را فراهم نموده است تا خدمات کرایه ماشین بدون راننده را چه در ایران و چه در هر نقطه دیگر از جهان با شرایط آسان در اختیار شما قرار دهد. با اجاره ماشین بدون راننده افراد خیلی آزادانه می توانند به هر کجا که دوست دارند سفر کرده و یا کارهای شخصی خود را بدون دغدغه انجام دهند.</p>
                    <Link to="/" className='bg-transparent shadow-none text-blue-gray-900 my-3 float-start text-sm hover:text-blue-900'>بیشتر بخوانید <FaAngleLeft className='inline'/></Link>
                </div>
            </div>
        </section>
    );
}


export default About;