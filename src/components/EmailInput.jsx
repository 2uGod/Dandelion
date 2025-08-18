// src/components/settings/EmailInput.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./EmailInput.css";
import { EMAIL_DOMAINS } from "../constants";

export default function EmailInput({ local, domain, onChange }) {
  const [localPart, setLocalPart] = useState(local || "");
  const [domainPart, setDomainPart] = useState(domain || "");
  
  const initialMode = useMemo(() => {
    return EMAIL_DOMAINS.includes(domain || "") ? domain : "직접 입력";
  }, [domain]);
  
  const [mode, setMode] = useState(initialMode);

  useEffect(() => { 
    onChange?.(localPart.trim(), domainPart.trim()); 
  }, [localPart, domainPart, onChange]);

  const onSelect = useCallback((e) => {
    const v = e.target.value;
    setMode(v);
    if (v !== "직접 입력") {
      setDomainPart(v);
    } else {
      setDomainPart("");
    }
  }, []);
  
  const handleLocalChange = useCallback((e) => {
    setLocalPart(e.target.value);
  }, []);
  
  const handleDomainChange = useCallback((e) => {
    setDomainPart(e.target.value);
  }, []);

  return (
    <div className="email-row">
      <input
        className="settings-input"
        value={localPart}
        onChange={handleLocalChange}
        placeholder="example"
      />
      <span className="at">@</span>
      {mode === "직접 입력" ? (
        <input
          className="settings-input"
          value={domainPart}
          onChange={handleDomainChange}
          placeholder="domain.com"
        />
      ) : (
        <input className="settings-input" value={domainPart} readOnly />
      )}
      <select className="settings-select" value={mode} onChange={onSelect}>
        {EMAIL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  );
}
