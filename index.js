// Дисклеймер: автор оригинального кода - некий "кило мяу", на права авторства
// этого "шедевра" я не претендую(Боже упаси!). Никаких копирайтов, копилефтов и копицентров
// обнаружено не было, а сам код лежит в открытом доступе, из чего следует, что весь код на момент
// выгрузки(27.01.2022) предоставлен "AS IS", так что я просто по коду катаюсь и ничьих планов 
// не нарушаю. И конечно же я вставлю ссылку на сурс: https://handsoff.doxajournal.ru/
// Соответственно, авторство текста в комментах ревью принадлежит мне и распространяется по 
// лицензии КУДА-ТЫ-ЛЕЗЕШЬ-ХУЕСОСИНА 14.88 версии. На самом деле мне похуй, вряд ли кто-то вменяемый 
// это купит, а если и купит, то мне будет хотя бы смешно.

// TL;DR: отвратительное программирование.

// Вводная: я воистину сгорел от такого прославления Сатаны и как настоящий
// мазохист-естествоиспытатель решил разобрать этот код, чтобы донести до всех
// хоть немного разбирающихся в теме всю физичискую боль, которую я испытываю,
// смотря на такую писанину.
// Немного обо мне: официально сейчас я джуниор fullstack, с яваскриптом работаю реже, чем с бэком,
// а когда контактирую, то обычно это React, Webpack, RxJS и прочие относительно простые штуки. 
// Поэтому могу упустить БАЗУ. Есть замечания - пишите в личку.
// В этом документе я предлагаю взять скальпели, воспарить как хирурги над лабиринтом и заглянуть под капот 
// прогрессивного проекта.
// Как ревьюер я взял на себя ответственность запихнуть всё в один файл. 
// Такой шаг был сделан, потому что все файлы js этого проекта все равно подключаются в index
// друг за другом, а сам код не дробится на модули. По сути - это вермишель, распиханная по разным файлам.
// Жалкие попытки минификации были безжалостно нейтрализованы автоформатером.
// К сожалению, следы лени разработчика проставлять семиколоны или изучить БАЗУ и поставить
// prettier затерялись, но тут ничего не поделать, остается только упомянуть.

// Цель данного ревью - не показать, как и к чему стремиться, а донести
// очевидную мысль: может с таким скиллом лучше не стоит лезть в разработку движков ВН-ок,
// а взять готовый? Или вообще лучше не лезть в разработку?

// Краткий обзор проблем: 
// 1) Этот код свалится при AJAX-запросе, если хоть один пакет с сервера закорруптится.
// 2) Этот код действительно трахнет ваше железо. Особенно "игра" с супом.
// 2.1) Перевод с коддерского на человеческий: у Genderfluid Helisexual в Firefox 
// fps limit был равен не 60-ти, а герцовке моника, которая выше. На моей 1660 
// загрузка GPU во вступлении составила 30%, т.к. мой моник работает в 60hz. Теперь
// можно предстваить, что будет на 144hz сделав коррекцию погрешности(эти две карты всё-таки слегка разные), 
// а именно: Firefox говорит карте отрисовывать, карта не успевает это сделать за 0.0087с, но старается, 
// а огнелис продолжает накидывать, накидывать, накидывать... А карта старается, старается, старается.
// Это та ситуация, когда лок фпс ни на что не влияет. Вот и 100%-я загрузка видюхи.
// Какой пиздец происходит при отключенном аппаратном ускорении графики или на gt430 мне 
// даже представлять не хочется.
// 3) Глобал завален переменными. Глобальная переменная - это штука, которая может дать сайд-эффект.
// Подробнее, почему это зло: https://ravesli.com/urok-50-pochemu-globalnye-peremennye-zlo/
// 4) Работы с ресурсами нет. Вот например в игре с супом есть спрайты спиралей, только чуть-чуть разного
// цвета под разным углом. Логика подсказывает, что загрузиться должна была всего одна картинка, 
// а потом уже как-то трансформироваться, но нет, у нас загружается по сети больше 10 почти
// одинаковых png-шек со спиралями. Векторные картинки - это всегда разные файлы. Есть там где-то анимация
// с дергающейся шторой из трех кадров. SVG позволяет содержать в себе все три этих состояния и даже анимацию.
// Таки, что бы вы думали? Это три абсолютно полностью отрисованных сцены в трех PNG-файлах. При том, что
// что нарисовано это всё явно в векторе.
// Есть вопросики к оптимизации самих SVG, но так глубоко копать я не стал, а то еще инфаркт жопы схвачу.
// Так же замечены ЖИПЕГИ на аватарках в "соцсети", хотя "графон" достаточно прост, чтобы с 
// этим лучше справился png.
// 5) ООП. Автор ингода пытается в ООП, но лишь иногда, потому что совершенно не понимает его сути 
// и выглядит это как пара классов завернутых в вермишель.

// gradient.js
// Глобальная перменная без причины. Почему без причины?
// Кроме как в рамках этого файла она нигде не используется.
// Есть очень простой паттерн, который делает из документа модуль и не засоряет global
// мусором. Выглядит он так:
// ()=>{ /*body of document*/ }();
// Использование:
// const module = require('./relative_path/module_name.js');
// ...и всё это можно использовать внутри другого модуля.
// Для транспайлеров есть и export, но исходя из того, что любой может сделать ревью этого кода - 
// для автора это Rocket Science
// Отмечу, однако, что и внутри scope модуля почти все переменные - зло.
let gradient = null;
// Охохоу, классы - это конечно круто. Что же у нас в цепких лапах?
class GradientAnimation {
    constructor() {
        this.cnv = document.querySelector(`canvas.bg`);
        this.ctx = this.cnv.getContext(`2d`);
        this.circlesNum = 25;
        this.minRadius = 350;
        this.maxRadius = 450;
        this.speed = 0.02;
        (window.onresize = () => {
            this.setCanvasSize();
            this.createCircles();
        })();
        // Сразу вот так с порога стартуем, не дожидаясь окончания конструктора? 
        // И где остановка этого дерьма?
        // ...
        // я поглядел ниже и стоп находится в другом замке. И только ради того, чтобы
        // создать areq как глобальную переменную, вместо поля класса и методов Start() и Stop(),
        // я полагаю. Принцип инкапсуляции сломан, смысл класса утерян.
        this.drawAnimation();
    }
    setCanvasSize() {
        // Может как-то определиться? Либо мы используем поля объедка, как-то с ними манипулируем 
        // и только потом транслируем эти значения на канву, либо не используем поля 
        // и берем все с cnv.
        this.w = this.cnv.width = innerWidth * devicePixelRatio;
        this.h = this.cnv.height = innerHeight * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    createCircles() {
        this.circles = [];
        for (let i = 0; i < this.circlesNum; ++i) {
            this.circles.push(
                new Circle(this.w, this.h, this.minRadius, this.maxRadius)
            );
        }
    }

    drawCircles() {
        this.circles.forEach((circle) => circle.draw(this.ctx, this.speed));
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.w, this.h);
    }

    // Первое, так сказать, роковое использование.
    // https://developer.mozilla.org/ru/docs/Web/API/window/requestAnimationFrame
    // То, что тут рекурсия - не важно, потому что функция не совсем рекурсивная, а
    // очень даже асинхронная. Т.е. движок браузера порешает.
    // Но конечно же тут есть другой косяк.
    // Частота вызовов этой функи в chrome-based залочена на 60 кадров(раз в 16ms)
    // или частоту моника.
    // А в firefox этот лок может быть... ммм... другой. Или не быть вовсе.
    // От чего RX590 улетит в стратосферу.
    // Моя GTX 1660 показывала на этом экране в среднем 30-50% загруженности. Но и лок
    // был в 60 кадров, потому что герцовка моника 60.
    // У Genderfluid Helisexual, насколько я знаю, герцовка моника выше, поэтому очень
    // легко представить, что карточка изо всех сил пыталась выдавить из себя как можно
    // больше кадров, но задыхалась.
    drawAnimation() {
            this.clearCanvas();
            this.drawCircles();

            areq = window.requestAnimationFrame(() => this.drawAnimation());


        }
        // Чтобы такой херни не было, нужно было программно хотя бы поставить проверку дельты:
        // //this.lastTs = 0; в конструкторе
        // static delta = 60 / 1000;//~0.16мс
        // drawAnimation(ts) { //взяли параметры, который requestAnimationFrame подпихивает в колбэк
        //     areq = window.requestAnimationFrame(() => this.drawAnimation());
        //     // Отрисовываем, если прошло достаточно времени
        //     const currentDelta = (ts-lastTs) / 1000;
        //     if (currentDelta > delta)
        //     {
        //         this.clearCanvas();
        //         this.drawCircles();   
        //         lastTs = ts; 
        //     }
        // }
        // По моему личному опыту поверхностного изучения геймдева это чуть ли не первое, чему учат в
        // организации циклов отрисовки.
}

// Опять глобальная перменная без причины
const colors = [
    "#bf1765",
    "#3eedcd",
    "#beed3e",
    "#a930ff",
    "#ff8e2b",
    "#27f2d7",
];

// Ну тут +-, но по стилю написания кажется, что это чужой код.
class Circle {
    constructor(w, h, minR, maxR) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * (maxR - minR) + minR;
        this.firstColor = colors[Math.floor(colors.length * Math.random())];
        this.secondColor = colors[Math.floor(colors.length * Math.random())] + "00";
    }
    draw(ctx, speed) {
        this.angle += speed;
        const x = this.x + Math.cos(this.angle) * 200;
        const y = this.y + Math.sin(this.angle) * 200;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
        gradient.addColorStop(0, this.firstColor);
        gradient.addColorStop(1, this.secondColor);
        ctx.globalCompositeOperation = `overlay`;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Есть Circle, а есть GuidedCircle.
// Почему второй не наследуется от первого, а является его слегка измененной копипастой?
// Тут надо или крестик снять и не использовать Java-стиль ООП, или трусы надеть и трахать
// SOLID, что называется. И в любом случае ебаный DRY(Don't reapeat yourself) соблюдать надо.
// Да он еще и не используется...
class GuidedCircle {
    constructor(radius) {
        this.radius = radius;
        this.firstColor = colors[Math.floor(colors.length * Math.random())] + "77";
        this.secondColor = colors[Math.floor(colors.length * Math.random())] + "00";
    }
    draw(ctx, speed) {
        const x = mouseOffsetX;
        const y = mouseOffsetY;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
        gradient.addColorStop(0, this.firstColor);
        gradient.addColorStop(1, this.secondColor);
        ctx.globalCompositeOperation = `overlay`;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Естественно, что функция никогда не захлопнется, пока кодер не догадается,
// что нужно остановить анимацию через глобальную переменную areq. Заебись.
startGradient = () => {
    gradient = new GradientAnimation();
};
// end gradient.js

// assembly.js
// Опять глобальная перменная без причины
let currentDestroy;

// Было
function loadScene(name, onload, ondestroy) {
    return fetch(name + ".html")
        .then((response) => {
            return response.text();
        })
        .then(insertScene(onload, ondestroy));
}

// Стало
//const loadScene = async(name, onload, ondestroy) => {
//    const response = await fetch(name + ".html");
//    // А тут могла быть одна строчка вместо двух. Кучи кода ради куч кода.
//    const curryingForCurryingReasonWTF = insertScene(onload, ondestroy);
//    return curryingForCurryingReasonWTF(response.text());
//};

// Пояснение: async/await - стандарт де факто.
// Вопрос: что будет, если fetch провалится?
// Ответ: отвал в промисе.
// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
// curryingForCurryingReasonWTF пояснен в insertScene

// Наверняка и для этой глобальной переменной есть причина. Нет? Так какого хуя оно здесь?
// Это уже нихуя не смешно, потому что нужно скакать по всему коду, чтобы найти, где же происходят
// сайд-эффекты и почему "там null оказался".
let root;

// Функция называется parsePage, а парсиься здесь ебаное нихуя, просто append элемента.
function parsePage(page_source) {
    root = null;
    root = document.createElement("div");
    root.innerHTML = page_source;
    return root;
}

// Опять глобальная перменная без причины
let areq = null;

// Почему эта функция закаррирована? В чем причина?
// Вопросы для проверки целесообразности каррирования(хотя бы один ответ "да", значит используем):
// 1) Используется замыкание функции с сингнатурой (onload, ondestroy) внутри функции с 
// сигнатурой (page_source)?
// 2) Организуется HOC? Для не умеющих гуглить: позже, на основе этой функции мы создаем
// несколько функций-дерривативов, в которые инкапсулируем частичный результат.
// 3) Это попытка уменьшить количество аргументов, перевалившее за десяток?
// В 3 случае еще стоит подумать, нужно ли каррирование, или все-таки лучше перестать быть мудаком и
// распилить этот кусок недоразумения на несколько функов.
const insertScene = (onload, ondestroy) => (page_source) => {
    body = parsePage(page_source);
    body.classList.add("slide");
    //Эта переменная как-то потом меняется? Нет. Нахуя тут let, а не const?
    let slide_container = document.getElementById("slide-container");
    let slide = slide_container.querySelector(".slide");
    if (body.classList.contains("animation")) {
        window.cancelAnimationFrame(areq);
    }
    if (body.classList.contains("background")) {
        let bg = document.getElementById("background");
        if (bg) {
            slide_container.removeChild(bg);
        }
        // Что e?
        e;
        clearBg();
    }
    if (body.classList.contains("audio")) {
        document.dispatchEvent(new Event("stop_playing"));
    }
    slide_container.removeChild(slide);
    // Во-первых, GC и без этого спокойно соберет мусор, как только scope закончится,
    // во-вторых: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/delete
    // "delete эффективен только применительно к свойствам объектов. 
    // Он не оказывает никакого влияния на имена переменных и функций."
    delete slide;
    if (currentDestroy) {
        currentDestroy();
    }
    currentDestroy = ondestroy;
    endPending();
    slide_container.appendChild(body);
    return onload();
};

// Опять глобальная перменная без причины
let pages = new Array();
// Опять глобальная перменная без причины
let currentIndex = -1;

function loadPage() {
    currentIndex = loadProgress();
    let new_page = pages[currentIndex];
    if (new_page) {
        return loadScene(new_page.name, new_page.onload, new_page.ondestroy);
    }
}

// Функция называется nextPage... Посмотрим внутрь:
function nextPage() {
    let new_page = pages[currentIndex + 1];
    if (new_page) {
        currentIndex += 1;
        saveProgress(currentIndex);
        return loadScene(new_page.name, new_page.onload, new_page.ondestroy);
    }
}
// Агакакскажешь, милая функа. Следующая страница, но еще сайд-эффекты в виде сохранения и
// изменения глобальной переменной.

// Эта функция используется ровно в одном месте. И её вызов длиннее,
// чем написать pages = newPages;
function setPageList(newPages) {
    pages = newPages;
}

document.body.addEventListener("finish_scene", () => {
    nextPage();
});

// end assembly.js

// bookmarks.js
// Опять глобальная перменная без причины
const conrgatsDelay = 1500;
// Опять глобальная перменная без причины
const nextDelay = 2500;

const scrollFlow = () => {
    const flow = document.getElementById("reference-flow");
    flow.scrollTo({ top: flow.scrollHeight, behavior: "smooth" });
};

function showNext() {
    let nextRef = document.querySelector("bookmark-reference.willing");
    if (nextRef) {
        nextRef.classList.remove("hidden");
        nextRef.classList.remove("willing");
    } else {
        // ТАК ВОТ ПОЧЕМУ ЭТО ГОВНО С ОПРЕДЕЛЕНИЯМИ НЕ СКИПАЛОСЬ
        setTimeout(() => {
            sparkle(document.body);
            sendEmotion(false, "s:wonders");
        }, conrgatsDelay);
        setTimeout(() => {
            let b = document.createElement("div");
            b.classList.add("button-next");
            b.classList.add("white");
            b.onclick = finishScene;
            let p = document.createElement("p");
            p.innerText = "→";
            b.appendChild(p);
            document.getElementById("to-next").appendChild(b);
            scrollFlow();
        }, nextDelay);
    }
    scrollFlow();
}
// Опять класс, да еще и наследующийся, ну надо же. Тааак:
class Reference extends HTMLElement {
    // Этот конструктор нахуй не нужен. Совсем.
    constructor() {
            super();
        }
        // Так это колбэк или всё же хандлер?
        // И как эту простыню читать? Автор, тебе было удобно?
    connectedCallback() {
        this.word = this.getAttribute("word");
        let bookmarks = currentBookmarks();
        // Переменные одной буквы считаются чем-то хорошим 
        // только после бандлинга, минификации и обфускации.
        let b = bookmarks.filter((b) => {
            return b.word == this.word;
        });
        const template = document.querySelector(
            "template#bookmark-reference"
        ).content;
        const shadowRoot = this.attachShadow({ mode: "open" }).appendChild(
            template.cloneNode(true)
        );
        // Вот эта функа могла бы стать отдельным членом класса. Но нет, разраб
        // шлёт читателя кода(и себя в том числе) нахуй. Спасибо, ебать.
        const open = () => {
            this.classList.add("open");
            this.shadowRoot
                .querySelector(".bookmark-reference")
                .classList.add("open");
        };
        if (b.length > 0) {
            if (b[0].researched) {
                this.classList.add("open");
                this.shadowRoot
                    .querySelector(".bookmark-reference")
                    .classList.add("open");
            } else {
                this.classList.add("willing");
                this.classList.add("hidden");
            }
        } else {
            this.classList.add("hidden");
        }
        // Опять автор посылает всех нахуй.
        const tryOpen = () => {
            // А реверснуть выражение в if и выпилить "{} else" не?
            if (document.querySelector("bookmark-reference.click-block")) {} else {
                open();
                researchBookmark(this.word);
                showNext();
                this.removeEventListener("click", tryOpen);
            }
        };
        this.addEventListener("click", tryOpen);
    }
}

// И зачем это существует? В чем глубокий смысл этого куска мертвого кода?
function updateRefs() {
    let focused = refs.some((r) => {
        return r.classList.contains("focus");
    });
    refs.forEach((r) => {
        if (!r.classList.contains("open")) {}
    });
}

function randint(b) {
    return Math.floor(Math.random() * b);
}

// Опять глобальная перменная без причины
const sparkle_offset = 10;
// Опять глобальная перменная без причины
const DESTROY_TIMEOUT = 1000;

// И снова автор шлет нахуй читабельность. Ок.
function sparkle(elem) {
    elem.classList.add("click-block");
    // Это код из продакшна, оцените:
    console.log("sparkle!");
    // когда вы проводите важный феминистический ресёрч в этой игре, консоль отладки каждый раз такая:
    // sparkle!
    // sparkle!
    // sparkle!
    // sparkle!
    // sparkle!
    // sparkle!
    // Это таааак мииииило!
    let rect = elem.getBoundingClientRect();
    let canvas = document.createElement("canvas");
    let true_width = rect.right - rect.left;
    let true_height = rect.bottom - rect.top;
    canvas.width = true_width + 2 * sparkle_offset;
    canvas.height = true_height + 2 * sparkle_offset;
    canvas.style.left = rect.left - sparkle_offset + "px";
    canvas.style.top = rect.top - sparkle_offset + "px";
    canvas.style.zIndex = 10;
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);
    let ctx = canvas.getContext("2d");
    let particles = new Array();
    for (i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * true_width + sparkle_offset,
            y: Math.random() * true_height + sparkle_offset,
            color: "rgb(" + randint(256) + "," + randint(256) + "," + randint(256) + ")",
        });
    }
    let velocity = 0.002;
    let play = true;
    let prev = null;
    step = (cur) => {
        if (prev == null) {
            prev = cur;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 4, 4);
            p.x += (p.x - true_width / 2 - sparkle_offset) * velocity * (cur - prev);
            p.y += (p.y - true_height / 2 - sparkle_offset) * velocity * (cur - prev);
        });
        prev = cur;
        if (play) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
    // Весь предыдущий блок step был написан настолько неправильно, настолько без понимания 
    // что и в каком потоке должно происходить, что пришлось
    // пристрелить эту одноногую собаку из жалости по таймауту
    setTimeout(() => {
        play = false;
        document.body.removeChild(canvas);
        elem.classList.remove("click-block");
    }, DESTROY_TIMEOUT);
}
customElements.define("bookmark-reference", Reference);
// end bookmarks.js

// finish_scene.js
// Опять глобальная перменная без причины
const pending_delay = 200;
// Опять глобальная перменная без причины
let pending_finish = false;

function finishScene() {
    if (!pending_finish) {
        pending_finish = true;
        document.body.dispatchEvent(new Event("finish_scene"));
    }
}

function endPending() {
    pending_finish = false;
}
// end finish_scene.js

// track.js
// Опять глобальная перменная без причины.
// Да еще и со старым оператором объявления, который работает неочевидным образом.
// Подробности на medium.com: shorturl.at/qKPQ5
// Да еще и самымые "подходящие" имена в глобале.
var width, height;

function updateWindowParams() {
    height = window.innerHeight;
    width = window.innerWidth;
}
// Опять глобальная перменная без причины.
var mouseOffsetX = 0;
// Опять глобальная перменная без причины.
var mouseOffsetY = 0;
// Опять глобальная перменная без причины.
var moveX = 0;
// Опять глобальная перменная без причины.
var moveY = 0;

// Теперь я понял, почему var. Код сворован из интернета и даже не адаптирован.
// К оригинальному коду у меня претензий нет, так что без комментариев.
function trackMouse(e) {
    var rect = e.currentTarget.getBoundingClientRect();
    mouseOffsetX = e.clientX - rect.left;
    mouseOffsetY = e.clientY - rect.top;
    moveX = (2 * mouseOffsetX) / width - 1;
    moveY = (2 * mouseOffsetY) / height - 1;
}

function setTrack() {
    updateWindowParams();
    window.dispatchEvent(new Event("loaded"));
    window.dispatchEvent(new Event("size_update"));
    window.addEventListener("resize", () => {
        updateWindowParams();
        window.dispatchEvent(new Event("size_update"));
    });
    document.body.addEventListener("mousemove", trackMouse);
}
// end track.js

// utils.js
// Индекс эмо - это показатель степени сгорания сентября?
// Еще и бывший фейсбук зачем-то приплетён...
function emoindex(meta) {
    speaker = meta.getAttribute("speaker");
    emotion = meta.getAttribute("emotion");
    return speaker + ":" + emotion;
}
//А вообще, если без шуток, да кто такой этот ваш meta?!
// Meta, huh?..

function sendEmotion(isleft, emoindex, jump = false) {
    ev = new CustomEvent("update_emotion", {
        detail: { isleft, emotion_index: emoindex, jump },
    });
    document.dispatchEvent(ev);
}

function sendVibe(vibe) {
    ev = new CustomEvent("switch_vibe", { detail: { vibe } });
    document.dispatchEvent(ev);
}
// end utils.js

// sound.js
// Опять глобальная перменная без причины.
let sound_cache = {};
// Опять глобальная перменная без причины.
let sound_volume = -10;

function cacheSound(name, callback = () => {}) {
    let player = new Tone.Player(
        "assets/sound/" + name + ".ogg",
        callback
    ).toDestination();
    sound_cache[name] = player;
    return player;
}

function playSound(name, volume = 0) {
    if (Tone.context.state !== "running") {
        return;
    }
    let player = sound_cache[name];
    if (player == null) {
        player = cacheSound(name, () => {
            player.start();
        });
    } else {
        player.start();
    }
    player.volume.value = sound_volume + volume;
}
["typing", "notif", "powerup", "consume", "absorb3"].forEach((n) => {
    cacheSound(n);
});
// end sound.js

// music.js
function vibe_audio(name) {
    let a = new Tone.Player(
        "assets/music/vibes/" + name + ".mp3"
    ).toDestination();
    a.loop = true;
    a.volume.value = -30;
    a.volume.mute = true;
    return a;
}
// Опять глобальная перменная без причины.
let current_playing = new Array();
// Опять глобальная перменная без причины.
let mus_vibes = ["basic", "nervous", "insight", "calm"];
// Опять глобальная перменная без причины. Да блядь, когда это закончится?
let vibes_audio = {
    basic: vibe_audio("basic"),
    nervous: vibe_audio("nervous"),
    insight: vibe_audio("insight"),
    calm: vibe_audio("calm"),
};
// Опять глобальная перменная без причины.
let current_vibe = "basic";
// Опять глобальная перменная без причины.
let music_audio = {};

function playMusic(name, volume = 0) {
    if (Tone.context.state !== "running") {
        // А, ну то есть, если контекст не загрузился, то похуй,
        // без музыки поиграет, да?
        return;
        // Хотя я бы тут вообще убрал if и сделал бы return безусловным.
    }
    // a - это когда настолько лень придумать нормальное название переменной,
    // что еле сдерживаешься написать ЖОПА, или ХУЙ, или что-там обычно кричат с копролалией.
    let a = music_audio[name];
    if (a == null) {
        a = new Tone.Player("assets/music/" + name + ".mp3").toDestination();
        a.volume.value = volume;
        music_audio[name] = a;
        Tone.loaded().then(() => {
            a.start();
        });
    } else {
        a.volume.value = volume;
        a.start();
    }
    current_playing.push(a);
}
// Опять глобальная перменная без причины.
const crossFadeDelay = 2;
// Опять глобальная перменная без причины.
const startStopDelay = 1;

function startVibe() {
    if (Tone.context.state !== "running") {
        return;
    }
    Tone.loaded().then(() => {
        // А если в предыдущем промисе из loaded что-то пошло не так, то всё наебнётся нахуй.
        mus_vibes.forEach((vibe) => {
            let a = vibes_audio[vibe];
            a.start();
            if (vibe == current_vibe) {
                a.volume.value = -30;
                a.volume.mute = false;
                a.volume.rampTo(0, startStopDelay);
            }
            current_playing.push(a);
        });
    });
}

// Опять абсолютно ненужный кусок мертвого кода
function v_d(v, d) {
    return Math.max(Math.min(v + d, 1), 0);
}

function switchVibe(new_vibe) {
    // Продолжается посыл юзера нахуй со звуками
    if (Tone.context.state !== "running") {
        return;
    }

    if (new_vibe == current_vibe) {
        return;
    }
    vibes_audio[new_vibe].volume.rampTo(0, crossFadeDelay);
    vibes_audio[current_vibe].volume.rampTo(-30, crossFadeDelay);
    setTimeout(() => {
        vibes_audio[current_vibe].volume.mute = true;
    }, crossFadeDelay);
    current_vibe = new_vibe;
}

function stopPlaying() {
    current_playing.forEach((a) => {
        a.stop("+" + startStopDelay);
        a.volume.rampTo(-30, startStopDelay);
    });
    current_playing = new Array();
}
document.addEventListener("play_vibe", startVibe);
document.addEventListener("switch_vibe", (d) => {
    console.log("update vibe", d.detail.vibe);
    switchVibe(d.detail.vibe);
});
document.addEventListener("stop_playing", stopPlaying);
// end music.js

// chat.js
// Так, сейчас будет опять интересно.
class ExtRef extends HTMLAnchorElement {

    constructor() {
        super();
        this.setAttribute("target", "_blank");
        this.setAttribute("href", this.innerText);
    }
}
customElements.define("ext-ref", ExtRef, { extends: "a" });
// А, нет, это просто определение ёбаного нихуя непонятно зачем.

// Опять глобальная перменная без причины.
let current_branch = null;

function getNextLine() {
    if (current_branch) {
        let node = current_branch.querySelector(".line:not(.taken)");
        if (node) {
            return node;
        } else {
            current_branch.parentNode.classList.add("taken");
            current_branch = null;
        }
    }
    return document.querySelector("#dialogue > *:not(.taken)");
}
// Опять глобальная перменная без причины.
let player_emotion = null;

function setEmotion(left, emoindex, jump = false) {
    // Так left же потом передается в sendEmotion, зачем это здесь?
    // Или зачем это там? Вообще, непонятно, почему эти три параметра протягиваются
    // через эту спагеттину.
    if (!left) {
        player_emotion = emoindex;
    }
    sendEmotion(left, emoindex, jump);
}
// Опять глобальная перменная без причины.
const autoplayDelay = 500;
// Опять глобальная перменная без причины.
const pauseEmotionDelay = 1600;
// Опять глобальная перменная без причины.
const pauseDelay = 2000;
// Опять глобальная перменная без причины.
let optionsContainer = null;

function setBubbleBoxHeight() {
    const dialogue_box = document.getElementById("dialogue-box");
    const bubble_box = document.getElementById("bubble-box");
    const dh = parseInt(window.getComputedStyle(dialogue_box).height, 10);
    const by = parseInt(window.getComputedStyle(bubble_box).bottom, 10);
    bubble_box.style.height = dh - by + "px";
}

function prepareHighlight(highlights) {
    const highlight_box = document.getElementById("highlight-box");
    optionsContainer = document.createElement("div");
    setBubbleBoxHeight();
    highlights.forEach((h) => {
        if (h.classList.contains("option")) {
            const line = h.parentNode;
            const branch = line.parentNode;
            if (branch.tagName == "BRANCH") {
                h.branch = branch;
            }
            const meta = line.querySelector("linemeta");
            h.emotion = emoindex(meta);
            const type = meta.getAttribute("type");
            if (type) {
                h.type = type;
                countType(type);
            }
            h.addEventListener("mouseover", (e) => selectOption(h));
            h.addEventListener("mouseout", (e) => selectOption(null));
            h.addEventListener("click", (e) => proceedOption(h));
        } else if (h.classList.contains("bookmark")) {
            h.addEventListener("click", (e) => proceedBookmark(highlight_box));
        }
        optionsContainer.appendChild(h);
    });
    if (highlights.length > 1) {
        optionsContainer.classList.add("options");
        optionsContainer.children[0].classList.add("left");
        optionsContainer.children[1].classList.add("right");
    }
    highlight_box.appendChild(optionsContainer);
}

function addChatListeners() {
    window.addEventListener("size_update", setBubbleBoxHeight);
    document.addEventListener("keyup", handleKeyboard);
}

function removeChatListeners() {
    window.removeEventListener("size_update", setBubbleBoxHeight);
    document.removeEventListener("keyup", handleKeyboard);
}

function cleanHighlight() {
    optionsContainer.parentNode.removeChild(optionsContainer);
    optionsContainer = null;
}

function selectOption(option_, by_index = false) {
    let options = optionsContainer.querySelectorAll(".option");
    options.forEach((o) => {
        o.classList.remove("selected");
    });
    let option = null;
    if (by_index) {
        if (options.length == 1) {
            option = options[0];
        } else {
            option = options[option_];
        }
    } else {
        option = option_;
    }
    if (option) {
        sendEmotion(false, option.emotion);
        option.classList.add("selected");
    } else {
        sendEmotion(false, player_emotion);
    }
}

function selectedOption() {
    let options = optionsContainer.querySelectorAll(".option,.bookmark");
    if (options.length == 1) {
        return options[0];
    } else {
        return optionsContainer.querySelector(".option.selected");
    }
}

function proceedBookmark(highlight_box) {
    animate_flyaway(highlight_box);
    rememberBookmark(highlight_box.innerText);
    nextline(true);
    cleanHighlight();
    playSound("absorb3");
}

function proceedOption(option = null) {
    if (option) {
        current_branch = option.branch;
    }
    if (option.type) {
        countSelectedType(option.type);
    }
    nextline(true);
    cleanHighlight();
}
const chatProceed = () => {
    activateHighlight(true);
};

function activateHighlight(ignore_selection = false) {
    let option;
    if (optionsContainer == null) {
        return;
    }
    if (ignore_selection) {
        option = optionsContainer.querySelector(".option");
    } else {
        option = optionsContainer.querySelector(".option.selected");
    }
    if (option) {
        proceedOption(option);
    } else if (optionsContainer.querySelector(".bookmark")) {
        proceedBookmark(optionsContainer.parentNode);
    }
}
const handleKeyboard = (e) => {
    if (optionsContainer) {
        if (e.code == "Space") {
            activateHighlight();
        }
        if (e.code == "ArrowLeft") {
            selectOption(0, true);
        }
        if (e.code == "ArrowRight") {
            selectOption(1, true);
        }
    } else {
        if (e.code == "Space") {
            const lineNode = currentLineNode;
            if (lineNode.classList.contains("shown")) {
                clearTimeout(nextLineTimeout);
                nextline(true);
            }
            jumpToBubbleFinal(lineNode);
        }
    }
};

function setBubbleColor(left, color) {
    if (color == null) {
        return;
    }
    let pref = left ? "left" : "right";
    let root = document.documentElement;
    root.style.setProperty("--" + pref + "-bubble-color", "#" + color);
}

function initializeDialogue() {
    preloadEmotions(document.querySelectorAll("#dialogue linemeta"));
    document.querySelectorAll("#dialogue .line.init").forEach((line) => {
        let meta = line.querySelector("linemeta");
        let left = line.classList.contains("left");
        let speaker = meta.getAttribute("speaker");
        preloadBackground(left, speaker);
        setBubbleColor(left, meta.getAttribute("bubble_color"));
        addForeground(left, speaker, meta.getAttribute("foreground"));
        setEmotion(left, emoindex(meta));
    });
    nextline(true);
}
// Опять глобальная перменная без причины.
let nextLineTimeout;

// Зачем так душить? Просто душит и душит, душит и душит этой макарониной.
function nextline(force_instant = false) {
    let bind = true;
    const currentLine = getNextLine();
    if (currentLine) {
        let delay = 0;
        let highlights = currentLine.querySelectorAll(".highlight");
        let bubble = currentLine.querySelector(".bubble");
        if (highlights.length) {
            prepareHighlight(highlights);
            if (highlights[0].classList.contains("bookmark")) {
                currentLine.classList.add("bookmark");
            }
            bind = false;
        }
        if (currentLine.classList.contains("pause")) {
            delay = 1000;
        }
        if (currentLine.classList.contains("typing") && !force_instant) {
            delay = pauseDelay;
            typing_bubble = document.createElement("div");
            typing_bubble.classList.add("bubble");
            typing_bubble.appendChild(
                document.querySelector("components .wave").cloneNode(true)
            );
            prepareHighlight([typing_bubble]);
            setTimeout(() => {
                cleanHighlight(false, false);
            }, pauseDelay);
        }
        if (currentLine.classList.contains("vibe")) {
            let meta = currentLine.querySelector("linemeta");
            sendVibe(meta.getAttribute("vibe"));
        }
        if (highlights.length) {
            bind = false;
        } else {
            if (bubble && !currentLine.classList.contains("bookmark")) {
                delay = showBubble(currentLine, force_instant);
            }
        }
        if (bind) {
            currentLine.classList.add("taken");
            nextLineTimeout = setTimeout(nextline, delay + autoplayDelay);
        }
    } else {
        let button = document.querySelector("components .button-next");
        if (button) {
            prepareHighlight([button.cloneNode(true)]);
        } else {
            finishScene();
        }
    }
}

function animate_flyaway(node, duration = 500) {
    let rect = node.getBoundingClientRect();
    box = node.cloneNode((deep = true));
    box.style.position = "absolute";
    box.style.width = rect.right - rect.left;
    box.style.height = rect.bottom - rect.tops;
    box.style.margin = "0";
    box.style.left = rect.x + "px";
    box.style.top = rect.y + "px";
    box.style.transition = "all " + duration + "ms" + " ease-out";
    box.style.opacity = "1";
    box.style.transform = "translateX(0)";
    document.body.appendChild(box);
    setTimeout(() => {
        box.style.transform = "translateX(20em)";
        box.style.opacity = "0";
    }, 10);
    setTimeout(() => {
        document.body.removeChild(box);
    }, duration);
}
// Опять глобальная перменная без причины.
let currentLineNode;
// Опять глобальная перменная без причины.
let poisitioned_TO, shown_TO, notif_TO, text_appear_TO;
// Опять глобальная перменная без причины.
// Опять глобальная перменная без причины.
const microDelay = 20;
// Опять глобальная перменная без причины.
const positioningDelay = 500;
// Опять глобальная перменная без причины.
const typingDurationLong = 1700;
// Опять глобальная перменная без причины.
const typingDurationShort = 600;
// Опять глобальная перменная без причины.
const textAppearDelay = 250;

// Так. Стоп, стоп. Вот тут это бросается больше всего в глаза:
// первый параметр - camelCase
// второй и третий - under_score
// Или кодер юзает одну конвенцию именований, или идет нахуй из программирования.
function showBubble(currentLine, force_instant, additional_delay = 0) {
    currentLineNode = currentLine.cloneNode(true);
    const lineNode = currentLineNode;
    const bubble = lineNode.querySelector(".bubble");
    const meta = lineNode.querySelector("linemeta");
    const highlight = lineNode.querySelector(".highlight");
    const bubble_box = document.querySelector("#bubble-box");
    bubble_box.insertBefore(lineNode, bubble_box.firstChild);
    if (highlight) {
        lineNode.removeChild(highlight);
    }
    const islong = lineNode.classList.contains("pause");
    const isinstant = lineNode.classList.contains("instant") || force_instant;
    const jump = lineNode.classList.contains("jump");
    lineNode.classList.add("appeared");
    const bubble_style = window.getComputedStyle(bubble, null);
    const b_width = bubble_style.getPropertyValue("width");
    const b_height = bubble_style.getPropertyValue("height");
    if (isinstant) {

        positioned_TO = setTimeout(() => {
            if (lineNode.classList.contains("blocked")) {
                return;
            }
            lineNode.classList.add("positioned");
            setEmotion(lineNode.classList.contains("left"), emoindex(meta), jump);
            lineNode.classList.add("notified");
            lineNode.classList.add("shown");
            currentLine.classList.add("shown");
            playSound("notif");
        }, additional_delay + microDelay);
        return additional_delay + microDelay;
    }
    lineNode.classList.add("texthide");
    typingDots = document.querySelector("components .wave").cloneNode(true);
    bubble.appendChild(typingDots);
    lineNode.classList.add("typing");
    lineNode.classList.add("appeared");
    dialogue.scrollTop = dialogue.scrollHeight;
    positioned_TO = setTimeout(() => {
        if (lineNode.classList.contains("blocked")) {
            return;
        }
        lineNode.classList.add("positioned");
        setEmotion(lineNode.classList.contains("left"), emoindex(meta), jump);
        var typing_bubble_style = window.getComputedStyle(bubble, null);
        bubble.style.width = typing_bubble_style.getPropertyValue("width");
        bubble.style.height = typing_bubble_style.getPropertyValue("height");
        playSound("typing");
    }, additional_delay + microDelay);
    shown_TO = setTimeout(() => {
        if (lineNode.classList.contains("blocked")) {
            return;
        }
        currentLine.classList.add("shown");
        lineNode.classList.add("shown");
    }, additional_delay + positioningDelay);
    const typingDuration = islong ? typingDurationLong : typingDurationShort;
    notif_TO = setTimeout(() => {
        if (lineNode.classList.contains("blocked")) {
            return;
        }
        bubble.style.width = b_width;
        bubble.style.height = b_height;
        lineNode.classList.remove("typing");
        lineNode.classList.add("notified");
        playSound("notif");
    }, additional_delay + positioningDelay + typingDuration);
    text_appear_TO = setTimeout(() => {
        if (lineNode.classList.contains("blocked")) {
            return;
        }
        bubble.style.width = null;
        bubble.style.height = null;
        lineNode.classList.remove("texthide");
        bubble.scrollIntoView();
    }, additional_delay + positioningDelay + typingDuration + textAppearDelay);
    return additional_delay + positioningDelay + typingDuration + textAppearDelay;
}

function jumpToBubbleFinal(node) {
    node.classList.add("blocked");
    const lineNode = node;
    const bubble = lineNode.querySelector(".bubble");
    const meta = lineNode.querySelector("linemeta");
    lineNode.classList.add("shown");
    bubble.style.width = null;
    bubble.style.height = null;
    lineNode.classList.remove("typing");
    lineNode.classList.remove("texthide");
    bubble.scrollIntoView();
    if (!lineNode.classList.contains("notified")) {
        lineNode.classList.add("notified");
        playSound("notif");
    }
    let jump = lineNode.classList.contains("jump");
    setEmotion(lineNode.classList.contains("left"), emoindex(meta), jump);
}
// end chat.js

// bg_scene.js
// Опять глобальная перменная без причины.
let sprite_l, sprite_r;
// Опять глобальная перменная без причины.
let background_l, background_r;
// Опять глобальная перменная без причины.
let foreground_l, foreground_r;
// Опять глобальная перменная без причины.
let overlapMode = false;
// Опять глобальная перменная без причины.
let drawLeft;
// Опять глобальная перменная без причины.
let emotions = {};
// Опять глобальная перменная без причины.
let c, cl, cr;
// Опять глобальная перменная без причины.
let ctx, clx, crx;
// Опять глобальная перменная без причины.
cl = document.createElement("canvas");
// Опять глобальная перменная без причины.
cr = document.createElement("canvas");
// Опять глобальная перменная без причины.
crx = cr.getContext("2d");
// Опять глобальная перменная без причины.
clx = cl.getContext("2d");

function clearBg() {
    sprite_l = new Image();
    sprite_r = new Image();
    background_l = new Image();
    background_r = new Image();
    foreground_l = new Array();
    foreground_r = new Array();
}

function preloadEmotions(metas) {
    emotions = null;
    emotions = {};
    metas.forEach((meta) => {
        img = new Image();
        img.src =
            "assets/sprites/" +
            meta.getAttribute("speaker") +
            "_" +
            meta.getAttribute("emotion") +
            ".svg";
        emotions[emoindex(meta)] = img;
    });
}

function preloadBackground(left, speaker) {
    url = "assets/backgrounds/" + speaker + "_background.svg";
    let resource;
    if (left) {
        background_l.src = url;
        resource = background_l;
    } else {
        background_r.src = url;
        resource = background_r;
    }
    resource.onload = () => {
        updateScale();
    };
}

function addForeground(left, speaker, name) {
    if (name == null) {
        return;
    }
    img = new Image();
    img.src = "assets/backgrounds/" + speaker + "_" + name + ".svg";
    if (left) {
        foreground_l.push(img);
    } else {
        foreground_r.push(img);
    }
}

function getEmotion(emoind) {
    if (emoind in emotions) {
        return emotions[emoind];
    } else {
        img = new Image();
        img.src =
            "assets/sprites/" +
            emoind.split(":")[0] +
            "_" +
            emoind.split(":")[1] +
            ".svg";
        return img;
    }
}
// Опять глобальная перменная без причины.
const dividerThickness = 4;
// Опять глобальная перменная без причины.
const slopeTg = 0.1;
// Опять глобальная перменная без причины.
let slopeStep;
// Опять глобальная перменная без причины.
let stepOffset = 0;
// Опять глобальная перменная без причины.
let stepOffsetAmp;
// Опять глобальная перменная без причины.
const offset_delay = 300;
// Опять глобальная перменная без причины.
const side_offset = 50;
// Опять глобальная перменная без причины.
var lOffset = side_offset;
// Опять глобальная перменная без причины.
var rOffset = side_offset;
// Опять глобальная перменная без причины.
let lj = 0,
    rj = 0;

function updateFrame() {
    c.width = width;
    c.height = height;
    ctx = c.getContext("2d");
    ctx.strokeStyle = "#152424";
    ctx.lineWidth = dividerThickness;
    updateScale();
    // Ещё немного pasta 🤌 от шефа "кило мяу"
    if (drawLeft) {
        cr.width = Math.max(width / 2 + slopeStep - stepOffset, 1);
        cr.height = height;
        // И в итоге мы совсем скатились в игру "робот, который выполняет команды"...
        crx.beginPath();
        crx.moveTo(0, height);
        crx.lineTo(cr.width, height);
        crx.lineTo(cr.width, 0);
        crx.lineTo(2 * slopeStep, 0);
        crx.closePath();
        crx.clip();
        // ...который скачет по контекстам
        cl.width = Math.max(width / 2 + slopeStep + stepOffset, 1);
        cl.height = height;
        // ...и продолжает откладывать кучи кода в одну функцию.
        clx.beginPath();
        clx.moveTo(0, 0);
        clx.lineTo(cl.width, 0);
        clx.lineTo(cl.width - 2 * slopeStep, height);
        clx.lineTo(0, height);
        clx.closePath();
        clx.clip();
    }
}
// Опять глобальная перменная без причины.
const drag = 20;
// Опять глобальная перменная без причины.
const scale_eps = 0.02;
// Опять глобальная перменная без причины.
var width_bl, width_sl, width_br, width_sr, t_height;
const wscale = (sp) => {
    return sp.width * (t_height / sp.height);
};

// Говорящее имя. Оно нарисует же мне единичку?
function draw1(totalTime) {
    ctx.drawImage(background_r, 0, -drag, width_br, t_height);
    ctx.drawImage(
        background_r,
        drag * moveX * 0.5 + width - width_br + widthPenalty / 2, -drag,
        width_br,
        t_height
    );
    ctx.drawImage(
        sprite_r,
        drag * moveX - drag + width - width_sr + widthPenalty / 2,
        drag * moveY * 0.2 - drag,
        width_sr,
        t_height
    );
    foreground_r.forEach((f) => {
        ctx.drawImage(
            f,
            drag * moveX * 1.3 + width - width_br + widthPenalty / 2, -drag,
            width_br,
            t_height
        );
    });
}

// Опять глобальная перменная без причины.
const drag_intensity = 0.001;

// А эта функа нарисует двоечку, ведь да же?
function draw2(totalTime) {
    clx.drawImage(
        background_l, -drag * moveX * 0.5 - drag - lOffset - widthPenalty / 2, -drag,
        width_bl,
        t_height
    );
    crx.drawImage(
        background_r,
        drag * moveX * 0.5 + cr.width - width_br + rOffset + widthPenalty / 2, -drag,
        width_br,
        t_height
    );
    clx.drawImage(
        sprite_l, -drag * moveX - drag - lOffset - widthPenalty / 2, -lj + -drag * moveY * 0.2 - drag,
        width_sl,
        t_height
    );
    crx.drawImage(
        sprite_r,
        drag * moveX + rOffset - width_sr + cr.width + widthPenalty / 2, -rj + drag * moveY * 0.2 - drag,
        width_sr,
        t_height
    );
    foreground_l.forEach((f) => {
        clx.drawImage(
            f, -drag * moveX * 1.3 - drag - lOffset - widthPenalty / 2, -drag,
            width_bl,
            t_height
        );
    });
    foreground_r.forEach((f) => {
        crx.drawImage(
            f,
            drag * moveX * 1.3 + cr.width - width_br + rOffset + widthPenalty / 2, -drag,
            width_br,
            t_height
        );
    });
    ctx.drawImage(cl, 0, 0);
    ctx.drawImage(cr, width - cr.width, 0);
    ctx.beginPath();
    ctx.moveTo(width / 2 + slopeStep + stepOffset, 0);
    ctx.lineTo(width / 2 - slopeStep + stepOffset, height);
    ctx.stroke();
}

// Опять глобальная перменная без причины.
let draw = null;

function initBg(left, solid) {
    c = document.querySelector("canvas#background");
    if (c == null) {
        let container = document.getElementById("slide-container");
        if (container == null) {
            container = document.body;
        }
        c = document.createElement("canvas");
        c.setAttribute("id", "background");
        container.appendChild(c);
    }
    c.setAttribute("class", "scene");
    ctx = c.getContext("2d");
    drawLeft = left;
    updateFrame();
    if (solid) {
        draw = drawSolid;
    } else if (left) {
        draw = draw2;
    } else {
        draw = draw1;
    }
    updateBG(0);
}

function animate_jump(left) {
    const delay_step = 25;
    const total_delay = 150;
    const amplitude = 20;
    const steps_amount = total_delay / delay_step;
    const step = amplitude / steps_amount;
    let timer, end;
    if (left) {
        // Ctrl+C
        timer = setInterval(() => {
            lj += step;
        }, delay_step);
        end = () => {
            lj = 0;
        };
    } else {
        // Ctrl+V
        timer = setInterval(() => {
            rj += step;
        }, delay_step);
        end = () => {
            rj = 0;
        };
    }
    setTimeout(() => {
        clearInterval(timer);
        end();
    }, total_delay);
}

function animate(onProgress, duration) {
    let start = performance.now();
    requestAnimationFrame(function animate(time) {
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;
        onProgress(timeFraction);
        if (timeFraction <= 1) {
            requestAnimationFrame(animate);
        }
    });
}
// Опять глобальная перменная без причины.
let widthPenalty = 0;
// Опять глобальная перменная без причины.
const spriteCharacterProportion = 0.4;
// Опять глобальная перменная без причины.
let hideLeft = false;
// Опять глобальная перменная без причины.
let dir = 0;
// Опять глобальная перменная без причины.
const minOffsetAmp = 100;

function updateScale() {
    updateWindowParams();
    t_height = height + 2 * drag;
    width_br = wscale(background_r);
    width_bl = wscale(background_l);
    width_sr = wscale(sprite_r);
    width_sl = wscale(sprite_l);
    slopeStep = height * slopeTg;
    let characterNeededSpace = spriteCharacterProportion * width_sr;
    let freeSideSpace = width / 2 - slopeStep;
    widthPenalty = Math.max(0, characterNeededSpace - width);
    stepOffsetAmp = Math.max(characterNeededSpace - freeSideSpace, 0) || 0;
    if (stepOffsetAmp < minOffsetAmp) {
        stepOffsetAmp = 0;
    }
    stepOffset =
        Math.sign(stepOffset) * Math.min(Math.abs(stepOffset), stepOffsetAmp);
    overlapMode = stepOffsetAmp > 0;
    if (hideLeft) {
        stepOffsetAmp = width / 2 + slopeStep;
    }
}

// Давненько не было объедко-ориентированного костылирования.
// Этот флаг left протаскивался через всю вермишель.
// А можно было сразу определить объект, который сам решает, 
// где ему рисоваться, как повернуть спарйт, какую эмоцию выставить.
// Но нужно больше глобальных переменных и параметров в функциях, поэтому похуй.
function updateEmotion(left, emoIndex) {
    img = getEmotion(emoIndex);
    updateScale();
    if (left) {
        sprite_l = img;
    } else {
        sprite_r = img;
    }
}
// Опять глобальная перменная без причины.
let prevTime = 0;

function moveOffset(totalTime) {
    let _step = (stepOffsetAmp * (totalTime - prevTime)) / offset_delay;
    stepOffset += dir * _step;
    updateFrame();
}
document.addEventListener("update_emotion", (e) => {
    updateEmotion(e.detail.isleft, e.detail.emotion_index);
    dir = e.detail.isleft ? 1 : -1;
    if (e.detail.jump) {
        animate_jump(e.detail.isleft);
    }
});

function updateBG(totalTime) {
    if (dir * stepOffset < stepOffsetAmp) {
        moveOffset(totalTime);
    }
    draw(totalTime);
    prevTime = totalTime;
    areq = requestAnimationFrame(updateBG);
}

function setBg(left = true, solid = false) {
    clearBg();
    initBg(left, solid);
    window.addEventListener("size_update", updateFrame);
}
// end bg_scene.js

// solid_bg.js
// Опять глобальная перменная без причины.
var frameArray = [];
// Опять глобальная перменная без причины.
var totalFrames = 0;
// Опять глобальная перменная без причины.
var currentFrameIndex = 0;
// Опять глобальная перменная без причины.
var currentFrame = null;

function preloadImages() {
    bg = document.querySelector("components #background");
    frameInterval = bg.getAttribute("interval") || 1000;
    document.querySelectorAll("components #background img").forEach((img) => {
        new_img = new Image();
        new_img.src = img.src;
        console.log("preload", img.src);
        frameArray.push(new_img);
        totalFrames += 1;
    });
}

function drawSolid(totalTime) {
    let frameNum = Math.floor(totalTime / frameInterval);
    let frameIndex = frameNum % totalFrames;
    let currentFrame = frameArray[frameIndex];
    var scale = Math.max(
        (height + 2 * drag) / currentFrame.height,
        (width + 2 * drag) / currentFrame.width
    );
    var ctx = c.getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "#152424";
    ctx.fill();
    ctx.drawImage(
        currentFrame, -drag * moveX - drag, -drag * moveY - drag,
        currentFrame.width * scale,
        height + 2 * drag
    );
}

function initSolidBg() {
    draw = drawSolid;
    preloadImages();
    c.classList.add("scene");
    updateBG(0);
    document.body.style.width = window.innerWidth;
    document.body.style.height = window.innerHeight;
    document.body.appendChild(c);
}
// end solid_bg.js

// reflection.js
function showReflection() {
    current = document.querySelector(".reflection.visible");
    if (current) {
        current.classList.remove("visible");
        current.classList.add("shown");
    }
    newref = document.querySelector(".reflection:not(.shown)");
    if (newref) {
        newref.classList.add("visible");
    } else {
        document.querySelector("#reflection-box").style.display = "none";
        finishScene();
    }
}
// end reflection.js

// tw.js
function checkAgreement() {
    document.getElementById("checkbox").classList.add("checked");
    document.getElementById("next").classList.remove("hidden");
}
// end tw.js

// Это единственный, сука, единственный(sic!) почти правильное оформленный файл структуры.
// Но модули всё ещё не завезли и вот оно опять в глобале.
// sprite.js
class Sprite {
    constructor(img, horizontal_amount, vertical_amount, total_amount = -1) {
        this.img = img;
        this.ha = horizontal_amount;
        this.va = vertical_amount;
        this.tile_width = Math.floor(img.width / horizontal_amount);
        this.tile_height = Math.floor(img.height / vertical_amount);
        if (total_amount < 0) {
            this.tile_amount = this.ha * this.va;
        } else {
            this.tile_amount = total_amount;
        }
        this.current = -1;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.tile_width;
        this.canvas.height = this.tile_height;
        this.context = this.canvas.getContext("2d");
    }
    update() {
        let hp = this.current % this.ha;
        let vp = Math.floor(this.current / this.ha);
        this.context.clearRect(0, 0, this.tile_width, this.tile_height);
        this.context.drawImage(
            this.img,
            hp * this.tile_width,
            vp * this.tile_height,
            this.tile_width,
            this.tile_height,
            0,
            0,
            this.tile_width,
            this.tile_height
        );
    }
    _nextFrame() {
        this.current++;
        this.current = this.current % this.tile_amount;
    }
    _setFrame(i) {
        this.current = i;
    }
    nextFrame() {
        this._nextFrame();
        this.update();
    }
    setFrame(i) {
        this._setFrame(i);
        this.update();
    }
    get frame() {
        return this.canvas;
    }
}
// end sprite.js

// Эта херня самая интересная в плане оптим... простите, костылизации.
// Так много строк в этом файле только потому что автору не пришло в голову сделать класс
// SoupGame, который бы управлял циклом игры. И был бы класс Letter, который при клике бы 
// оповещали класс SoupGame, а он в свою очередь решал бы, из какого и в какой массив делать 
// pop/push ссылки Letter. Ну и естественно он бы решал, выиграл_а ли сынок_чница.
// Это первое, что пришло мне в голову, но не автору.
// Вместо этого при клике по канве автор рили делает трассировку указателя мыши, ковыряется в массиве
// анонимных объедков, созданых без функциональной логики. И в процессе ковыряния пытается вычислить 
// коллизию по координатам.
// А логику он производит в двух дополнительных массивах char. Вместо простого pop/push ссылок
// из одного массива в другой.
// Доплнительный кек в том, что в 36 версии Chrome и в 31 версии Firefox уже был Path2D и isPointInPath: 
// https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath
// И с этой штукой не нужно городить велосипеды из кастомных событий, которые бы делали трассировку 
// курсора.
// soup_game.js
Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
};
// Опять глобальная перменная без причины.
let game_canvas = document.createElement("canvas");
game_canvas.classList.add("minigame");
// Опять глобальная перменная без причины.
let context = game_canvas.getContext("2d");
// Опять глобальная перменная без причины.
let alph_tiles_img = new Image();
alph_tiles_img.src = "assets/minigames/soup/alphabet.png";
// Опять глобальная перменная без причины.
let fly_sprite = new Image();
fly_sprite.src = "assets/minigames/soup/fly.png";
// Опять глобальная перменная без причины.
let sound_wrong = new Audio("assets/sound/wrong.ogg");
sound_wrong.volume = 0.2;
// Опять глобальная перменная без причины.
let sound_fail = new Audio("assets/sound/buzz.ogg");
// Опять глобальная перменная без причины.
let sound_win = new Audio("assets/sound/win.ogg");
// Опять глобальная перменная без причины.
const synth = new Tone.Synth().toDestination();
// Опять глобальная перменная без причины.
const total_alph = 32;
// Опять глобальная перменная без причины.
const alph_width = 50;
// Опять глобальная перменная без причины.
const alph_height = 67;
// Опять глобальная перменная без причины.
let fly_height = 0;
fly_sprite.onload = () => {
    fly_height = (alph_width / fly_sprite.width) * fly_sprite.height;
};
// Опять глобальная перменная без причины.
const offset_x = 30;
// Опять глобальная перменная без причины.
const offset_y = 30;
// Опять глобальная перменная без причины.
const wallRepulsionSoften = 0.7;
// Опять глобальная перменная без причины.
const baseVelocity = 35;
// Опять глобальная перменная без причины.
const initialAmplitude = 4;
// Опять глобальная перменная без причины.
const smoothDec = (velocity) => {
    let k = 0.02;
    let dv = Math.max(velocity - baseVelocity, 0);
    return dv * k * (dv * k);
};
// Опять глобальная перменная без причины.
const spoonRepulsion = 5;
// Опять глобальная перменная без причины.
const spoonRadialSpeed = 0.3;
// Опять глобальная перменная без причины.
const alphabet = "абвгдежзийклмнопрстуфхцчшщъыьэюя";
// Опять глобальная перменная без причины.
// Разве это хорошее слово - виктимблейминг?
const goodWords = ["виктимблейминг"];
// Опять глобальная перменная без причины.
let letters = new Array();
// Опять глобальная перменная без причины.
let total_letters = 20;
// Опять глобальная перменная без причины.
let goodWord;
// Опять глобальная перменная без причины.
let found_letters;
// Опять глобальная перменная без причины.
let fail_meter;
// Опять глобальная перменная без причины.
let fail;
// Опять глобальная перменная без причины.
let clickUpdate;
let positionate_letters = () => {
    let n = 0;
    let spiral = Math.min(width, height) / 2;
    const spiral_turns = 6;
    const start_offset = 10;
    letters.forEach((l) => {
        n += 1;
        let r = spiral * ((n + start_offset) / (total_letters + start_offset));
        let d = (n / total_letters) * 2 * Math.PI * spiral_turns;
        let home_pos_x = width / 2 + r * Math.cos(d);
        let home_pos_y = height / 2 + r * Math.sin(d);
        l.home_pos_x = home_pos_x;
        l.pos_x = home_pos_x;
        l.home_pos_y = home_pos_y;
        l.pos_y = home_pos_y;
    });
};
let loadgame = () => {
    fail = 0;
    fail_meter = 0;
    if (goodWords.length) {
        goodWord = goodWords[0];
        goodWords.splice(0, 1);
    } else {
        setTimeout(finishScene, 1500);
        return;
    }
    found_letters = [];
    let spiral = Math.min(width, height) / 2;
    letters = new Array();
    let generate_letter = (char) => {
        let i = alphabet.indexOf(char);
        let sprite = new Sprite(alph_tiles_img, 11, 3, total_alph);
        sprite.setFrame(i);
        let home_pos_x = -100;
        let home_pos_y = -100;
        // Вот и оно, самое сладкое. Для каждой буквы создается объект шума Перлина.
        letters.push({
            char,
            sprite,
            home_pos_x,
            home_pos_y,
            pos_x: home_pos_x,
            pos_y: home_pos_y,
            deg_offset: Math.random() * 2 * Math.PI,
            noise: new perlinNoise3d(),
            display: "normal",
        });
        positionate_letters();
    };
    let all_chars = [];
    for (c of goodWord) {
        all_chars.push(c);
    }
    let remaining_letters = [];
    for (c of alphabet) {
        if (!goodWord.includes(c)) {
            remaining_letters.push(c);
        }
    }
    for (let t = 0; t < total_letters - goodWord.length; t += 1) {
        all_chars.push(remaining_letters.sample());
    }
    for (let count = 0; count < total_letters; count += 1) {
        rand_i = Math.floor(Math.random() * (total_letters - count));
        character = all_chars.splice(rand_i, 1)[0];
        generate_letter(character);
    }
};

// Сердце пиздеца.
function start() {
    const note = (i) => {
        let nc = String.fromCharCode(97 + (i % 7));
        let no = (Math.floor((i + 5) / 7) + 4).toString();
        return nc.toUpperCase() + no;
    };
    let interact = (letter) => {
        if (goodWord.includes(letter.char)) {
            let i = goodWord.indexOf(letter.char);
            console.log(note(i));
            synth.triggerAttackRelease(note(i), "8n");
            found_letters.push(letter.char);
            letter.display = "success";
            updateUI();
            if (win) {
                congrat = () => {
                    playSound("win");
                };
                setTimeout(congrat, 700);
                setTimeout(restart_game, 1700);
            }
        } else {
            letter.display = "wrong";
            fail_meter += 1;
            if (fail_meter >= 5) {
                playSound("buzz");
                fail = true;
                fail_meter = 0;
                setTimeout(restart_game, 1700);
            } else {
                playSound("wrong", -5);
            }
        }
    };

    // Кусок мёртвого кода. Полагаю дропнуто, потому что встройка Macbook 11-го года охуела
    // от таких вычислений блокчейна.
    const rad_amp = 50;
    const rad_freq = 0.1;
    const deg_velocity_amp = 0.2;
    const deg_velocity_freq = 0.1;
    const noisyMove = (totalTime) => {
        for (let letter of letters) {
            let rad = rad_amp * letter.noise.get(rad_freq * totalTime, 0);
            let deg_velocity =
                deg_velocity_amp *
                (letter.noise.get(0, deg_velocity_freq * totalTime) - 0.5);
            letter.pos_x =
                letter.home_pos_x +
                rad * Math.cos(deg_velocity * totalTime + letter.deg_offset);
            letter.pos_y =
                letter.home_pos_y +
                rad * Math.sin(deg_velocity * totalTime + letter.deg_offset);
        }
    };
    // А это - текущая версия. Как все обеднело на эффекты, однако. Ох уж эти предрелизные даунгрейды.
    const amp = 50;
    const normal_freq = 0.2;
    const fail_freq = 5;
    const noisyMoveSimple = (totalTime) => {
        let freq;
        if (fail) {
            freq = fail_freq;
        } else {
            freq = normal_freq;
        }
        for (let letter of letters) {
            letter.pos_x =
                letter.home_pos_x + amp * (letter.noise.get(freq * totalTime, 0) - 0.5);
            letter.pos_y =
                letter.home_pos_y + amp * (letter.noise.get(0, freq * totalTime) - 0.5);
        }
    };
    const drawFrame = () => {
        context.clearRect(0, 0, width, height);
        for (let letter of letters) {
            switch (letter.display) {
                case "normal":
                    context.drawImage(
                        letter.sprite.frame,
                        letter.pos_x,
                        letter.pos_y,
                        alph_width,
                        alph_height
                    );
                    break;
                case "wrong":
                    context.drawImage(
                        fly_sprite,
                        letter.pos_x,
                        letter.pos_y,
                        alph_width,
                        fly_height
                    );
                    break;
            }
        }
    };
    let prev_ts = null;
    const step = (ts) => {
        // Даже пришлось впилить дельту для отладки, потому что бедный мукбанг 11-го года 
        // всё никак не хотел делать расчет шума в реальном времени для каждой из 20 букв хотя 
        // бы в 10 fps. Только использована дельта была(если вообще использовалась) не для того,
        // для чего нужна. Так и осталась мертвым грузом.
        if (prev_ts) {
            delta = (ts - prev_ts) / 1000;
        } else {
            delta = 0;
        }
        prev_ts = ts;
        noisyMoveSimple(ts / 1000);
        drawFrame();
        // Про этот метод я уже рассказывал выше.
        window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
    loadgame();
    console.log(goodWord);
    updateUI();
    touched = (letter, x, y) =>
        letter.pos_x < x &&
        x < letter.pos_x + alph_width &&
        letter.pos_y < y &&
        y < letter.pos_y + alph_height;
    clickUpdate = (e) => {
        let x = e.pageX;
        let y = e.pageY;
        for (let letter of letters) {
            if (letter.display == "normal" && touched(letter, x, y)) {
                interact(letter);
                break;
            }
        }
    };
}

function addCanvasClickListener() {
    game_canvas.addEventListener("click", clickUpdate);
}
const restart_game = () => {
    loadgame();
    updateUI();
};
// Опять глобальная перменная без причины.
let win = false;
// Опять глобальная перменная без причины.
let word_panel;
const updateUI = () => {
    show = [];
    win = true;
    for (c of goodWord) {
        if (found_letters.includes(c)) {
            show.push(c);
        } else {
            show.push("_");
            win = false;
        }
    }
    if (win) {
        word_panel.classList.add("win");
    } else {
        word_panel.classList.remove("win");
    }
    word_panel.innerHTML = show.join(" ");
};

function startSoupGame() {
    word_panel = document.createElement("div");
    word_panel.classList.add("word-panel");
    let container = document.querySelector("#slide-container .slide");
    if (container == null) {
        container = document.body;
    }
    container.appendChild(word_panel);
    document.getElementById("background").remove();
    let bg_container = document.createElement("div");
    bg_container.setAttribute("id", "background");
    container.appendChild(bg_container);
    lottie.loadAnimation({
        container: bg_container,
        renderer: "canvas",
        loop: true,
        autoplay: true,
        path: "assets/minigames/soup/soup_animation.json",
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    });
    window.addEventListener("size_update", () => {
        game_canvas.width = width;
        game_canvas.height = height;
        lottie.resize();
        positionate_letters();
    });
    game_canvas.width = width;
    game_canvas.height = height;
    positionate_letters();
    start();
    container.appendChild(game_canvas);
}

function hideInstruction() {
    document.getElementById("trigger-warning-box").classList.add("hidden");
    addCanvasClickListener();
}
// end soup_game.js

// storage.js
const storeGet = (k) => JSON.parse(localStorage.getItem(k));
const storeSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));
// Опять глобальная перменная без причины.
let types = {};

function saveProgress(index) {
    storeSet("progress", index);
    const savedTypes = storeGet("types") || {};
    Object.keys(types).forEach((t) => {
        savedTypes[t] = (savedTypes[t] || 0) + types[t];
    });
    types = {};
    storeSet("types", savedTypes);
}

function loadProgress() {
    let progress = storeGet("progress");
    if (progress == null) {
        storeSet("progress", 0);
        return 0;
    } else {
        return progress;
    }
}

function countType(type) {
    let c = types[type + "_total"] || 0;
    types[type + "_total"] = c + 1;
}

function countSelectedType(type) {
    let c = types[type] || 0;
    types[type] = c + 1;
}

function rememberBookmark(word) {
    let bookmarks = storeGet("rememberedBookmarks");
    if (bookmarks == null) {
        bookmarks = new Array();
    }
    bookmarks.push(word);
    storeSet("rememberedBookmarks", bookmarks);
}

function researchBookmark(word) {
    let bookmarks = storeGet("researchedBookmarks");
    if (bookmarks == null) {
        bookmarks = new Array();
    }
    bookmarks.push(word);
    storeSet("researchedBookmarks", bookmarks);
}

function currentBookmarks() {
    let bookmarks = storeGet("rememberedBookmarks");
    if (bookmarks == null) {
        bookmarks = new Array();
    }
    let researchedBm = storeGet("researchedBookmarks");
    if (researchedBm == null) {
        researchedBm = new Array();
    }
    return bookmarks.map((word) => {
        return { word, researched: researchedBm.includes(word) };
    });
}
// end storage.js

// types_test.js
function insertType() {
    const types = storeGet("types");
    const percentage = new Map();
    Object.keys(types)
        .filter((t) => t.endsWith("_total"))
        .forEach((t) => {
            const tname = t.substring(0, t.length - 6);
            percentage.set(tname, (100 * types[tname]) / types[t]);
        });
    const typesSort = new Map(
        [...percentage.entries()].sort((a, b) => b[1] - a[1])
    );
    const type = typesSort.entries().next().value[0];
    const type_description = document.querySelector(".types #" + type);
    document.getElementById("type_holder").appendChild(type_description);
}
// end types_test.js

// pages.js
// Почему это здесь, а не в gradient.js?
const stopAnimation = () => {
    window.cancelAnimationFrame(areq);
};
// Почему это здесь, а не в sound.js?
const stopMusic = () => {
    document.dispatchEvent(new Event("stop_playing"));
};
// Пссс... не хотите немного... декларативного стиля? А он вас не хочет, говорит, что вы в ООП не умеете.
const Pages = {
    scene: (v) => {
        return {
            name: "scene" + v,
            onload: () => {
                stopAnimation();
                stopMusic();
                setBg();
                initializeDialogue();
                startVibe();
                addChatListeners();
            },
            ondestroy: () => {
                removeChatListeners();
            },
        };
    },
    single: (name) => {
        return {
            name,
            onload: () => {
                stopAnimation();
                stopMusic();
                setBg(false);
                initializeDialogue();
                startVibe();
                addChatListeners();
                document.querySelector(".slide").addEventListener("click", chatProceed);
            },
            ondestroy: () => {
                removeChatListeners();
            },
        };
    },
    bookmarks: {
        name: "bookmarks",
        onload: () => {
            stopAnimation();
            setBg(false);
            preloadBackground(false, "s");
            addForeground(false, "s", "laptop");
            sendEmotion(false, "s:neutral");
            showNext();
        },
    },
    trigger_warning: { name: "trigger_warning", onload: () => {} },
    flashback: {
        name: "flashback",
        onload: () => {
            stopAnimation();
            stopMusic();
            preloadImages();
            setBg(false, true);
            showReflection();
            playMusic("flashback", -15);
        },
    },
    soup_game: {
        name: "soup_game",
        onload: () => {
            stopAnimation();
            stopMusic();
            startSoupGame();
        },
    },
    network: (person) => {
        return {
            name: "network/" + person,
            onload: () => {
                stopMusic();
            },
        };
    },
    outro: {
        name: "outro",
        onload: () => {
            stopAnimation();
            stopMusic();
            setBg(false);
            initializeDialogue();
            startVibe();
            addChatListeners();
            document.querySelector(".slide").addEventListener("click", chatProceed);
            insertType();
        },
        ondestroy: () => {
            removeChatListeners();
        },
    },
};
// end pages.js

// Ну и напоследок:
// index
let hit = false;

function hitlogo() {
    if (hit) {
        return;
    }
    hit = true;
    gradient = null;
    let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    Tone.context = audioCtx;
    Tone.context.resume().then(loadPage);
}
// end index
// Да хотя уже плевать.

// Послесловие: анализ этого кода меня утомил. Ну это не удивительно. Под конец я уже скипал 
// по сотне строк, потому что было уже лень в этом ковыряться. 
// Посчитайте "Опять глобальная перменная без причины."
// 109 штук включая самую первую. Если хоть одна случайно удалится... Если хоть одна случайно перезапишется
// неверным типом данных... Более 30 лет после изучения функций все преподы и гайды говорят сразу: нахуй эти 
// глобальные переменные, но к сожалению почти никто не говорит "не будь идиотом, иди лучше на повара,
// потому что в макаронах ты явно знаешь толк". 
// Все те архитектурные и стилистические ошибки, которые я обозрел на самом деле уже давно описаны в:
// https://learn.javascript.ru
// https://stackoverflow.com
// https://developer.mozilla.org
// https://wikipedia.org
// https://refactoring.guru
// книгах Кнута, лекциях любой провинциальной шараги и прочем, и прочем.
// Есть люди, которые совершенно не способны искать информацию.
// К сожалению или к счастью это не лечится. Им кодерами не стать.

// Пойду отформатирую свой винчестер прямо сейчас.
// fin.