import React, { useEffect, useState, useContext } from "react";
import { Card, Typography, Spinner, Button } from "@material-tailwind/react";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import AuthContext from "../../context/authContext";
import swal from "sweetalert";
import { TbStatusChange } from "react-icons/tb";

const TABLE_HEAD = ["موضوع", "محتوا", "وضعیت", "شناسه مشتری", ""];

const Comments = () => {
    const authContext = useContext(AuthContext);
    const [commentsData, setCommentsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllComments();
    }, []);

    const getAllComments = async () => {
        const response = await fetch(`${authContext.baseUrl}/comments`);
        const commentsRes = await response.json();

        if (response.status === 200) {
            setLoading(false);
            setCommentsData(commentsRes);
        }
    };

    const handleDelete = async (id) => {
        swal({
            title: "آیا مطمئن هستید؟",
            text: "این عملیات قابل بازگشت نیست!",
            icon: "warning",
            buttons: ["لغو", "حذف"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                const response = await fetch(`${authContext.baseUrl}/comments/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authContext.user.access_token}`,
                        "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                    },
                });

                if (response.status === 200) {
                    swal({ title: "کامنت با موفقیت حذف شد!", icon: "success", buttons: "باشه" });
                    getAllComments();
                } else {
                    swal({ title: "خطا در حذف", icon: "error", buttons: "باشه" });
                }
            }
        });
    };

    const handleStatusChange = async (comment) => {
        swal({
            title: "تغییر وضعیت کامنت",
            text: "لطفاً وضعیت جدید را انتخاب کنید:",
            content: {
                element: "div",
                attributes: {
                    innerHTML: `
                        <label>
                            <input type="radio" name="status" value="pending" className="mt-2" checked> در انتظار بررسی
                        </label><br><br>
                        <label>
                            <input type="radio" name="status" value="approved" className="mt-2"> تأیید شده
                        </label><br><br>
                        <label>
                            <input type="radio" name="status" value="rejected" className="mt-2"> رد شده
                        </label><br><br>
                        <label>
                            <input type="radio" name="status" value="spam" className="mt-2"> اسپم
                        </label>
                    `,
                },
            },
            buttons: ["لغو", "تأیید"],
        }).then(async (confirm) => {
            if (confirm) {
                const selectedStatus = document.querySelector('input[name="status"]:checked').value;

                const response = await fetch(`${authContext.baseUrl}/comments/${comment.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authContext.user.access_token}`,
                        "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
                    },
                    body: JSON.stringify({ status: selectedStatus }),
                });

                if (response.status === 200) {
                    swal({ title: "وضعیت با موفقیت تغییر کرد!", icon: "success", buttons: "باشه" });
                    getAllComments();
                } else {
                    swal({ title: "خطا در تغییر وضعیت", icon: "error", buttons: "باشه" });
                }
            }
        });
    };

    return (
        <>
            {loading ? (
                <Spinner className="h-8 w-8 mx-auto mt-16" />
            ) : (
                <div className="container mx-auto p-6">
                    <Typography variant="h5" className="text-center text-gray-900 font-bold mb-4">
                        لیست کامنت‌ها
                    </Typography>
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
                                {commentsData.map((comment, index) => {
                                    const isLast = index === commentsData.length - 1;
                                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                                    return (
                                        <tr key={comment.id}>
                                            <td className={classes}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {comment.subject}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {comment.content}
                                                </Typography>
                                            </td>
                                            <td className={"flex w-max items-center justify-center " + classes}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {comment.status === "pending" ? "در انتظار بررسی" :
                                                     comment.status === "approved" ? "تأیید شده" :
                                                     comment.status === "rejected" ? "رد شده" :
                                                     "اسپم"}
                                                </Typography>
                                                <button
                                                    className="p-2 mr-3 rounded-full bg-blue-gray-900 text-white text-xl"
                                                    onClick={() => handleStatusChange(comment)}
                                                >
                                                    <TbStatusChange />
                                                </button>
                                            </td>
                                            <td className={classes}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {comment.id}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <button
                                                    className="p-2 ml-2 pl-3 rounded-full bg-blue-gray-900 text-white text-xl"
                                                    onClick={() => console.log("ویرایش کلیک شد")}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="p-2 rounded-full bg-red-600 text-white text-xl"
                                                    onClick={() => handleDelete(comment.id)}
                                                >
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

export default Comments;
