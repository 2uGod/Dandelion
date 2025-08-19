// src/components/settings/EmailInput.jsx
import React, { useEffect, useState } from "react";
import "./EmailInput.css";
const COMMON = [
  "gmail.com",
  "naver.com",
  "daum.net",
  "kakao.com",
  "icloud.com",
  "직접 입력",
];

export default function EmailInput({ local, domain, onChange }) {
  const [localPart, setLocalPart] = useState(local || "");
  const [domainPart, setDomainPart] = useState(domain || "");
  const [mode, setMode] = useState(
    COMMON.includes(domain || "") ? domain : "직접 입력"
  );

  useEffect(() => {
    onChange?.(localPart.trim(), domainPart.trim());
  }, [localPart, domainPart]);

  const onSelect = (e) => {
    const v = e.target.value;
    setMode(v);
    if (v !== "직접 입력") setDomainPart(v);
    else setDomainPart("");
  };

  return (
    <div className="email-row">
      <input
        className="settings-input"
        value={localPart}
        onChange={(e) => setLocalPart(e.target.value)}
        placeholder="example"
      />
      <span className="at">@</span>
      {mode === "직접 입력" ? (
        <input
          className="settings-input"
          value={domainPart}
          onChange={(e) => setDomainPart(e.target.value)}
          placeholder="domain.com"
        />
      ) : (
        <input className="settings-input" value={domainPart} readOnly />
      )}
      <select className="settings-select" value={mode} onChange={onSelect}>
        {COMMON.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
