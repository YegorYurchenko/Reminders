import axios from 'axios';
import { template } from 'underscore';

class Reminders {
    constructor(el) {
        this.reminders = el;
        this.remindersInner = this.reminders.querySelector('.js-reminders-inner');

        this.months = {
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
            11: "Dec"
        };

        this.classes = {
            active: "is-active"
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
                            this.setListeners();
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
                    id: itemData.id,
                    dateAndTime: this.getDateAndTime(itemData.date, itemData.time),
                    title: itemData.title,
                    date: this.getReceivedDate(itemData.date),
                    time: Reminders.getReceivedTime(itemData.time)
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
     * Получаем дату (через запятую все данные)
     * @param {Object} date - объект с годом, месяцем и днём
     * @param {Object} time - объект с часом и минутой
     * @returns {string}
     */
    getDateAndTime(date, time) {
        return `${date.year}, ${date.month}, ${date.day}, ${time.hour}, ${time.minute}`;
    }

    /**
     * Получаем время в нужной форме
     * @param {Object} time - объект с часом и минутой
     * @returns {string}
     */
    static getReceivedTime(time) {
        return `${time.hour}:${time.minute}`;
    }

    setListeners() {
        // Действия с блоком Actions
        this.listenActionsEvents();

        // Обновим все блоки Actions после обновления Remind items
        this.remindersInner.addEventListener("DOMSubtreeModified", () => {
            this.listenActionsEvents();
        });
    }

    /**
     * Действия с блоком Actions
     * @returns {void}
     */
    listenActionsEvents() {
        this.actionsBtns = this.remindersInner.querySelectorAll('.js-remind-actions-btn');
        this.actionsBtns.forEach((actionBtn) => {
            // Нужный блок Actions
            const actionBlock = actionBtn.nextElementSibling;

            // Кнопка удаления Remind
            const removeRemindBtn = actionBlock.querySelector('.js-remind-remove');

            // Открытие/закрытие нужного блока Actions
            actionBtn.addEventListener("click", () => {
                this.toggleActionsVisibility(actionBlock);
            });

            // Закрытие нужного Actions при клике вне блока
            document.body.addEventListener("click", (e) => {
                this.handleMilkClick(e, actionBtn, actionBlock);
            });

            removeRemindBtn.addEventListener("click", () => {
                // Получим ID выбранного Remind
                const remindItemId = removeRemindBtn.closest(".reminders__item").getAttribute("id");
                this.removeRemind(remindItemId);
            });
        });   
    }

    /**
     * Открываем/закрываем Actions
     * @param {object} actionBlock - блок с кнопками "Edit" и "Remove"
     * @returns {void}
     */
    toggleActionsVisibility(actionBlock) {
        if (!actionBlock.classList.contains(this.classes.active)) {
            actionBlock.classList.add(this.classes.active);
        } else {
            actionBlock.classList.remove(this.classes.active);
        }
    }

    /**
     * Закрываем Actions при клике вне блока
     * @param {object} e - блок с кнопками "Edit" и "Remove"
     * @param {object} actionBtn - кнопка открытия блока Actions
     * @param {object} actionBlock - блок с кнопками "Edit" и "Remove"
     * @returns {void}
     */
    handleMilkClick(e, actionBtn, actionBlock) {
        if (
            e.target !== actionBtn
            && actionBlock.classList.contains(this.classes.active)
        ) {
            this.toggleActionsVisibility(actionBlock);
        }
    }

    /**
     * Удаление выбранного Remind из списка
     * @param {string} chosenRemindId - ID выбранного Remind
     * @returns {void}
     */
    removeRemind(chosenRemindId) {
        // Все Reminds
        let variants = this.remindersInner.innerHTML.split('class="reminders__item"');

        const RegExp = /remind_\d{1,}/;
        let position = variants.length - 1;

        // Найдём, какой Remind нужно удалить (ищем по id)
        for (let i = 1; i < variants.length; i++) {
            let remindId = RegExp.exec(variants[i])[0];

            if (remindId === chosenRemindId) {
                position = i - 1;
                break;
            }
        }

        // Отправляем на сервер id Remind, который нужно удалить (пока что get, потом ПЕРЕДЕЛАТЬ НА POST)
        axios({
            method: this.remindersInner.getAttribute("data-remove-method") || "get",
            url: this.remindersInner.getAttribute("data-remove-url")
        })
            .then((response) => {
                const receivedData = response.data;
                switch (receivedData.status) {
                    case "GET_REMOVE_REMIND_SUCCESS":
                        // Удалим выбранный Remind из списка
                        this.removeRemindItem(variants.slice(1), position);
                        break;
                    case "GET_REMOVE_REMIND_FAIL":
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
    }

    /**
     * Изменяем список Reminds (удаляем выбранный Remind)
     * @param {Object} variants - все Remind items
     * @param {number} position - позиция, какой Remind нужно удалить
     * @returns {string}
     */
    removeRemindItem(variants, position) {
        let newRemindItemsList = '';

        // Добавляем каждый элемент по очереди (на position не будем вставлять Remind)
        for (let i = 0; i < variants.length; i++) {
            if (i === position) {
                continue;
            }

            newRemindItemsList += '<div class="reminders__item"' + variants[i];
        }

        if (!newRemindItemsList) {
            newRemindItemsList += "<span class='reminders__empty'>You have no reminders yet! It's time to add one</span>";
        }

        // Добавим элементы в DOM
        this.remindersInner.innerHTML = newRemindItemsList;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-reminders");
    for (let i = 0; i < items.length; i++) {
        new Reminders(items[i]);
    }
});
