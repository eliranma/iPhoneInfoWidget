// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: terminal;
/******************************************************************************
 * Constants and Configurations
 *****************************************************************************/

// Cache keys and default location
const CACHE_KEY_LAST_UPDATED = "last_updated";
const CACHE_KEY_LOCATION = "location";
const DEFAULT_LOCATION = { latitude: 0, longitude: 0 };

// Font name and size
const FONT_NAME = "ArialHebrew";
const FONT_SIZE = 10;

// Colors
const COLORS = {
  bg0: "#29323c",
  bg1: "#1c1c1c",
  personalCalendar: "#5BD2F0",
  workCalendar: "#9D90FF",
  weather: "#FDFD97",
  location: "#FEB144",
  deviceStats: "#7AE7B9",
};

// TODO: PLEASE SET THESE VALUES
const NAME = `Eliran's ${Device.name()}`;
const WORK_CALENDAR_NAME = "עבודה";
const PERSONAL_CALENDAR_NAME = "לוח שנה";
const NOTIFICATION = {
  BATTERY: "BATTERY_PIKA_WIDGET",
};
const currentDatePlus15Minutes = () => new Date(Date.now() + 15 * 60 * 1000);

/******************************************************************************
 * Initial Setups
 *****************************************************************************/

/**
 * Convenience function to add days to a Date.
 *
 * @param {*} days The number of days to add
 */
Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

// Import and setup Cache
const Cache = importModule("Cache");
const cache = new Cache("pikachuWidget");

// Fetch data and create widget
const data = await fetchData();
const widget = createWidget(data);

Script.setWidget(widget);
Script.complete();

/******************************************************************************
 * Main Functions (Widget and Data-Fetching)
 *****************************************************************************/

/**
 * Main widget function.
 *
 * @param {} data The data for the widget to display
 */
function createWidget(data) {
  // console.log(`Creating widget with data: ${JSON.stringify(data)}`);
  console.log(`weater data: ${JSON.stringify(data.weather.current)}`);

  const widget = new ListWidget();
  const bgColor = new LinearGradient();
  const timeFormatter = new DateFormatter();
  timeFormatter.locale = Device.locale().split("_", 1)[0];
  timeFormatter.useNoDateStyle();
  timeFormatter.useShortTimeStyle();

  bgColor.colors = [new Color(COLORS.bg0), new Color(COLORS.bg1)];
  bgColor.locations = [0.0, 1.0];
  widget.backgroundGradient = bgColor;
  widget.setPadding(0, 0, 0, 0);
  widget.refreshAfterDate = currentDatePlus15Minutes();

  const stack = widget.addStack();
  stack.layoutVertically();
  stack.spacing = 2;
  stack.size = new Size(0, 0);

  // Line 0 - Info
  const infoStack = stack.addStack();
  infoStack.layoutVertically();
  infoStack.spacing = 2;
  // Line 0.0 - Header
  infoStack.setPadding(2, 1, 0, 1);
  const inputLine = infoStack.addText(`⚙️ | ${getText("INFO")}`);
  inputLine.textColor = Color.white();
  inputLine.font = new Font(FONT_NAME, FONT_SIZE);

  const nameLine = infoStack.addText(`${getText("NAME")} : ${NAME}`);
  nameLine.textColor = Color.white();
  nameLine.textOpacity = 0.7;
  nameLine.font = new Font(FONT_NAME, FONT_SIZE);
  // Line 0.2 - Last Login

  const lastLoginLine = infoStack.addText(
    `${getText("LAST_LOGIN")} : ${timeFormatter.string(new Date())}`
  );
  lastLoginLine.textColor = Color.white();
  lastLoginLine.textOpacity = 0.7;
  lastLoginLine.font = new Font(FONT_NAME, FONT_SIZE);
  // Line 1 - Next Calendar Events
  const eventStack = stack.addStack();
  eventStack.spacing = 2;
  eventStack.centerAlignContent();

  // Line 1.0 - Personal Events
  const privateEventStack = eventStack.addStack();
  privateEventStack.layoutVertically();
  privateEventStack.spacing = 1;

  const nextPersonalHeaderLine = privateEventStack.addText(
    `🗓 | ${getText("PRIVATE")}`
  );
  const nextPersonalCalendarEventLine = privateEventStack.addText(
    `${getCalendarEventTitle(data.nextPersonalEvent, false)}`
  );
  nextPersonalCalendarEventLine.textColor = new Color(COLORS.personalCalendar);
  nextPersonalCalendarEventLine.font = new Font(FONT_NAME, FONT_SIZE);
  nextPersonalHeaderLine.textColor = new Color(COLORS.personalCalendar);
  nextPersonalHeaderLine.font = new Font(FONT_NAME, FONT_SIZE);

  // Line 1.1 Work Events
  const workEventStack = eventStack.addStack();
  workEventStack.layoutVertically();
  workEventStack.spacing = 1;
  const nextWorkHeaderLine = workEventStack.addText(`🗓 | ${getText("WORK")}`);
  const nextWorkCalendarEventLine = workEventStack.addText(
    `${getCalendarEventTitle(data.nextWorkEvent, true)}`
  );
  nextWorkHeaderLine.textColor = new Color(COLORS.workCalendar);
  nextWorkHeaderLine.font = new Font(FONT_NAME, FONT_SIZE);
  nextWorkCalendarEventLine.textColor = new Color(COLORS.workCalendar);
  nextWorkCalendarEventLine.font = new Font(FONT_NAME, FONT_SIZE);

  // Line 4 - Weather
  const weatherLine = stack.addText(
    `${data.weather.icon} | ${data.weather.temperature}°, ${getText(
      "FEELS_LIKE"
    )} ${data.weather.feelsLike}°`
  );
  weatherLine.textColor = new Color(COLORS.weather);
  weatherLine.font = new Font(FONT_NAME, FONT_SIZE);
  //
  // Line 5 - Location
  let loc = data.weather.location || getText("CURRENT_LOCATION");
  const locationLine = stack.addText(`📍 | ${loc}`);
  locationLine.textColor = new Color(COLORS.location);
  locationLine.font = new Font(FONT_NAME, FONT_SIZE);

  // Line 7 - Various Device Stats
  const deviceStatsStack = stack.addStack();
  deviceStatsStack.layoutVertically();
  deviceStatsStack.spacing = 3;
  const statsLine = deviceStatsStack.addText(`📊 | ${getText("DEVICE_STATS")}`);
  statsLine.textColor = Color.white();
  statsLine.font = new Font(FONT_NAME, FONT_SIZE);
  const bateryImage = data.device.battery > 80 ? "🔋" : "🪫";
  const deviceBatteryLine = deviceStatsStack.addText(
    `${bateryImage} | ${getText("BATTERY")} : ${data.device.battery}%`
  );
  deviceBatteryLine.textColor = new Color(COLORS.deviceStats);
  deviceBatteryLine.font = new Font(FONT_NAME, FONT_SIZE);
  const deviceBrightnessLine = deviceStatsStack.addText(
    `☀ | ${getText("BRIGHTNESS")} : ${data.device.brightness}%`
  );
  deviceBrightnessLine.textColor = new Color(COLORS.deviceStats);
  deviceBrightnessLine.font = new Font(FONT_NAME, FONT_SIZE);
  return widget;
}

function createNotification(
  notificationObj = {
    title: getText("NEW_NOTIFICATION"),
    subtitle: undefined,
    body: getText("NOTIFICATION_MSG"),
    preferredContentHeight: undefined,
    threadIdentifier: undefined,
    sound: "default",
    scriptName: Script.name,
    identifier: "",
  }
) {
  const notifi = new Notification({ ...notificationObj });
  return notifi;
}
/**
 * list of notification:
 * 1. battery lower than 20%
 * 2. battery lower than 10%
 * 3.
 */

/**
 * Fetch pieces of data for the widget.
 */
async function fetchData() {
  // Get the weather data
  const lastUpdated = await getLastUpdated();
  const weather = await fetchWeather();
  // Get next work/personal calendar events
  const nextWorkEvent = await fetchNextCalendarEvent(WORK_CALENDAR_NAME);
  const nextPersonalEvent = await fetchNextCalendarEvent(
    PERSONAL_CALENDAR_NAME
  );

  // Get last data update time (and set)

  cache.write(CACHE_KEY_LAST_UPDATED, new Date().getTime());
  const batteryLevel = Device.batteryLevel();
  const brightness = Device.screenBrightness();
  switch (batteryLevel) {
    case batteryLevel < 20 || batteryLevel>10:
      createNotification({
        title: getText("LOW_BATTERY"),
        subtitle: undefined,
        body: `${getText("BATTERY_LOWER_THAN")} ${batteryLevel}`,
        preferredContentHeight: undefined,
        threadIdentifier: undefined,
        sound: "default",
        scriptName: Script.name,
        identifier: NOTIFICATION.BATTERY,
      });
      break;
  }
  // console.log(Device.batteryLevel())
  // console.log(Device.sc)
  return {
    weather,
    nextWorkEvent,
    nextPersonalEvent,
    device: {
      battery: `${Math.round(batteryLevel * 100)}`,
      brightness: `${Math.round(brightness * 100)}`,
    },
    lastUpdated,
  };
}

/******************************************************************************
 * Helper Functions
 *****************************************************************************/

//-------------------------------------
// Weather Helper Functions
//-------------------------------------

async function getLocation() {
  let location = await cache.read(CACHE_KEY_LOCATION);
  if (!location) {
    try {
      Location.setAccuracyToThreeKilometers();
      location = await Location.current();
    } catch (error) {
      location = await cache.read(CACHE_KEY_LOCATION);
    }
  }
  if (!location) {
    location = DEFAULT_LOCATION;
  }
  return location;
}

/**
 * Fetch the weather data from Open Weather Map
 */
async function fetchWeather() {
  let location = await getLocation();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,rain,weather_code&daily=sunrise,sunset,daylight_duration,sunshine_duration&timezone=auto&past_days=1&forecast_days=3`;

  const data = await fetchJson(
    `weather_${location.latitude}_${location.longitude}`,
    url
  );
  // console.log(data); // Verify the structure of the response
  const address = await Location.reverseGeocode(
    location.latitude,
    location.longitude
  );

  // Example of accessing data based on the response structure, adjust as needed
  const currentTime = new Date().getTime() / 1000;
  const isDay = data?.current?.is_day; // Assuming there's a property 'is_day' in the response

  return {
    location: `${address[0].postalAddress.city}, ${address[0].postalAddress.state}`,
    icon: getWeatherEmoji(data?.current?.weather_code, !isDay),
    temperature: Math.round(data?.current?.temperature_2m),
    wind: Math.round(data.current.wind_speed_10m),
    feelsLike: Math.round(data.current.apparent_temperature),
  };
}

/**
 * Given a weather code from Open Weather Map, determine the best emoji to show.
 *
 * @param {*} code Weather code from Open Weather Map
 * @param {*} isNight Is `true` if it is after sunset and before sunrise
 */
function getWeatherEmoji(code, isNight) {
  switch (code) {
    case 0:
      return isNight ? "🌕" : "☀️"; // Clear sky
    case 1:
      return "🌤"; // Mainly clear
    case 2:
      return "⛅️"; // Partly cloudy
    case 3:
      return "☁️"; // Overcast
    case 45:
      return "🌫"; // Fog
    case 48:
      return "🌫"; // Deposition rime fog
    case 51:
      return "🌧"; // Drizzle: Light intensity
    case 53:
      return "🌧️"; // Drizzle: Moderate intensity
    case 55:
      return "🌧️"; // Drizzle: Dense intensity
    case 56:
      return "🌨️"; // Freezing drizzle: Light intensity
    case 57:
      return "🌨️"; // Freezing drizzle: Dense intensity
    case 61:
      return "🌧️"; // Rain: Slight intensity
    case 63:
      return "🌧️"; // Rain: Moderate intensity
    case 65:
      return "🌧️"; // Rain: Heavy intensity
    case 66:
      return "🌨️"; // Freezing rain: Light intensity
    case 67:
      return "🌨️"; // Freezing rain: Heavy intensity
    case 71:
      return "❄️"; // Snow fall: Slight intensity
    case 73:
      return "❄️"; // Snow fall: Moderate intensity
    case 75:
      return "❄️"; // Snow fall: Heavy intensity
    case 77:
      return "❄️"; // Snow grains
    case 80:
      return "🌧️"; // Rain showers: Slight intensity
    case 81:
      return "🌧️"; // Rain showers: Moderate intensity
    case 82:
      return "⛈"; // Rain showers: Violent intensity
    case 85:
      return "🌨️"; // Snow showers: Slight intensity
    case 86:
      return "❄️"; // Snow showers: Heavy intensity
    case 95:
      return "⛈"; // Thunderstorm: Slight or moderate
    case 96:
      return "⛈"; // Thunderstorm: With slight hail
    case 99:
      return "⛈"; // Thunderstorm: With heavy hail
    default:
      return "❓"; // Unknown
  }
}

//-------------------------------------
// Calendar Helper Functions
//-------------------------------------

/**
 * Fetch the next calendar event from the given calendar
 *
 * @param {*} calendarName The calendar to get events from
 */
async function fetchNextCalendarEvent(calendarName) {
  const calendar = await Calendar.forEventsByTitle(calendarName);
  const events = await CalendarEvent.today([calendar]);
  const tomorrow = await CalendarEvent.tomorrow([calendar]);

  const upcomingEvents = events
    .concat(tomorrow)
    .filter((e) => new Date(e.endDate).getTime() >= new Date().getTime());

  return upcomingEvents ? upcomingEvents[0] : null;
}

/**
 * Given a calendar event, return the display text with title and time.
 *
 * @param {*} calendarEvent The calendar event
 * @param {*} isWorkEvent Is this a work event?
 */
function getCalendarEventTitle(calendarEvent, isWorkEvent) {
  if (!calendarEvent) {
    return isWorkEvent ? getText("NO_WORK_EVENTS") : getText("NO_EVENTS");
  }
  // console.log(Device.locale())
  const timeFormatter = new DateFormatter();
  timeFormatter.locale = Device.locale().split("_", 1)[0];
  timeFormatter.useNoDateStyle();
  timeFormatter.useShortTimeStyle();

  const eventTime = new Date(calendarEvent.startDate);

  return `[${timeFormatter.string(eventTime)}] ${calendarEvent.title}`;
}

//-------------------------------------
// Misc. Helper Functions
//-------------------------------------

/**
 * Make a REST request and return the response
 *
 * @param {*} key Cache key
 * @param {*} url URL to make the request to
 * @param {*} headers Headers for the request
 */
async function fetchJson(key, url, headers) {
  const cached = await cache.read(key, 5);
  if (cached) {
    return cached;
  }

  try {
    console.log(`Fetching url: ${url}`);
    const req = new Request(url);
    req.headers = headers;
    const resp = await req.loadJSON();
    // console.log(resp)
    cache.write(key, resp);
    return resp;
  } catch (error) {
    try {
      return cache.read(key, 5);
    } catch (error) {
      console.log(`Couldn't fetch ${url}`);
    }
  }
}

/**
 * Get the last updated timestamp from the Cache.
 */
async function getLastUpdated() {
  let cachedLastUpdated = await cache.read(CACHE_KEY_LAST_UPDATED);

  if (!cachedLastUpdated) {
    cachedLastUpdated = new Date().getTime();
    cache.write(CACHE_KEY_LAST_UPDATED, cachedLastUpdated);
  }

  return cachedLastUpdated;
}

function is15MinutesPassed(timestamp) {
  // Create a Date object from the given timestamp
  const date = new Date(timestamp);

  // Create a Date object representing the current time
  const currentDate = new Date();

  // Add 15 minutes to the given timestamp
  const plus15Minutes = new Date(date.getTime() + 15 * 60 * 1000);

  // Compare the current time with the time 15 minutes after the given timestamp
  return currentDate >= plus15Minutes;
}
function getText(key) {
  let lang = Device.locale().split("_", 1)[0];
  // console.log(lang)

  let languageObject = {
    he: {
      NO_WORK_EVENTS: "אין אירועים קרובים בעבודה",
      NO_EVENTS: "אין אירועים קרובים",
      CURRENT_LOCATION: "מיקום נוכחי",
      INFO: "מידע",
      FEELS_LIKE: "מרגיש כמו",
      LAST_LOGIN: "כניסה אחרונה",
      NAME: "שם",
      BATTERY: "סוללה",
      BRIGHTNESS: "בהירות",
      DEVICE_STATS: "נתוני מכשיר",
      PRIVATE: "פרטי",
      WORK: "עבודה",
    },
    en: {
      NO_WORK_EVENTS: "No upcoming work events",
      NO_EVENTS: "No upcoming events",
      CURRENT_LOCATION: "Current Location",
      FEELS_LIKE: "feels like",
      INFO: "info",
      LAST_LOGIN: "Last login",
      BATTERY: "Battery",
      NAME: "Name",
      BRIGHTNESS: "Brightness",
      DEVICE_STATS: "Device Stats",
      PRIVATE: "Private",
      WORK: "Work",
    },
  };
  return languageObject[lang][key];
}
