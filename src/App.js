import React, { useState, useEffect } from "react";
import './App.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 날씨 상태별 텍스트 표시
const weatherIcons = {
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
  const cityMap = {
    서울: "Seoul",
    부산: "Busan",
    대구: "Daegu",
    인천: "Incheon",
    광주: "Gwangju",
  };

  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");  // 시간에 따른 다크/라이트 모드 상태 관리

  // 날씨 상태 정의
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

  // 시간에 따라 다크/라이트 모드 클래스 적용
  useEffect(() => {
    const updateMode = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 18 || hour < 6) {
        setTimeOfDay("dark");
      } else {
        setTimeOfDay("light");
      }
    };

    updateMode(); // 최초 실행
    const interval = setInterval(updateMode, 60000); // 1분마다 갱신

    return () => clearInterval(interval);
  }, []);

  // 현재 시간을 1초마다 갱신
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");

      setCurrentTime(`${yyyy}.${mm}.${dd} ${hh}:${min}`);
    };

    updateTime(); // 첫 렌더링 시 호출
    const interval = setInterval(updateTime, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 날씨 정보를 1분마다 업데이트
  useEffect(() => {
    const API_KEY = "1e47671f81095299ed7564508d8fd5dc";

    const fetchAllWeather = async () => {
      setLoading(true);
      const results = {};

      for (const city of cities) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityMap[city]}&appid=${API_KEY}&units=metric&lang=kr`;

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error("API 실패");
          const data = await response.json();
          const weatherDescription = data.weather[0]?.description;
          const formattedWeather = weatherStates[weatherDescription] || weatherDescription;
          results[city] = { ...data, formattedWeather };
        } catch (error) {
          results[city] = { error: "불러오기 실패" };
        }
      }

      setWeatherData(results);
      setLoading(false);
    };

    fetchAllWeather(); // 첫 렌더링 시 날씨 데이터 불러오기

    const interval = setInterval(fetchAllWeather, 60000); // 1분마다 날씨 데이터 업데이트

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 제거
  }, []);

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
            <div
              key={city}
              className={`slide ${timeOfDay}`} // 슬라이드에 다크/라이트 클래스 적용
              style={{ padding: "20px", textAlign: "center" }}
            >
              <div>
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
            </div>
          );
        })}
      </Slider>
    </div>
  );
}

export default App;
