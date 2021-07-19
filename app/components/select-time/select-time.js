class SelectTime {
    constructor(el) {
        this.selectTimeBlock = el;

        this.selectHour = this.selectTimeBlock.querySelector(".js-select-hour-value");
        this.selectMinute = this.selectTimeBlock.querySelector(".js-select-minute-value");

        this.hourDecreaseBtn = this.selectTimeBlock.querySelector(".js-hour-decrease-btn");
        this.hourIncreaseBtn = this.selectTimeBlock.querySelector(".js-hour-increase-btn");
        this.minuteDecreaseBtn = this.selectTimeBlock.querySelector(".js-minute-decrease-btn");
        this.minuteIncreaseBtn = this.selectTimeBlock.querySelector(".js-minute-increase-btn");

        this.timeCloseBtn = this.selectTimeBlock.querySelector(".js-time-close-btn");
        this.timeSubmit = this.selectTimeBlock.querySelector(".js-select-time-submit");

        this.classes = {
            disabled: "disabled",
            active: "is-active",
            visible: "is-visible"
        };
        
        this.init();
        this.setListeners();
    }

    init() {
        this.correctButtons();
    }

    setListeners() {
        // Закрыть попап выбора даты
        this.timeCloseBtn.addEventListener("click", () => {
            this.closeSelectTimePopup();
        });

        // Уменьшить час
        this.hourDecreaseBtn.addEventListener("click", () => {
            this.changeHour(-1);
        });

        // Увеличить час
        this.hourIncreaseBtn.addEventListener("click", () => {
            this.changeHour(1);
        });

        // Уменьшить минуту (на 5 минут)
        this.minuteDecreaseBtn.addEventListener("click", () => {
            this.changeMinute(-1);
        });

        // Увеличить минуту (на 5 минут)
        this.minuteIncreaseBtn.addEventListener("click", () => {
            this.changeMinute(1);
        });

        // Утвердить время
        this.timeSubmit.addEventListener("click", () => {
            this.submitTime();
        });
    }

    /**
     * Закрываем popup выбора времени
     * @returns {void}
     */
    closeSelectTimePopup() {
        this.selectTimeBlock.classList.remove(this.classes.visible);

        setTimeout(() => { // Задержка для плавного скрытия popup
            this.selectTimeBlock.classList.remove(this.classes.active);
        }, 150);
    }

    /**
     * Уменьшаем/увеличиваем час
     * @param {number} type - тип: уменьшение или увеличение
     * @returns {void}
     */
    changeHour(type) {
        let hour = +this.selectHour.getAttribute("data-hour");

        if (type < 0) {
            hour -= 1;
        } else {
            hour += 1;
        }

        if (this.correctTime(hour, 0)) {
            this.selectHour.innerHTML = hour;
            this.selectHour.setAttribute("data-hour", hour);
        } else {
            const [currentHour, currentMinute] = this.getCurrentTime();
            this.selectHour.innerHTML = currentHour;
            this.selectHour.setAttribute("data-hour", currentHour);
            this.selectMinute.innerHTML = currentMinute;
            this.selectMinute.setAttribute("data-minute", currentMinute);
        }

        this.correctButtons();
    }

    /**
     * Уменьшаем/увеличиваем минуту
     * @param {number} type - тип: уменьшение или увеличение
     * @returns {void}
     */
    changeMinute(type) {
        let minute = +this.selectMinute.getAttribute("data-minute");

        if (type < 0) {
            minute -= 5;
        } else {
            minute += 5;
        }

        const hour = this.selectTimeBlock.querySelector(".js-select-hour-value").getAttribute("data-hour");
        if (this.correctTime(hour, minute)) {
            this.selectMinute.innerHTML = minute;
            this.selectMinute.setAttribute("data-minute", minute);
        } else if (type > 0) {
            const [currentHour, currentMinute] = this.getCurrentTime();
            this.selectHour.innerHTML = currentHour;
            this.selectHour.setAttribute("data-hour", currentHour);
            this.selectMinute.innerHTML = currentMinute;
            this.selectMinute.setAttribute("data-minute", currentMinute);
        }

        this.correctButtons();
    }

    /**
     * Текущий час (number) и минута (number)
     * @returns {object}
     */
    getCurrentTime() {
        let date = new Date(+new Date() + 5 * 6e4);
        
        const minutes = date.getMinutes() % 5;
        if (minutes !== 0) {
            date = new Date(+new Date() + (10 - minutes) * 6e4);
        }
        
        const currentHour = date.getHours();
        const currentMinute = date.getMinutes();

        return [currentHour, currentMinute];
    }

    /**
     * Прверяем, прошедшее ли это время или нет?
     * @returns {boolean}
     */
    correctTime(hour, minute) {
        const date = document.querySelector(".js-new-remind-item-form");
        const year = date.getAttribute("data-year");
        const month = date.getAttribute("data-month");
        const day = date.getAttribute("data-day");

        const result = new Date(year, month, day, hour, minute) - new Date();

        if (result < 0) {
            return false;
        }

        // Делаем Submit активным
        this.timeSubmit.classList.add(this.classes.active);

        return true;
    }

    /**
     * Submit выбранной даты
     * @returns {void}
     */
    submitTime() {
        const hour = this.selectHour.getAttribute("data-hour");
        const minute = this.selectMinute.getAttribute("data-minute");

        // Добавим дату в соответствующие атрибуты
        const newRemindItem = this.selectTimeBlock.parentElement.querySelector(".js-new-remind-item-form");
        newRemindItem.setAttribute("data-hour", hour.padStart(2, "0"));
        newRemindItem.setAttribute("data-minute", minute.padStart(2, "0"));

        this.closeSelectTimePopup();

        // Изменим текст кнопки на выбранную дату
        const remindersDateBtn = this.selectTimeBlock.parentElement.querySelector('.js-new-item-time-text');
        remindersDateBtn.innerHTML = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

        // Если все поля заполнены, то активируем кнопку Submit
        const submitNewItemBtn = newRemindItem.querySelector(".js-new-remind-item-submit");
        const newItemTitle = newRemindItem.querySelector(".js-new-remind-item-title");

        if (newItemTitle.value) {
            submitNewItemBtn.classList.add(this.classes.active);
        }
    }

    /**
     * Корректируем видимость кнопок изменения даты
     * @returns {void}
     */
    correctButtons() {
        const hour = +this.selectHour.getAttribute("data-hour");
        const minute = +this.selectMinute.getAttribute("data-minute");
        
        // Если это 0 часов, то меньше быть не может
        if (hour <= 0) {
            this.hourDecreaseBtn.classList.add(this.classes.disabled);
        } else {
            this.hourDecreaseBtn.classList.remove(this.classes.disabled);
        }

        // Если это 23 часа, то больше быть не может
        if (hour >= 23) {
            this.hourIncreaseBtn.classList.add(this.classes.disabled);
        } else {
            this.hourIncreaseBtn.classList.remove(this.classes.disabled);
        }

        // Заменяем значения минут на предельные, чтобы измежать переполнения
        if (minute < 5) {
            this.selectMinute.setAttribute("data-minute", "0");
            this.selectMinute.innerHTML = "0";
        } else if (minute > 55) {
            this.selectMinute.setAttribute("data-minute", "55");
            this.selectMinute.innerHTML = "55";
        }

        // Если это 0 минут, то меньше быть не может
        if (minute <= 0) {
            this.minuteDecreaseBtn.classList.add(this.classes.disabled);
        } else {
            this.minuteDecreaseBtn.classList.remove(this.classes.disabled);
        }

        // Если это 55 минут, то больше быть не может
        if (minute >= 55) {
            this.minuteIncreaseBtn.classList.add(this.classes.disabled);
        } else {
            this.minuteIncreaseBtn.classList.remove(this.classes.disabled);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-select-time");
    for (let i = 0; i < items.length; i++) {
        new SelectTime(items[i]);
    }
});
