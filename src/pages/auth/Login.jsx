import { useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Link,
    TextField,
    Typography,
} from "@mui/material";

import {
    Link as RouterLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { loginUser } from "../../api/authService";
import { useAuth } from "../../context/AuthContext";


function LoginForm() {

    const navigate = useNavigate();

    const location = useLocation();

    const { login } = useAuth();


    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });


    const [loading, setLoading] = useState(false);


    const from =
        location.state?.from ||
        sessionStorage.getItem("redirectAfterLogin") ||
        null;


    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setLoginData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };


    const handleSubmit = async (event) => {

        event.preventDefault();


        if (
            !loginData.email ||
            !loginData.password
        ) {

            alert(
                "Please enter email and password"
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await loginUser(loginData);


            console.log(
                "LOGIN API RESPONSE:",
                response.data
            );


            if (!response.data.success) {

                alert(
                    response.data.message ||
                    "Login failed"
                );

                return;
            }


            const userData =
                response.data.data;


            console.log(
                "LOGIN USER DATA:",
                userData
            );


            /* ==========================================
               SAVE AUTHENTICATION
            ========================================== */

            login(userData);


            if (userData.token) {

                localStorage.setItem(
                    "token",
                    userData.token
                );
            }


            if (userData.role) {

                localStorage.setItem(
                    "role",
                    userData.role
                );
            }


            if (userData.email) {

                localStorage.setItem(
                    "email",
                    userData.email
                );
            }


            /* ==========================================
               SAVE USER ID
            ========================================== */

            /*
             * Different backend response DTOs may use
             * different names for the user ID.
             *
             * We support the common possibilities here.
             */

            const userId =
                userData.userId ??
                userData.id ??
                userData.user?.id ??
                userData.user?.userId;


            console.log(
                "Detected User ID:",
                userId
            );


            if (
                userId !== undefined &&
                userId !== null
            ) {

                localStorage.setItem(
                    "userId",
                    String(userId)
                );

            } else {

                console.warn(
                    "No user ID was returned by the login API."
                );

                /*
                 * Do not stop login. The user can still
                 * access the dashboard.
                 */
            }


            /* ==========================================
               CLEAR OLD VENDOR ID
            ========================================== */

            /*
             * vendorId will be loaded from the vendor
             * profile after login.
             *
             * Removing an old value prevents another
             * vendor's ID from being reused.
             */

            localStorage.removeItem(
                "vendorId"
            );


            /* ==========================================
               REDIRECT
            ========================================== */

            if (from) {

                sessionStorage.removeItem(
                    "redirectAfterLogin"
                );


                navigate(
                    from,
                    {
                        replace: true,
                    }
                );


                return;
            }


            if (
                userData.role ===
                "ROLE_ADMIN"
            ) {

                navigate(
                    "/admin/dashboard",
                    {
                        replace: true,
                    }
                );

            } else if (
                userData.role ===
                "ROLE_VENDOR"
            ) {

                navigate(
                    "/vendor/dashboard",
                    {
                        replace: true,
                    }
                );

            } else {

                navigate(
                    "/products",
                    {
                        replace: true,
                    }
                );
            }


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Login failed. Please check your email and password."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f4f6f8",
            }}
        >

            <Card
                sx={{
                    width: 500,
                    maxWidth: "90%",
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 6,
                }}
            >

                <CardContent>

                    <Typography
                        variant="h4"
                        align="center"
                        fontWeight="bold"
                        gutterBottom
                    >
                        ShopStack
                    </Typography>


                    <Typography
                        variant="body1"
                        align="center"
                        color="text.secondary"
                        mb={4}
                    >
                        Welcome Back
                    </Typography>


                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={
                                loginData.email
                            }
                            onChange={
                                handleChange
                            }
                            margin="normal"
                            required
                        />


                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={
                                loginData.password
                            }
                            onChange={
                                handleChange
                            }
                            margin="normal"
                            required
                        />


                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                mt: 3,
                                height: 45,
                            }}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </Button>

                    </Box>


                    <Typography
                        align="center"
                        mt={3}
                    >
                        Don't have an account?{" "}

                        <Link
                            component={RouterLink}
                            to="/register"
                        >
                            Register
                        </Link>

                    </Typography>

                </CardContent>

            </Card>

        </Box>
    );
}


export default LoginForm;
