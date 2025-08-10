import React from "react";

const WeatherBar = () => {
  const hourlyWeather = [
    { hour: "06시", temp: "22°", icon: "🌤️" },
    { hour: "09시", temp: "25°", icon: "☀️" },
    { hour: "12시", temp: "30°", icon: "☀️" },
    { hour: "15시", temp: "31°", icon: "☀️" },
    { hour: "18시", temp: "28°", icon: "🌤️" },
    { hour: "21시", temp: "24°", icon: "🌙" },
  ];

  return (
    <div className="weather-bar">
      {hourlyWeather.map((w, i) => (
        <div className="weather-hour" key={i}>
          <div>{w.icon}</div>
          <div>{w.temp}</div>
          <div>{w.hour}</div>
        </div>
      ))}
    </div>
  );
};

export default WeatherBar;
