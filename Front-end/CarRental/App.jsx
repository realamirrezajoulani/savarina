import React, { useEffect, useState } from "react";
import { useRoutes, useParams, useNavigate } from "react-router-dom";
import AuthContext from "./context/authContext";
import routes from "./routes";
import "./styles/reset.css";
import "./styles/App.css";
import swal from "sweetalert";
import DevAuth from "./Components/DevAuth/DevAuth";

const App = () => {

  const navigate = useNavigate();
  const router = useRoutes(routes);

  const baseUrl = "https://frail-hortense-sj-group-271834cf.koyeb.app"

  const [user, setUser] = useState({
    role: null,
    ID: null,
    access_token: null,
    refresh_token: null,
  });


  const setLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }
  const getLocalStorage = (key) => {
    return JSON.parse(localStorage.getItem(key))
  }

  const calcuteRelativeTimeDifference = (createdAt) => {


    // const publishDate = new Date(createdAt)
    // const newDate = new Date()

    // console.log(newDate);


    // let relativeTime = null

    // let miliSecond = newDate - publishDate
    // relativeTime = Math.floor((miliSecond / 3600000))

    // let TimeReturn = relativeTime > 24 ? (Math.floor(relativeTime / 24) + ' روز پیش') : (relativeTime + 'ساعت پیش ')

    return createdAt.slice(0, 10);

  }

  const isLogin = () => {
    let IsToken = user.role && user.ID && user.access_token && user.refresh_token

    return IsToken
  }

  const LogOut = async () => {
    let isTrueLogout = false
    await swal({
      title: "آیا از خروج مطمئن هستید؟",
      icon: "warning",
      buttons: ["خیر", "بله"]
    }).then(async (result) => {
      if (result) {

        setUser({ role: null, ID: null, access_token: null, refresh_token: null });
        localStorage.removeItem("user");

        isTrueLogout = true
      //  swal({
        //  title: "با موفقیت خارج شدید",
        //  icon: "success",
      //    buttons: "رفتن به هوم پیج"
       // }).then(() => (navigate('/')));
        navigate("/");

      }
    });

    return isTrueLogout

  }


  const LoginUser = async (userName, pass) => {

    let isLoginUser = false

    try {
      const resLoginUser = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'application/json'
        },
        body: `username=${userName}&password=StringStringString1@`, //amirj  rezat
      });
  
  
  
      if (resLoginUser.status === 200) {
        resLoginUser.json().then(dataLogin => {
  
          isLoginUser = true
  
  
          // ? Set Data User In Context
  
          const DataUserLogin = {
            role: dataLogin.role,
            ID: dataLogin.id,
            access_token: dataLogin.access_token,
            refresh_token: dataLogin.refresh_token,
          }
  
          setUser(DataUserLogin);
          localStorage.setItem("user", JSON.stringify(DataUserLogin));
  
  
        //  swal({
         //   title: "با موفقیت لاگین شدید",
          //  icon: "success",
          //  buttons: "ورود به پنل",
        //  }).then((value) => {
         //   navigate("/");
         // });
  navigate("/");
        });
  
      } else {
  
        swal({
          title: "رمز ورود اشتباه است.",
          icon: "error",
          buttons: "تلاش مجدد",
        })
      }
    } catch (error) {
      swal({
        title: "نام کاربری اشتباه است.",
        icon: "error",
        buttons: "تلاش مجدد",
      })
    }

    return isLoginUser

  };

  const RefreshToken = async () => {

    const resRefreshToken = await fetch(`${baseUrl}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "Authorization": `Bearer ${user.access_token}`,
        "Authorization-Refresh": `Bearer ${user.refresh_token}`
      },
      body: '',
    });



    if (resRefreshToken.status === 200) {
      resRefreshToken.json().then(dataLogin => {

        // console.log(dataLogin);



        // ? Set Data User In Context

        const DataUserLogin = {
          role: user.role,
          ID: user.ID,
          access_token: dataLogin.access_token,
          refresh_token: dataLogin.refresh_token,
        }

        setUser(DataUserLogin);
        localStorage.setItem("user", JSON.stringify(DataUserLogin));
      });

    }

  };

  setInterval(() => {
    RefreshToken()
  }, 780000);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        baseUrl,
        setLocalStorage,
        getLocalStorage,
        calcuteRelativeTimeDifference,
        isLogin,
        LogOut,
        LoginUser,
        user,
        RefreshToken
      }}
    >
      <DevAuth>

        {router}

      </DevAuth>
    </AuthContext.Provider>
  );
}


export default App;
