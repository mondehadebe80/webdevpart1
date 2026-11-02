(function () {
    "use strict";

    var images = Array.prototype.slice.call(
        document.querySelectorAll(".lightbox-image")
    );
    var lightbox = document.getElementById("gallery-lightbox");
    var lightboxImage = document.getElementById("lightbox-img");
    var lightboxCaption = document.getElementById("lightbox-caption");
    var closeButton = document.getElementById("lightbox-close");
    var prevButton = document.getElementById("lightbox-prev");
    var nextButton = document.getElementById("lightbox-next");
    var currentIndex = 0;

    if (!images.length || !lightbox || !lightboxImage || !lightboxCaption) {
        return;
    }

    function renderImage(index) {
        var image = images[index];

        if (!image) {
            return;
        }

        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt || "";
        lightboxCaption.textContent =
            image.getAttribute("data-caption") || image.alt || "";
        currentIndex = index;
    }

    function openLightbox(index) {
        renderImage(index);
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function showNext() {
        var nextIndex = (currentIndex + 1) % images.length;
        renderImage(nextIndex);
    }

    function showPrevious() {
        var previousIndex =
            (currentIndex - 1 + images.length) % images.length;
        renderImage(previousIndex);
    }

    images.forEach(function (image, index) {
        image.addEventListener("click", function () {
            openLightbox(index);
        });
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeLightbox);
    }

    if (nextButton) {
        nextButton.addEventListener("click", showNext);
    }

    if (prevButton) {
        prevButton.addEventListener("click", showPrevious);
    }

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (!lightbox.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        } else if (event.key === "ArrowRight") {
            showNext();
        } else if (event.key === "ArrowLeft") {
            showPrevious();
        }
    });
})();