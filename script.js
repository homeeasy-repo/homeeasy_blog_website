document.addEventListener('DOMContentLoaded', function() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    const container = document.querySelector('.testimonial-container');
    const testimonialSection = document.querySelector('.testimonials');
    let currentIndex = 0;
    let isAnimating = false;
    let isAutoScrollPaused = false;

    function scrollToTestimonials() {
        testimonialSection.scrollIntoView({ behavior: 'smooth' });
    }

    function getTestimonialHeight(testimonial) {
        testimonial.style.position = 'absolute';
        testimonial.style.visibility = 'hidden';
        testimonial.style.display = 'block';
        const height = testimonial.offsetHeight;
        testimonial.style.position = '';
        testimonial.style.visibility = '';
        testimonial.style.display = '';
        return height;
    }

    function updateContainerHeight(testimonial) {
        const height = getTestimonialHeight(testimonial);
        container.style.height = `${height}px`;
    }

    function initialize() {
        testimonials.forEach((testimonial, index) => {
            if (index === currentIndex) {
                testimonial.classList.add('active');
                dots[index].classList.add('active');
                updateContainerHeight(testimonial);
            }
        });
        startAutoScroll();
    }

    function showTestimonial(index, direction = 'right', shouldScroll = true) {
        if (isAnimating) return;
        isAnimating = true;

        if (shouldScroll) {
            scrollToTestimonials();
        }

        const currentTestimonial = testimonials[currentIndex];
        const nextTestimonial = testimonials[index];

        // Update container height before transition
        updateContainerHeight(nextTestimonial);

        // Reset other testimonials
        testimonials.forEach(testimonial => {
            if (testimonial !== currentTestimonial && testimonial !== nextTestimonial) {
                testimonial.className = 'testimonial';
            }
        });

        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');

        // Set up the transition
        requestAnimationFrame(() => {
            // Prepare testimonials for animation
            currentTestimonial.className = 'testimonial active';
            nextTestimonial.className = 'testimonial';
            nextTestimonial.style.display = 'block';

            // Force reflow
            void currentTestimonial.offsetWidth;
            void nextTestimonial.offsetWidth;

            // Add transition classes
            if (direction === 'right') {
                currentTestimonial.classList.add('sliding-left');
                nextTestimonial.classList.add('sliding-in-right');
                currentTestimonial.style.transform = 'translateX(-100%)';
                nextTestimonial.style.transform = 'translateX(0)';
            } else {
                currentTestimonial.classList.add('sliding-right');
                nextTestimonial.classList.add('sliding-in-left');
                currentTestimonial.style.transform = 'translateX(100%)';
                nextTestimonial.style.transform = 'translateX(0)';
            }

            // Update current index
            currentIndex = index;

            // Clean up after transition
            setTimeout(() => {
                currentTestimonial.className = 'testimonial';
                currentTestimonial.style.transform = '';
                currentTestimonial.style.display = 'none';
                
                nextTestimonial.className = 'testimonial active';
                nextTestimonial.style.transform = '';
                
                isAnimating = false;
            }, 600);
        });
    }

    function startAutoScroll() {
        return setInterval(() => {
            if (!isAnimating && !isAutoScrollPaused) {
                const newIndex = (currentIndex + 1) % testimonials.length;
                showTestimonial(newIndex, 'right', false);
            }
        }, 5000);
    }

    // Previous button click handler
    prevArrow.addEventListener('click', () => {
        if (isAnimating) return;
        const newIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        showTestimonial(newIndex, 'left');
    });

    // Next button click handler
    nextArrow.addEventListener('click', () => {
        if (isAnimating) return;
        const newIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(newIndex, 'right');
    });

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isAnimating || index === currentIndex) return;
            const direction = index > currentIndex ? 'right' : 'left';
            showTestimonial(index, direction);
        });
    });

    // Auto-advance slides and handle hover
    let autoplayInterval = startAutoScroll();

    const testimonialSlider = document.querySelector('.testimonial-slider');
    testimonialSlider.addEventListener('mouseenter', () => {
        isAutoScrollPaused = true;
        clearInterval(autoplayInterval);
    });

    testimonialSlider.addEventListener('mouseleave', () => {
        isAutoScrollPaused = false;
        autoplayInterval = startAutoScroll();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (!isAnimating) {
            updateContainerHeight(testimonials[currentIndex]);
        }
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isAutoScrollPaused = true;
            clearInterval(autoplayInterval);
        } else {
            isAutoScrollPaused = false;
            autoplayInterval = startAutoScroll();
        }
    });

    // Initialize the slider
    initialize();
}); 