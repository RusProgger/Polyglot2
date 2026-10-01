/* =========================================
   Polyglot Translate — форма відгуків
   Кнопка "Написати відгук" + модальне вікно
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const section = document.querySelector(".reviews-section");
    const track = document.querySelector(".reviews-track");

    if (!section || !track) return;

    const API_URL = "reviews.php";


    // ------------------------------------------
    // Іконка зірки
    // ------------------------------------------

    const STAR_PATH =
        "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8" +
        "L2.2 9.1l6.9-.8L12 2z";

    function starIcon(filled) {

        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");

        const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        path.setAttribute("d", STAR_PATH);

        if (filled) {

            path.setAttribute("fill", "currentColor");

        } else {

            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "currentColor");
            path.setAttribute("stroke-width", "1.5");

        }

        svg.appendChild(path);

        return svg;
    }


    // ------------------------------------------
    // Картка відгуку
    // ------------------------------------------

    function buildSlide(review) {

        const rating = Math.min(5, Math.max(1, parseInt(review.rating, 10) || 5));

        const slide = document.createElement("div");
        slide.className = "review-slide review-slide--user";

        const card = document.createElement("div");
        card.className = "review-card review-card--user";


        // Зірки
        const stars = document.createElement("div");
        stars.className = "review-stars";

        for (let i = 1; i <= 5; i++) {
            stars.appendChild(starIcon(i <= rating));
        }


        // Текст
        const text = document.createElement("div");
        text.className = "review-text";
        text.textContent = "«" + review.text + "»";


        // Автор
        const author = document.createElement("div");
        author.className = "review-author";

        const avatar = document.createElement("div");
        avatar.className = "review-avatar";
        avatar.textContent = review.initial ||
            String(review.name || "?").trim().charAt(0).toUpperCase();

        const info = document.createElement("div");

        const name = document.createElement("div");
        name.className = "review-name";
        name.textContent = review.name;

        const role = document.createElement("div");
        role.className = "review-role";
        role.textContent = "Відгук на сайті";

        info.appendChild(name);
        info.appendChild(role);

        author.appendChild(avatar);
        author.appendChild(info);


        card.appendChild(stars);
        card.appendChild(text);
        card.appendChild(author);

        slide.appendChild(card);

        return slide;
    }


    function refreshSlider() {

        document.dispatchEvent(new CustomEvent("reviews:updated"));

    }


    // Полная перерисовка пользовательских отзывов
    function renderReviews(reviews) {

        track.querySelectorAll(".review-slide--user").forEach(function (slide) {

            slide.remove();

        });

        reviews.forEach(function (review) {

            track.insertBefore(buildSlide(review), track.firstChild);

        });

        refreshSlider();

    }


    function loadReviews() {

        fetch(API_URL)

            .then(function (response) {

                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }

                return response.json();

            })

            .then(function (result) {

                if (!result || !result.ok || !result.reviews) return;

                renderReviews(result.reviews);

            })

            .catch(function (error) {

                console.warn("Відгуки не завантажились:", error);

            });

    }


    // ------------------------------------------
    // Кнопка
    // ------------------------------------------

    const openButton = document.createElement("button");

    openButton.type = "button";
    openButton.className = "rv-open";

    openButton.appendChild(starIcon(true));

    const openLabel = document.createElement("span");

    openLabel.textContent = "Написати відгук";

    openButton.appendChild(openLabel);

    const dots = section.querySelector(".reviews-dots");

    if (dots) {
        dots.parentNode.insertBefore(openButton, dots.nextSibling);
    } else {
        section.querySelector(".container").appendChild(openButton);
    }


    // ------------------------------------------
    // Модальне вікно
    // ------------------------------------------

    const modal = document.createElement("div");
    modal.className = "rv-modal";
    modal.id = "reviewModal";

    modal.innerHTML =
        '<div class="rv-overlay"></div>' +
        '<div class="rv-window" role="dialog" aria-modal="true">' +
            '<button type="button" class="rv-close" aria-label="Закрити">&times;</button>' +
            '<h3 class="rv-title">Залишити відгук</h3>' +
            '<p class="rv-subtitle">Ваш досвід допоможе іншим зробити вибір</p>' +
            '<form class="rv-form" novalidate>' +
                '<label class="rv-label" for="rvName">Ваше ім\'я</label>' +
                '<input class="rv-input" type="text" id="rvName" name="name" ' +
                    'maxlength="60" placeholder="Наприклад, Олена" autocomplete="name">' +
                '<label class="rv-label">Оцінка</label>' +
                '<div class="rv-stars" data-rating="5">' +
                    '<button type="button" class="rv-star" data-value="1" aria-label="1 зірка"></button>' +
                    '<button type="button" class="rv-star" data-value="2" aria-label="2 зірки"></button>' +
                    '<button type="button" class="rv-star" data-value="3" aria-label="3 зірки"></button>' +
                    '<button type="button" class="rv-star" data-value="4" aria-label="4 зірки"></button>' +
                    '<button type="button" class="rv-star" data-value="5" aria-label="5 зірок"></button>' +
                '</div>' +
                '<label class="rv-label" for="rvText">Ваш відгук</label>' +
                '<textarea class="rv-textarea" id="rvText" name="text" rows="5" ' +
                    'maxlength="1000" placeholder="Що вам сподобалось або що можна покращити..."></textarea>' +
                '<label class="rv-label" for="rvCaptcha">Код з картинки</label>' +
                '<div class="rv-captcha">' +
                    '<button type="button" class="rv-captcha-img" ' +
                        'aria-label="Оновити код" title="Натисніть, щоб оновити">' +
                        '<img alt="Код підтвердження" src="captcha.php?img=1">' +
                        '<span class="rv-captcha-text"></span>' +
                    '</button>' +
                    '<input class="rv-input rv-captcha-input" type="text" id="rvCaptcha" ' +
                        'name="captcha" maxlength="10" autocomplete="off" ' +
                        'placeholder="Введіть код">' +
                '</div>' +
                '<p class="rv-error" role="alert"></p>' +
                '<button type="submit" class="rv-submit">Надіслати відгук</button>' +
            '</form>' +
            '<div class="rv-success">' +
                '<div class="rv-success-icon">&#10003;</div>' +
                '<h4>Дякуємо за відгук!</h4>' +
                '<p>Він вже з\'явився у списку.</p>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);


    const form = modal.querySelector(".rv-form");
    const nameInput = modal.querySelector("#rvName");
    const textInput = modal.querySelector("#rvText");
    const captchaInput = modal.querySelector("#rvCaptcha");
    const captchaButton = modal.querySelector(".rv-captcha-img");
    const captchaImage = captchaButton.querySelector("img");
    const starsBox = modal.querySelector(".rv-stars");
    const errorBox = modal.querySelector(".rv-error");
    const submitButton = modal.querySelector(".rv-submit");
    const successBox = modal.querySelector(".rv-success");

    let rating = 5;


    // ------------------------------------------
    // Зірки у формі
    // ------------------------------------------

    function paintStars(value) {

        starsBox.querySelectorAll(".rv-star").forEach(function (button) {

            const isActive = Number(button.dataset.value) <= value;

            button.classList.toggle("is-active", isActive);
            button.replaceChildren(starIcon(isActive));

        });

    }

    starsBox.addEventListener("click", function (event) {

        const button = event.target.closest(".rv-star");

        if (!button) return;

        rating = Number(button.dataset.value);

        starsBox.dataset.rating = String(rating);

        paintStars(rating);

    });

    starsBox.addEventListener("mouseover", function (event) {

        const button = event.target.closest(".rv-star");

        if (!button) return;

        paintStars(Number(button.dataset.value));

    });

    starsBox.addEventListener("mouseleave", function () {

        paintStars(rating);

    });


    // ------------------------------------------
    // Капча
    // ------------------------------------------

    function loadCaptcha() {

        captchaInput.classList.remove("is-invalid");
        captchaInput.value = "";

        fetch("captcha.php")

            .then(function (response) {
                return response.json();
            })

            .then(function (result) {

                if (!result || !result.ok) return;

                // Нет GD на сервере — показываем пример
                if (result.type === "math") {

                    captchaButton.classList.add("is-math");
                    captchaButton.querySelector(".rv-captcha-text").textContent =
                        result.question;

                } else {

                    captchaButton.classList.remove("is-math");
                    captchaButton.querySelector(".rv-captcha-text").textContent = "";

                    captchaImage.src =
                        result.url + "&r=" + Date.now();

                }

            })

            .catch(function () {

                // Если captcha.php недоступен — пробуем картинку напрямую
                captchaImage.src = "captcha.php?img=1&r=" + Date.now();

            });

    }


    function refreshCaptcha() {

        // loadCaptcha() сам определит — картинка это или пример
        loadCaptcha();

    }


    captchaButton.addEventListener("click", refreshCaptcha);

    captchaInput.addEventListener("input", function () {
        setInvalid(this, false);
        errorBox.textContent = "";
    });


    // ------------------------------------------
    // Відкрити / закрити
    // ------------------------------------------

    function openModal() {

        modal.classList.add("active");

        document.body.style.overflow = "hidden";

        loadCaptcha();

        setTimeout(function () {
            nameInput.focus();
        }, 250);

    }

    function closeModal() {

        modal.classList.remove("active");

        document.body.style.overflow = "";

    }

    openButton.addEventListener("click", openModal);

    modal.querySelector(".rv-close").addEventListener("click", closeModal);

    modal.querySelector(".rv-overlay").addEventListener("click", closeModal);

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }

    });


    // ------------------------------------------
    // Валідація
    // ------------------------------------------

    function setInvalid(input, invalid) {
        input.classList.toggle("is-invalid", invalid);
    }

    [nameInput, textInput].forEach(function (input) {

        input.addEventListener("input", function () {
            setInvalid(this, false);
            errorBox.textContent = "";
        });

    });


    function validate() {

        let valid = true;

        if (nameInput.value.trim().length < 2) {

            setInvalid(nameInput, true);
            valid = false;

        } else {

            setInvalid(nameInput, false);

        }

        if (textInput.value.trim().length < 10) {

            setInvalid(textInput, true);
            valid = false;

        } else {

            setInvalid(textInput, false);

        }

        if (captchaInput.value.trim() === "") {

            setInvalid(captchaInput, true);
            valid = false;

        } else {

            setInvalid(captchaInput, false);

        }

        if (!valid) {
            errorBox.textContent =
                "Заповніть ім'я, відгук (від 10 символів) та код капчи.";
        }

        return valid;

    }


    // ------------------------------------------
    // Відправка
    // ------------------------------------------

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!validate()) return;

        submitButton.disabled = true;
        submitButton.textContent = "Надсилаємо...";

        const payload = new FormData();

        payload.append("name", nameInput.value);
        payload.append("text", textInput.value);
        payload.append("rating", String(rating));
        payload.append("captcha", captchaInput.value);
        payload.append("website", "");


        try {

            const response = await fetch(API_URL, {
                method: "POST",
                body: payload
            });

            const result = await response.json();

            if (!result || !result.ok) {

                errorBox.textContent =
                    (result && result.error) ||
                    "Не вдалося надіслати відгук. Спробуйте ще раз.";

                // Капча одноразова — після будь-якої відповіді сервера
                // її вже не прийняти, тому оновлюємо
                if (/капч|код/i.test(errorBox.textContent)) {
                    setInvalid(captchaInput, true);
                }

                refreshCaptcha();

                return;

            }


            // Дубль — просто закриваємо
            if (!result.review) {

                form.reset();
                rating = 5;
                paintStars(5);

                showSuccess();

                return;

            }


            form.reset();
            rating = 5;
            paintStars(5);

            showSuccess();

            // Обновляем список с сервера — отзыв уже там
            loadReviews();


        } catch (error) {

            console.error("Помилка відгуку:", error);

            errorBox.textContent =
                "Немає зв'язку із сервером. Спробуйте пізніше.";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Надіслати відгук";

        }

    });


    function showSuccess() {

        form.style.display = "none";

        successBox.classList.add("active");

        setTimeout(function () {

            successBox.classList.remove("active");

            form.style.display = "";

            closeModal();

        }, 2200);

    }


    // ------------------------------------------
    // Старт
    // ------------------------------------------

    paintStars(5);

    loadReviews();

});