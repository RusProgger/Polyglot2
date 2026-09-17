/* =========================================
   REVIEWS SLIDER
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const track = document.querySelector(".reviews-track");
    const slides = document.querySelectorAll(".review-slide");
    const prevButton = document.querySelector(".reviews-prev");
    const nextButton = document.querySelector(".reviews-next");
    const dotsContainer = document.querySelector(".reviews-dots");

    if (!track || !slides.length) return;

    let currentIndex = 0;
    let autoplay;

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
            dot.setAttribute("aria-label", `Відкрити відгуки ${i + 1}`);

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
        autoplay = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        clearInterval(autoplay);
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    nextButton.addEventListener("click", function () {
        nextSlide();
        restartAutoplay();
    });

    prevButton.addEventListener("click", function () {
        prevSlide();
        restartAutoplay();
    });

    /* Pause when mouse is over slider */
    const slider = document.querySelector(".reviews-slider");

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    /* Recalculate after resize */
    window.addEventListener("resize", function () {
        createDots();
        updateSlider();
    });

    createDots();
    updateSlider();
    startAutoplay();

});
