import { template } from 'underscore';
import _debounce from 'lodash/debounce';
import { ReminderSocket } from '../../common/scripts/app';

class Reminders {
    constructor(el) {
        this.reminders = el;
        this.remindersInner = this.reminders.querySelector('.js-reminders-inner');

        this.editRemindFormBlock = document.querySelector('.js-new-remind-item');
        this.editRemindForm = document.querySelector('.js-new-remind-item-form');

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

        this.init();
    }

    init() {
        // Индикатор загрузки
        this.remindersInner.innerHTML = "<span class='reminders__loading'>Loading...</span>";

        // Получаем все reminders
        ReminderSocket.onopen = function () {
            ReminderSocket.send(JSON.stringify({
                'type': 'initialization'
            }));
        };

        const self = this;
        ReminderSocket.onmessage = function (e) {
            const receivedData = JSON.parse(e.data).data;
            switch (receivedData.status) {
                case "success":
                    setTimeout(() => {
                        self.remindersInner.innerHTML = self.getReminderData(receivedData.data);
                        self.setListeners();
                    }, 800);
                    break;
                case "fail":
                    setTimeout(() => {
                        self.remindersInner.innerHTML = '<span class="reminders__error">;-( server error, please try again in a moment...</span>';
                    }, 800);
                    console.error(receivedData.data.errorMessage);
                    break;
                default:
                    setTimeout(() => {
                        self.remindersInner.innerHTML = '<span class="reminders__error">;-( server error, please try again in a moment...</span>';
                    }, 800);
                    console.error("Что-то пошло не так!");
                    break;
            }
        };

        ReminderSocket.onerror = function (e) {
            console.error(e);
        };
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

        // Отслеживаем изменение количества элементов Reminds
        let variants = this.remindersInner.innerHTML.split('class="reminders__item"').slice(1).length;
        this.remindersInner.addEventListener("DOMSubtreeModified", _debounce(() => {
            let newVariants = this.remindersInner.innerHTML.split('class="reminders__item"').slice(1).length;

            // Если количество изменилось
            if (variants !== newVariants) {
                variants = newVariants;

                // Обновим слушатели событий
                this.listenActionsEvents();
            }
        }, 50));

        // Посчитаем, сколько секунд осталось до начала следующей минуты
        const now = new Date();
        const currentTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 1)
        const timer = currentTime - new Date();

        setTimeout(() => {
            this.checkReminderTimer();

            setInterval(() => {
                this.checkReminderTimer();
            }, 60000)
        }, timer);
    }

    /**
     * Прверка изменений раз в 5 минут
     * @returns {void}
     */
    checkReminderTimer() {
        if (new Date().getMinutes() % 5 === 0) {
            ReminderSocket.send(JSON.stringify({
                'type': 'checkReminderTimer'
            }));

            const self = this;
            ReminderSocket.onmessage = function (e) {
                const receivedData = JSON.parse(e.data).data;
                switch (receivedData.status) {
                    case "success":
                        // Все Reminds
                        let variants = self.remindersInner.innerHTML.split('class="reminders__item"');

                        const RegExp = /remind_\d{1,}/;
                        let position = variants.length - 1;

                        // Найдём, какой Remind нужно удалить (ищем по id)
                        for (let i = 1; i < variants.length; i++) {
                            let remindId = RegExp.exec(variants[i])[0];

                            if (remindId === receivedData.data.id) {
                                position = i - 1;
                                break;
                            }
                        }

                        self.removeRemindItem(variants.slice(1), position);
                        break;
                    case "fail":
                        console.error(receivedData.data.errorMessage);
                        break;
                    default:
                        console.error("Что-то пошло не так!");
                        break;
                }
            };

            ReminderSocket.onerror = function (e) {
                console.error(e);
            };
        }
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

            // Кнопка изменения Edit
            const editRemindBtn = actionBlock.querySelector('.js-remind-edit');

            // Кнопка удаления Remind
            const removeRemindBtn = actionBlock.querySelector('.js-remind-remove');

            // Слушатели событий для Actions
            this.activateActionsEvents(actionBtn, actionBlock, removeRemindBtn, editRemindBtn);
        });
    }

    /**
     * Установка слушателей на блок Actions
     * @param {object} actionBtn - кнопка для отображения блока Actions
     * @param {object} actionBlock - блок Actions
     * @param {object} removeRemindBtn - кнопка Remove
     * @param {object} editRemindBtn - кнопка Edit
     * @returns {void}
     */
    activateActionsEvents(actionBtn, actionBlock, removeRemindBtn, editRemindBtn) {
        // Открытие/закрытие нужного блока Actions
        actionBtn.addEventListener("click", () => {
            this.toggleActionsVisibility(actionBlock);
        });

        // Закрытие нужного Actions при клике вне блока
        document.body.addEventListener("click", (e) => {
            this.handleMilkClick(e, actionBtn, actionBlock);
        });

        // Удаление Remind
        removeRemindBtn.addEventListener("click", () => {
            // Получим ID выбранного Remind
            const remindItemId = removeRemindBtn.closest(".reminders__item").getAttribute("id");
            this.removeRemind(remindItemId);
        });

        // Открытие попапа изменения Remind
        editRemindBtn.addEventListener("click", () => {
            // Нужный Remind
            const remindItem = editRemindBtn.closest(".reminders__item");

            // Добавим уже существующие данные
            this.addRemindInfo(remindItem);
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

        // Отправляем на сервер id Remind, который нужно удалить
        ReminderSocket.send(JSON.stringify({
            'type': 'removeRemind',
            'remindId': chosenRemindId
        }));

        const self = this;
        ReminderSocket.onmessage = function (e) {
            const receivedData = JSON.parse(e.data).data;
            switch (receivedData.status) {
                case "success":
                    self.removeRemindItem(variants.slice(1), position);
                    break;
                case "fail":
                    console.error(receivedData.data.errorMessage);
                    break;
                default:
                    console.error("Что-то пошло не так!");
                    break;
            }
        };

        ReminderSocket.onerror = function (e) {
            console.error(e);
        };
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

    /**
     * Добавление существующих данных в попап изменения данных
     * @param {object} remindItem - dom-элемент нужного Remind
     * @returns {void}
     */
    addRemindInfo(remindItem) {
        // Соберём все известные данные
        let dateAndTime = remindItem.getAttribute("data-date-and-time").split(",");
        dateAndTime = dateAndTime.map(item => +item); // массив вида [year, month, day, hour, minute]

        const remindId = remindItem.getAttribute("id");
        const remindTitle = remindItem.querySelector(".js-remind-title").innerHTML;
        const remindDate = remindItem.querySelector(".js-new-item-date-text").innerHTML;
        const remindTime = remindItem.querySelector(".js-new-item-time-text").innerHTML;

        // Откроем попап изменения данных Remind
        this.openEditRemindInfo();

        // Добавим все изместные данные
        this.editRemindForm.setAttribute("data-id", remindId);
        this.editRemindForm.setAttribute("data-year", dateAndTime[0]);
        this.editRemindForm.setAttribute("data-month", dateAndTime[1]);
        this.editRemindForm.setAttribute("data-day", dateAndTime[2]);
        this.editRemindForm.setAttribute("data-hour", dateAndTime[3]);
        this.editRemindForm.setAttribute("data-minute", dateAndTime[4]);
        this.editRemindForm.querySelector(".js-new-remind-item-title").value = remindTitle;
        this.editRemindForm.querySelector(".js-new-item-date-text").innerHTML = remindDate;

        // Активируем кнопку выбора времени
        this.editRemindForm.querySelector(".js-new-item-time-btn").classList.add(this.classes.active);
        this.editRemindForm.querySelector(".js-new-item-time-text").innerHTML = remindTime;
    }

    /**
     * Открываем popup изменения Remind item
     * @returns {void}
     */
    openEditRemindInfo() {
        this.editRemindFormBlock.classList.add(this.classes.visible);

        setTimeout(() => {
            this.editRemindFormBlock.classList.add(this.classes.active);
        }, 33);

        this.editRemindForm.querySelector(".js-new-remind-item-submit").classList.add(this.classes.hidden);

        const saveChangesBtn = this.editRemindForm.querySelector(".js-new-remind-item-save");
        saveChangesBtn.classList.remove(this.classes.hidden);
        saveChangesBtn.classList.add(this.classes.active);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-reminders");
    for (let i = 0; i < items.length; i++) {
        new Reminders(items[i]);
    }
});
