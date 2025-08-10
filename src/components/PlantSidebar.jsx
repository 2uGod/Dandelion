import React, { useState } from "react";
import PlantPopup from "./PlantPopup";
import "./PlantSidebar.css"

const PlantSidebar = ({ selectedPlant, setSelectedPlant }) => {
  const [showPopup, setShowPopup] = useState(false);
  const plants = ["토마토", "상추", "오이", "고추"];

  return (
    <aside className="plant-sidebar">
      <h3>🌱 나의 작물</h3>
      <ul>
        {plants.map((plant, i) => (
          <li
            key={i}
            className={selectedPlant === plant ? "selected" : ""}
            onClick={() => setSelectedPlant(plant)}
          >
            {plant}
          </li>
        ))}
      </ul>
      <button onClick={() => setShowPopup(true)}>+ 작물 추가</button>
      {showPopup && <PlantPopup onClose={() => setShowPopup(false)} />}
    </aside>
  );
};

export default PlantSidebar;
