import { template } from 'underscore';

class NewRemindItem {
    constructor(el) {
        this.newRemindItem = el;
        this.newRemindItemInner = this.newRemindItem.querySelector(".js-new-remind-item-form");

        this.selectDateBlock = this.newRemindItem.querySelector(".js-select-date");

        this.classes = {
            active: "is-active",
            visible: "is-visible"
        };

        this.setListener();
    }

    setListener() {
        this.newRemindItemInner.innerHTML += NewRemindItem.getReminderData();

        setTimeout(() => {
            this.closeBtn = this.newRemindItem.querySelector(".js-close-btn");

            this.closeBtn.addEventListener("click", () => {
                this.closeNewItemPopup();
            });
        }, 50);

        setTimeout(() => {
            this.selectDateBtn = document.querySelector(".js-new-item-date-btn");
            
            this.selectDateBtn.addEventListener("click", () => {
                this.openSelectDataPopup();
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
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-new-remind-item");
    for (let i = 0; i < items.length; i++) {
        new NewRemindItem(items[i]);
    }
});
