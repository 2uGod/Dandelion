// src/components/LoginForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);

  // 저장된 이메일 복원
  useEffect(() => {
    const remembered = localStorage.getItem("remembered_email");
    if (remembered) {
      setForm((prev) => ({ ...prev, email: remembered, remember: true }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const token = res?.data?.data?.accessToken;
      if (typeof token !== "string" || !token) {
        throw new Error("서버 응답에서 accessToken을 찾을 수 없습니다.");
      }

      login(token);

      if (form.remember) {
        localStorage.setItem("remembered_email", form.email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      alert("로그인에 성공했습니다!");
      navigate("/MyPage");
    } catch (error) {
      console.warn("[LOGIN ERROR]", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "로그인 중 오류가 발생했습니다.";
      alert(`로그인 실패: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">함께 가꿔요, 농부들의 이야기밭!</h2>
        <p className="login-sub">Farmunity에 로그인하세요.</p>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
          <input
            type="email"
            name="email"
            placeholder="이메일을 입력하세요"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                disabled={loading}
              />
              <span> ID 기억하기</span>
            </label>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="register-link-wrapper">
          <p>계정이 없으신가요?</p>
          <button
            className="register-button"
            onClick={() => navigate("/register")}
            disabled={loading}
          >
            회원가입
          </button>
        </div>
      </div>
    </main>
  );
};

export default LoginForm;
