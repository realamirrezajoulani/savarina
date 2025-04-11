import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/authContext";
import swal from "sweetalert";
import { Card, Typography, Spinner, Button, Input, Select, Option } from "@material-tailwind/react";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";


const TABLE_HEAD = ["تاریخ پرداخت", "روش پرداخت", "شناسه تراکنش", "مبلغ", "وضعیت پرداخت", "فاکتور"];

const Payments = () => {
    const authContext = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState([]);
    const [loader, setLoader] = useState(true);


    useEffect(() => {
        getAllPayments();
    }, []);

    const getAllPayments = async () => {
        try {
            const response = await fetch(`${authContext.baseUrl}/payments` , {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "Authorization" : `Bearer ${authContext.user.access_token}`,
                    "Authorization-Refresh" : `Bearer ${authContext.user.refresh_token}`
                },
            });
            const data = await response.json();

            if (response.status === 200) {
                setPaymentData(data);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoader(false);
        }
    };


    const showInvoiceInfo = (invoice) => {
        swal({
            title: `اطلاعات فاکتور`,
            text: `
            مبلغ کل: ${invoice.total_amount.toLocaleString()} تومان
            مالیات: ${invoice.tax.toLocaleString()} تومان
            تخفیف: ${invoice.discount.toLocaleString()} تومان
            مبلغ نهایی: ${invoice.final_amount.toLocaleString()} تومان
            وضعیت: ${invoice.status}
            `,
            icon: "info",
            button: "بستن",
        });
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
                const response = await fetch(`${authContext.baseUrl}/payments/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                        "Authorization" : `Bearer ${authContext.user.access_token}`,
                        "Authorization-Refresh" : `Bearer ${authContext.user.refresh_token}`
                    },
                });

                if (response.status === 200) {
                    swal({title:"پرداخت با موفقیت حذف شد!",  icon: "success" ,buttons: "باشه",});
                    getAllPayments();
                } else {
                    swal({title:"خطا در حذف",  icon: "error" ,buttons: "باشه",});
                }
            }
        });
    };

    const handleEdit = (payment) => {
        console.log(payment);

    };

    return (
        <>
            {loader ? (
                <Spinner className="h-8 w-8 mx-auto mt-16" />
            ) : (
                <div className="container mx-auto p-6">


                    <Card className="h-full w-full overflow-scroll">
                        <Typography variant="h5" className="text-center text-gray-900 font-bold mb-4">
                            لیست پرداخت‌ها
                        </Typography>

                        <table className="w-full min-w-max table-auto text-right">
                            <thead>
                                <tr>
                                    {TABLE_HEAD.map((head) => (
                                        <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography className="font-normal leading-none opacity-70">{head}</Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paymentData.map((payment, index) => (
                                    <tr key={payment.id}>
                                        <td className="p-4">{payment.payment_datetime}</td>
                                        <td className="p-4">{payment.payment_method}</td>
                                        <td className="p-4">{payment.transaction_id}</td>
                                        <td className="p-4">{payment.amount.toLocaleString()}</td>
                                        <td className="p-4">{payment.payment_status}</td>
                                        <td className="p-4">
                                            <Button size="sm" onClick={() => showInvoiceInfo(payment.invoice)}>نمایش</Button>
                                        </td>
                                        <button className="p-2 ml-2 pl-3 rounded-full bg-blue-gray-900 text-white text-xl" onClick={() => handleEdit(payment)}>
                                            <FaEdit />
                                        </button>
                                        <button className="p-2 rounded-full bg-red-600 text-white text-xl" onClick={() => handleDelete(payment.id)}>
                                            <MdDelete />
                                        </button>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </Card>
                </div>
            )
            }
        </>

    );
};

export default Payments;
