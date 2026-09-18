 document.addEventListener("DOMContentLoaded", function () {

    const faqItems = document.querySelectorAll(".faq-item");


    faqItems.forEach(function (item) {

        const button = item.querySelector(".faq-question");


        if (!button) {
            return;
        }


        button.addEventListener("click", function () {

            const wasOpen = item.classList.contains("active");


            /*
             * Закрываем все вопросы
             */
            faqItems.forEach(function (faq) {

                faq.classList.remove("active");

            });


            /*
             * Если нажатый вопрос был закрыт —
             * открываем его
             */
            if (!wasOpen) {

                item.classList.add("active");

            }

        });

    });

});