// src/components/NavTabs.jsx
import React from "react";
import "./NavTabs.css"

const NavTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { label: "캘린더", key: "calendar" },
    { label: "일정관리", key: "plan" }, 
    { label: "농사일지", key: "journal" },
    { label: "설정", key: "settings" },
  ];

  return (
    <nav className="nav-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? "active" : ""}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default NavTabs;
