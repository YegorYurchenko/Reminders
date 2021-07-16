class Header {
    constructor(el) {
        this.header = el;
        this.addNewItemBtn = this.header.querySelector('.js-header-add-new-item');
        this.addNewItemForm = document.querySelector('.js-new-remind-item');

        this.classes = {
            active: "is-active",
            visible: "is-visible"
        };

        this.setListener();
    }

    setListener() {
        this.addNewItemBtn.addEventListener("click", () => {
            this.openNewItemPopup();
        });
    }

    /**
     * Открываем popup добавления нового item
     * @returns {void}
     */
    openNewItemPopup() {
        this.addNewItemForm.classList.add(this.classes.visible);

        setTimeout(() => {
            this.addNewItemForm.classList.add(this.classes.active);
        }, 33);
    } 
}

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".js-header");
    for (let i = 0; i < items.length; i++) {
        new Header(items[i]);
    }
});
