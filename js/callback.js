document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("callbackModal");
    const closeButton = document.getElementById("callbackClose");
    const overlay = document.querySelector(".callback-overlay");

    const form = document.getElementById("callbackForm");
    const phone = document.getElementById("callbackPhone");

    const success = document.getElementById("callbackSuccess");


    // Открытие модального окна через 1.2 секунды

    setTimeout(function () {

        if (modal) {
            modal.classList.add("active");
        }

    }, 1200);



    // Закрытие модального окна

    function closeModal() {

        modal.classList.remove("active");

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );

    }



    // Закрытие клавишей Escape

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeModal();

            }

        }
    );



    // Только цифры телефона

    phone.addEventListener(
        "input",
        function () {

            this.value = this.value
                .replace(/\D/g, "")
                .slice(0, 9);

        }
    );



    // Отправка формы

    form.addEventListener(
        "submit",
        async function (event) {


            event.preventDefault();



            if (phone.value.length !== 9) {

                phone.focus();

                return;

            }



            const formData = new FormData(form);



            try {


                const response = await fetch(
                    "send-callback.php",
                    {
                        method: "POST",
                        body: formData
                    }
                );



                const result = await response.text();



                console.log(result);



                if (result.trim() === "success") {



                    form.style.display = "none";


                    success.classList.add("active");



                    setTimeout(function () {


                        closeModal();


                        form.style.display = "";


                        success.classList.remove("active");


                        form.reset();



                    }, 3000);



                } else {


                    alert(
                        "Помилка відправки заявки"
                    );


                    console.log(
                        "Ответ PHP:",
                        result
                    );


                }



            } catch (error) {


                console.error(
                    "Ошибка:",
                    error
                );


                alert(
                    "Не вдалося відправити заявку"
                );


            }


        }
    );


});
