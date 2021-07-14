class SelectDate {
    constructor(el) {
        this.selectDateBlock = el;
        this.selectYear = this.selectDateBlock.querySelector(".js-select-year-value");
        this.selectMonth = this.selectDateBlock.querySelector(".js-select-month-value");
        this.selectDayBlock = this.selectDateBlock.querySelector(".js-select-day-list");

        this.yearDecreaseBtn = this.selectDateBlock.querySelector(".js-year-decrease-btn");
        this.yearIncreaseBtn = this.selectDateBlock.querySelector(".js-year-increase-btn");
        this.monthDecreaseBtn = this.selectDateBlock.querySelector(".js-month-decrease-btn");
        this.monthIncreaseBtn = this.selectDateBlock.querySelector(".js-month-increase-btn");
        
        this.dateCloseBtn = this.selectDateBlock.querySelector(".js-date-close-btn");
        this.dateSubmit = this.selectDateBlock.querySelector(".js-select-date-submit");
        
        this.months = {
            "01": "January",
            "02": "February",
            "03": "March",
            "04": "April",
            "05": "May",
            "06": "June",
            "07": "July",
            "08": "August",
            "09": "September",
            "10": "October",
            "11": "November",
            "12": "December"
        };

        this.shortMonths = {
            "01": "Jan",
            "02": "Feb",
            "03": "Mar",
            "04": "Apr",
            "05": "May",
            "06": "June",
            "07": "July",
            "08": "Aug",
            "09": "Sept",
            "10": "Oct",
            "11": "Nov",
            "12": "Dec"
        };
        
        this.classes = {
            disabled: "disabled",
            active: "is-active",
            visible: "is-visible"
        };
        
        this.init();
        this.setListeners();
    }
    
    init() {
        this.fillDays();
        this.daysList = this.selectDateBlock.querySelectorAll(".js-select-day-item");
        this.correctButtons();
    }

    /**
     * Заполняем дни в попапе
     * @returns {void}
     */
    fillDays() {
        const year = this.selectYear.getAttribute("data-year");
        const month = this.selectMonth.getAttribute("data-month");
        const amountOfDays = new Date(year, month, 0).getDate();

        let content = "";

        for (let i = 1; i <= amountOfDays; i++) {
            content += `
                <li class="select-date__select-day-item">
                    <button class="select-date__select-day-btn js-select-day-item" type="button" data-value="${i}">${i}</button>
                </li>`
        }

        this.selectDayBlock.innerHTML = content;
    }

    setListeners() {
        // Закрыть попап выбора даты
        this.dateCloseBtn.addEventListener("click", () => {
            this.closeSelectDatePopup();
        });

        // Уменьшить месяц
        this.monthDecreaseBtn.addEventListener("click", () => {
            this.changeMonth(-1);
        });

        // Увеличить месяц
        this.monthIncreaseBtn.addEventListener("click", () => {
            this.changeMonth(1);
        });

        // Уменьшить год
        this.yearDecreaseBtn.addEventListener("click", () => {
            this.changeYear(-1);
        });

        // Увеличить год
        this.yearIncreaseBtn.addEventListener("click", () => {
            this.changeYear(1);
        });

        // Выбор дня
        this.selectDayBlock.addEventListener("click", (e) => {
            this.selectDay(e.target, e.target.localName);
        });

        // Утвердить дату
        this.dateSubmit.addEventListener("click", () => {
            this.submitDate();
        });
    }

    /**
     * Закрываем popup выбора даты
     * @returns {void}
     */
    closeSelectDatePopup() {
        this.selectDateBlock.classList.remove(this.classes.visible);

        setTimeout(() => { // Задержка для плавного скрытия popup
            this.selectDateBlock.classList.remove(this.classes.active);
        }, 150);
    }

    /**
     * Уменьшаем/увеличиваем месяц
     * @param {number} type - тип: уменьшение или увеличение
     * @returns {void}
     */
    changeMonth(type) {
        let month = +this.selectMonth.getAttribute("data-month");

        if (type < 0) {
            month -= 1;
        } else {
            month += 1;
        }

        month = month < 10 ? `0${month}` : `${month}`;

        this.selectMonth.innerHTML = this.months[month];
        this.selectMonth.setAttribute("data-month", month);

        // Сбросим выбранный день
        this.selectDayBlock.setAttribute("data-day", "");
        this.dateSubmit.classList.remove(this.classes.active);

        this.fillDays();
        this.correctButtons();

        // Обновим дни
        this.daysList = this.selectDateBlock.querySelectorAll(".js-select-day-item");
    }

    /**
     * Уменьшаем/увеличиваем год
     * @param {number} type - тип: уменьшение или увеличение
     * @returns {void}
     */
    changeYear(type) {
        let year = +this.selectYear.getAttribute("data-year");

        if (type < 0) {
            year -= 1;
        } else {
            year += 1;
        }

        this.selectYear.innerHTML = year;
        this.selectYear.setAttribute("data-year", year);

        // Проверим корректность месяца, если выбран текущий год
        this.correctMonth(year);

        // Сбросим выбранный день
        this.selectDayBlock.setAttribute("data-day", "");
        this.dateSubmit.classList.remove(this.classes.active);

        this.fillDays();
        this.correctButtons();

        // Обновим дни
        this.daysList = this.selectDateBlock.querySelectorAll(".js-select-day-item");
    }

    /**
     * Корректируем выбраный месяц, если выбран текущий год
     * @param {number} year - выбранный год
     * @returns {void}
     */
    correctMonth(year) {
        const [currentYear, currentMonth] = this.getCurrentDate();

        // Выбранный месяц
        const month = +this.selectMonth.getAttribute("data-month");

        // Если выбранный месяц уже в прошлом, то меняем на текущий
        if (currentYear === year && month < +currentMonth) {
            this.selectMonth.innerHTML = this.months[currentMonth];
            this.selectMonth.setAttribute("data-month", currentMonth);
        }
    }

    /**
     * Получаем текущий год (number) и месяц (string)
     * @returns {Object}
     */
    getCurrentDate() {
        const date = new Date();
        const currentYear = date.getFullYear(0);
        const currentMonth = `0${date.getMonth() + 1}`;

        return [currentYear, currentMonth];
    }

    /**
     * Выбираем день
     * @param {object} element - dom-элемент, на котором сработало событие
     * @param {string} elementType - название тэга элемента
     * @returns {void}
     */
    selectDay(element, elementType) {
        let value = null;

        if (elementType === "button") {
            value = element.getAttribute("data-value");
            this.selectDayBlock.setAttribute("data-day", value);

            this.daysList.forEach((day) => {
                day.classList.remove(this.classes.active);
            });

            element.classList.add(this.classes.active);

            this.dateSubmit.classList.add(this.classes.active);
        }
    }

    /**
     * Submit выбранной даты
     * @returns {void}
     */
    submitDate() {
        const year = this.selectYear.getAttribute("data-year");
        const month = this.selectMonth.getAttribute("data-month");
        const day = this.selectDayBlock.getAttribute("data-day");

        // Добавим дату в соответствующие атрибуты
        const newRemindItem = this.selectDateBlock.parentElement.querySelector(".js-new-remind-item-form");
        newRemindItem.setAttribute("data-year", year);
        newRemindItem.setAttribute("data-month", month);
        newRemindItem.setAttribute("data-day", day);

        this.closeSelectDatePopup();

        // Изменим текст кнопки на выбранную дату
        const remindersDateBtn = this.selectDateBlock.parentElement.querySelector('.js-new-item-date-text');
        remindersDateBtn.innerHTML = `${this.shortMonths[month]} ${day}, ${year}`;
    }

    /**
     * Корректируем видимость кнопок изменения даты
     * @returns {void}
     */
    correctButtons() {
        const year = +this.selectYear.getAttribute("data-year");
        const month = this.selectMonth.getAttribute("data-month");

        const [currentYear, currentMonth] = this.getCurrentDate();

        // Если год - текущий, то меньше быть не может
        if (year <= currentYear) {
            this.yearDecreaseBtn.classList.add(this.classes.disabled);
        } else {
            this.yearDecreaseBtn.classList.remove(this.classes.disabled);
        }

        // Если это Январь или это текущий месяц и год, то меньше быть не может
        if (month === "01") {
            this.monthDecreaseBtn.classList.add(this.classes.disabled);
        } else if (year === currentYear && month === currentMonth) {
            this.monthDecreaseBtn.classList.add(this.classes.disabled);
        } else {
            this.monthDecreaseBtn.classList.remove(this.classes.disabled);
        }

        // Если это Декабрь, то больше быть не может
        if (month === "12") {
            this.monthIncreaseBtn.classList.add(this.classes.disabled);
        } else {
            this.monthIncreaseBtn.classList.remove(this.classes.disabled);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-select-date");
    for (let i = 0; i < items.length; i++) {
        new SelectDate(items[i]);
    }
});
