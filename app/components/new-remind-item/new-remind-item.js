import { template } from 'underscore';

class NewRemindItem {
    constructor(el) {
        this.newRemindItem = el;
        this.newRemindItemInner = this.newRemindItem.querySelector('.js-new-remind-item-form');
        this.closeBtn = this.newRemindItem.querySelector('.js-close-btn');

        this.classes = {
            active: "is-active",
            visible: "is-visible"
        };

        this.setListener();
    }

    setListener() {
        this.newRemindItemInner.innerHTML += NewRemindItem.getReminderData();

        this.closeBtn.addEventListener("click", () => {
            this.closeNewItemPopup();
        });
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

        setTimeout(() => { // Задержка для плавного скрытия tooltip
            this.newRemindItem.classList.remove(this.classes.active);
        }, 150);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-new-remind-item");
    for (let i = 0; i < items.length; i++) {
        new NewRemindItem(items[i]);
    }
});
