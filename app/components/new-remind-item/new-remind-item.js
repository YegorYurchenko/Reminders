import axios from 'axios';
import { template } from 'underscore';

class NewRemindItem {
    constructor(el) {
        this.newRemindItem = el;
        this.newRemindItemInner = this.newRemindItem.querySelector(".js-new-remind-item-form");

        this.selectDateBlock = this.newRemindItem.querySelector(".js-select-date");
        this.selectTimeBlock = this.newRemindItem.querySelector(".js-select-time");

        this.months = {
            "00": "Jan",
            "01": "Feb",
            "02": "Mar",
            "03": "Apr",
            "04": "May",
            "05": "June",
            "06": "July",
            "07": "Aug",
            "08": "Sept",
            "09": "Oct",
            "10": "Nov",
            "11": "Dec"
        };

        this.classes = {
            active: "is-active",
            visible: "is-visible",
            hidden: "is-hidden"
        };
        
        this.setListener();
    }
    
    setListener() {
        this.newRemindItemInner.innerHTML += NewRemindItem.getReminderDataBtns();

        //  Закрытие попапа создания нового Remind
        setTimeout(() => {
            this.closeBtn = this.newRemindItem.querySelector(".js-close-btn");
            this.closeBtn.addEventListener("click", () => {
                this.closeNewItemPopup();
            });
        }, 50);

        // Закрытие попапа выбора даты
        setTimeout(() => {
            this.selectDateBtn = document.querySelector(".js-new-item-date-btn");
            this.selectDateBtn.addEventListener("click", () => {
                this.openSelectDataPopup();
            });
        }, 50);

        // Закрытие попапа выбора времени
        setTimeout(() => {
            this.selectTimeBtn = document.querySelector(".js-new-item-time-btn");
            this.selectTimeBtn.addEventListener("click", () => {
                this.openSelectTimePopup();
            });
        }, 50);

        // Активация кнопки Submit для создания нового Remind
        setTimeout(() => {
            this.newRemindItemTitle = document.querySelector(".js-new-remind-item-title");
            this.newRemindItemTitle.addEventListener("input", (e) => {
                this.activateSubmitBtn(e.target);
            });
        }, 50);
        
        // Submit создания нового Remind
        setTimeout(() => {
            this.newRemindItemSubminBtn = document.querySelector(".js-new-remind-item-submit");
            this.remindItemSaveBtn = document.querySelector(".js-new-remind-item-save");
            this.newRemindItemSubminBtn.addEventListener("click", () => {
                this.createNewRemindItem();
            });
        }, 50);

        // Save новых значений для старого Remind
        setTimeout(() => {
            this.remindItemSaveBtn.addEventListener("click", () => {
                this.saveNewRemindInfo();
            });
        }, 50);
    }

    /**
     * Формируем кнопки "Set Date" и "Set Time" с помощью template
     * @returns {string}
     */
    static getReminderDataBtns() {
        const reminderItemsTemplate = document.getElementById("reminders-item-template");
        const tmpl = template(reminderItemsTemplate.innerHTML);
        let reminderItems = "";

        const tmplData = {
            title: false,
            date: "Set Date",
            time: "Set Time"
        };

        reminderItems += tmpl(tmplData);

        return reminderItems;
    }

    /**
     * Закрываем popup добавления нового item
     * @returns {void}
     */
    closeNewItemPopup() {
        this.newRemindItem.classList.remove(this.classes.visible);

        setTimeout(() => { // Задержка для плавного скрытия popup
            this.newRemindItem.classList.remove(this.classes.active);

            // Обнулим все данные в попапе создания нового Remind
            this.clearNewRemindPopup();
    
            // Удалим текст ошибки
            this.newRemindItem.querySelector(".js-new-remind-item-error").classList.remove(this.classes.active);
    
            // Деактивируем кнопку сохранения нового Remind
            this.newRemindItemSubminBtn.classList.remove(this.classes.active);
        }, 150);
        
    }

    /**
     * Открываем popup выбора даты
     * @returns {void}
     */
    openSelectDataPopup() {
        this.selectDateBlock.classList.add(this.classes.visible);

        setTimeout(() => {
            this.selectDateBlock.classList.add(this.classes.active);
        }, 33);
    }

    /**
     * Открываем popup выбора времени
     * @returns {void}
     */
    openSelectTimePopup() {
        this.selectTimeBlock.classList.add(this.classes.visible);

        setTimeout(() => {
            this.selectTimeBlock.classList.add(this.classes.active);
        }, 33);
    }

    /**
     * Активация кнопки Submit для создания нового Remind
     * @param {object} el - dom-элемент input
     * @returns {void}
     */
    activateSubmitBtn(el) {
        const value = el.value;
        el.value = value.trimLeft();

        // Если Дата и Время выбраны
        if (value.trim().length > 3) {
            const [year, month, day, hour, minute] = this.getDateInfo();

            if (year && month && day && hour && minute) {
                this.newRemindItemSubminBtn.classList.add(this.classes.active);
                this.remindItemSaveBtn.classList.add(this.classes.active);
            }
        } else {
            this.newRemindItemSubminBtn.classList.remove(this.classes.active);
            this.remindItemSaveBtn.classList.remove(this.classes.active);
        }
    }

    /**
     * Получить дату и время
     * @returns {object}
     */
    getDateInfo() {
        const year = this.newRemindItemInner.getAttribute("data-year");
        const month = this.newRemindItemInner.getAttribute("data-month").padStart(2, "0");
        const day = this.newRemindItemInner.getAttribute("data-day").padStart(2, "0");
        const hour = this.newRemindItemInner.getAttribute("data-hour").padStart(2, "0");
        const minute = this.newRemindItemInner.getAttribute("data-minute").padStart(2, "0");

        return [year, month, day, hour, minute];
    }

    /**
     * Отправим на сервер новый Remind и добавим его в список (в правильное место)
     * @returns {string}
     */
    createNewRemindItem() {
        // Выбранная дата и время
        const [year, month, day, hour, minute] = this.getDateInfo();
        const selectedDate = new Date(year, month, day, hour, minute);
        const diff = selectedDate - new Date(+new Date() + 1 * 6e4); // Добавим 1 минуту для устранения проблем со временем

        const textError = this.newRemindItem.querySelector(".js-new-remind-item-error");

        // Если это не прошедшее время
        if (diff > 0) {
            // Удалим текст ошибки
            textError.classList.remove(this.classes.active);

            // Получим список всех Remind items
            const allRemindItems = document.querySelector(".js-reminders-inner");
            let variants = allRemindItems.innerHTML.split('class="reminders__item"');

            const RegExp = /\d{4}, \d{1,2}, \d{1,2}, \d{1,2}, \d{1,2}/;
            let position = variants.length - 1;

            // Найдём, куда нужно вставить новый Remind (относительно даты)
            for (let i = 1; i < variants.length; i++) {
                let itemDate = RegExp.exec(variants[i])[0];
                itemDate = itemDate.split(',');

                if (new Date(...itemDate.map(item => +item)) - selectedDate > 0) {
                    position = i - 1;
                    break;
                }
            }

            let newRemindItemHtml = null;

            // Отправляем на сервер новый Remind (пока что get, потом ПЕРЕДЕЛАТЬ НА POST)
            axios({
                method: this.newRemindItemInner.getAttribute("data-method") || "get",
                url: this.newRemindItemInner.getAttribute("data-url")
            })
                .then((response) => {
                    const receivedData = response.data;
                    switch (receivedData.status) {
                        case "GET_NEW_REMINDER_ITEM_SUCCESS":
                            // Сформируем новый Remind
                            newRemindItemHtml = NewRemindItem.getReminderData(
                                "remind_" + Math.floor(Math.random() * 1000 + 10), // ПОТОМ ИСПРАВИТЬ НА receivedData.data.id,
                                `${year}, ${month}, ${day}, ${hour}, ${minute}`,
                                this.newRemindItemTitle.value,
                                this.getReceivedDate(month, day, year),
                                NewRemindItem.getReceivedTime(hour, minute)
                            );
                            
                            // Добавим новый элемент в список
                            this.modifyRemindItemsList(variants.slice(1), position, newRemindItemHtml, allRemindItems);
                            break;
                        case "GET_NEW_REMINDER_ITEM_FAIL":
                            console.error(receivedData.data.errorMessage);
                            break;
                        default:
                            console.error("Что-то пошло не так!");
                            break;
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
        } else {
            textError.classList.add(this.classes.active);
        }
    }

    /**
     * Изменяем список Reminds (добавляем новый элемент)
     * @param {Object} variants - все Remind items
     * @param {number} position - позиция, куда нужно вставить новый Remind item
     * @param {string} newRemindItemHtml - новый Remind item
     * @param {oblect} allRemindItems - dom-элемент - список Remind items
     * @returns {string}
     */
    modifyRemindItemsList(variants, position, newRemindItemHtml, allRemindItems) {
        let newRemindItemsList = '';

        // Добавляем каждый элемент по очереди (в position добавим новый Remind)
        for (let i = 0; i < variants.length; i++) {
            if (i === position) {
                newRemindItemsList += newRemindItemHtml;
            }

            newRemindItemsList += '<div class="reminders__item"' + variants[i];
        }

        // Если нужно добавить Remind в конец списка
        if (position > variants.length - 1) {
            newRemindItemsList += newRemindItemHtml;
        }

        // Добавим элементы в DOM
        allRemindItems.innerHTML = newRemindItemsList;

        // Закроем попап создания нового Remind
        this.newRemindItem.classList.remove(this.classes.visible);
        setTimeout(() => { // Задержка для плавного скрытия popup
            this.newRemindItem.classList.remove(this.classes.active);

            // Обнулим все данные в попапе создания нового Remind
            this.clearNewRemindPopup();
        }, 150);

    }

    /**
     * Очищаем данные из попапа создания нового Remind
     * @returns {string}
     */
    clearNewRemindPopup() {
        this.newRemindItemInner.setAttribute("data-year", "");
        this.newRemindItemInner.setAttribute("data-month", "");
        this.newRemindItemInner.setAttribute("data-day", "");
        this.newRemindItemInner.setAttribute("data-hour", "");
        this.newRemindItemInner.setAttribute("data-minute", "");

        // Вернём в первоначальное состояние
        this.newRemindItemTitle.value = "";
        this.newRemindItem.querySelector(".js-new-item-date-text").innerHTML = "Set Date";
        this.newRemindItem.querySelector(".js-new-item-time-text").innerHTML = "Set Time";
        this.newRemindItem.querySelector(".js-new-item-time-btn").classList.remove(this.classes.active); // Кнопка не активна

        // Активируем кнопку сохранения новых данных
        this.newRemindItemSubminBtn.classList.remove(this.classes.hidden);
        const saveChangesBtn = this.newRemindItemInner.querySelector(".js-new-remind-item-save");

        // Деактивируем кнопку изменения существующих данных
        saveChangesBtn.classList.add(this.classes.hidden);
        saveChangesBtn.classList.remove(this.classes.active);
    }

    /**
     * Получаем дату в нужной форме
     * @param {string} month - месяц
     * @param {string} day - день
     * @param {string} year - год
     * @returns {string}
     */
    getReceivedDate(month, day, year) {
        return `${this.months[month]} ${day}, ${year}`;
    }

    /**
     * Получаем время в нужной форме
     * @param {string} hour - час
     * @param {string} minute - минута
     * @returns {string}
     */
    static getReceivedTime(hour, minute) {
        return `${hour}:${minute}`;
    }

    /**
    * Добавляем новый Remind в общий список с помощью template
    * @param {number} id - id нового Remind
    * @param {string} dateAndTime - dateAndTime нового Remind
    * @param {string} title - title нового Remind
    * @param {string} date - date нового Remind
    * @param {string} time - time нового Remind
    * @returns {string}
    */
    static getReminderData(id, dateAndTime, title, date, time) {
        const reminderItemsTemplate = document.getElementById("reminders-item-template");
        const tmpl = template(reminderItemsTemplate.innerHTML);
        let reminderItems = "";

        const tmplData = {
            id,
            dateAndTime,
            title,
            date,
            time
        };

        reminderItems += tmpl(tmplData);

        return reminderItems;
    }

    /**
     * Обновление данных уже существующего Remind
     * @returns {void}
     */
    saveNewRemindInfo() {
        // Получим выбранную дату и время
        const [year, month, day, hour, minute] = this.getDateInfo();
        const selectedDate = new Date(year, month, day, hour, minute);
        const diff = selectedDate - new Date(+new Date() + 1 * 6e4); // Добавим 1 минуту для устранения проблем со временем

        const textError = this.newRemindItem.querySelector(".js-new-remind-item-error");

        // Если это не прошедшее время
        if (diff > 0) {
            // Удалим текст ошибки
            textError.classList.remove(this.classes.active);

            // Соберём все необходимые данные
            const id = this.newRemindItemInner.getAttribute("data-id");
            const remindTitle = this.newRemindItemTitle.value;
            const remindDate = this.getReceivedDate(month, day, year);
            const remindTime = NewRemindItem.getReceivedTime(hour, minute);

            // Отправляем на сервер изменённый Remind (пока что get, потом ПЕРЕДЕЛАТЬ НА POST)
            axios({
                method: this.newRemindItemInner.getAttribute("data-edit-method") || "get",
                url: this.newRemindItemInner.getAttribute("data-edit-url")
            })
                .then((response) => {
                    const receivedData = response.data;
                    switch (receivedData.status) {
                        case "GET_EDIT_REMIND_SUCCESS":
                            // Обновим данные
                            const remindItem = document.querySelector(`#${id}`);
                            remindItem.setAttribute("data-date-and-time", `${year}, ${month}, ${day}, ${hour}, ${minute}`);
                            remindItem.querySelector(".js-remind-title").innerHTML = remindTitle;
                            remindItem.querySelector(".js-new-item-date-text").innerHTML = remindDate;
                            remindItem.querySelector(".js-new-item-time-text").innerHTML = remindTime;

                            // Закроем попап создания нового Remind
                            this.newRemindItem.classList.remove(this.classes.visible);
                            setTimeout(() => { // Задержка для плавного скрытия popup
                                this.newRemindItem.classList.remove(this.classes.active);

                                // Обнулим все данные в попапе создания нового Remind
                                this.clearNewRemindPopup();
                            }, 150);

                            break;
                        case "GET_EDIT_REMIND_FAIL":
                            console.error(receivedData.data.errorMessage);
                            break;
                        default:
                            console.error("Что-то пошло не так!");
                            break;
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
        } else {
            textError.classList.add(this.classes.active);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-new-remind-item");
    for (let i = 0; i < items.length; i++) {
        new NewRemindItem(items[i]);
    }
});
