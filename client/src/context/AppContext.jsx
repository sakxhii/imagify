import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [showLogin, setshowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [credit, setCredit] = useState(null); // Initialize with null

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const loadCreditData = async () => {
        if (!token) return; // Prevent API call if not logged in

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/credits`,
                {}, // Empty body, middleware extracts userId
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setCredit(data.credits); // Ensure correct credit update
                setUser(data.user);
            } else {
                toast.error("Failed to load credits.");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error fetching credits.");
        }
    };

    const generateImage = async (prompt) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/image/generate-image`,
                { prompt },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                loadCreditData();
                return data.resultImage;
            } else {
                toast.error(data.message || "Error generating image.");
            }

            // If user has no credits, redirect to the "Buy Credits" page
            if (data.creditBalance === 0) {
                navigate("/buy");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error generating image.");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null); // Use `null` instead of empty string
        setUser(null);
        setCredit(null); // Reset credits on logout
    };

    useEffect(() => {
        if (token) {
            loadCreditData();
        }
    }, [token]);

    const value = {
        user,
        setUser,
        showLogin,
        setshowLogin,
        backendUrl,
        token,
        setToken,
        credit,
        setCredit,
        loadCreditData,
        logout,
        generateImage,
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;
