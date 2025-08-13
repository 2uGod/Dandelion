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
      // 로그인 요청
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      // 응답 인터셉터 유무와 상관없이 data를 안전하게 추출
      console.log('[LOGIN RES]', res);
      const data = res?.data ?? res; // (응답 인터셉터가 있으면 res, 없으면 res.data)
      console.log('[LOGIN DATA]', data);

      // 가능한 모든 위치/키에서 토큰 추출
      const token =
        // 1) 순수 문자열 응답
        (typeof data === 'string' ? data : null) ||
        // 2) 평평한 키
        data?.accessToken || data?.access_token || data?.token || data?.jwt ||
        // 3) 한 단계 중첩
        data?.data?.accessToken || data?.data?.access_token || data?.data?.token || data?.data?.jwt ||
        // 4) 다른 컨벤션
        data?.result?.accessToken || data?.result?.access_token;

      if (!token || typeof token !== 'string') {
        // 쿠키(HTTP-only) 기반일 수도 있으니 힌트 로그 남김
        console.warn('No token in response body. If you use HTTP-only cookies, enable withCredentials and proper CORS.');
        throw new Error('서버 응답에서 토큰을 찾을 수 없습니다.');
      }

      // accessToken 저장 및 디코드 처리(AuthContext.login 내부에서)
      login(token);

      alert("로그인에 성공했습니다!");
      navigate('/');  // 홈으로 이동
    } catch (error) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "로그인 중 오류가 발생했습니다.";
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
            onClick={() => navigate("/register")}
          >
            회원가입
          </button>
        </div>
      </div>
    </main>
  );
};

export default LoginForm;
