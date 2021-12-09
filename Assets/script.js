var city = "";

var searchCity = $("#search-city")
var searchButton = $("#search-button")
var currentCity = $("#current-city")
var currentTemperature = $("#temperature")
var currentHumidity = $("#humidity")
var currentWindSpeed = $("#wind-speed")
var currentUVIndex = $("#uv-index")
var sCity =[]

function find(c){
    for (var i = 0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1
        }
    }
    return 1
}

var APIKey="a0aca8a89948154a4182dcecc780b513"

function displayWeather(event){
    event.preventDefault()
    if (searchCity.val().trim()!==""){
        city = searchCity.val().trim()
        currentWeather(city)
    }
}

function currentWeather(city){
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method: "GET",
    }).then(function(response){
        console.log(response)
        var date = moment().format("dddd, MMMM Do YYYY" )
        var iconUrl = "https://openweathermap.org/img/wn/" + response.weather[0].icon + ".png"
        $(currentCity).html(response.name + "("+date+")" + "<img src="+iconUrl+">")
        var tempF =(response.main.temp -273.15) * 1.80 + 32
        $(currentTemperature).html((tempF).toFixed(2) + "&#8457")
        $(currentHumidity).html(response.main.humidity + "%")
        var ws = Math.floor(response.wind.speed)
        $(currentWindSpeed).html(ws + "MPH")

        assignUV(response.coord.lon, response.coord.lat)
        
        forecast(response.id)
        if(response.cod==200){
            sCity = JSON.parse(localStorage.getItem("cityName"))
            console.log(sCity)
            if (sCity == null) {
                sCity = []
                sCity.push(city.toUpperCase())
                localStorage.setItem("cityName", JSON.stringify(sCity))
                addToList(city)
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase())
                    localStorage.setItem("cityName", JSON.stringify(sCity))
                    addToList(city)
                }
            }
        }

    })
}

function assignUV(ln, lt) {
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
        url:uvqURL,
        method: "GET"
    }).then(function(response){
        $(currentUVIndex).html(response.value)
    })
}

function forecast(cityID){
    var dayOver = false;
    var queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?id="+cityID+"&appid="+APIKey;
    $.ajax({
        url:queryForecastURL,
        method: "GET"
    }).then(function(response){
        console.log(response)
        for (i = 0; i<5; i++){
            var date = moment().add(i +1, "days").format("L")
            var iconCode = response.list[i + 1].weather[0].icon
            var iconUrl="https://openweathermap.org/img/wn/"+iconCode+".png"
            var tempK = response.list[i + 1].main.temp
            var tempF = (((tempK-273.5)*1.8)+32).toFixed(2)
            var humidity = response.list[i + 1].main.humidity
            var wind = response.list[i+1].wind.speed

            $("#fDate" + i).html(date)
            $("#fImg" + i).html("<img src ="+iconUrl + ">")
            $("#fTemp" +i).html(tempF + "&#8457")
            $("#fHumidity" + i).html(humidity + "%")
            $("#fWind" +i).html(wind)
        }
    })
}

function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase()+"</li>")
    $(listEl).attr("class", "list-group-item")
    $(listEl).attr("data-value", c.toUpperCase())
    $(".list-group").append(listEl)
}

function invokePastSearch(event){
    var liEl = event.target
    if (event.target.matches("li")){
        city = liEl.textContent.trim()
        currentWeather(city)
    }
}

function loadLastCity(){
    $("ul").empty()
    var sCity = JSON.parse(localStorage.getItem("cityName"))
    if (sCity !== null ){
        sCity = JSON.parse(localStorage.getItem("cityName"))
        for(i = 0; i<sCity.length; i++){
            addToList(sCity[i])
        }
        city = sCity[ i - 1]
        currentWeather(city)
    }
}

$("#search-button").on("click", displayWeather)
$(document).on("click", invokePastSearch)
$(window).on("load", loadLastCity)