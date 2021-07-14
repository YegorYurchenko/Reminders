import axios from 'axios';
import { template } from 'underscore';

class Reminders {
    constructor(el) {
        this.reminders = el;
        this.remindersInner = this.reminders.querySelector('.js-reminders-inner');

        this.months = {
            1: "Jan",
            2: "Feb",
            3: "Mar",
            4: "Apr",
            5: "May",
            6: "June",
            7: "July",
            8: "Aug",
            9: "Sept",
            10: "Oct",
            11: "Nov",
            12: "Dec"
        };

        this.init();
    }

    init() {
        // Индикатор загрузки
        this.remindersInner.innerHTML = "<span class='reminders__loading'>Loading...</span>";

        // Получаем все reminders
        axios({
            method: this.reminders.getAttribute("data-method") || "get",
            url: this.reminders.getAttribute("data-url")
        })
            .then((response) => {
                const receivedData = response.data;
                switch (receivedData.status) {
                    case "GET_REMINDERS_LIST_SUCCESS":
                        setTimeout(() => {
                            this.remindersInner.innerHTML = this.getReminderData(receivedData.data);
                        }, 800);
                        break;
                    case "GET_REMINDERS_LIST_FAIL":
                        setTimeout(() => {
                            this.remindersInner.innerHTML = '<span class="reminders__error">;-( server error, please try again in a moment...</span>';
                        }, 800);
                        console.error(receivedData.data.errorMessage);
                        break;
                    default:
                        setTimeout(() => {
                            this.remindersInner.innerHTML = '<span class="reminders__error">;-( server error, please try again in a moment...</span>';
                        }, 800);
                        console.error("Что-то пошло не так!");
                        break;
                }
            })
            .catch((e) => {
                console.error(e);
            });
    }

    /**
     * Формируем объекты для каждого блока Reminder и создаём содержимое через template
     * @param {Object} data - данные из AJAX-запроса
     * @returns {string}
     */
    getReminderData(data) {
        const reminderItemsTemplate = document.getElementById("reminders-item-template");
        const tmpl = template(reminderItemsTemplate.innerHTML);
        let reminderItems = "";

        if (data.length !== 0) {
            data.forEach(itemData => {
                const tmplData = {
                    title: itemData.title,
                    date: this.getReceivedDate(itemData.date),
                    time: Reminders.getReceivedTime(itemData.time, itemData.timeZone)
                };

                reminderItems += tmpl(tmplData);
            });
        } else {
            reminderItems += "<span class='reminders__empty'>You have no reminders yet! It's time to add one</span>";
        }

        return reminderItems;
    }

    /**
     * Получаем дату в нужной форме
     * @param {Object} date - объект с годом, месяцем и днём
     * @returns {string}
     */
    getReceivedDate(date) {
        return `${this.months[date.month]} ${date.day}, ${date.year}`;
    }

    /**
     * Получаем время в нужной форме
     * @param {Object} time - объект с часом и минутой
     * @param {string} timeZone - AM или PM
     * @returns {string}
     */
    static getReceivedTime(time, timeZone) {
        return `${time.hours}:${time.minutes} ${timeZone}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-reminders");
    for (let i = 0; i < items.length; i++) {
        new Reminders(items[i]);
    }
});
