// domain/weather.js

let weather = "sunny";
let isDay = true;

function updateWeatherAndTime() {
    setInterval(() => {
        weather = Math.random() > 0.5 ? "sunny" : "rainy";
        isDay = !isDay;
        let time = isDay ? "day" : "night";
        broadcastGlobal(i18n("weather_update", { weather, time }));
    }, 30000);
}
