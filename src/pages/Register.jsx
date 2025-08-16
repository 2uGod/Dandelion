// pages/Register.jsx
import React from "react";
import Header from "../components/Header";
import RegisterForm from "../components/RegisterForm";

const Register = () => {
  return (
    <div className="register-page">
    <Header />
    <div className="register-container">
        <RegisterForm />
    </div>
    </div>

  );
};

export default Register;
