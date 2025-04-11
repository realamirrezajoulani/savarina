import React, { useEffect, useContext, useState } from 'react';
import { Typography, Card, CardBody } from "@material-tailwind/react";
import AuthContext from "../../context/authContext";
import { Link } from 'react-router-dom';
import { Button } from "@material-tailwind/react";
import { IoArrowBackCircleOutline } from "react-icons/io5";

function ContentCard({ id, subject, content, thumbnail }) {
  return (
    <Link to={'/blog/' + id}>
      <Card
        className="relative grid min-h-[25rem] items-end overflow-hidden rounded-xl"
        color="transparent"
      >
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

// const contents = [
//   {
//     img: "https://www.material-tailwind.com/image/blog-11.jpeg",
//     title: "Search and Discovery",
//     desc: "Website visitors today demand a frictionless user expericence — especially when using search. Because of the hight standards we tend to offer.",
//   },
//   {
//     img: "https://www.material-tailwind.com/image/blog-10.jpeg",
//     title: "Last visits in US",
//     desc: "Wealth creation is an evolutionarily recent positive-sum game. Status is an old zero-sum game. Those attacking wealth creation are often just seeking status.",
//   },
//   {
//     img: "https://demos.creative-tim.com/material-kit-pro/assets/img/examples/card-blog2.jpg",
//     title: "Grow in a beautiful area",
//     desc: "Free people make free choices. Free choices mean you get unequal outcomes. You can have freedom, or you can have equal outcomes. You can't have both.",
//   },
//   {
//     img: "https://demos.creative-tim.com/material-kit-pro/assets/img/examples/card-blog2.jpg",
//     title: "Grow in a beautiful area",
//     desc: "Free people make free choices. Free choices mean you get unequal outcomes. You can have freedom, or you can have equal outcomes. You can't have both.",
//   },
// ];

export function BlogSection() {

  const authContext = useContext(AuthContext)
  const [contents, setContents] = useState([])


  useEffect(() => {
    fetchBlog()
  }, [])

  const fetchBlog = async () => {
    const response = await fetch(`${authContext.baseUrl}/posts`);

    const allBlog = await response.json();


    if (response.status === 200) {
      setContents(allBlog)
    }
  }

  return (
    <section className="container mx-auto lg:w-[80%] w-[90%] py-10 lg:py-28">
      <div className="container w-full flex items-center justify-between">
        <h3 className="titleSlider lalezar mr-3">وبلاگ ها</h3>


        <Link to={'/blogList'}>
          <Button variant="text" className="py-2 px-3">لیست وبلاگ ها <IoArrowBackCircleOutline className="inline text-xl" /></Button>
        </Link>

      </div>


      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-4">
        {contents.map((blog) => (
          <ContentCard key={blog.id} {...blog} />
        ))}
      </div>
    </section>
  );
}

export default BlogSection;