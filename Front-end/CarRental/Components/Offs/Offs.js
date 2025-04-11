import React, { useEffect, useState } from "react";
import ErrorBox from "../Errorbox/Errorbox";
import DeleteModal from "./../DeleteModal/DeleteModal";

export default function Offs() {
  const [offs, setOffs] = useState([]);
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
  const [mainOffID, setMainOffID] = useState(null);

  function getAllOff() {
    fetch(`http://localhost:8000/api/offs`)
      .then((res) => res.json())
      .then((off) => {
        setOffs(off);
        console.log(off);
      });
  }

  useEffect(() => {
    getAllOff();
  }, []);

  const closeDeleteModal = () => setIsShowDeleteModal(false);

  const removeOff = () => {
    console.log(mainOffID);
    fetch(`http://localhost:8000/api/offs/${mainOffID}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setIsShowDeleteModal(false);
        getAllOff();
      });
    setIsShowDeleteModal(false);
  };

  return (
    <div className="cms-main">
      <h1 className="cms-title">لیست کد تخفیفات</h1>

      {offs.length ? (
        <table className="products-table">
          <thead>
            <tr className="products-table-heading-tr">
              <th>نام و نام خانوادگی ادمین</th>
              <th>نام تخفیف</th>
              <th>درصد تخفیف</th>
              <th>تاریخ</th>
            </tr>
          </thead>

          <tbody>
            {offs.map((off) => (
              <tr key={off.id} className="products-table-tr">
                <td>{off.adminID}</td>
                <td>{off.code}</td>
                <td>{off.percent}%</td>
                <td>{off.date}</td>
                <td>
                  <button
                    className="products-table-btn"
                    onClick={() => {
                      setIsShowDeleteModal(true);
                      setMainOffID(off.id);
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
        <ErrorBox msg="هیچ کد تخفیفی یافت نشد" />
      )}
      {isShowDeleteModal && (
        <DeleteModal
          title="آیا از حذف کد تخفیف اطمینان دارید؟"
          cancelAction={closeDeleteModal}
          submitAction={removeOff}
        />
      )}
    </div>
  );
}
