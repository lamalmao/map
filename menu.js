"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var MenuMap = /** @class */ (function () {
    function MenuMap(center, mapObjectId, zoom) {
        this.yandexMapInstance = null;
        this._flags = [];
        this._center = center;
        this._zoom = zoom ? zoom : 15;
        this.initialZoom = this._zoom;
        this._mapHTMLObjectId = mapObjectId;
        this.yandexMapInstance = new ymaps.Map(this._mapHTMLObjectId, {
            center: this._center,
            zoom: this._zoom,
            controls: [],
        });
    }
    MenuMap.prototype.setZoom = function (zoom) {
        var _a;
        this._zoom = zoom;
        (_a = this.yandexMapInstance) === null || _a === void 0 ? void 0 : _a.setZoom(zoom);
    };
    MenuMap.prototype.setCenter = function (center) {
        var _a;
        (_a = this.yandexMapInstance) === null || _a === void 0 ? void 0 : _a.setCenter(center);
    };
    MenuMap.prototype.setFlags = function (flags) {
        this._flags = flags;
        this.redraw();
    };
    MenuMap.prototype.reset = function (center) {
        this.redraw(this.initialZoom, center ? center : undefined);
    };
    MenuMap.prototype.redraw = function (zoom, center) {
        var e_1, _a;
        if (this.yandexMapInstance) {
            this.yandexMapInstance.geoObjects.removeAll();
            var newCenter = center ? center : this._center;
            this.yandexMapInstance.setCenter(newCenter);
            try {
                for (var _b = __values(this._flags), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var flag = _c.value;
                    var geoItem = flag.getPlaceMark();
                    this.yandexMapInstance.geoObjects.add(geoItem);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (!zoom)
                this.yandexMapInstance.setZoom(this._zoom);
            else
                this.yandexMapInstance.setZoom(zoom);
        }
        else
            throw new Error("No map found");
    };
    return MenuMap;
}());
var Flag = /** @class */ (function () {
    function Flag(color, coords, text, menu, point) {
        this.color = color;
        this.coords = coords;
        this.text = text;
        this._point = point;
        this._menu = menu;
    }
    Flag.prototype.getPlaceMark = function () {
        var geoMark = new ymaps.GeoObject({
            geometry: {
                type: "Point",
                coordinates: this.coords,
            },
            properties: {
                iconContent: this.text,
            },
        }, {
            preset: this.color,
            draggable: false,
        });
        var instance = this;
        geoMark.events.add(["click"], function (_) {
            instance._menu.moveTo(instance.coords);
            instance._menu.showWindow(instance._point);
        });
        return geoMark;
    };
    return Flag;
}());
var Menu = /** @class */ (function () {
    function Menu(categoriesMenuElementId, itemsMenuElementId, map, informationWindow, categories, enableBackButton) {
        this.backButton = true;
        this._pointer = 0;
        var categoriesMenuElement = document.getElementById(categoriesMenuElementId);
        var itemsMenuElement = document.getElementById(itemsMenuElementId);
        if (!(categoriesMenuElement && itemsMenuElement))
            throw new Error("Please provide menu elements.");
        if (!Menu.checkMenuElement(categoriesMenuElement))
            throw new Error("Categories element must be <ul> or <ol>.");
        if (!Menu.checkMenuElement(itemsMenuElement))
            throw new Error("Items element must be <ul> or <ol>.");
        this._map = map;
        this._categoriesMenuElement = categoriesMenuElement;
        this._itemsMenuElement = itemsMenuElement;
        this._categories = categories ? categories : [];
        this._informationWindow = informationWindow;
        this.backButton =
            typeof enableBackButton === "undefined" ? true : enableBackButton;
        var initFlags = this.genFlagsByCursor();
        if (initFlags)
            this._map.setFlags(initFlags);
    }
    Object.defineProperty(Menu.prototype, "cursor", {
        set: function (position) {
            if (position < 0 || position >= this._categories.length)
                throw new Error("Pointer out of range");
            this._pointer = position;
            this.drawItemsMenu();
            var newFlags = this.genFlagsByCursor();
            if (newFlags)
                this._map.setFlags(newFlags);
        },
        enumerable: false,
        configurable: true
    });
    Menu.checkMenuElement = function (element) {
        if (!element)
            return false;
        else
            return (element instanceof HTMLOListElement ||
                element instanceof HTMLUListElement);
    };
    Menu.createButton = function (text, className, callback) {
        var e = document.createElement("li");
        e.innerText = text;
        e.setAttribute("class", className);
        e.onclick = callback;
        return e;
    };
    Menu.prototype.genFlagsByCursor = function () {
        var e_2, _a;
        if (this._categories.length > 0) {
            var flags = [];
            try {
                for (var _b = __values(this._categories[this._pointer].points), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var item = _c.value;
                    flags.push(new Flag(item.iconColor, item.location.location, item.shortName, this, item));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return flags;
        }
        else
            return null;
    };
    Menu.prototype.close = function () {
        this._informationWindow.visible = false;
        var center = this._categories[this._pointer].center;
        this._map.reset(center ? center : undefined);
    };
    Menu.prototype.moveTo = function (coords) {
        this._map.setCenter(coords);
        this._map.setZoom(this._map.initialZoom + 2);
    };
    Menu.prototype.drawItemsMenu = function () {
        var e_3, _a;
        this._itemsMenuElement.innerHTML = "";
        var instance = this;
        var classStyle = "menu-point-item";
        var currentCategory = this._categories[this._pointer];
        var _loop_1 = function (item) {
            if (!item.showInMenu)
                return "continue";
            var menuItem = Menu.createButton(item.shortName.toLocaleUpperCase(), classStyle, function () {
                instance._informationWindow.point = item;
                instance._informationWindow.visible = true;
                instance.moveTo(item.location.location);
            });
            this_1._itemsMenuElement.appendChild(menuItem);
        };
        var this_1 = this;
        try {
            for (var _b = __values(currentCategory.points), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                _loop_1(item);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (this.backButton) {
            var backButton = Menu.createButton("НАЗАД", classStyle, function () {
                instance.close();
            });
            backButton.setAttribute("style", "text-align: center; padding: 0; font-size: 1.3em");
            this._itemsMenuElement.appendChild(backButton);
        }
    };
    Menu.prototype.drawCategoriesMenu = function () {
        if (this._categories.length === 0)
            return;
        var instance = this;
        var _loop_2 = function (categoryIndex) {
            var category = this_2._categories[categoryIndex];
            var categoryListItem = Menu.createButton(category.name.toLocaleUpperCase(), "menu-category-item", function () {
                instance._informationWindow.visible = false;
                instance.cursor = categoryIndex;
                instance._map.reset(category.center ? category.center : undefined);
            });
            this_2._categoriesMenuElement.appendChild(categoryListItem);
        };
        var this_2 = this;
        for (var categoryIndex = 0; categoryIndex < this._categories.length; categoryIndex++) {
            _loop_2(categoryIndex);
        }
    };
    Menu.prototype.showWindow = function (item) {
        this._informationWindow.point = item;
        this._informationWindow.visible = true;
    };
    return Menu;
}());
var PointLocation = /** @class */ (function () {
    function PointLocation(lon, alt, address) {
        this._longtitude = lon;
        this._altitude = alt;
        this.address = address;
    }
    Object.defineProperty(PointLocation.prototype, "location", {
        get: function () {
            return [this._longtitude, this._altitude];
        },
        enumerable: false,
        configurable: true
    });
    return PointLocation;
}());
var Link = /** @class */ (function () {
    function Link(link, name) {
        if (typeof link === "string") {
            this.url = new URL(link);
        }
        else {
            this.url = link;
        }
        this.name = name ? name : null;
    }
    Link.prototype.createLinkElement = function () {
        var result = document.createElement("a");
        var href = this.url.toString();
        result.innerHTML = this.name ? this.name : href;
        result.setAttribute("href", href);
        return result;
    };
    return Link;
}());
var Color = /** @class */ (function () {
    function Color(r, g, b, opacity) {
        this._red = r >= 0 && r <= 255 ? r : 0;
        this._green = g >= 0 && g <= 255 ? g : 0;
        this._blue = b >= 0 && b <= 255 ? b : 0;
        if (opacity) {
            this._opacity = opacity >= 0 && opacity <= 1 ? opacity : 1;
        }
        else
            this._opacity = 1;
    }
    Color.prototype.getAsRGB = function () {
        return ("rgba(" +
            [this._red, this._green, this._blue, this._opacity].join(",") +
            ")");
    };
    Color.prototype.getAsHex = function () {
        return ("#" +
            Color.componentToHex(this._red) +
            Color.componentToHex(this._green) +
            Color.componentToHex(this._blue));
    };
    Color.componentToHex = function (colorComponent) {
        var hex = colorComponent.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    Color.createColorFromHex = function (hex) {
        var colorComponents = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (colorComponents) {
            return new Color(parseInt(colorComponents[1], 16), parseInt(colorComponents[2], 16), parseInt(colorComponents[3], 16));
        }
        else {
            return new Color(0, 0, 0);
        }
    };
    return Color;
}());
var Point = /** @class */ (function () {
    function Point(name, shortName, location, links, paragraphs, color, iconColor, showInMenu) {
        if (showInMenu === void 0) { showInMenu = true; }
        this.name = name;
        this.shortName = shortName;
        this.location = location;
        this.links = links ? links : [];
        this.paragraphs = paragraphs ? paragraphs : [];
        this.iconColor = iconColor;
        this.showInMenu = showInMenu;
        if (!color) {
            this._color = new Color(0, 0, 0);
        }
        else if (Array.isArray(color)) {
            this._color = new Color(color[0], color[1], color[2]);
        }
        else if (typeof color === "string") {
            this._color = Color.createColorFromHex(color);
        }
        else if (color instanceof Color) {
            this._color = color;
        }
        else
            this._color = new Color(0, 0, 0);
    }
    Object.defineProperty(Point.prototype, "color", {
        get: function () {
            return this._color.getAsRGB();
        },
        enumerable: false,
        configurable: true
    });
    Point.IconsColors = {
        blue: "islands#blueStretchyIcon",
        red: "islands#redStretchyIcon",
        darkOrange: "islands#darkOrangeStretchyIcon",
        night: "islands#nightStretchyIcon",
        darkBlue: "islands#darkBlueStretchyIcon",
        pink: "islands#pinkStretchyIcon",
        gray: "islands#grayStretchyIcon",
        brown: "islands#brownStretchyIcon",
        darkGreen: "islands#darkGreenStretchyIcon",
        violet: "islands#violetStretchyIcon",
        black: "islands#blackStretchyIcon",
        yellow: "islands#yellowStretchyIcon",
        green: "islands#greenStretchyIcon",
        orange: "islands#orangeStretchyIcon",
        lightBlue: "islands#lightBlueStretchyIcon",
        olive: "islands#oliveStretchyIcon",
    };
    return Point;
}());
var Category = /** @class */ (function () {
    function Category(name, points, center) {
        this.name = name;
        this.points = points;
        this.center = center ? center : null;
    }
    Category.prototype.addPoint = function (point) {
        var e_4, _a;
        try {
            for (var _b = __values(this.points), _c = _b.next(); !_c.done; _c = _b.next()) {
                var existingPoint = _c.value;
                if (existingPoint.shortName === point.shortName)
                    throw new Error("This point already exists.");
                return;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.points.push(point);
    };
    Category.prototype.getPoint = function (name) {
        var e_5, _a;
        var result = null;
        try {
            for (var _b = __values(this.points), _c = _b.next(); !_c.done; _c = _b.next()) {
                var existingPoint = _c.value;
                if (existingPoint.shortName === name) {
                    result = existingPoint;
                    break;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return result;
    };
    return Category;
}());
var InformationWindow = /** @class */ (function () {
    function InformationWindow(blockId, buttonId) {
        this._visible = false;
        this._point = null;
        var block = document.getElementById(blockId);
        var button = document.getElementById(buttonId);
        if (block && button) {
            block.setAttribute("style", "display: none");
            this._DOMElement = block;
            var contentBlock = document.createElement("div");
            contentBlock.setAttribute("id", "article-content-block");
            this._DOMElement.appendChild(contentBlock);
            this._contentBlock = contentBlock;
            var instance_1 = this;
            button.onclick = function () {
                instance_1.close();
            };
            this._closeButtonElement = button;
        }
        else
            throw new Error("One of provided elements is not exist's.");
    }
    Object.defineProperty(InformationWindow.prototype, "visible", {
        set: function (value) {
            this._visible = value;
            var newDisplay = "display: ".concat(value ? "block" : "none");
            if (this._point) {
                newDisplay += "; background-color: ".concat(this._point.color);
            }
            this._DOMElement.setAttribute("style", newDisplay);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InformationWindow.prototype, "point", {
        set: function (point) {
            var needToRedraw = this._point !== point;
            this._point = point;
            if (needToRedraw)
                this.redraw();
        },
        enumerable: false,
        configurable: true
    });
    InformationWindow.prototype.close = function () {
        this.visible = false;
    };
    InformationWindow.prototype.redraw = function (show) {
        var e_6, _a, e_7, _b;
        if (!this._point)
            throw new Error("Point to draw not set.");
        this._contentBlock.innerHTML = "";
        var header = document.createElement("h1");
        header.innerText = this._point.name;
        this._contentBlock.appendChild(header);
        try {
            for (var _c = __values(this._point.paragraphs), _d = _c.next(); !_d.done; _d = _c.next()) {
                var articleText = _d.value;
                var article = document.createElement("p");
                article.innerHTML = articleText;
                article.setAttribute("class", "article-text");
                this._contentBlock.appendChild(article);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
        var list = document.createElement("ul");
        try {
            for (var _e = __values(this._point.links), _f = _e.next(); !_f.done; _f = _e.next()) {
                var link = _f.value;
                var linkElement = link.createLinkElement();
                linkElement.setAttribute("class", "article-link");
                var itemList = document.createElement("li");
                itemList.appendChild(linkElement);
                list.appendChild(itemList);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_7) throw e_7.error; }
        }
        this._contentBlock.appendChild(list);
        var addressDataElement = document.createElement("p");
        addressDataElement.setAttribute("class", "article-address");
        addressDataElement.innerHTML = this._point.location.address;
        this._contentBlock.appendChild(addressDataElement);
        if (show)
            this.visible = true;
    };
    return InformationWindow;
}());
ymaps.ready(function () {
    var map = new MenuMap([47.228588, 39.73678], "map");
    var menu = new Menu("categoriesMenu", "itemsMenu", map, new InformationWindow("location-about", "about-close"), tours, true);
    menu.drawCategoriesMenu();
    menu.drawItemsMenu();
});
var tours = [
    new Category("Культурологический тур", [
        new Point("Государственное бюджетное учреждение культуры Ростовской области «Донская государственная публичная библиотека»", "Публичная библиотека", new PointLocation(47.22866283578775, 39.726360998451206, "г. Ростов-на-Дону, ул. Пушкинская, 175А"), [
            new Link("http://www.dspl.ru/", "Сайт"),
            new Link("https://kg-rostov.ru/premiere/24-noyabrya-otrytie-vystavki-estamp-v-publichnoy-biblioteke/", 'КтоГлавный - Выставка "Эстамп"'),
            new Link("https://rostovnadonu.bezformata.com/listnews/vistavka-muzeyniy-landshaft-germanii/111958687/?ysclid=lb9mdyrbas744461917", "БезФормата - Выставка «Музейный ландшафт Германии» "),
            new Link("https://kg-rostov.ru/news/v-vystavochnom-prostranstve-publichnoy-biblioteki-otkroetsya-vystavka-geometriya-prostranstva-vi-/?ysclid=lb9mgaf1tj364640075", "КтоГлавный - Выставка «ГЕОМЕТРИЯ ПРОСТРАНСТВА – VI»"),
        ], [
            "Библиотека основана 7 января 1886 года. Донская государственная публичная библиотека - один из крупных культурных центров г. Ростова-на-Дону. Здесь проходят кинофестивали, действуют абонементы и клубы для пользователей библиотеки. Многогранна выставочная деятельность библиотеки – персональные и коллективные выставки изобразительного искусства, прикладного мастерства, детского рисунка, фотовыставки, книжные тематические выставки. Библиотека ежегодно проводит более 2 000 культурно-просветительских мероприятий, в которых участвуют свыше 110 тысяч человек.",
            "График работы: вт – пт 10:00-20:00, суб – вс 10:00-18:00",
            "Телефон: +7 (863) 264-85-97",
            "Email: dspl-online@dspl.ru",
        ], new Color(126, 28, 48, 0.5), Point.IconsColors.red),
        new Point("Ростовский академический театр драмы им. Максима Горького", "Театр Горького", new PointLocation(47.228608757655685, 39.744755387723316, "Театральная площадь, 1"), [
            new Link("https://rostovteatr.ru", "Сайт"),
            new Link("https://google.com", "VK"),
            new Link("https://t.me/gorky_drama_rostov", "Telegram"),
            new Link("https://don24-ru.turbopages.org/don24.ru/s/rubric/kultura/teatr-kak-kosmos.html", "ДОН24 - театр Горького"),
            new Link("https://www.1rnd.ru/news/2768250/teatr-v-kotorom-stalo-slysno-kak-vojna-perestroila-donskuu-stolicu", "1rnd.ru - театр Горького"),
            new Link("https://www.nvgazeta.ru/news/12381/581788/", "Наше Время - театр Горького"),
            new Link("https://161.ru/text/culture/2021/10/25/70208573/", "161.ru - «Пиковая дама»"),
            new Link("https://www.youtube.com/watch?v=bs4MRCUwJb0&t=15s", "ГТРК ДОН-ТР - Волки и овцы"),
        ], [
            "Датой образования театра принято считать 23 июня 1863 года, когда состоялось первое представление стационарной драматической труппы. Современное здание театра построено в 1935 году, восстановлено после Великой Отечественной войны в 1963 году, знаменито особенно тем, что по своей форме напоминает трактор – один из символов промышленного Ростова. Архитекторами уникального памятника архитектуры, мирового шедевра конструктивизма стали Владимир Щуко и Владимир Гельфрейх.",
            "Театром руководит драматург Александр Пудин, ему в заслугу ставится возвращение в репертуар произведений донских авторов, а местная постановка «Тихого Дона» получила широкую известность в России и за рубежом. В программе театра сплошь классические произведения: спектакли по текстам Шолохова, Чехова, Гоголя, Шекспира, Островского.",
            "График работы администрации: пн-пт 10:00-18:00",
            "Телефон администрации: +7 (863) 263-36-22",
            "График работы кассы: ежедневно 10:00-18:30",
            "Телефон кассы: +7 (863) 263-36-13",
        ], new Color(186, 186, 49, 0.5), Point.IconsColors.orange),
        new Point("Ростовский государственный музыкальный театр", "Музыкальный театр", new PointLocation(47.224643565299225, 39.732546348428436, "ул. Большая Садовая, 134"), [
            new Link("https://rostovopera.ru/", "Ростовский музыкальный театр"),
            new Link("https://vk.com/rgmteatr?ysclid=lbevdu4wsp939771786", "ВКонтакте"),
            new Link("https://don24.ru/rubric/kultura/bolero-lyubov-i-strast-novyy-spektakl-prezentovali-v-muzteatre.html", "1.	ДОН24 - «Болеро. Любовь и страсть»"),
            new Link("https://don24.ru/rubric/kultura/samaya-romantichnaya-premera-sezona-zhiteli-dona-uvidyat-alye-parusa.html", "ДОН24 - «Алые паруса»"),
            new Link("https://don24.ru/rubric/obschestvo/konkurs-festival-dlya-molodyh-ispolniteley-mir-dzhaza-prohodit-v-donskoy-stolice.html", "ДОН24 - Конкурс-фестиваль для молодых исполнителей «Мир джаза»"),
        ], [
            "В сентябре 1999 Ростовский театр музыкальной комедии переехал в новое здание общей площадью 37 тысяч квадратных метров и сценической площадкой, которая на сегодняшний день уступает по своим техническим параметрам и размеру зеркала сцены только Большому театру. Создателями грандиозного сооружения – белого рояля с открытой крышкой – стали молодые архитекторы Лобак, Дуков, Хафизов.",
            "У театра обширная гастрольная география. За последние годы труппа побывала на гастролях в Германии, Италии, Испании, Польше, Португалии, Великобритании, Ирландии, Объединенных Арабских Эмиратах, Катаре.",
            'На сцене театра были созданы оперные спектакли «Кармен» Ж. Бизе, «Мадам Баттерфляй» и «Богема"» Дж. Пуччини, «Царская невеста» Н.Римского-Корсакова, «Евгений Онегин», «Иоланта» и «Пиковая дама» П. Чайковского, «Леди Макбет Мценского уезда» Д. Шостаковича, «Волшебная флейта» В.- А.Моцарта , «Хованщина» М. Мусоргского, балетные спектакли «Жизель» А. Адама, «Лебединое озеро», «Спящая красавица» и «Щелкунчик» П. Чайковского, «Дон Кихот» Л. Минкуса, «Ромео и Джульетта» С. Прокофьева, «Гамлет» на музыку Д. Шостаковича, оперетты «Принцесса цирка» и «Королева чардаша» И.Кальмана, «Летучая мышь» и «Цыганский барон» И.Штрауса.',
            "Адрес: ул. Большая Садовая, 134",
            "График работы: ежедневно, 10:00–20:00",
            "Телефон: +7 (863) 264-07-07, +7 (863) 264-18-26, +7 (863) 263-89-51",
        ], new Color(35, 41, 183, 0.5), Point.IconsColors.darkBlue),
        new Point("Театрально-выставочный центр MAKARONKA. Перезапуск", "MAKARONKA. Перезапуск", new PointLocation(47.231455298389044, 39.76001349047456, "ул. 18 линия, д. 8"), [
            new Link("https://taplink.cc/makaronka_art ", "Сайт"),
            new Link("https://vk.com/makaronka_space?ysclid=lbevltdkn3265108098", "ВКонтакте"),
            new Link("https://t.me/makaronka_art", "Telegram"),
            new Link("https://cityreporter.ru/makaronka-my-pytaemsya-uderzhatsya-na-plavu/?ysclid=lbaj60xi8m579572893", "Городской репортёр - Макаронка"),
            new Link("https://gorodn.ru/razdel/obshchestvo_free/afisha/31894/?ysclid=lbaj6f863s556950722", "Город N - Арт-центр MAKARONKA "),
            new Link("https://www.sobaka.ru/rnd/city/portrety/130892?ysclid=lbaj7bqbge512063735", "Sobaka.ru - интервью с куратором театрально-выставочного центра MAKARONKA"),
            new Link("http://werawolw.ru/?p=28761&ysclid=lbevj0bvbr647533377", "Живой Ростов - Муха-Театр"),
        ], [
            "Макаронка была открыта в январе 2013 на территории бывшей макаронной фабрики. Свою историю центр начал с Фестиваля уличного искусства «Макаронная фабрика», объединившего несколько выставок и проектов, включая лекции, концерты, перформансы, конкурс граффити. Осенью 2020 года управление театрально-выставочным центром MAKARONKA взяла на себя команда из энтузиастов и бывших штатных сотрудников Макаронки, которая взяла на себя финансовое, организационное и артистическое обеспечение работы центра. Макаронка объединяет одноимённый современный театр, основанный осенью 2020 года режиссёром и художником Дмитрием Цупко, и выставочный зал, программу которого ведет куратор и художница Лейли Асланова, а также концертное направление под руководством философа и актёра Юрия Арефьева.",
            "График работы: ср-вс 14:00-20:00",
            "Телефон: +7 (995) 290-86-90",
        ], new Color(126, 28, 48, 0.5), Point.IconsColors.violet),
        new Point("«Центр вокруг. Галерея, арт-лаборатория, багетная мастерская «Иллюзия эфемерности»", "Багетная мастерская", new PointLocation(47.224394, 39.723282, "просп. Чехова, 35/30"), [
            new Link("https://vk.com/illusion_ephemerality?ysclid=lbew4c483v431166779", "ВКонтакте"),
            new Link("https://t.me/illusion_ephemerality", "Telegram"),
            new Link("https://rostovchanka-media.ru/dosug-i-kultura/vyistavki/illyuziya-efemernosti?cultureKey&ysclid=lb9lsa1mkd489011696", "Ростовчанка - Иллюзия эфемерности"),
            new Link("https://kg-rostov.ru/afisha/vystavki/v-prostranstve-tsentr-vokrug-otkrylas-galereya-illyuziya-efemernosti/", "КтоГлавный - Иллюзия эфемерности"),
        ], [
            "Знакомит посетителей с творчеством художников и скульпторов. В галерее вы можете приобрести картины, живопись, графику, арт-объекты, подобрать оформление для ваших произведений искусства, картин, гобеленов, вышивок, предметов интерьера, орденов и медалей, артефактов, зеркал. Находятся в старинном особняке в самом центре Ростова, атмосфера которого подарит Вам новые ощущения!",
            "График работы: ежедневно, 10:00-22:00",
            "Телефон: +7 (928) 615-55-75",
        ], new Color(186, 186, 49, 0.5), Point.IconsColors.darkOrange),
    ], [47.228588, 39.73678]),
    new Category("Экскурсионный тур", [
        new Point("Био-Хутор Петровский", "Био-Хутор", new PointLocation(47.330931, 38.31285, "Заречный пер., 8, хутор Петровский, Неклиновский район, Ростовская область"), [
            new Link("https://biohutor.ru/", "Био-Хутор"),
            new Link("https://vk.com/biohutor?ysclid=lbhmvt105w123527441", "ВКонтакте"),
            new Link("https://mius-media.ru/bio-hutor-petrovskij-put-k-zdorovoj-zhizni", "Миус Инфо - Био-Хутор Петровский"),
            new Link("https://don24-ru.turbopages.org/don24.ru/s/rubric/obschestvo/selskiy-turizm-v-bio-hutore-petrovskom.html", "ДОН24 - Био-Хутор Петровский"),
            new Link("https://gorodn-ru.turbopages.org/gorodn.ru/s/razdel/novosti_kompaniy/novye_produkty/35224/", "ГородN - «Био-Хутор Петровский» "),
            new Link("https://ro-today.turbopages.org/ro.today/s/9415-biohutor-petrovskij-postroit-v-rostovskoj-oblasti-gljemping-za-10-mln-rublej.html", "RO.Today - «Био-Хутор Петровский»"),
            new Link("https://expertsouth.ru/articles/Nachalosvsyeskhlebaonbylochenvkusnyy/", "Эксперт ЮГ - Био-Хутор Петровский"),
        ], [
            "Экологическое предприятие, которое занимается выращиванием без химии, ГМО, пестицидов с 2010 года. Выпускают большой ассортимент органических продуктов премиум качества: 21 вид хлеба: «Тонус» из пророщенного зерна, ремесленный хлеб из русской печи, ржаной хлеб «На Здоровье», отрубной батон, багет, 5 злаков. Также изготавливают цельнозерновую муку, хлопья, крупу, зерно, бобовые, яйца.",
            "Кроме того, Био-Хутор открыл набирающую популярность в последнее время сферу сельского туризма. На экскурсии вам предлагают увидеть, где и как рождается самая чистая органическая еда, уединиться в медитативной тишине села, насладиться красотой нетронутой природы Донского края, съесть свежий хлеб, сделанный своими руками и выпеченный в русской печи.",
            "Координаты: 47°19'49\"N 38°18'55\"E",
            "График работы: пн-пт 8:30-16:30",
            "Телефон: 8 (800) 350-12-98, +7 (863) 461-91-71, +7 (903) 400-04-54",
            "Email: info@biohutor.ru",
        ], new Color(126, 28, 48, 0.5), Point.IconsColors.red),
        new Point("Неизвестный Дон", "Неизвестный Дон", new PointLocation(47.217904630773226, 39.72203370997485, "344006, г. Ростов-на-Дону, ул. Седова, 5, оф. М15"), [
            new Link("https://tours.unknown-don.ru/", "Неизвестный Дон"),
            new Link("https://vk.com/unknown_don", "ВКонтакте"),
            new Link("https://rostov.aif.ru/society/persona/brend_dlya_turistov_priroda_rostovskoy_oblasti_unikalna?ysclid=lb9n9nayer168247993", "АиФ Ростов-на-Дону - Неизвестный Дон"),
            new Link("https://priazove.ru/otkryvaem-neizvedannye-dorogi-donskogo-kraya/?ysclid=lbho91x59u556055359", "Приазовье_Неизвестный Дон"),
            new Link("https://bloknot-rostov.ru/news/za-500-tysyach-rubley-iz-byudzheta-pokatayut-turis-1013070", "Блокнот_Ростов_Неизвестный Дон"),
        ], [
            "Неизвестный Дон – эксклюзивные познавательные экологические путешествия по малоизвестным уголкам Донской земли, в которых вам откроется удивительный край, хранящий в себе множество впечатляющих красот и загадок. Вы познакомитесь с донской природой в её самых неожиданных проявлениях, услышите забытые истории и легенды.",
            "На выбор вам предлагаются: познавательные туры (география, геология, палеонтология, биология и история Донского края. Увлекательные природные квесты и практикумы); рекреационные туры (посещение обзорных площадок, облегчённые пешие и водные прогулки, отдых в лесу и на белоснежных пляжах, купание); экологические туры (пешие походы по заповедным тропам. Знакомство с природой Донского края) и фототуры (особенности пейзажной фотосъёмки. Осмысленное управление параметрами съёмки и технические приёмы. Тур-ревю).",
            "Уникальное предложение - двухдневная экскурсия по северу Ростовской области с посещением удивительных, малоизвестных достопримечательностей и заповедных уголков природы.",
            "График работы: пн-пт 9:00-18:00",
            "Телефон: +7 (863) 218-53-96",
            "Email: welcome@unknown-don.ru",
        ], new Color(186, 186, 49, 0.5), Point.IconsColors.orange),
        new Point("Государственное бюджетное учреждение культуры Ростовской области (ГБУК РО) «Азовский историко-археологический и палеонтологический музей-заповедник»", "Главное здание музея", new PointLocation(47.111693, 39.423438, "г.Азов, Ростовская область, ул.Московская, 38/40"), [
            new Link("https://www.azovmuseum.ru/?ysclid=lbhogx573i677080257", "Сайт"),
            new Link("https://vk.com/azovmuseum?ysclid=lbhokpqrl2751375898", "ВКонтакте"),
            new Link("https://gazetaluch.ru/azovskij-muzej-provedet-pryamuyu-translyaciyu-ekskursii-istoriya-unikalnoj-naxodki/?ysclid=lb9ng0ayph580541978", "ГАЗЕТА ЛУЧ - прямая трансляция экскурсии «История уникальной находки»"),
            new Link("https://www.nvgazeta.ru/news/15115/582289/?ysclid=lb9nic3t5z701093360", "НАШЕ ВРЕМЯ - Азовский историко-археологический и палеонтологический музей-заповедник"),
            new Link("https://don24.ru/rubric/kultura/deti-i-studenty-smogut-besplatno-pobyvat-v-azovskom-muzee-zapovednike.html", "ДОН24 - Азовский музей-заповедник"),
        ], [
            "Открылся 17 мая 1917 года. Сегодня Азовский музей-заповедник – один из крупнейших музеев юга России. В нём более 400 тысяч экспонатов, самым ранним из которых около 250 миллионов лет. Палеонтология, археология, история, природа, искусство – история человечества в отдельно взятом городе.",
            "Азовский музей-заповедник обладает богатой палеонтологической коллекцией. Немногие музеи мира могут гордиться такими экспонатами как в Азове – скелетами динотерия (обитавшего на территории Приазовья 8 млн. лет назад), двух трогонтериевых мамонтов (геологический возраст которых 700-800 тысяч лет), кавказского эласмотерия (1,3-1,4 млн. лет). В экспозиции представлены интересные находки: трогонтериевый бобр, слон Громова, винторогая антилопа, ливенцовская лошадь, азовский жираф. Науке они стали известны благодаря тому, что впервые их кости были найдены в донской земле.",
            "Координаты для навигатора: 47.111693, 39.423438",
            "Телефон: +7 (863) 424-03-71",
            "Email: azovmuseum@azovmuseum.ru",
        ], new Color(35, 41, 183, 0.5), Point.IconsColors.darkBlue),
        new Point("Государственное бюджетное учреждение культуры Ростовской области (ГБУК РО) «Азовский историко-археологический и палеонтологический музей-заповедник»", "Пороховой погреб", new PointLocation(47.116409, 39.419027, "г.Азов, Ростовская область, ул.Лермонтова, 6"), [
            new Link("https://www.azovmuseum.ru/?ysclid=lbhogx573i677080257", "Сайт"),
            new Link("https://vk.com/azovmuseum?ysclid=lbhokpqrl2751375898", "ВКонтакте"),
            new Link("https://gazetaluch.ru/azovskij-muzej-provedet-pryamuyu-translyaciyu-ekskursii-istoriya-unikalnoj-naxodki/?ysclid=lb9ng0ayph580541978", "ГАЗЕТА ЛУЧ - прямая трансляция экскурсии «История уникальной находки»"),
            new Link("https://www.nvgazeta.ru/news/15115/582289/?ysclid=lb9nic3t5z701093360", "НАШЕ ВРЕМЯ - Азовский историко-археологический и палеонтологический музей-заповедник"),
            new Link("https://don24.ru/rubric/kultura/deti-i-studenty-smogut-besplatno-pobyvat-v-azovskom-muzee-zapovednike.html", "ДОН24 - Азовский музей-заповедник"),
        ], [
            "Открылся 17 мая 1917 года. Сегодня Азовский музей-заповедник – один из крупнейших музеев юга России. В нём более 400 тысяч экспонатов, самым ранним из которых около 250 миллионов лет. Палеонтология, археология, история, природа, искусство – история человечества в отдельно взятом городе.",
            "Азовский музей-заповедник обладает богатой палеонтологической коллекцией. Немногие музеи мира могут гордиться такими экспонатами как в Азове – скелетами динотерия (обитавшего на территории Приазовья 8 млн. лет назад), двух трогонтериевых мамонтов (геологический возраст которых 700-800 тысяч лет), кавказского эласмотерия (1,3-1,4 млн. лет). В экспозиции представлены интересные находки: трогонтериевый бобр, слон Громова, винторогая антилопа, ливенцовская лошадь, азовский жираф. Науке они стали известны благодаря тому, что впервые их кости были найдены в донской земле.",
            "ежедневно с 10:00-18:00",
            "продажа билетов осуществляется кассой с 10.00 до 17.30",
            "Телефон: +7 (863) 424-03-71",
            "Email: azovmuseum@azovmuseum.ru",
        ], new Color(35, 41, 183, 0.5), Point.IconsColors.darkBlue),
        new Point("Государственное бюджетное учреждение культуры Ростовской области (ГБУК РО) «Азовский историко-археологический и палеонтологический музей-заповедник»", "Валы Азовской крепости", new PointLocation(47.11606, 39.420931, "г.Азов, Ростовская область, Пролетарский спуск, 9"), [
            new Link("https://www.azovmuseum.ru/?ysclid=lbhogx573i677080257", "Сайт"),
            new Link("https://vk.com/azovmuseum?ysclid=lbhokpqrl2751375898", "ВКонтакте"),
            new Link("https://gazetaluch.ru/azovskij-muzej-provedet-pryamuyu-translyaciyu-ekskursii-istoriya-unikalnoj-naxodki/?ysclid=lb9ng0ayph580541978", "ГАЗЕТА ЛУЧ - прямая трансляция экскурсии «История уникальной находки»"),
            new Link("https://www.nvgazeta.ru/news/15115/582289/?ysclid=lb9nic3t5z701093360", "НАШЕ ВРЕМЯ - Азовский историко-археологический и палеонтологический музей-заповедник"),
            new Link("https://don24.ru/rubric/kultura/deti-i-studenty-smogut-besplatno-pobyvat-v-azovskom-muzee-zapovednike.html", "ДОН24 - Азовский музей-заповедник"),
        ], [
            "Открылся 17 мая 1917 года. Сегодня Азовский музей-заповедник – один из крупнейших музеев юга России. В нём более 400 тысяч экспонатов, самым ранним из которых около 250 миллионов лет. Палеонтология, археология, история, природа, искусство – история человечества в отдельно взятом городе.",
            "Азовский музей-заповедник обладает богатой палеонтологической коллекцией. Немногие музеи мира могут гордиться такими экспонатами как в Азове – скелетами динотерия (обитавшего на территории Приазовья 8 млн. лет назад), двух трогонтериевых мамонтов (геологический возраст которых 700-800 тысяч лет), кавказского эласмотерия (1,3-1,4 млн. лет). В экспозиции представлены интересные находки: трогонтериевый бобр, слон Громова, винторогая антилопа, ливенцовская лошадь, азовский жираф. Науке они стали известны благодаря тому, что впервые их кости были найдены в донской земле.",
            "ежедневно с 9:00-20:00 ",
            "продажа билетов осуществляется кассой с 9.00 до 19.30",
            "Телефон: +7 (863) 424-03-71",
            "Email: azovmuseum@azovmuseum.ru",
        ], new Color(35, 41, 183, 0.5), Point.IconsColors.darkBlue),
        new Point("Государственное бюджетное учреждение культуры Ростовской области (ГБУК РО) «Азовский историко-археологический и палеонтологический музей-заповедник»", "Валы Азовской крепости", new PointLocation(47.11606, 39.420931, "г.Азов, Ростовская область, Пролетарский спуск, 9"), [
            new Link("https://www.azovmuseum.ru/?ysclid=lbhogx573i677080257", "Сайт"),
            new Link("https://vk.com/azovmuseum?ysclid=lbhokpqrl2751375898", "ВКонтакте"),
            new Link("https://gazetaluch.ru/azovskij-muzej-provedet-pryamuyu-translyaciyu-ekskursii-istoriya-unikalnoj-naxodki/?ysclid=lb9ng0ayph580541978", "ГАЗЕТА ЛУЧ - прямая трансляция экскурсии «История уникальной находки»"),
            new Link("https://www.nvgazeta.ru/news/15115/582289/?ysclid=lb9nic3t5z701093360", "НАШЕ ВРЕМЯ - Азовский историко-археологический и палеонтологический музей-заповедник"),
            new Link("https://don24.ru/rubric/kultura/deti-i-studenty-smogut-besplatno-pobyvat-v-azovskom-muzee-zapovednike.html", "ДОН24 - Азовский музей-заповедник"),
        ], [
            "Открылся 17 мая 1917 года. Сегодня Азовский музей-заповедник – один из крупнейших музеев юга России. В нём более 400 тысяч экспонатов, самым ранним из которых около 250 миллионов лет. Палеонтология, археология, история, природа, искусство – история человечества в отдельно взятом городе.",
            "Азовский музей-заповедник обладает богатой палеонтологической коллекцией. Немногие музеи мира могут гордиться такими экспонатами как в Азове – скелетами динотерия (обитавшего на территории Приазовья 8 млн. лет назад), двух трогонтериевых мамонтов (геологический возраст которых 700-800 тысяч лет), кавказского эласмотерия (1,3-1,4 млн. лет). В экспозиции представлены интересные находки: трогонтериевый бобр, слон Громова, винторогая антилопа, ливенцовская лошадь, азовский жираф. Науке они стали известны благодаря тому, что впервые их кости были найдены в донской земле.",
            "ежедневно с 9:00-20:00 ",
            "продажа билетов осуществляется кассой с 9.00 до 19.30",
            "Телефон: +7 (863) 424-03-71",
            "Email: azovmuseum@azovmuseum.ru",
        ], new Color(35, 41, 183, 0.5), Point.IconsColors.darkBlue),
        new Point("Государственное бюджетное учреждение культуры Ростовской области (ГБУК РО) «Азовский историко-археологический и палеонтологический музей-заповедник»", "Гошпитальный сад", new PointLocation(47.115434, 39.423554, "г.Азов, Ростовская область, ул. Дзержинского, 9"), [
            new Link("https://www.azovmuseum.ru/?ysclid=lbhogx573i677080257", "Сайт"),
            new Link("https://vk.com/azovmuseum?ysclid=lbhokpqrl2751375898", "ВКонтакте"),
            new Link("https://gazetaluch.ru/azovskij-muzej-provedet-pryamuyu-translyaciyu-ekskursii-istoriya-unikalnoj-naxodki/?ysclid=lb9ng0ayph580541978", "ГАЗЕТА ЛУЧ - прямая трансляция экскурсии «История уникальной находки»"),
            new Link("https://www.nvgazeta.ru/news/15115/582289/?ysclid=lb9nic3t5z701093360", "НАШЕ ВРЕМЯ - Азовский историко-археологический и палеонтологический музей-заповедник"),
            new Link("https://don24.ru/rubric/kultura/deti-i-studenty-smogut-besplatno-pobyvat-v-azovskom-muzee-zapovednike.html", "ДОН24 - Азовский музей-заповедник"),
        ], [
            "Открылся 17 мая 1917 года. Сегодня Азовский музей-заповедник – один из крупнейших музеев юга России. В нём более 400 тысяч экспонатов, самым ранним из которых около 250 миллионов лет. Палеонтология, археология, история, природа, искусство – история человечества в отдельно взятом городе.",
            "Азовский музей-заповедник обладает богатой палеонтологической коллекцией. Немногие музеи мира могут гордиться такими экспонатами как в Азове – скелетами динотерия (обитавшего на территории Приазовья 8 млн. лет назад), двух трогонтериевых мамонтов (геологический возраст которых 700-800 тысяч лет), кавказского эласмотерия (1,3-1,4 млн. лет). В экспозиции представлены интересные находки: трогонтериевый бобр, слон Громова, винторогая антилопа, ливенцовская лошадь, азовский жираф. Науке они стали известны благодаря тому, что впервые их кости были найдены в донской земле.",
            "закрыт с 01.10.2022 по март 2023 г",
            "Телефон: +7 (863) 424-03-71",
            "Email: azovmuseum@azovmuseum.ru",
        ], new Color(35, 41, 183, 0.5), Point.IconsColors.darkBlue),
        new Point("Государственное бюджетное учреждение культуры Ростовской области (ГБУК РО) «Азовский историко-археологический и палеонтологический музей-заповедник»", "Выставочный зал «Меценат»", new PointLocation(47.10786, 39.425638, "г.Азов, Ростовская область, ул.Ленинградская, 86а"), [
            new Link("https://www.azovmuseum.ru/?ysclid=lbhogx573i677080257", "Сайт"),
            new Link("https://vk.com/azovmuseum?ysclid=lbhokpqrl2751375898", "ВКонтакте"),
            new Link("https://gazetaluch.ru/azovskij-muzej-provedet-pryamuyu-translyaciyu-ekskursii-istoriya-unikalnoj-naxodki/?ysclid=lb9ng0ayph580541978", "ГАЗЕТА ЛУЧ - прямая трансляция экскурсии «История уникальной находки»"),
            new Link("https://www.nvgazeta.ru/news/15115/582289/?ysclid=lb9nic3t5z701093360", "НАШЕ ВРЕМЯ - Азовский историко-археологический и палеонтологический музей-заповедник"),
            new Link("https://don24.ru/rubric/kultura/deti-i-studenty-smogut-besplatno-pobyvat-v-azovskom-muzee-zapovednike.html", "ДОН24 - Азовский музей-заповедник"),
        ], [
            "Открылся 17 мая 1917 года. Сегодня Азовский музей-заповедник – один из крупнейших музеев юга России. В нём более 400 тысяч экспонатов, самым ранним из которых около 250 миллионов лет. Палеонтология, археология, история, природа, искусство – история человечества в отдельно взятом городе.",
            "Азовский музей-заповедник обладает богатой палеонтологической коллекцией. Немногие музеи мира могут гордиться такими экспонатами как в Азове – скелетами динотерия (обитавшего на территории Приазовья 8 млн. лет назад), двух трогонтериевых мамонтов (геологический возраст которых 700-800 тысяч лет), кавказского эласмотерия (1,3-1,4 млн. лет). В экспозиции представлены интересные находки: трогонтериевый бобр, слон Громова, винторогая антилопа, ливенцовская лошадь, азовский жираф. Науке они стали известны благодаря тому, что впервые их кости были найдены в донской земле.",
            "ежедневно с 09:00-17:00",
            "продажа билетов осуществляется кассой с 10.00 до 16.30",
            "Телефон: +7 (863) 424-03-71",
            "Email: azovmuseum@azovmuseum.ru",
        ], new Color(35, 41, 183, 0.5), Point.IconsColors.darkBlue),
        new Point("Государственное бюджетное учреждение культуры Ростовской области (ГБУК РО) «Азовский историко-археологический и палеонтологический музей-заповедник»", "Музей Самойловича", new PointLocation(47.11173, 39.420877, "346780, г.Азов, Ростовская область, ул. Ленинградская, 46"), [
            new Link("https://www.azovmuseum.ru/?ysclid=lbhogx573i677080257", "Сайт"),
            new Link("https://vk.com/azovmuseum?ysclid=lbhokpqrl2751375898", "ВКонтакте"),
            new Link("https://gazetaluch.ru/azovskij-muzej-provedet-pryamuyu-translyaciyu-ekskursii-istoriya-unikalnoj-naxodki/?ysclid=lb9ng0ayph580541978", "ГАЗЕТА ЛУЧ - прямая трансляция экскурсии «История уникальной находки»"),
            new Link("https://www.nvgazeta.ru/news/15115/582289/?ysclid=lb9nic3t5z701093360", "НАШЕ ВРЕМЯ - Азовский историко-археологический и палеонтологический музей-заповедник"),
            new Link("https://don24.ru/rubric/kultura/deti-i-studenty-smogut-besplatno-pobyvat-v-azovskom-muzee-zapovednike.html", "ДОН24 - Азовский музей-заповедник"),
        ], [
            "Открылся 17 мая 1917 года. Сегодня Азовский музей-заповедник – один из крупнейших музеев юга России. В нём более 400 тысяч экспонатов, самым ранним из которых около 250 миллионов лет. Палеонтология, археология, история, природа, искусство – история человечества в отдельно взятом городе.",
            "Азовский музей-заповедник обладает богатой палеонтологической коллекцией. Немногие музеи мира могут гордиться такими экспонатами как в Азове – скелетами динотерия (обитавшего на территории Приазовья 8 млн. лет назад), двух трогонтериевых мамонтов (геологический возраст которых 700-800 тысяч лет), кавказского эласмотерия (1,3-1,4 млн. лет). В экспозиции представлены интересные находки: трогонтериевый бобр, слон Громова, винторогая антилопа, ливенцовская лошадь, азовский жираф. Науке они стали известны благодаря тому, что впервые их кости были найдены в донской земле.",
            "вт-сб с 10:00-18:00",
            "продажа билетов осуществляется кассой Азовского музея с 10.00",
            "Телефон: +7 (863) 424-03-71",
            "Email: azovmuseum@azovmuseum.ru",
        ], new Color(35, 41, 183, 0.5), Point.IconsColors.darkBlue),
    ]),
    new Category("Гастрономический тур", [
        new Point("Ресторан «Онегин Дача»", "Онегин Дача", new PointLocation(47.225478, 39.723051, "г. Ростов-на-Дону, пр. Чехова, 45Б."), [
            new Link("https://taplink.cc/onegin_dacha", "Сайт"),
            new Link("https://vk.com/onegin_dacha?ysclid=lbdfx3izxq964093721", "ВКонтакте"),
            new Link("https://allcafe.ru/reviews/kolonka-restorannogo-kritika/onegin-dacha/", "Allcafe. Онегин Дача"),
            new Link("https://www.donnews.ru/dva-restorana-v-rostove-nazvali-v-chisle-samyh-luchshih-zavedeniy-mira?ysclid=lb9bx7e5nz478889347", "Donnews.ru - Онегин Дача"),
            new Link("https://swn.ru/articles/onegin-dacha-kak-rozhdaetsya-menu-enogastronomicheskogo-uzhina?ysclid=lb9byt7ah0221644790", "SWN.ru - Онегин Дача"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-restorany-rostova-na-donu", "ЯПокупаю - рейтинг ресторанов Ростова-на-Дону"),
        ], [
            "Ресторан «Онегин Дача» - это уютный дом-усадьба в центре города",
            "Оказавшись в кругу друзей этого гостеприимного дома, сразу чувствуешь атмосферу «дворянского гнезда», где жили несколько поколений большой и дружной семьи, всегда готовой к радушному приему гостей.",
            "Здесь готовят исконно русские блюда, приправленные французским шиком. В 2023 году попал в число участников престижного международного рейтинга «La Liste», набрав 79 баллов из 100 возможных.",
            "Телефон: +7 (928) 100-43-11",
            "Режим работы: пн-вс 8:00-23:00",
        ], new Color(134, 162, 71, 0.5), Point.IconsColors.yellow),
        new Point("КЕКС", "КЕКС", new PointLocation(47.223602, 39.717807, "Ворошиловский 53/22"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (906) 420-70-22",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet),
        new Point("КЕКС", "КЕКС", new PointLocation(47.219703, 39.710773, "Соборный 21"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (989) 533-01-31, ежедневно 7:00-23:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.226441, 39.719388, "Пушкинская 135/33"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (909) 430-04-29, ежедневно 7:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.222127, 39.715992, "Б. Садовая 57"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (909) 427-98-16, ежедневно 7:00-23:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.22895, 39.734398, "Пушкинская 192/93"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (906) 420-78-85, ежедневно 7:00-23:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.223902, 39.723637, "Чехова 31/81"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (989) 529-35-83, ежедневно 7:00-23:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.225132, 39.705796, "Максима Горького 111/52"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (906) 454-29-38, ежедневно 7:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.233552, 39.714465, "Ворошиловский 64"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (906) 420-75-62, ежедневно 7:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.22676, 39.736429, "Крепостной 76"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (906) 454-27-63, ежедневно 7:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.224128, 39.711734, "Пушкинская 54/55А"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (960) 455-74-53, ежедневно 8:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.249366, 39.710494, "Ленина 99"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (961) 290-28-07, ежедневно 8:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.260852, 39.719001, "ТРК Горизонт, Михаила Нагибина 32/2к3"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (905) 439-00-93, ежедневно 10:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС", new PointLocation(47.227237, 39.73006, "Кировский 44"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (961) 426-33-46 ежедневно 7:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("КЕКС", "КЕКС в Аксае", new PointLocation(47.290057, 39.846535, "г.Аксай, Аксайский пр. 23"), [
            new Link("https://www.sobaka.ru/rnd/bars/opening/117931", "Sobaka.ru - КЕКС"),
            new Link("https://www.yapokupayu.ru/blogs/post/luchshie-pekarni-rostova", "Sobaka.ru - КЕКС"),
        ], [
            "Ростовская сеть пекарен, работает на рынке с сентября 2020 года. Несмотря на столь юный возраст, «КЕКС» давно попал в ряды любимейших заведений сотен ростовчан, ведь помимо классных десертов, вкуснейшего кофе и воздушных круассанов в пекарне вас ждут приятная музыка и уютная атмосфера.",
            "тел.: +7 (996) 438-50-60, ежедневно 10:00-22:00",
        ], new Color(189, 130, 217, 0.3), Point.IconsColors.violet, false),
        new Point("Шаурма Маркет", "Шаурма Маркет", new PointLocation(47.2316, 39.728308, "Красноармейская, 109а"), [
            new Link("https://nationmagazine.ru/people/shaurma-uzhe-vstroilas-v-geneticheskiy-kod-rostovchan/?ysclid=lbdldp70i1250504084", "Интервью"),
            new Link("http://shaurmamarket.com/", "Сайт"),
        ], [
            "В своём интервью журналу «Нация» основатель сети ресторанов «Осака», ресторанов «Ялла», «Макао», «Ош Пош» и «La Fabbrica» Аджай Сингх сказал: «Шаурма уже встроилась в генетический код ростовчан»",
            "И спросить с этим заявлением явно бессмысленная затея. А вот делиться интересными шаурмичными точками на карте Ростовской области можно и даже нужно!",
            "Телефон: +7 (928) 165-09-24",
            "График работы: ежедневно, круглосуточно",
        ], new Color(189, 212, 41, 0.4), Point.IconsColors.red),
        new Point("Шаурма Хаус", "Шаурма Хаус", new PointLocation(47.218332, 39.700514, "Б. Садовая, 20"), [
            new Link("https://nationmagazine.ru/people/shaurma-uzhe-vstroilas-v-geneticheskiy-kod-rostovchan/?ysclid=lbdldp70i1250504084", "Интервью"),
            new Link("https://161.ru/text/food/2022/09/16/71660018/?ysclid=lb9dibqatg693265200", "161.ru"),
            new Link("https://www.yapokupayu.ru/blogs/post/kruto-zavernuli-gde-samaya-vkusnaya-shaurma-v-rostove?ysclid=lb9dvbvom0474721016", "ЯПокупаю"),
        ], [
            "В своём интервью журналу «Нация» основатель сети ресторанов «Осака», ресторанов «Ялла», «Макао», «Ош Пош» и «La Fabbrica» Аджай Сингх сказал: «Шаурма уже встроилась в генетический код ростовчан»",
            "И спросить с этим заявлением явно бессмысленная затея. А вот делиться интересными шаурмичными точками на карте Ростовской области можно и даже нужно!",
            "Телефон: +7 (928) 112-11-21",
            "График работы: пн-сб 8:00-23:00, вс 9:00-22:00",
        ], new Color(189, 212, 41, 0.4), Point.IconsColors.red),
        new Point("Kikchak", "Kikchak", new PointLocation(47.223779, 39.725963, "Б. Садовая, 114"), [
            new Link("https://nationmagazine.ru/people/shaurma-uzhe-vstroilas-v-geneticheskiy-kod-rostovchan/?ysclid=lbdldp70i1250504084", "Интервью"),
            new Link("https://kikchak.clients.site/?ysclid=lbdl1mma2686518376", "Сайт"),
            new Link("https://161.ru/text/food/2022/09/16/71660018/?ysclid=lb9dibqatg693265200", "161.ru"),
            new Link("https://www.yapokupayu.ru/blogs/post/kruto-zavernuli-gde-samaya-vkusnaya-shaurma-v-rostove?ysclid=lb9dvbvom0474721016", "ЯПокупаю"),
        ], [
            "В своём интервью журналу «Нация» основатель сети ресторанов «Осака», ресторанов «Ялла», «Макао», «Ош Пош» и «La Fabbrica» Аджай Сингх сказал: «Шаурма уже встроилась в генетический код ростовчан»",
            "И спросить с этим заявлением явно бессмысленная затея. А вот делиться интересными шаурмичными точками на карте Ростовской области можно и даже нужно!",
            "Телефон: +7 (993) 993-63-30",
            "График работы: ежедневно, 10:00-00:00",
        ], new Color(189, 212, 41, 0.4), Point.IconsColors.red),
        new Point("Доннер-кебаб", "Доннер-кебаб", new PointLocation(47.235038, 39.712893, "Ворошиловский, 105а"), [
            new Link("https://nationmagazine.ru/people/shaurma-uzhe-vstroilas-v-geneticheskiy-kod-rostovchan/?ysclid=lbdldp70i1250504084", "Интервью"),
            new Link("https://161.ru/text/food/2022/09/16/71660018/?ysclid=lb9dibqatg693265200", "161.ru"),
            new Link("https://www.yapokupayu.ru/blogs/post/kruto-zavernuli-gde-samaya-vkusnaya-shaurma-v-rostove?ysclid=lb9dvbvom0474721016", "ЯПокупаю"),
        ], [
            "В своём интервью журналу «Нация» основатель сети ресторанов «Осака», ресторанов «Ялла», «Макао», «Ош Пош» и «La Fabbrica» Аджай Сингх сказал: «Шаурма уже встроилась в генетический код ростовчан»",
            "И спросить с этим заявлением явно бессмысленная затея. А вот делиться интересными шаурмичными точками на карте Ростовской области можно и даже нужно!",
            "Телефон: +7 (863) 311-11-22, +7 (863) 311-11-23",
            "График работы: ежедневно, 8:00-00:00",
        ], new Color(189, 212, 41, 0.4), Point.IconsColors.red),
        new Point("От души", "От души", new PointLocation(47.294336, 39.703038, "Добровольского 30/3"), [
            new Link("https://nationmagazine.ru/people/shaurma-uzhe-vstroilas-v-geneticheskiy-kod-rostovchan/?ysclid=lbdldp70i1250504084", "Интервью"),
            new Link("https://161.ru/text/food/2022/09/16/71660018/?ysclid=lb9dibqatg693265200", "161.ru"),
            new Link("https://www.yapokupayu.ru/blogs/post/kruto-zavernuli-gde-samaya-vkusnaya-shaurma-v-rostove?ysclid=lb9dvbvom0474721016", "ЯПокупаю"),
        ], [
            "В своём интервью журналу «Нация» основатель сети ресторанов «Осака», ресторанов «Ялла», «Макао», «Ош Пош» и «La Fabbrica» Аджай Сингх сказал: «Шаурма уже встроилась в генетический код ростовчан»",
            "И спросить с этим заявлением явно бессмысленная затея. А вот делиться интересными шаурмичными точками на карте Ростовской области можно и даже нужно!",
            "Телефон: +7 (961) 305-81-81",
            "График работы: ежедневно, круглосуточно;",
        ], new Color(189, 212, 41, 0.4), Point.IconsColors.red),
    ]),
];
