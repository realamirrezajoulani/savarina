import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../../context/authContext";
import { Spinner, Card, Typography, Alert, Chip, Accordion, AccordionHeader, AccordionBody } from "@material-tailwind/react";

const InvoicesOld = () => {
    const authContext = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [open, setOpen] = useState(null);

    useEffect(() => {
        getAllInvoices();
    }, []);

    const getAllInvoices = async () => {
        const resInvoices = await fetch(
            `${authContext.baseUrl}/invoices/search/?status=%D8%AA%D8%A7%DB%8C%DB%8C%D8%AF%20%D8%B4%D8%AF%D9%87&operator=and&offset=0&limit=100`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authContext.user.access_token}`,
                    "Authorization-Refresh": `Bearer ${authContext.user.refresh_token}`,
                },
            }
        );

        const data = await resInvoices.json();

        setLoading(false);
        if (resInvoices.status === 200) {
            setInvoices(data);
        }
    };

    const handleOpen = (index) => {
        setOpen(open === index ? null : index);
    };

    return (
        <div className="container mx-auto lg:w-[60%] w-full py-16 px-4">
            {loading ? (
                <div className="flex justify-center">
                    <Spinner className="h-7 w-7" />
                </div>
            ) : invoices.length === 0 ? (
                <Alert color="blue-gray" className="text-center">
                    شما هنوز هیچ فاکتوری ندارید.
                </Alert>
            ) : (
                <>
                    <Typography variant="h4" className="text-center mb-6">
                        فاکتورهای قدیمی
                    </Typography>
                    <div className="space-y-4">
                        {invoices.map((invoice, index) => (
                            <Card key={invoice.id} className="p-4 shadow-lg">
                                <div className="flex flex-col md:flex-row justify-between items-center">
                                    <div>
                                        <Typography variant="h6" className="mb-1">
                                            مبلغ کل: {invoice.total_amount.toLocaleString()} تومان
                                        </Typography>
                                        <Typography variant="small" className="text-gray-600">
                                            مالیات: {invoice.tax.toLocaleString()} | تخفیف: {invoice.discount.toLocaleString()}
                                        </Typography>
                                        <Typography variant="h6" className="mt-2 text-green-600">
                                            مبلغ نهایی: {invoice.final_amount.toLocaleString()} تومان
                                        </Typography>
                                    </div>
                                    <div className="text-center">
                                        <Chip value={invoice.status} color="blue-gray" className="mb-2" />
                                        <Typography variant="small" className="text-gray-500">
                                            تاریخ ایجاد: {invoice.created_at.slice(0, 10)}
                                        </Typography>
                                    </div>
                                </div>

                                <Accordion open={open === index}>
                                    <AccordionHeader onClick={() => handleOpen(index)}>
                                        اجارات مربوط به این فاکتور
                                    </AccordionHeader>
                                    <AccordionBody>
                                        {invoice.rentals.length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {invoice.rentals.map((rental, i) => (
                                                    <li key={i} className="text-gray-700">
                                                        {rental}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <Typography variant="small" className="text-gray-500">
                                                هیچ اجاره‌ای برای این فاکتور ثبت نشده است.
                                            </Typography>
                                        )}
                                    </AccordionBody>
                                </Accordion>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default InvoicesOld;
