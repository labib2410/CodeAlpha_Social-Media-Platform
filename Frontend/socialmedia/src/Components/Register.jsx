import { useFormik } from "formik";
import * as validation from "yup";
import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const yupObj = validation.object().shape({
        username: validation.string()
            .min(3, "Username must be at least 3 characters")
            .max(15, "Username must be less than 15 characters")
            .required("Username is required"),
        email: validation.string()
            .email("Email is invalid")
            .required("Email is required"),
        password: validation.string()
            .matches(/^[A-Z][a-z0-9]{5,10}$/, "Password must start with capital letter and be 6–11 chars")
            .required("Password is required"),
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
        },
        validationSchema: yupObj,
        onSubmit: handleRegister,
    });

    async function handleRegister(values) {
        setIsLoading(true);
        try {
            const { data } = await axios.post("http://localhost:4008/api/users/register", values);

            if (data.success) {
                setErrorMsg('');
                navigate('/signin');
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="bg-white p-5 rounded shadow w-100" style={{ maxWidth: '400px' }}>
                <h2 className="text-center text-primary mb-4">Create Account</h2>

                {errorMsg && <div className="alert alert-danger text-center">{errorMsg}</div>}

                <form onSubmit={formik.handleSubmit}>

                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            placeholder="Username"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.username}
                        />
                        <label htmlFor="username">Username</label>
                        {formik.errors.username && formik.touched.username && (
                            <small className="text-danger d-block mt-1">{formik.errors.username}</small>
                        )}
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="Email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        <label htmlFor="email">Email address</label>
                        {formik.errors.email && formik.touched.email && (
                            <small className="text-danger d-block mt-1">{formik.errors.email}</small>
                        )}
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="Password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        <label htmlFor="password">Password</label>
                        {formik.errors.password && formik.touched.password && (
                            <small className="text-danger d-block mt-1">{formik.errors.password}</small>
                        )}
                    </div>

                    <div className="d-grid gap-2 mb-2">
                        <button className="btn btn-primary fw-bold" type="submit" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </button>
                        <Link to="/signin" className="btn btn-outline-secondary">
                            Already have an account?
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}
