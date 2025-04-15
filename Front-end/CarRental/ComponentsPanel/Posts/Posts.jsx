import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../../context/authContext";
import swal from "sweetalert";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { Card, Typography, Spinner, Button, Input, Textarea } from "@material-tailwind/react";

const TABLE_HEAD = ["تصویر شاخص", "موضوع", "محتوا", "شناسه ادمین", ""];

const Posts = () => {
    const authContext = useContext(AuthContext);
    const [postsData, setPostsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaderPosts, setLoaderPosts] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [idForUpdate, setIdForUpdate] = useState("");

    const [formData, setFormData] = useState({
        thumbnail: "",
        subject: "",
        content: "",
        admin_id: authContext.user.ID,
    });

    useEffect(() => {
        getAllPosts();
    }, []);

    const getAllPosts = async () => {
        setLoaderPosts(true);
        const response = await fetch(`${authContext.baseUrl}/posts`);
        const postsRes = await response.json();

        if (response.status === 200) {
            setLoaderPosts(false);
            setPostsData(postsRes);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log(formData);

        let response = null;

        if (isUpdate) {

            console.log("Update...");


            response = await fetch(`${authContext.baseUrl}/posts/${idForUpdate}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "Authorization": `Bearer ${authContext.user.access_token}`,
                    "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                },
                body: JSON.stringify(formData),
            });

        } else {
            response = await fetch(`${authContext.baseUrl}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "Authorization": `Bearer ${authContext.user.access_token}`,
                    "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                },
                body: JSON.stringify(formData),
            });

        }



        if (response.status === 200) {
            response.json().then(() => {
                setLoading(false);
                setIsUpdate(false);
                swal({
                    title: "پست با موفقیت اضافه شد",
                    icon: "success",
                    buttons: "باشه",
                }).then(() => {
                    setFormData({
                        thumbnail: "",
                        subject: "",
                        content: "",
                        admin_id: authContext.user.ID,
                    })
                    getAllPosts();
                });
            });
        } else {
            setLoading(false);
            swal({
                title: "مشکلی در ارسال اطلاعات پیش آمد",
                icon: "error",
                buttons: "تلاش مجدد",
            });
        }
    };

    const ShowContent = (content) => {
        swal({
            title: content,
            icon: "info",
            buttons: "بستن",
        });
    }

    const handleDelete = async (id) => {
        swal({
            title: "آیا مطمئن هستید؟",
            text: "این عملیات قابل بازگشت نیست!",
            icon: "warning",
            buttons: ["لغو", "حذف"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                const response = await fetch(`${authContext.baseUrl}/posts/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                        "Authorization": `Bearer ${authContext.user.access_token}`,
                        "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                    },
                });

                if (response.status === 200) {
                    swal({ title: "بلاگ با موفقیت حذف شد!", icon: "success", buttons: "باشه", });
                    getAllPosts();
                } else {
                    swal({ title: "خطا در حذف", icon: "error", buttons: "باشه", });
                }
            }
        });
    };

    const handleEdit = (post) => {
        console.log(post);

        setIsUpdate(true)

        setIdForUpdate(post.id)

        setFormData({
            thumbnail: post.thumbnail,
            subject: post.subject,
            content: post.content,
            admin_id: authContext.user.ID,
        })

    };

    return (
        <>
            {loaderPosts ? (
                <Spinner className="h-8 w-8 mx-auto mt-16" />
            ) : (
                <div className="container mx-auto">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl mb-16 mx-auto p-6 bg-white shadow-lg rounded-md">
                        <Typography variant="h5" className="text-center text-gray-900 font-bold mb-4">
                            افزودن پست جدید
                        </Typography>

                        <div>
                            <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">
                                لینک تصویر شاخص
                            </Typography>
                            <Input color="gray" size="lg" name="thumbnail" value={formData.thumbnail} onChange={handleChange} />
                        </div>

                        <div>
                            <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">
                                موضوع
                            </Typography>
                            <Input color="gray" size="lg" name="subject" value={formData.subject} onChange={handleChange} />
                        </div>

                        <div>
                            <Typography variant="small" className="mb-2 text-right font-medium text-gray-900">
                                محتوا
                            </Typography>
                            <div className="w-full">
                                <Textarea label="" name="content" value={formData.content} onChange={handleChange} className="iransans"/>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-gray-900 text-white">
                            {loading ? <Spinner className="inline h-4 w-4" /> : "افزودن پست"}
                        </Button>
                    </form>

                    <Card className="h-full w-full overflow-scroll">
                        <table className="w-full min-w-max table-auto text-right">
                            <thead>
                                <tr>
                                    {TABLE_HEAD.map((head) => (
                                        <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                {head}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {postsData.map((post, index) => {
                                    const classes = "p-4 border-b border-blue-gray-50";

                                    return (
                                        <tr key={post.id}>
                                            <td className={classes}>
                                                <img src={post.thumbnail} alt="thumbnail" className="w-16 h-16 object-cover rounded-md" />
                                            </td>
                                            <td className={classes}>{post.subject}</td>
                                            <td className={classes}>
                                                <Button onClick={() => ShowContent(post.content)}>نمایش محتوا</Button>
                                            </td>
                                            <td className={classes}>{post.admin_id}</td>
                                            <td className={classes}>
                                                <button className="p-2 ml-2 pl-3 rounded-full bg-blue-gray-900 text-white text-xl" onClick={() => handleEdit(post)}>
                                                    <FaEdit />
                                                </button>
                                                <button className="p-2 rounded-full bg-red-600 text-white text-xl" onClick={() => handleDelete(post.id)}>
                                                    <MdDelete />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}
        </>
    );
};

export default Posts;
