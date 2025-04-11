import React, { useEffect, useState, useContext } from "react";
import { Card, Typography, Spinner } from "@material-tailwind/react";
import {
    FaCar, FaComments, FaBlog, FaFileInvoice,
    FaMoneyBill, FaUsers, FaUserShield
} from "react-icons/fa";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import AuthContext from "../../context/authContext";

Chart.register(...registerables);

const AdminDashboard = () => {
    const authContext = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const response = await fetch(`${authContext.baseUrl}/stats`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json",
                "Authorization": `Bearer ${authContext.user.access_token}`,
                "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`
            },
        });
        if (response.status === 200) {
            const data = await response.json();

            setStats(data);
            setLoading(false);
        }
    };

    const cards = [
        { title: "تعداد خودروها", value: stats?.vehicle_count, icon: <FaCar />, color: "bg-blue-500" },
        { title: "تعداد کامنت‌ها", value: stats?.comment_count, icon: <FaComments />, color: "bg-yellow-500" },
        { title: "تعداد وبلاگ‌ها", value: stats?.post_count, icon: <FaBlog />, color: "bg-green-500" },
        { title: "تعداد فاکتورها", value: stats?.invoice_count, icon: <FaFileInvoice />, color: "bg-red-500" },
        { title: "پرداختی‌های روزانه", value: stats?.today_purchase_count, icon: <FaMoneyBill />, color: "bg-purple-500" },
        { title: "تعداد مشتریان", value: stats?.customer_count, icon: <FaUsers />, color: "bg-cyan-500" },
        { title: "تعداد ادمین‌ها", value: stats?.admin_count, icon: <FaUserShield />, color: "bg-pink-500" },
    ];
    const cardsGeneralAdmin = [
        { title: "تعداد خودروها", value: stats?.vehicle_count, icon: <FaCar />, color: "bg-blue-500" },
        { title: "تعداد کامنت‌ها", value: stats?.comment_count, icon: <FaComments />, color: "bg-yellow-500" },
        { title: "تعداد فاکتورها", value: stats?.invoice_count, icon: <FaFileInvoice />, color: "bg-red-500" },
        { title: "پرداختی‌های روزانه", value: stats?.today_purchase_count, icon: <FaMoneyBill />, color: "bg-purple-500" },
        { title: "تعداد مشتریان", value: stats?.customer_count, icon: <FaUsers />, color: "bg-cyan-500" },
    ];

    const chartData = {
        labels: ["ادمین", "کامنت‌ها", "مشتری", "فاکتورها", "وبلاگ‌ها", "پرداختی‌ها", "خودروها"],
        datasets: [
            {
                label: "آمار",
                data: [stats?.admin_count, stats?.comment_count, stats?.customer_count, stats?.invoice_count, stats?.post_count, stats?.today_purchase_count, stats?.vehicle_count],
                backgroundColor: ["#c1121f", "#003049", "#fdf0d5", "#283618", "#457b9d", "#ffb703", "#7f5539"],
                hoverOffset: 6,
            },
        ],
    };
    const chartDataGeneralAdmin = {
        labels: ["کامنت‌ها", "مشتری", "فاکتورها", "پرداختی‌ها", "خودروها"],
        datasets: [
            {
                label: "آمار",
                data: [stats?.comment_count, stats?.customer_count, stats?.invoice_count, stats?.today_purchase_count, stats?.vehicle_count],
                backgroundColor: ["#c1121f", "#003049", "#fdf0d5", "#ffd60a", "#7f5539"],
                hoverOffset: 6,
            },
        ],
    };

    const doughnutChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: "iransans",
                        size: 14,
                    },
                    color: "#333",
                },
            },
            tooltip: {
                bodyFont: {
                    family: "iransans",
                    size: 14,
                },
                titleFont: {
                    family: "iransans",
                    size: 16,
                },
            },
        },
    };

    const lineChartData = {
        labels: ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"],
        datasets: [
            {
                label: "پرداختی‌های روزانه",
                data: [10, 20, 15, 30, 25, 40, 35],
                borderColor: "#000",
                backgroundColor: "rgba(176, 168, 176, 0.4)",
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: "iransans",
                        size: 14,
                    },
                    color: "#333",
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        family: "iransans",
                        size: 12,
                    },
                    color: "#555",
                },
            },
            y: {
                ticks: {
                    font: {
                        family: "iransans",
                        size: 12,
                    },
                    color: "#555",
                },
            },
        },
    };


    return (
        <div className="container mx-auto p-6">
            {loading ? (
                <Spinner className="h-8 w-8 mx-auto mt-16" />
            ) : (
                <>

                    <Typography variant="h4" className="text-center text-blue-gray-900 font-bold mb-6 lalezar">
                        داشبورد مدیریت
                    </Typography>


                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {
                            authContext.user.role == "Admin" ?
                                (
                                    cardsGeneralAdmin.map((card, index) => {
                                        return (
                                            <Card key={index} className="p-6 shadow-md flex items-center justify-between text-blue-gray-900 rounded-lg">
                                                <div className={`p-4 text-3xl rounded-full text-white mb-3 bg-blue-gray-900`}>
                                                    {card.icon}
                                                </div>
                                                <div>
                                                    <Typography variant="h6" className="lalezar">{card.title}</Typography>
                                                    <Typography variant="h4" className="font-bold text-center">{card.value}</Typography>
                                                </div>
                                            </Card>
                                        )
                                    })
                                ) : (
                                    cards.map((card, index) => {
                                        return (
                                            <Card key={index} className="p-6 shadow-md flex items-center justify-between text-blue-gray-900 rounded-lg">
                                                <div className={`p-4 text-3xl rounded-full text-white mb-3 bg-blue-gray-900`}>
                                                    {card.icon}
                                                </div>
                                                <div>
                                                    <Typography variant="h6" className="lalezar">{card.title}</Typography>
                                                    <Typography variant="h4" className="font-bold text-center">{card.value}</Typography>
                                                </div>
                                            </Card>
                                        )
                                    })
                                )

                        }
                    </div>


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <Card className="p-6 shadow-md bg-white !max-h-max">
                            <Typography variant="h6" className="text-center text-blue-gray-900 font-semibold mb-4 lalezar">
                                توزیع اطلاعات کلی
                            </Typography>
                            <Doughnut data={authContext.user.role == "Admin" ? chartDataGeneralAdmin : chartData} options={doughnutChartOptions} />
                        </Card>


                        <Card className="p-6 shadow-md bg-white !max-h-max">
                            <Typography variant="h6" className="text-center text-blue-gray-900 font-semibold mb-4 lalezar">
                                روند پرداختی‌های روزانه
                            </Typography>
                            <Line data={lineChartData} options={lineChartOptions} />
                        </Card>
                    </div>
                </>
            )
            }
        </div >
    );
};

export default AdminDashboard;