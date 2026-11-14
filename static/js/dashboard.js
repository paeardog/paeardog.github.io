(function () {
	"use strict";

	// ===================== 天气（Open-Meteo）配置 =====================
	//
	// 【定位策略】dwWeatherConfig.locationMode
	//   "auto"  —— 默认。定位访客所在地：浏览器 GPS（带跑偏校验）→ IP 定位 → 兜底城市。
	//   "fixed" —— 不做任何定位，永远显示下面写死的兜底城市。
	//
	// 关于定位可靠性（原实现踩过的坑，别改回去）：
	//   1) 浏览器 GPS 在电脑端其实是 WiFi 定位库，经常偏到隔壁市 → 用 maxAutoDistanceKm 校验；
	//   2) 国内宽带 IP 归属地会跨市漂移，同一个 IP 被不同 IP 库分别解析成
	//      涞源 / 保定 / 石家庄 / 承德，跨度 300 km → 地名只用于「显示」，
	//      取数一律用 IP 库返回的经纬度，不用地名反查坐标；
	//   3) 中文地名库不可靠（「保定」会命中云南的一个村，「涞源县」查不到），
	//      绝不要用城市名反查坐标；Open-Meteo 同样直接吃经纬度，不需要反查；
	//   4) 定位类接口偶尔会挂住不返回 → 必须有超时，否则页面永远停在「正在定位...」。
	var dwWeatherConfig = {
		locationMode: "auto",
		fallbackCity: "长沙",
		fallbackLatitude: 28.2278,
		fallbackLongitude: 112.9388,
		// 定位点离兜底城市超过该公里数即判定为跑偏，继续往下一级回退
		maxAutoDistanceKm: 80,
		// 单个定位/天气请求的超时（毫秒），避免页面一直卡在「正在定位...」
		requestTimeoutMs: 8000,
		// 整个定位链的总时限（毫秒）。多级回退是串行的，
		// 若每个源都挂住不返回，累加会把「正在定位...」拖到十几秒，所以必须封顶。
		locationDeadlineMs: 6000,
		// 天气自动刷新间隔（分钟）；切回前台时若已过期也会立即刷新
		refreshIntervalMinutes: 15,
		// 备用 IP 定位源：主源失败或返回坐标明显跑偏时依次尝试（都必须支持 CORS 跨域）
		// 注意：ip-api.com 的 HTTPS 需付费、ipinfo.io 免费额度有限，故未启用
		ipApis: [
			"https://v2.xxapi.cn/api/ip",
			"https://whois.pconline.com.cn/ipJson.jsp?json=true"
		],

		// ===================== 数据来源：Open-Meteo =====================
		// 免注册、免 Key，只需经纬度。之前用和风时页面挂了 —— 那个凭据属于
		// 模板作者，他账号侧的安全限制会把我们的请求直接判 403，改代码绕不过去。
		// 数据采用 CC BY 4.0，页面底部保留来源署名，请勿删。
		openMeteoHost: "https://api.open-meteo.com",
		airQualityHost: "https://air-quality-api.open-meteo.com"
	};

	// ===================== 时间 / 日期 =====================
	function timePeriodText(hour) {
		if (hour < 5) {
			return "凌晨";
		}
		if (hour < 9) {
			return "早上";
		}
		if (hour < 12) {
			return "上午";
		}
		if (hour < 14) {
			return "中午";
		}
		if (hour < 18) {
			return "下午";
		}
		if (hour < 19) {
			return "傍晚";
		}
		return "晚上";
	}

	function dwEl(id) {
		return document.getElementById(id);
	}

	function updateLocalTime() {
		var timeElement = dwEl("dw-local-time-main");
		var secondsElement = dwEl("dw-local-time-seconds");
		var periodElement = dwEl("dw-time-period");
		var dateElement = dwEl("dw-local-date");

		if (!timeElement || !dateElement) {
			return;
		}

		var pad = function (value) {
			return String(value).padStart(2, "0");
		};
		var now = new Date();

		timeElement.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes());
		if (secondsElement) {
			secondsElement.textContent = ":" + pad(now.getSeconds());
		}
		if (periodElement) {
			periodElement.textContent = timePeriodText(now.getHours());
		}
		dateElement.textContent = now.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "long",
			day: "numeric",
			weekday: "long"
		});
	}

	// ===================== 天气现象映射（WMO weather_code）=====================
	// Open-Meteo 只回数字代码，不给本地化文字，中文文案和图标都在这张表里自建。
	var WmoWeather = {
		0: ["晴", "☀️"], 1: ["晴间多云", "⛅"], 2: ["多云", "⛅"], 3: ["阴", "☁️"],
		45: ["雾", "🌫️"], 48: ["冻雾", "🌫️"],
		51: ["毛毛雨", "🌦️"], 53: ["毛毛雨", "🌦️"], 55: ["毛毛雨", "🌧️"],
		56: ["冻毛毛雨", "🌧️"], 57: ["冻毛毛雨", "🌧️"],
		61: ["小雨", "🌦️"], 63: ["中雨", "🌧️"], 65: ["大雨", "🌧️"],
		66: ["冻雨", "🌧️"], 67: ["冻雨", "🌧️"],
		71: ["小雪", "🌨️"], 73: ["中雪", "🌨️"], 75: ["大雪", "❄️"], 77: ["雪粒", "🌨️"],
		80: ["阵雨", "🌦️"], 81: ["阵雨", "🌧️"], 82: ["强阵雨", "🌧️"],
		85: ["阵雪", "🌨️"], 86: ["阵雪", "❄️"],
		95: ["雷阵雨", "⛈️"], 96: ["雷暴伴冰雹", "⛈️"], 99: ["雷暴伴冰雹", "⛈️"]
	};

	function wmoEntry(code) {
		return WmoWeather[code] || null;
	}

	// 风级：Open-Meteo 给的是 km/h，蒲福等级自己按阈值换算
	function beaufortScale(kmh) {
		var limits = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
		for (var i = 0; i < limits.length; i++) {
			if (Number(kmh) < limits[i]) {
				return i;
			}
		}
		return 12;
	}

	function windDirection(degrees) {
		var directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
		return directions[Math.round(degrees / 45) % 8];
	}

	function formatWeatherTime(value) {
		return value ? value.slice(11, 16) : "--:--";
	}

	function formatAirValue(value, unit) {
		var num = Number(value);
		if (value == null || !Number.isFinite(num)) {
			return "暂无数据";
		}
		// Open-Meteo 的污染物一律 μg/m³，CO 也是（和风的 CO 是 mg/m³，量级差一千倍）
		var text = num >= 10 ? String(Math.round(num)) : num.toFixed(1);
		return text + " " + (unit || "μg/m³");
	}

	// US AQI 只有数值，等级文案按官方分段自己算
	function aqiCategory(aqi) {
		var n = Number(aqi);
		if (!Number.isFinite(n)) {
			return "";
		}
		if (n <= 50) return "优";
		if (n <= 100) return "良";
		if (n <= 150) return "轻度污染";
		if (n <= 200) return "中度污染";
		if (n <= 300) return "重度污染";
		return "严重污染";
	}

	function currentWeatherText(current) {
		var entry = wmoEntry(current && current.weather_code);
		return entry ? entry[0] : "天气未知";
	}

	function currentWeatherIcon(current) {
		var entry = wmoEntry(current && current.weather_code);
		return entry ? entry[1] : "🌡️";
	}

	// 记录最近一次成功解析出的取数点，供定时刷新复用
	var resolvedWeatherLocation = null;
	var lastWeatherFetchAt = 0;

	// 实况 + 今日预报一次请求就能拿全（daily 数组在同一响应里返回），无需鉴权。
	function forecastUrl(latitude, longitude) {
		return dwWeatherConfig.openMeteoHost + "/v1/forecast" +
			"?latitude=" + Number(latitude).toFixed(4) +
			"&longitude=" + Number(longitude).toFixed(4) +
			"&current=temperature_2m,apparent_temperature,relative_humidity_2m," +
			"precipitation,weather_code,cloud_cover,visibility,surface_pressure," +
			"wind_speed_10m,wind_direction_10m" +
			"&daily=weather_code,sunrise,sunset,precipitation_probability_max,uv_index_max" +
			"&timezone=auto&forecast_days=1";
	}

	function airQualityUrl(latitude, longitude) {
		return dwWeatherConfig.airQualityHost + "/v1/air-quality" +
			"?latitude=" + Number(latitude).toFixed(4) +
			"&longitude=" + Number(longitude).toFixed(4) +
			"&current=pm2_5,pm10,carbon_monoxide,ozone,nitrogen_dioxide," +
			"sulphur_dioxide,us_aqi&timezone=auto";
	}

	// 判断取到的值是不是可用数字。
	// 不能直接用 Number.isFinite(Number(v))：Number(null) 和 Number("") 都是 0，
	// 会把「字段缺失」误判成真实的 0，详情卡片就会显示 0% / 0 hPa 这种假数据。
	function isNum(value) {
		return value !== null && value !== undefined && value !== "" &&
			Number.isFinite(Number(value));
	}

	// 外部数据（attributions）拼进 innerHTML 前必须转义
	function escapeHtml(text) {
		return String(text).replace(/[&<>"']/g, function (ch) {
			return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch];
		});
	}

	// 带超时的 fetch：定位类接口偶尔会挂住不返回，没有超时页面会永远停在「正在定位...」
	// deadlineMs 是调用方给的剩余总时限，取它和 requestTimeoutMs 的较小值，
	// 保证整条回退链不会因为多个源逐个超时而越拖越久。
	function fetchWithTimeout(url, timeoutMs, deadlineMs) {
		var limit = timeoutMs || dwWeatherConfig.requestTimeoutMs;
		if (typeof deadlineMs === "number" && deadlineMs < limit) {
			limit = deadlineMs;
		}
		if (limit <= 0) {
			return Promise.reject(new Error("定位总时限已到，跳过：" + url));
		}

		var controller = new AbortController();
		var timer = window.setTimeout(function () {
			controller.abort();
		}, limit);

		return fetch(url, { signal: controller.signal }).then(function (response) {
			window.clearTimeout(timer);
			if (!response.ok) {
				throw new Error("请求失败 " + response.status + "：" + url);
			}
			return response;
		}, function (error) {
			window.clearTimeout(timer);
			throw error;
		});
	}

	// 两点间大圆距离（公里），用于判断浏览器定位有没有跑偏
	function haversineKm(lat1, lon1, lat2, lon2) {
		var toRad = function (deg) {
			return deg * Math.PI / 180;
		};
		var dLat = toRad(lat2 - lat1);
		var dLon = toRad(lon2 - lon1);
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	}

	function loadWeather(latitude, longitude, locationName) {
		var weatherElement = dwEl("dw-weather-info");
		var forecastElement = dwEl("dw-weather-forecast");
		var locationElement = dwEl("dw-weather-location");

		if (!weatherElement) {
			return;
		}

		resolvedWeatherLocation = {
			latitude: latitude,
			longitude: longitude,
			name: locationName
		};
		lastWeatherFetchAt = Date.now();

		var timeout = dwWeatherConfig.requestTimeoutMs;

		var forecastRequest = fetchWithTimeout(forecastUrl(latitude, longitude), timeout)
			.then(function (response) {
				return response.json();
			});

		// 空气质量是锦上添花，失败不该拖垮整个天气卡片
		var airRequest = fetchWithTimeout(airQualityUrl(latitude, longitude), timeout)
			.then(function (response) {
				return response.json();
			}).catch(function (error) {
				console.warn("空气质量获取失败，详情中显示暂无数据", error);
				return null;
			});

		Promise.all([forecastRequest, airRequest])
			.then(function (results) {
				var forecast = results[0];
				var air = results[1];
				var current = forecast && forecast.current;
				var daily = forecast && forecast.daily;

				// 气温是必填项：拿不到就当作整个请求失败，走兜底文案
				var temp = current && current.temperature_2m;
				if (!isNum(temp)) {
					throw new Error("Open-Meteo 未返回有效气温");
				}
				var text = currentWeatherText(current);
				var icon = currentWeatherIcon(current);

				if (locationElement && locationName) {
					locationElement.textContent = "⌖ " + locationName;
				}
				weatherElement.classList.remove("dw-muted");
				weatherElement.innerHTML =
					"<div class=\"dw-weather-main\"><span class=\"dw-weather-icon\">" +
					icon + "</span><strong>" +
					Math.round(Number(temp)) + "°</strong><span>" +
					escapeHtml(text) + "</span></div>";

				if (!forecastElement) {
					return;
				}

				// daily 是与 current 平行的数组，forecast_days=1 所以只有今天这一格
				var dailyFirst = function (key) {
					return daily && Array.isArray(daily[key]) ? daily[key][0] : null;
				};
				var prob = dailyFirst("precipitation_probability_max");
				var uvIndex = dailyFirst("uv_index_max");
				var sunrise = dailyFirst("sunrise");
				var sunset = dailyFirst("sunset");

				// Open-Meteo 的湿度、云量、降水概率已经是百分数，不像和风那样是 [0,1] 小数
				var humidity = current.relative_humidity_2m;
				var cloudCover = current.cloud_cover;
				var visibility = current.visibility;
				var feelsLike = current.apparent_temperature;
				var pressure = current.surface_pressure;
				var precipAmount = current.precipitation;
				var windDegree = current.wind_direction_10m;
				var windSpeed = current.wind_speed_10m;

				// 注意 Number(null) 是 0，所以必须先判空再转数字，否则缺字段会显示「北风 null级」
				var windText = (isNum(windDegree) && isNum(windSpeed))
					? windDirection(Number(windDegree)) + "风 " + beaufortScale(windSpeed) + "级"
					: "暂无数据";

				// 空气质量只显示 AQI 与等级，具体污染物浓度统一放下面的「污染物浓度」块
				var airNow = air && air.current;
				var airUnits = (air && air.current_units) || {};
				var aqi = airNow ? airNow.us_aqi : null;
				var airText = isNum(aqi)
					? "AQI " + Math.round(Number(aqi)) + " " + aqiCategory(aqi)
					: "暂无数据";

				// Open-Meteo 把单位放在和平行字段分开的 current_units 里
				var airVal = function (key) {
					return formatAirValue(airNow && airNow[key], airUnits[key]);
				};

				// Open-Meteo 按 CC BY 4.0 授权，要求标注数据来源，这段署名别删
				var sourceNote = "<div class=\"dw-source-note\">🌤️ 数据来源：" +
					"<a href=\"https://open-meteo.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Open-Meteo</a>" +
					"（<a href=\"https://creativecommons.org/licenses/by/4.0/\" target=\"_blank\" rel=\"noopener noreferrer\">CC BY 4.0</a>）</div>";

				forecastElement.innerHTML =
					"<div class=\"dw-detail-heading\">今日天气详情" +
					"<span>" + escapeHtml(text) + " " + icon + "</span></div>" +
					"<div class=\"dw-detail-grid\">" +
					"<div class=\"dw-detail-card\"><i>🌬️</i><span><em>风力</em><b>" + windText + "</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>👁️</i><span><em>能见度</em><b>" +
					(isNum(visibility) ? (Number(visibility) / 1000).toFixed(1) + " km" : "暂无数据") +
					"</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>🌡️</i><span><em>体感温度</em><b>" +
					(isNum(feelsLike) ? Math.round(Number(feelsLike)) + "°" : "暂无数据") +
					"</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>💧</i><span><em>湿度</em><b>" +
					(isNum(humidity) ? Math.round(Number(humidity)) + "%" : "暂无数据") +
					"</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>⏱️</i><span><em>气压</em><b>" +
					(isNum(pressure) ? Math.round(Number(pressure)) + " hPa" : "暂无数据") +
					"</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>🍃</i><span><em>空气质量</em><b>" + airText + "</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>☁️</i><span><em>云量</em><b>" +
					(isNum(cloudCover) ? Math.round(Number(cloudCover)) + "%" : "暂无数据") +
					"</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>☀️</i><span><em>紫外线</em><b>" +
					(isNum(uvIndex) ? Number(uvIndex).toFixed(1) : "暂无数据") +
					"</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>🌧️</i><span><em>降水量</em><b>" +
					(isNum(precipAmount) ? Number(precipAmount).toFixed(1) + " mm" : "暂无数据") +
					"</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>☔</i><span><em>降水概率</em><b>" +
					(isNum(prob) ? Math.round(Number(prob)) + "%" : "暂无数据") + "</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>🌅</i><span><em>日出</em><b>" + formatWeatherTime(sunrise) + "</b></span></div>" +
					"<div class=\"dw-detail-card\"><i>🌇</i><span><em>日落</em><b>" + formatWeatherTime(sunset) + "</b></span></div>" +
					"</div>" +
					"<div class=\"dw-air-title\">污染物浓度</div>" +
					"<div class=\"dw-pollutant-grid\">" +
					"<span><i>PM2.5</i><b>" + airVal("pm2_5") + "</b></span>" +
					"<span><i>PM10</i><b>" + airVal("pm10") + "</b></span>" +
					"<span><i>O₃</i><b>" + airVal("ozone") + "</b></span>" +
					"<span><i>NO₂</i><b>" + airVal("nitrogen_dioxide") + "</b></span>" +
					"<span><i>SO₂</i><b>" + airVal("sulphur_dioxide") + "</b></span>" +
					"<span><i>CO</i><b>" + airVal("carbon_monoxide") + "</b></span>" +
					"</div>" +
					sourceNote;
			})
			.catch(function (error) {
				console.error(error);
				showWeatherUnavailable();
			});
	}

	// 兜底城市：所有定位手段都失败（或 fixed 模式）时使用
	function loadFallbackWeatherLocation() {
		loadWeather(dwWeatherConfig.fallbackLatitude,
			dwWeatherConfig.fallbackLongitude,
			dwWeatherConfig.fallbackCity);
	}

	function showWeatherUnavailable() {
		var weatherElement = dwEl("dw-weather-info");
		if (weatherElement) {
			weatherElement.textContent = "天气暂时无法获取";
			weatherElement.classList.add("dw-muted");
		}
	}

	// 把 IP 库的地址串统一成「省市区」：
	//   「中国河北省保定市涞源县」→「河北省保定市涞源县」
	//   「河北省保定市 联通」      →「河北省保定市」（pconline 会把 ISP 拼在后面）
	function pickCityName(address) {
		var name = String(address || "").replace(/^中国/, "").trim();
		name = name.split(/\s+/)[0];
		return name.replace(/(联通|移动|电信|铁通|广电|教育网|鹏博士)$/, "");
	}

	// 各 IP 定位源返回结构不同，统一归一化成 { latitude, longitude, name }
	// 返回 null 表示该源不可用，继续尝试下一个源
	function parseIpLocation(sourceIndex, data) {
		if (!data) {
			return null;
		}

		// 源 0：v2.xxapi.cn
		if (sourceIndex === 0) {
			var loc = data.data;
			var lat = loc && Number(loc.lat);
			var lng = loc && Number(loc.lng);
			if (data.code !== 200 || !loc ||
				!Number.isFinite(lat) || !Number.isFinite(lng)) {
				return null;
			}
			return { latitude: lat, longitude: lng, name: pickCityName(loc.address) };
		}

		// 源 1：whois.pconline.com.cn（GBK 返回，靠 fetch 的 charset 自动解码）
		if (sourceIndex === 1) {
			var lat2 = Number(data.lat);
			var lng2 = Number(data.lng);
			if (!Number.isFinite(lat2) || !Number.isFinite(lng2)) {
				return null;
			}
			var name = pickCityName(data.addr) ||
				[data.pro, data.city].filter(Boolean).join("");
			return { latitude: lat2, longitude: lng2, name: name };
		}

		return null;
	}

	// 依次尝试各个 IP 定位源；成功一个就立刻用，全部失败才回退兜底城市。
	// 整条链共享 locationDeadlineMs 总时限，防止逐个超时把等待时间越拖越长。
	function loadLocalWeather() {
		var apis = dwWeatherConfig.ipApis || [];
		var deadline = Date.now() + dwWeatherConfig.locationDeadlineMs;
		var index = 0;

		function tryNext() {
			var remaining = deadline - Date.now();
			if (index >= apis.length || remaining <= 0) {
				console.warn("IP 定位源均不可用，回退到兜底城市");
				loadFallbackWeatherLocation();
				return;
			}

			var current = index++;
			fetchWithTimeout(apis[current], remaining, remaining)
				.then(function (response) {
					return response.json();
				})
				.then(function (data) {
					var result = parseIpLocation(current, data);
					if (!result) {
						throw new Error("IP 定位源返回内容无效：" + apis[current]);
					}
					loadWeather(result.latitude, result.longitude,
						result.name || "当前位置");
				})
				.catch(function (error) {
					console.warn(error);
					tryNext();
				});
		}

		tryNext();
	}

	function loadBrowserWeather() {
		if (!navigator.geolocation) {
			loadLocalWeather();
			return;
		}

		navigator.geolocation.getCurrentPosition(function (position) {
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;

			// 电脑端的「GPS」其实是 WiFi 定位库，经常偏到隔壁市，用距离做一次兜底校验
			var drift = haversineKm(latitude, longitude,
				dwWeatherConfig.fallbackLatitude, dwWeatherConfig.fallbackLongitude);
			if (Number.isFinite(drift) && drift > dwWeatherConfig.maxAutoDistanceKm) {
				console.warn("浏览器定位偏离兜底城市 " + Math.round(drift) + " km，已忽略");
				loadLocalWeather();
				return;
			}

			// 地名仅用于显示；取数始终用定位坐标本身，不做地名反查
			loadWeather(latitude, longitude, dwWeatherConfig.fallbackCity);
		}, function () {
			loadLocalWeather();
		}, {
			enableHighAccuracy: true,
			timeout: 12000,
			maximumAge: 300000
		});
	}

	// 按配置选择定位方式：auto（默认，定位访客所在地）/ fixed（永远用兜底坐标）
	function initWeather() {
		if (dwWeatherConfig.locationMode === "fixed") {
			loadFallbackWeatherLocation();
			return;
		}

		loadBrowserWeather();
	}

	// 定时刷新，避免页面挂久了显示的还是几小时前的数据
	function refreshWeather() {
		if (!resolvedWeatherLocation) {
			return;
		}

		loadWeather(resolvedWeatherLocation.latitude,
			resolvedWeatherLocation.longitude,
			resolvedWeatherLocation.name);
	}

	function isWeatherStale() {
		return Date.now() - lastWeatherFetchAt >=
			dwWeatherConfig.refreshIntervalMinutes * 60 * 1000;
	}

	// ===================== 天气详情折叠开关 =====================
	function initWeatherToggle() {
		var weatherToggle = dwEl("dw-weather-toggle");
		var weatherForecast = dwEl("dw-weather-forecast");
		if (!weatherToggle || !weatherForecast) {
			return;
		}

		weatherForecast.removeAttribute("hidden");
		weatherForecast.classList.add("dw-collapsed");
		weatherToggle.setAttribute("aria-expanded", "false");
		weatherToggle.addEventListener("click", function () {
			var expanded = weatherToggle.getAttribute("aria-expanded") === "true";
			weatherToggle.setAttribute("aria-expanded", String(!expanded));
			weatherForecast.classList.toggle("dw-collapsed", expanded);
		});
	}

	// ===================== 启动 =====================
	function initDashboard() {
		initWeatherToggle();
		updateLocalTime();
		window.setInterval(updateLocalTime, 1000);
		initWeather();

		// 每分钟检查一次是否已过期（阈值 = refreshIntervalMinutes），
		// 与原实现一致：切回前台时若数据过期也会立刻刷新
		window.setInterval(function () {
			if (document.visibilityState === "visible" && isWeatherStale()) {
				refreshWeather();
			}
		}, 60 * 1000);

		// 切回前台时若数据已过期，立刻刷新
		document.addEventListener("visibilitychange", function () {
			if (document.visibilityState === "visible" && isWeatherStale()) {
				refreshWeather();
			}
		});

		// 双保险：定位链若因异常卡死，超过「定位总时限 + 单请求超时」仍未取到数据，
		// 直接落到兜底城市，绝不让卡片停在「正在定位...」。
		window.setTimeout(function () {
			if (!resolvedWeatherLocation) {
				console.warn("定位链超时未返回，使用兜底城市");
				loadFallbackWeatherLocation();
			}
		}, dwWeatherConfig.locationDeadlineMs + dwWeatherConfig.requestTimeoutMs + 1000);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initDashboard);
	} else {
		initDashboard();
	}
})();
