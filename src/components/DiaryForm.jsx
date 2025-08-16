// src/components/DiaryForm.jsx
import React, { useState, useEffect } from "react";
import "./DiaryForm.css"

const STORAGE_KEY = "farmunity_diary_entries";

const DiaryForm = ({ selectedPlant, editingEntry, setEditingEntry }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setContent(editingEntry.content);
      setDate(editingEntry.date);
    }
  }, [editingEntry]);

  const saveEntry = () => {
    if (!title || !date) return alert("날짜와 제목을 입력하세요");

    let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (editingEntry) {
      entries = entries.map((e) =>
        e.id === editingEntry.id ? { ...e, title, content, date, plant: selectedPlant } : e
      );
    } else {
      entries.push({
        id: Date.now(),
        title,
        content,
        date,
        plant: selectedPlant,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    setTitle("");
    setContent("");
    setDate("");
    setEditingEntry(null);
  };

  return (
    <div className="diary-form">
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={saveEntry}>{editingEntry ? "수정" : "저장"}</button>
      {editingEntry && <button onClick={() => setEditingEntry(null)}>취소</button>}
    </div>
  );
};

export default DiaryForm;
