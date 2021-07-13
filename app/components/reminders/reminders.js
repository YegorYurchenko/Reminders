import axios from 'axios';
import { template } from 'underscore';

class Reminders {
    constructor(el) {
        this.reminders = el;
        this.remindersInner = this.reminders.querySelector('.js-reminders-inner');

        this.date = {
            0: "Jan",
            1: "Feb",
            2: "Mar",
            3: "Apr",
            4: "May",
            5: "June",
            6: "July",
            7: "Aug",
            8: "Sept",
            9: "Oct",
            10: "Nov",
            11: "Dec",
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
        return `${this.date[date.month]} ${date.day}, ${date.year}`;
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
