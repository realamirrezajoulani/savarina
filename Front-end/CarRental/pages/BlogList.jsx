import React, { useEffect, useContext, useState } from 'react';
import { Typography, Card, CardBody, Spinner, Input, Alert, Button } from "@material-tailwind/react";
import AuthContext from "../context/authContext";
import { Link } from 'react-router-dom';
import { NavbarDefault } from '../Components/Navbar/Navbar';
import { Footer } from '../Components/Footer/Footer';
import { FaSearch } from "react-icons/fa";

function ContentCard({ id, subject, content, thumbnail }) {
    return (
        <Link to={'/blog/' + id}>
            <Card className="relative grid min-h-[25rem] items-end overflow-hidden rounded-xl" color="transparent">
                <img
                    src={thumbnail}
                    alt="bg"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/70" />
                <CardBody className="relative flex flex-col justify-end">
                    <Typography variant="h5" color="white" className='mb-4 leading-8'>
                        {subject}
                    </Typography>
                    <Typography
                        variant="paragraph"
                        color="white"
                        className="my-2 font-normal text-xs"
                    >
                        {content.slice(0, 30)}...
                    </Typography>
                </CardBody>
            </Card>
        </Link>
    );
}

const BlogList = () => {
    const authContext = useContext(AuthContext);
    const [blogData, setBlogData] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loaderBlog, setLoaderBlog] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getAllBlog();
    }, []);

    const getAllBlog = async () => {
        const response = await fetch(`${authContext.baseUrl}/posts`);
        const allBlog = await response.json();

        if (response.status === 200) {
            setBlogData(allBlog);
            setFilteredBlogs(allBlog);
            setLoaderBlog(false);
        }
    };

    const handleSearch = () => {
        const filtered = blogData.filter(blog =>
            blog.subject.includes(searchTerm)
        );
        setFilteredBlogs(filtered);
    };

    return (
        <>
            <NavbarDefault />
            <div className="container mx-auto lg:w-[80%] w-[90%] md:py-24 pb-12 md:min-h-[1000px]">
                <div className="flex items-center justify-between py-8">
                    <h3 className="titleSlider lalezar mr-3">لیست وبلاگ ها</h3>
                    <p className='lalezar hidden md:block'>+{blogData.length} وبلاگ موجود است.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
                    <Input
                        label="جستجو بر اساس عنوان وبلاگ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                    <Button onClick={handleSearch} className="w-full flex items-center justify-center gap-2 md:w-auto bg-blue-gray-900">
                        <FaSearch className="inline" /> جستجو
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-8 pt-7">
                    {
                    loaderBlog ? (<Spinner className="h-8 w-8 mx-auto mt-16" />)
                : (
                    filteredBlogs.length > 0 ? (
                        filteredBlogs.map((blog) => (
                            <ContentCard key={blog.id} {...blog} />
                        ))
                    ) : (
                        <p className="text-gray-600 text-center col-span-3">
                            هیچ وبلاگی با این عنوان پیدا نشد! 😢
                        </p>
                    )
                )
                    }
                </div>

                
            </div>
            <Footer />
        </>
    );
};

export default BlogList;
