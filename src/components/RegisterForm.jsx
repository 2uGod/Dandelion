// components/RegisterForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Register.css";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "hobby",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? value : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력하세요.";
    }
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "비밀번호는 8자 이상, 영문+숫자를 포함해야 합니다.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    const payload = {
      nickname: formData.name,
      email: formData.email,
      password: formData.password,
      userType: formData.userType,
    };

    try {
      setLoading(true);
      // ✅ 회원가입 엔드포인트 변경
      await api.post("/auth/signup", payload);

      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (error) {
      console.error("회원가입 에러:", error);
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "서버와 통신할 수 없습니다.";
      setErrors((prev) => ({ ...prev, server: Array.isArray(msg) ? msg.join("\n") : msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-form-wrapper">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="name"
          placeholder="이름"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="비밀번호 확인"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword}</p>
        )}

        <div className="radio-row">
          <label>
            <input
              type="radio"
              name="userType"
              value="hobby"
              checked={formData.userType === "hobby"}
              onChange={handleChange}
            />
            취미반
          </label>
          <label>
            <input
              type="radio"
              name="userType"
              value="expert"
              checked={formData.userType === "expert"}
              onChange={handleChange}
            />
            전문가
          </label>
        </div>

        {errors.server && <p className="error-text">{errors.server}</p>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "가입 중..." : "가입하기"}
        </button>
      </form>
    </main>
  );
};

export default RegisterForm;
