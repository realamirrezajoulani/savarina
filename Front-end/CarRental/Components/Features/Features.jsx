import React from "react";
import { Card, CardBody, Typography, Avatar, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { IoIosSettings } from "react-icons/io";
import { GoGoal } from "react-icons/go";
import { SlEnvolopeLetter } from "react-icons/sl";
import { FaCar } from "react-icons/fa";

export function FeatureSection() {
  return (
    <section className="py-16 lg:pb-44 container w-full lg:w-[80%] mx-auto">


      <div className="h-auto lg:h-56 py-1 bg-blue-gray-900 relative rounded-lg">
        <p className="hidden md:block text-center w-96 text-white mx-auto leading-8 pt-10">سوارینا به عنوان یک کمپانی با سابقه درخشان، گستره وسیعی
          از خدمات کاربردی را به مشتریان خود عرضه می کند.</p>


        <div className="my-10 lg:my-20 grid lg:grid-cols-4  grid-cols-2 items-center gap-4 lg:absolute -bottom-40 left-0 z-40 w-full px-10">
          <Card className="shadow-md border border-gray-200 !rounded-lg transition-all hover:shadow-none hover:-translate-y-3">
            <CardBody className="p-4">
              <div className="flex flex-col justify-between items-center">

                <div className="flex items-center gap-1 text-blue-gray-800 text-5xl md:text-7xl">
                  <GoGoal />
                </div>

                <Typography
                  className="!font-medium mt-4 text-xs md:!text-md text-blue-gray-700 text-center"
                >
                  رزرو رایگان با امتیاز
                </Typography>
              </div>
            </CardBody>
          </Card>
          <Card className="shadow-md border border-gray-200 !rounded-lg transition-all hover:shadow-none hover:-translate-y-3">
            <CardBody className="p-4">
              <div className="flex flex-col justify-between items-center">

                <div className="flex items-center gap-1 text-blue-gray-800 text-5xl md:text-7xl">
                  <SlEnvolopeLetter />
                </div>

                <Typography
                  className="!font-medium mt-4 text-xs md:!text-md text-blue-gray-700 text-center"
                >
                  ارائه فاکتور رسمی
                </Typography>
              </div>
            </CardBody>
          </Card>
          <Card className="shadow-md border border-gray-200 !rounded-lg transition-all hover:shadow-none hover:-translate-y-3">
            <CardBody className="p-4">
              <div className="flex flex-col justify-between items-center">

                <div className="flex items-center gap-1 text-blue-gray-800 text-5xl md:text-7xl">
                  <IoIosSettings />
                </div>

                <Typography
                  className="!font-medium mt-4 text-xs md:!text-md text-blue-gray-700 text-center"
                >
                  امداد رسانی کمتر از 30 دقیقه
                </Typography>
              </div>
            </CardBody>
          </Card>
          <Card className="shadow-md border border-gray-200 !rounded-lg transition-all hover:shadow-none hover:-translate-y-3">
            <CardBody className="p-4">
              <div className="flex flex-col justify-between items-center">

                <div className="flex items-center gap-1 text-blue-gray-800 text-5xl md:text-7xl">
                  <FaCar />
                </div>

                <Typography
                  className="!font-medium mt-4 text-xs md:!text-md text-blue-gray-700 text-center"
                >
                  ارائه ماشین های تمیز و نو
                </Typography>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

    </section>
  );
}
export default FeatureSection;