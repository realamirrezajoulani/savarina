import React, { useEffect, useContext, useState } from 'react';
import { Typography } from "@material-tailwind/react";
import { Footer } from "../Components/Footer/Footer";
import { NavbarDefault } from "../Components/Navbar/Navbar";
import BlogSection from "../Components/Blog/Blog";
import AuthContext from "../context/authContext";
import { useParams } from 'react-router-dom';

export function Blog() {
    const { postId } = useParams()
    const authContext = useContext(AuthContext)
    const [blogData, setBlogData] = useState([])

    useEffect(() => {
        getOneBlog()
    }, [])

    const getOneBlog = async () => {
        const response = await fetch(`${authContext.baseUrl}/posts/${postId}`);

        const blogRes = await response.json();


        if (response.status === 200) {
            setBlogData(blogRes)
            console.log(blogRes);

        }
    }
    return (
        <>
            <NavbarDefault />
            <div className="container md:mt-16 mx-auto lg:w-[80%] w-[90%]">
                <section className="p-8">
                    <div className="mx-auto max-w-screen-md">
                        <img
                            src={blogData.thumbnail}
                            alt="team work"
                            className="mb-4 h-[28rem] w-full rounded-xl object-cover"
                        />
                        <div className="flex items-center justify-between">
                            <Typography
                                variant="small"
                                className="font-medium !text-blue-500"
                            >
                                #وبلاگ #پست #سوارینا
                            </Typography>
                            <p>{blogData.created_at ? authContext.calcuteRelativeTimeDifference(blogData.created_at) : ''}</p>
                        </div>
                        <Typography
                            variant="h2"
                            color="blue-gray"
                            className="my-4 font-black text-4xl !leading-snug lalezar"
                        >
                            {blogData.subject}
                        </Typography>
                        <Typography className="font-normal !text-gray-500">
                            {blogData.content}

                        </Typography>
                    </div>
                </section>
                <BlogSection />
            </div>
            <Footer />
        </>

    );
}

export default Blog;