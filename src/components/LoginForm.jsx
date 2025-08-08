import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import "./LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', {
        email: form.email,
        password: form.password
      });

      const { accessToken } = response.data;
      login(accessToken);

      alert("로그인에 성공했습니다!");
      navigate('/');  //홈으로 이동 슈웃

    } catch (error) {
      const errorMessage = error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      alert(`로그인 실패: ${errorMessage}`);
    }
  };

  return (
    <main className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">함께 가꿔요, 농부들의 이야기밭!</h2>
        <p className="login-sub">Farmunity에 로그인하세요.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="이메일을 입력하세요"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChange={handleChange}
            required
          />
          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              <span> ID 기억하기</span>
            </label>
          </div>
          <button type="submit" className="login-button">로그인</button>
        </form>

        <div className="register-link-wrapper">
          <p>계정이 없으신가요?</p>
          <button
            className="register-button"
            onClick={() => navigate("/Register")}
          >
            회원가입
          </button>
        </div>
      </div>
    </main>
  );
};

export default LoginForm;
