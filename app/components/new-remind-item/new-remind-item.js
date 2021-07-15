import { template } from 'underscore';

class NewRemindItem {
    constructor(el) {
        this.newRemindItem = el;
        this.newRemindItemInner = this.newRemindItem.querySelector(".js-new-remind-item-form");

        this.selectDateBlock = this.newRemindItem.querySelector(".js-select-date");
        this.selectTimeBlock = this.newRemindItem.querySelector(".js-select-time");

        
        this.classes = {
            active: "is-active",
            visible: "is-visible"
        };
        
        this.setListener();
    }
    
    setListener() {
        this.newRemindItemInner.innerHTML += NewRemindItem.getReminderData();

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
            this.newRemindItemSubminBtn.addEventListener("click", () => {
                // TODO
            });
        }, 50);
    }

    /**
     * Формируем кнопки "Set Date" и "Set Time" с помощью template
     * @returns {string}
     */
    static getReminderData() {
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
        if (value.length > 4) {
            const year = this.newRemindItemInner.getAttribute("data-year");
            const month = this.newRemindItemInner.getAttribute("data-year");
            const day = this.newRemindItemInner.getAttribute("data-day");
            const hour = this.newRemindItemInner.getAttribute("data-hour");
            const minute = this.newRemindItemInner.getAttribute("data-minute");

            if (year && month && day && hour && minute) {
                this.newRemindItemSubminBtn.classList.add(this.classes.active);
            }
        } else {
            this.newRemindItemSubminBtn.classList.remove(this.classes.active);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-new-remind-item");
    for (let i = 0; i < items.length; i++) {
        new NewRemindItem(items[i]);
    }
});
