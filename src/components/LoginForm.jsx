import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import "./LoginForm.css"

const LoginForm = () => {
  const navigate = useNavigate(); // ✅ 추가
  const [form, setForm] = useState({ id: "", password: "", remember: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 정보:", form);
    alert("로그인 시도!");
  };

  return (
    <main className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">함께 가꿔요, 농부들의 이야기밭!</h2>
        <p className="login-sub">Farmunity에 로그인하세요.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            name="id"
            placeholder="아이디를 입력하세요"
            value={form.id}
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

        {/* ✅ 회원가입 버튼 영역 */}
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
