(function () {
	"use strict";

	/* --------------------------- 主题设置 --------------------------- */
	function getCookie(name) {
		var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
		return match ? decodeURIComponent(match[2]) : null;
	}

	function setCookie(name, value, days) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
	}

	var html = document.documentElement;
	var themeState = getCookie("themeState") || "Light";
	var snake = document.getElementById("tanChiShe");
	var themeSwitch = document.getElementById("myonoffswitch");
	var settingsToggle = document.querySelector(".theme-settings-toggle");
	var settingsPanel = document.getElementById("theme-settings-panel");
	var backgroundOpacity = document.getElementById("background-opacity");
	var backgroundBlur = document.getElementById("background-blur");
	var cardOpacity = document.getElementById("card-opacity");
	var cardBlur = document.getElementById("card-blur");
	var cardColor = document.getElementById("card-color");

	var themeDefaults = {
		Light: {
			backgroundOpacity: "0.2",
			backgroundBlur: "10",
			cardOpacity: "0.62",
			cardBlur: "12",
			cardColor: "#eff6fc"
		},
		Dark: {
			backgroundOpacity: "0.38",
			backgroundBlur: "12",
			cardOpacity: "0.78",
			cardBlur: "18",
			cardColor: "#181e2a"
		}
	};

	function getThemeDefaults() {
		return themeDefaults[themeState] || themeDefaults.Light;
	}

	function currentCardColor() {
		var colorKey = themeState === "Dark" ? "cardColorDark" : "cardColorLight";
		return window.localStorage.getItem(colorKey) || getThemeDefaults().cardColor;
	}

	function updateThemeVariables() {
		if (!cardColor) {
			return;
		}
		var colorParts = cardColor.value.replace("#", "").match(/.{2}/g);
		if (!colorParts) {
			return;
		}
		colorParts = colorParts.map(function (part) {
			return parseInt(part, 16);
		});
		if (backgroundOpacity) {
			html.style.setProperty("--background-opacity", backgroundOpacity.value);
			window.localStorage.setItem("backgroundOpacity", backgroundOpacity.value);
		}
		if (backgroundBlur) {
			html.style.setProperty("--back_filter", backgroundBlur.value + "px");
			window.localStorage.setItem("backgroundBlur", backgroundBlur.value);
		}
		if (cardOpacity) {
			html.style.setProperty("--card-opacity", cardOpacity.value);
			window.localStorage.setItem("cardOpacity", cardOpacity.value);
		}
		if (cardBlur) {
			html.style.setProperty("--card_filter", cardBlur.value + "px");
			window.localStorage.setItem("cardBlur", cardBlur.value);
		}
		html.style.setProperty("--card-base-rgb", colorParts.join(", "));
	}

	function applyTheme(theme, persist) {
		themeState = theme;
		html.dataset.theme = theme;
		if (persist) {
			setCookie("themeState", theme, 365);
		}
		if (themeSwitch) {
			themeSwitch.checked = theme !== "Dark";
		}
		if (snake) {
			snake.src = theme === "Dark"
				? "https://raw.githubusercontent.com/paeardog/paeardog.github.io/output/github-snake-dark.svg"
				: "https://raw.githubusercontent.com/paeardog/paeardog.github.io/output/github-snake.svg";
		}
		if (cardColor) {
			cardColor.value = currentCardColor();
		}
		updateThemeVariables();
	}

	if (themeSwitch) {
		themeSwitch.addEventListener("change", function () {
			applyTheme(themeState === "Dark" ? "Light" : "Dark", true);
		});
	}

	if (settingsToggle && settingsPanel) {
		settingsToggle.addEventListener("click", function () {
			var expanded = settingsToggle.getAttribute("aria-expanded") === "true";
			settingsToggle.setAttribute("aria-expanded", String(!expanded));
			settingsPanel.hidden = expanded;
		});
		document.addEventListener("click", function (event) {
			if (!settingsPanel.contains(event.target) && !settingsToggle.contains(event.target)) {
				settingsToggle.setAttribute("aria-expanded", "false");
				settingsPanel.hidden = true;
			}
		});
	}

	var defaults = getThemeDefaults();
	var savedBackgroundOpacity = window.localStorage.getItem("backgroundOpacity");
	var savedBackgroundBlur = window.localStorage.getItem("backgroundBlur");
	var savedCardOpacity = window.localStorage.getItem("cardOpacity");
	var savedCardBlur = window.localStorage.getItem("cardBlur");
	if (backgroundOpacity) {
		backgroundOpacity.value = savedBackgroundOpacity !== null ? savedBackgroundOpacity : defaults.backgroundOpacity;
		backgroundOpacity.addEventListener("input", updateThemeVariables);
	}
	if (backgroundBlur) {
		backgroundBlur.value = savedBackgroundBlur !== null ? savedBackgroundBlur : defaults.backgroundBlur;
		backgroundBlur.addEventListener("input", updateThemeVariables);
	}
	if (cardOpacity) {
		cardOpacity.value = savedCardOpacity !== null ? savedCardOpacity : defaults.cardOpacity;
		cardOpacity.addEventListener("input", updateThemeVariables);
	}
	if (cardBlur) {
		cardBlur.value = savedCardBlur !== null ? savedCardBlur : defaults.cardBlur;
		cardBlur.addEventListener("input", updateThemeVariables);
	}
	if (cardColor) {
		cardColor.value = currentCardColor();
		cardColor.addEventListener("input", function () {
			window.localStorage.setItem(themeState === "Dark" ? "cardColorDark" : "cardColorLight", cardColor.value);
			updateThemeVariables();
		});
	}

	applyTheme(themeState, false);

	/* --------------------------- 加载动画 --------------------------- */
	var pageLoading = document.querySelector("#zyyo-loading");
	if (pageLoading) {
		var loaderShownAt = Date.now();
		var loaderHidden = false;

		var hidePageLoader = function (event) {
			if (loaderHidden) {
				return;
			}
			loaderHidden = true;
			var wait = Math.max(0, 500 - (Date.now() - loaderShownAt));
			window.setTimeout(function () {
				pageLoading.classList.add("is-done");
				var removeLoader = function (transitionEvent) {
					if (transitionEvent && transitionEvent.target !== pageLoading) {
						return;
					}
					pageLoading.style.display = "none";
				};
				pageLoading.addEventListener("transitionend", removeLoader);
				window.setTimeout(removeLoader, 700);
			}, wait);
		};

		hidePageLoader();
		window.addEventListener("load", hidePageLoader);
		window.setTimeout(hidePageLoader, 4000);
	}

	/* --------------------------- 站点运行时长 --------------------------- */
	var siteStartTime = new Date("2026-11-08T00:00:00+08:00");
	var runtimeElement = document.getElementById("site-runtime");

	function updateSiteRuntime() {
		if (!runtimeElement) {
			return;
		}
		var elapsed = Date.now() - siteStartTime.getTime();
		if (elapsed < 0) {
			elapsed = 0;
		}
		var days = Math.floor(elapsed / 86400000);
		var hours = String(Math.floor(elapsed / 3600000) % 24).padStart(2, "0");
		var minutes = String(Math.floor(elapsed / 60000) % 60).padStart(2, "0");
		var seconds = String(Math.floor(elapsed / 1000) % 60).padStart(2, "0");
		runtimeElement.textContent = days + " 天 " + hours + " 时 " + minutes + " 分 " + seconds + " 秒";
	}

	updateSiteRuntime();
	window.setInterval(updateSiteRuntime, 1000);

	/* --------------------------- 双击资料卡进入终端 --------------------------- */
	var heroCard = document.getElementById("clear");
	if (heroCard) {
		var terminalState = "a";
		var avatar = document.getElementById("avatar");
		var persontag = document.getElementById("persontag");
		var terminal = document.getElementById("terminal");

		if (avatar && persontag && terminal) {
			heroCard.addEventListener("dblclick", function () {
				if (terminalState === "a") {
					avatar.className = "dap";
					persontag.className = "dap";
					window.setTimeout(function () {
						avatar.style.display = "none";
						persontag.style.display = "none";
						terminal.style.display = "block";
						terminal.className = "ap";
						terminalState = "t";
					}, 300);
				} else {
					terminal.className = "dap";
					window.setTimeout(function () {
						terminal.style.display = "none";
						avatar.style.display = "block";
						persontag.style.display = "block";
						avatar.className = "ap";
						persontag.className = "ap";
						terminalState = "a";
					}, 300);
				}
			});
		}
	}

	/* --------------------------- 顶部气泡提示 --------------------------- */
	var popup = document.querySelector(".popup");
	var popupText = document.getElementById("popupText");
	if (popup && popupText) {
		var popupTexts = [
			"欢迎来到 eardog 的小窝",
			"双击资料卡可进入或退出终端模式",
			"右上角可以切换明暗主题",
			"淡淡的就会顺顺的"
		];
		var popupIndex = 0;

		function updatePopupText() {
			popupText.textContent = popupTexts[popupIndex];
			popupIndex = (popupIndex + 1) % popupTexts.length;
		}

		updatePopupText();
		window.setInterval(function () {
			popup.style.top = "20px";
			window.setTimeout(function () {
				popup.style.top = "-120px";
				updatePopupText();
			}, 3000);
		}, 4000);
	}

	/* --------------------------- 向下滑动提示 --------------------------- */
	var scrollDown = document.querySelector(".scroll-down");
	if (scrollDown) {
		var handleScrollHint = function () {
			if (window.innerWidth > 768) {
				scrollDown.style.display = "none";
				return;
			}
			var atBottom = window.pageYOffset + window.innerHeight >=
				document.documentElement.scrollHeight - 4;
			scrollDown.style.display = atBottom ? "none" : "block";
		};
		scrollDown.addEventListener("click", function () {
			window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
		});
		window.addEventListener("scroll", handleScrollHint);
		window.addEventListener("resize", handleScrollHint);
		handleScrollHint();
	}

	/* --------------------------- 复制联系方式 --------------------------- */
	function copyContact(text, element) {
		var label = element ? element.querySelector("span") : null;
		var original = label ? label.textContent : "";

		function finish(ok) {
			if (!label) {
				return;
			}
			label.textContent = ok ? "已复制" : "复制失败";
			window.setTimeout(function () {
				label.textContent = original;
			}, 1500);
		}

		function fallback() {
			var input = document.createElement("textarea");
			input.value = text;
			input.style.position = "fixed";
			input.style.opacity = "0";
			document.body.appendChild(input);
			input.select();
			var ok = false;
			try {
				ok = document.execCommand("copy");
			} catch (error) {
				ok = false;
			}
			document.body.removeChild(input);
			finish(ok);
		}

		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text).then(function () {
				finish(true);
			}, fallback);
		} else {
			fallback();
		}
	}
	window.copyContact = copyContact;

	if (window.innerWidth > 720 && typeof window.jQuery !== "undefined" &&
		typeof window.NodeCursor === "function") {
		window.jQuery(function () {
			window.NodeCursor({
				cursor: true,
				node: true,
				cursor_velocity: 1,
				node_velocity: 0.15,
				native_cursor: "none",
				element_to_hover: "a",
				cursor_class_hover: "expand",
				node_class_hover: "expand",
				hide_mode: true,
				hide_timing: 2000
			});
			html.classList.add("has-custom-cursor");
		});
	}
})();
