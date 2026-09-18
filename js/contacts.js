document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("contactForm");

    const successModal = document.getElementById("successModal");
    const successModalClose = document.getElementById("successModalClose");
    const successModalOk = document.getElementById("successModalOk");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");

    const submitButton = document.getElementById("submitButton");


    // -------------------------
    // Ошибка поля
    // -------------------------

    function setInvalid(input, invalid) {

        const field = input.closest(".simple-field");

        if (!field) return;

        field.classList.toggle("is-invalid", invalid);
    }


    // -------------------------
    // Проверка формы
    // -------------------------

    function validateForm() {

        let valid = true;

        // Имя
        if (nameInput.value.trim().length < 2) {

            setInvalid(nameInput, true);
            valid = false;

        } else {

            setInvalid(nameInput, false);
        }


        // Email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailInput.value.trim())) {

            setInvalid(emailInput, true);
            valid = false;

        } else {

            setInvalid(emailInput, false);
        }


        // Телефон
        const phonePattern = /^[0-9]{9}$/;

        if (!phonePattern.test(phoneInput.value.trim())) {

            setInvalid(phoneInput, true);
            valid = false;

        } else {

            setInvalid(phoneInput, false);
        }


        // Сообщение
        if (messageInput.value.trim().length < 5) {

            setInvalid(messageInput, true);
            valid = false;

        } else {

            setInvalid(messageInput, false);
        }


        return valid;
    }


    // -------------------------
    // Отправка формы
    // -------------------------

    form.addEventListener("submit", async function (event) {

        event.preventDefault();


        // Проверяем форму
        if (!validateForm()) {
            return;
        }


        // Блокируем кнопку
        submitButton.disabled = true;
        submitButton.textContent = "Надсилання...";


        try {

            const formData = new FormData(form);

            const response = await fetch("form-send.php", {
                method: "POST",
                body: formData
            });


            const result = await response.text();


            console.log("Ответ PHP:", result);


            // PHP должен вернуть success
            if (result.trim() === "success") {

                successModal.classList.add("active");

                document.body.style.overflow = "hidden";

                form.reset();

            } else {

                alert(
                    "Не вдалося надіслати повідомлення.\n\n" +
                    "Спробуйте ще раз."
                );

                console.error("PHP error:", result);
            }


        } catch (error) {

            console.error("Ошибка отправки:", error);

            alert(
                "Сталася помилка під час надсилання.\n\n" +
                "Спробуйте ще раз."
            );

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Надіслати повідомлення";

        }

    });


    // -------------------------
    // Закрытие модального окна
    // -------------------------

    function closeModal() {

        successModal.classList.remove("active");

        document.body.style.overflow = "";
    }


    successModalClose.addEventListener(
        "click",
        closeModal
    );


    successModalOk.addEventListener(
        "click",
        closeModal
    );


    // Закрытие по клику вне окна

    successModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === successModal ||
                event.target.classList.contains("success-modal-overlay")
            ) {

                closeModal();
            }

        }
    );


    // Escape

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                successModal.classList.contains("active")
            ) {

                closeModal();
            }

        }
    );


    // -------------------------
    // Убираем ошибку при вводе
    // -------------------------

    [
        nameInput,
        emailInput,
        phoneInput,
        messageInput

    ].forEach(function (input) {

        input.addEventListener("input", function () {

            setInvalid(input, false);

        });

    });


    // -------------------------
    // Только цифры телефона
    // -------------------------

    phoneInput.addEventListener(
        "input",
        function () {

            this.value = this.value
                .replace(/\D/g, "")
                .slice(0, 9);

        }
    );

});
