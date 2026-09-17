document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("callbackModal");
    const closeButton = document.getElementById("callbackClose");
    const overlay = document.querySelector(".callback-overlay");

    const form = document.getElementById("callbackForm");
    const phone = document.getElementById("callbackPhone");

    const success = document.getElementById("callbackSuccess");


    /* Показываем окно через 1.2 секунды */

    setTimeout(function () {
        modal.classList.add("active");
    }, 1200);


    /* Закрытие */

    function closeModal() {
        modal.classList.remove("active");
    }

    closeButton.addEventListener("click", closeModal);

    overlay.addEventListener("click", closeModal);


    /* Закрытие клавишей Escape */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeModal();
        }

    });


    /* Только цифры */

    phone.addEventListener("input", function () {

        this.value = this.value.replace(/\D/g, "");

    });


    /* Отправка */

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        if (phone.value.length !== 9) {

            phone.focus();

            return;
        }


        /*
         * Здесь позже можно подключить
         * отправку номера на сервер / Telegram / email.
         */

        form.style.display = "none";

        success.classList.add("active");


        /* Закрываем через 3 секунды */

        setTimeout(function () {
            closeModal();

            form.style.display = "";
            success.classList.remove("active");

            phone.value = "";

        }, 3000);

    });

});
