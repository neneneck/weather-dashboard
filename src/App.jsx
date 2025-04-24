import React, { useState, useEffect } from "react";
import './App.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 날씨 상태별 텍스트 표시
const weatherStates = {
  "clear sky": "맑음",
  "few clouds": "구름 조금",
  "scattered clouds": "흐림",
  "broken clouds": "많은 구름",
  "shower rain": "소나기",
  "rain": "비",
  "thunderstorm": "천둥/번개",
  "snow": "눈",
  "mist": "안개",
};

function App() {
  const cities = ["서울", "부산", "대구", "인천", "광주"];
  const cityMap = { 서울: "Seoul", 부산: "Busan", 대구: "Daegu", 인천: "Incheon", 광주: "Gwangju" };
  
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");

  // 시간에 따른 다크/라이트 모드
  useEffect(() => {
    const updateMode = () => {
      const hour = new Date().getHours();
      setTimeOfDay(hour >= 18 || hour < 6 ? "dark" : "light");
    };
    updateMode();
    const interval = setInterval(updateMode, 60000);
    return () => clearInterval(interval);
  }, []);

  // 시간 갱신 (1초마다)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(`${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 날씨 데이터 최초 1회 갱신
  useEffect(() => {
    const API_KEY = "1e47671f81095299ed7564508d8fd5dc";
    const fetchWeather = async (city) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityMap[city]}&appid=${API_KEY}&units=metric&lang=kr`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API 실패");
        const data = await response.json();
        const weatherDescription = data.weather[0]?.description;
        return { ...data, formattedWeather: weatherStates[weatherDescription] || weatherDescription };
      } catch (error) {
        return { error: "불러오기 실패" };
      }
    };

    const fetchAllWeather = async () => {
      setLoading(true);
      const results = {};
      for (const city of cities) {
        results[city] = await fetchWeather(city);
      }
      setWeatherData(results);
      setLoading(false);
    };

    fetchAllWeather(); // 최초 1회 호출
  }, []); // 한 번만 실행

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="App">
      <h1><i>☀️</i> Weather</h1>
      <p className="wt_time ab_cen">{currentTime}</p>
      
      <Slider {...sliderSettings}>
        {cities.map((city) => {
          const weather = weatherData[city];
          return (
            <div key={city} className={`slide ${timeOfDay}`} style={{ padding: "20px", textAlign: "center" }}>
              <h2>{city}</h2>
              <p className="wt_state">{weather.formattedWeather}</p>
              {weather?.error ? (
                <p>{weather.error}</p>
              ) : (
                <div className="wt_box">
                  <p className="wt_tem"><i>기온</i>{weather.main?.temp}°C</p>
                  <p className="wt_tem"><i>체감</i>{weather.main?.feels_like}°C</p>
                  <p className="wt_hum"><i>습도</i>{weather.main?.humidity}%</p>
                  <p className="wt_hum"><i>풍속</i>{weather.wind?.speed}m/s</p>
                  <p className="wt_hum"><i>기압</i>{weather.main?.pressure}hPa</p>
                </div>
              )}
            </div>
          );
        })}
      </Slider>
    </div>
  );
}

export default App;