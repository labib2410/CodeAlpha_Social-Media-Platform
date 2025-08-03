import { useFormik } from "formik";
import * as validation from "yup";
import axios from "axios";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../Contexts/UserContext";

export default function Login() {
    const { setUserToken } = useContext(UserContext);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const yupObj = validation.object().shape({
        email: validation.string().email("Email is invalid").required("Email is required")
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: yupObj,
        onSubmit: handleLogin
    });

    async function handleLogin(values) {
        setIsLoading(true);
        try {
            const { data } = await axios.post("http://localhost:4008/api/users/login", values);
            console.log(data);

            if (data.success) {
                localStorage.setItem('userId', data.data.user.id);
                localStorage.setItem('userEmail', data.data.user.email);
                setErrorMsg('');
                setUserToken(data.data.token);
                navigate('/');
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="bg-white p-5 rounded shadow w-100" style={{ maxWidth: '400px' }}>
                <h2 className="text-center text-success mb-4">Login</h2>

                {errorMsg && <div className="alert alert-danger text-center">{errorMsg}</div>}

                <form onSubmit={formik.handleSubmit}>

                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control"
                            id="email-1"
                            name="email"
                            placeholder="Email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        <label htmlFor="email-1">Email address</label>
                        {formik.errors.email && formik.touched.email && (
                            <small className="text-danger d-block mt-1">{formik.errors.email}</small>
                        )}
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control"
                            id="pass-1"
                            name="password"
                            placeholder="Password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        <label htmlFor="pass-1">Password</label>
                        {formik.errors.password && formik.touched.password && (
                            <small className="text-danger d-block mt-1">{formik.errors.password}</small>
                        )}
                    </div>

                    <div className="d-grid gap-2 mb-2">
                        <button className="btn btn-success fw-bold" type="submit" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                        <Link to="/signup" className="btn btn-outline-secondary">
                            Create New Account
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}
