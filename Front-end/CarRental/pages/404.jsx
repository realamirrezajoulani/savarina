import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export function Error404() {
    return (
        <div className="h-screen mx-auto grid place-items-center text-center px-8">
            <div>
                <div className="flex items-center justify-center">
                    <img src="./carReantal/404.png" alt="Logo_img" className="max-h-72" />

                </div>
                <Typography
                    variant="h1"
                    color="blue-gray"
                    className="mt-10 !text-3xl !leading-snug md:!text-4xl lalezar"
                >
                    متاسفانه صفحه مورد نظر پیدا نشد.
                </Typography>
                <Link to={'/'}>
                <Button color="gray" className="w-full px-4 md:w-[10rem] text-sm mt-11">
                    بازگشت به <span className="lalezar">سوارینا</span>
                </Button>
                </Link>
            </div>
        </div>
    );
}

export default Error404;