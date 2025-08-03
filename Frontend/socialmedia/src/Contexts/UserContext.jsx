import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export default function UserProvider({ children }) {
    const [userToken, setUserToken] = useState(null);

    // عند أول تحميل، شوف إذا فيه توكن مخزّن في localStorage
    useEffect(() => {
        const token = localStorage.getItem("userId");
        if (token) {
            setUserToken(token);
        }
    }, []);

    return (
        <UserContext.Provider value={{ userToken, setUserToken }}>
            {children}
        </UserContext.Provider>
    );
}
