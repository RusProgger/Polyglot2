/* =========================================
   REVIEWS SLIDER
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const track = document.querySelector(".reviews-track");
    const slides = document.querySelectorAll(".review-slide");
    const prevButton = document.querySelector(".reviews-prev");
    const nextButton = document.querySelector(".reviews-next");
    const dotsContainer = document.querySelector(".reviews-dots");
    const slider = document.querySelector(".reviews-slider");

    if (!track || !slides.length) return;

    let currentIndex = 0;
    let autoplay;

    // Время между автоматическими переключениями
    const AUTOPLAY_DELAY = 7000;

    function getSlidesPerView() {

        if (window.innerWidth < 768) {
            return 1;
        }

        if (window.innerWidth < 992) {
            return 2;
        }

        return 3;
    }

    function getMaxIndex() {
        return Math.max(0, slides.length - getSlidesPerView());
    }

    function createDots() {

        dotsContainer.innerHTML = "";

        const maxIndex = getMaxIndex();

        for (let i = 0; i <= maxIndex; i++) {

            const dot = document.createElement("button");

            dot.classList.add("review-dot");

            dot.type = "button";
            dot.setAttribute(
                "aria-label",
                `Відкрити групу відгуків ${i + 1}`
            );

            dot.addEventListener("click", function () {

                currentIndex = i;

                updateSlider();

                restartAutoplay();
            });

            dotsContainer.appendChild(dot);
        }
    }

    function updateSlider() {

        const slidesPerView = getSlidesPerView();
        const maxIndex = getMaxIndex();

        if (currentIndex > maxIndex) {
            currentIndex = 0;
        }

        const slideWidth = 100 / slidesPerView;

        track.style.transform =
            `translateX(-${currentIndex * slideWidth}%)`;

        const dots = document.querySelectorAll(".review-dot");

        dots.forEach((dot, index) => {

            dot.classList.toggle(
                "active",
                index === currentIndex
            );

        });
    }

    function nextSlide() {

        const maxIndex = getMaxIndex();

        if (currentIndex >= maxIndex) {
            currentIndex = 0;
        } else {
            currentIndex++;
        }

        updateSlider();
    }

    function prevSlide() {

        const maxIndex = getMaxIndex();

        if (currentIndex <= 0) {
            currentIndex = maxIndex;
        } else {
            currentIndex--;
        }

        updateSlider();
    }

    function startAutoplay() {

        stopAutoplay();

        autoplay = setInterval(function () {
            nextSlide();
        }, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {

        if (autoplay) {
            clearInterval(autoplay);
            autoplay = null;
        }
    }

    function restartAutoplay() {

        stopAutoplay();

        startAutoplay();
    }


    /* ===============================
       BUTTONS
       =============================== */

    nextButton.addEventListener("click", function () {

        nextSlide();

        restartAutoplay();

    });

    prevButton.addEventListener("click", function () {

        prevSlide();

        restartAutoplay();

    });


    /* ===============================
       PAUSE ON HOVER
       =============================== */

    slider.addEventListener("mouseenter", function () {
        stopAutoplay();
    });

    slider.addEventListener("mouseleave", function () {
        startAutoplay();
    });


    /* ===============================
       RESIZE
       =============================== */

    window.addEventListener("resize", function () {

        createDots();

        updateSlider();

    });


    /* ===============================
       START
       =============================== */

    createDots();

    updateSlider();

    startAutoplay();

});
