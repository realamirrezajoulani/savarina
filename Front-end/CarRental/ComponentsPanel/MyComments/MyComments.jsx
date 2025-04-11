import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../../context/authContext";
import { Spinner, Card, Typography, Alert, Chip } from "@material-tailwind/react";

const MyComments = () => {
    const authContext = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        getAllComments();
    }, []);

    const getAllComments = async () => {
        try {
            const resComments = await fetch(`${authContext.baseUrl}/comments`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authContext.user.access_token}`,
                    "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`,
                },
            });

            const data = await resComments.json();
            setLoading(false);

            if (resComments.status === 200) {
                const userComments = data.filter(comment => comment.customer.id === authContext.user.ID);
                setComments(userComments);
            } else {
                console.error("خطا در دریافت کامنت‌ها");
            }
        } catch (error) {
            console.error("خطای شبکه:", error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "approved":
                return "green";
            case "pending":
                return "blue-gray";
            case "rejected":
                return "red";
            default:
                return "blue-gray";
        }
    };
    const getStatusValue = (status) => {
        switch (status) {
            case "approved":
                return "تایید شده";
            case "pending":
                return "در حال بررسی";
            case "rejected":
                return "رد شده";
            default:
                return "در حال بررسی";
        }
    };

    return (
        <div className="container mx-auto lg:w-[60%] w-full py-16 px-4">
            {loading ? (
                <div className="flex justify-center">
                    <Spinner className="h-7 w-7" />
                </div>
            ) : comments.length === 0 ? (
                <Alert color="blue-gray" className="text-center">
                    شما هنوز هیچ کامنتی ثبت نکرده‌اید.
                </Alert>
            ) : (
                <>
                    <Typography variant="h4" className="text-center mb-6">
                        نظرات من
                    </Typography>
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <Card key={comment.id} className="p-4 shadow-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <Typography variant="h6">{comment.subject}</Typography>
                                    <Chip color={getStatusColor(comment.status)} value={getStatusValue(comment.status)} size="sm" className="iransans"/>
                                </div>
                                <Typography variant="paragraph" className="text-gray-700">{comment.content}</Typography>
                                <Typography variant="small" className="text-gray-500 mt-2">
                                    تاریخ: {comment.created_at.slice(0, 10)}
                                </Typography>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyComments;
