import { createContext } from "react";


const AuthContext = createContext({
    baseUrl: "",
    LoginUser :() => { }  ,
    user : () => { } ,
    setLocalStorage: () => { },
    getLocalStorage: () => { },
    calcuteRelativeTimeDifference: () => { },
    isLogin: () => { },
    getMe: () => { },
    LogOut: () => { }
});

export default AuthContext;