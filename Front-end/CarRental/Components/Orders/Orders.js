import React, { useEffect, useState } from "react";
import ErrorBox from "../Errorbox/Errorbox";
import DeleteModal from "./../DeleteModal/DeleteModal";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
  const [mainOrderID, setMainOrderID] = useState(null);

  function getAllOrder() {
    fetch(`http://localhost:8000/api/orders`)
      .then((res) => res.json())
      .then((order) => {
        setOrders(order);
        console.log(order);
      });
  }

  useEffect(() => {
    getAllOrder();
  }, []);

  const closeDeleteModal = () => setIsShowDeleteModal(false);

  const removeOrder = () => {
    console.log(mainOrderID);
    fetch(`http://localhost:8000/api/orders/${mainOrderID}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setIsShowDeleteModal(false);
        getAllOrder();
      });
    setIsShowDeleteModal(false);
  };

  return (
    <div className="cms-main">
      <h1 className="cms-title">لیست سفارشات</h1>

      {orders.length ? (
        <table className="products-table">
          <thead>
            <tr className="products-table-heading-tr">
              <th>نام و نام خانوادگی</th>
              <th>نام محصول</th>
              <th>محبوبیت</th>
              <th>قیمت</th>
              <th>درصد تخفیف</th>
              <th>تاریخ</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="products-table-tr">
                <td>
                  {order.userID}
                </td>
                <td>{order.productID}</td>
                <td>{order.popularity}%</td>
                <td>{order.price}</td>
                <td>{order.off}%</td>
                <td>{order.date}</td>
                <td>
                  <button
                    className="products-table-btn"
                    onClick={() => {
                      setIsShowDeleteModal(true);
                      setMainOrderID(order.id);
                    }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ErrorBox msg="هیچ سفارشی یافت نشد" />
      )}
      {isShowDeleteModal && (
        <DeleteModal
          title="آیا از حذف سفارش اطمینان دارید؟"
          cancelAction={closeDeleteModal}
          submitAction={removeOrder}
        />
      )}
    </div>
  );
}
