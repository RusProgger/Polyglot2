document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("contactForm");

    const successModal = document.getElementById("successModal");
    const successModalClose = document.getElementById("successModalClose");
    const successModalOk = document.getElementById("successModalOk");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");


    function setInvalid(input, invalid) {

        const field = input.closest(".contact-field");

        if (!field) return;

        field.classList.toggle("is-invalid", invalid);

    }


    function validateForm() {

        let valid = true;


        // Name
        if (nameInput.value.trim().length < 2) {

            setInvalid(nameInput, true);

            valid = false;

        } else {

            setInvalid(nameInput, false);

        }


        // Email
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailInput.value.trim())) {

            setInvalid(emailInput, true);

            valid = false;

        } else {

            setInvalid(emailInput, false);

        }


        // Phone
        const phonePattern = /^[0-9]{9}$/;

        if (!phonePattern.test(phoneInput.value.trim())) {

            setInvalid(phoneInput, true);

            valid = false;

        } else {

            setInvalid(phoneInput, false);

        }


        // Message
        if (messageInput.value.trim().length < 5) {

            setInvalid(messageInput, true);

            valid = false;

        } else {

            setInvalid(messageInput, false);

        }


        return valid;

    }


    /* Submit */

    form.addEventListener("submit", function (event) {

        event.preventDefault();


        if (!validateForm()) {
            return;
        }


        // Здесь форма прошла проверку
        successModal.classList.add("active");

        document.body.style.overflow = "hidden";

    });


    /* Close modal */

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
        function () {

            closeModal();

            form.reset();

        }
    );


    /* Close by clicking outside */

    successModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === successModal ||
                event.target.classList.contains(
                    "success-modal-overlay"
                )
            ) {

                closeModal();

            }

        }
    );


    /* Escape */

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


    /* Remove error when user starts typing */

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


    /* Only numbers in phone */

    phoneInput.addEventListener(
        "input",
        function () {

            this.value = this.value
                .replace(/\D/g, "")
                .slice(0, 9);

        }
    );

});
