/* ============================================
   HomeEasy Main Script
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------
     Sticky Navigation
     ------------------------------------------ */
  const nav = document.getElementById('mainNav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 80) {
        nav.classList.remove('transparent');
        nav.classList.add('scrolled');
      } else {
        nav.classList.add('transparent');
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------
     Mobile Menu
     ------------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('mobileOverlay');

  if (hamburger && navLinks) {
    const toggleMenu = () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // Close menu on nav link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) toggleMenu();
      });
    });
  }

  /* ------------------------------------------
     Smooth Scroll for anchor links
     ------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ------------------------------------------
     AOS-like Scroll Animation
     ------------------------------------------ */
  const aosElements = document.querySelectorAll('[data-aos]');
  if (aosElements.length) {
    const aosObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          aosObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    aosElements.forEach(el => aosObserver.observe(el));
  }

  /* ------------------------------------------
     Stat Counter Animation
     ------------------------------------------ */
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length) {
    const animateCounter = (el) => {
      const fixed = el.dataset.fixed;
      if (fixed) return; // Skip elements with fixed text like "Free"

      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '+';
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        if (target >= 1000) {
          el.textContent = current.toLocaleString() + suffix;
        } else {
          el.textContent = current + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  /* ------------------------------------------
     Review Carousel
     ------------------------------------------ */
  const reviewTrack = document.getElementById('reviewTrack');
  const dotsContainer = document.getElementById('carouselDots');

  if (reviewTrack && dotsContainer) {
    const slides = reviewTrack.querySelectorAll('.review-slide');
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;
    let isTransitioning = false;
    let autoplayTimer;

    const updateHeight = (slide) => {
      // Temporarily show to measure
      slide.style.position = 'absolute';
      slide.style.visibility = 'hidden';
      slide.style.display = 'block';
      const h = slide.offsetHeight;
      slide.style.position = '';
      slide.style.visibility = '';
      slide.style.display = '';
      reviewTrack.style.height = h + 'px';
    };

    const goToSlide = (index) => {
      if (isTransitioning || index === currentSlide) return;
      isTransitioning = true;

      const current = slides[currentSlide];
      const next = slides[index];

      // Update dots
      dots.forEach(d => d.classList.remove('active'));
      dots[index].classList.add('active');

      // Update height
      updateHeight(next);

      // Transition
      current.style.opacity = '0';
      current.style.transform = 'translateX(-30px)';

      setTimeout(() => {
        current.classList.remove('active');
        current.style.opacity = '';
        current.style.transform = '';
        current.style.display = 'none';

        next.style.display = 'block';
        next.style.opacity = '0';
        next.style.transform = 'translateX(30px)';

        requestAnimationFrame(() => {
          next.classList.add('active');
          next.style.opacity = '1';
          next.style.transform = 'translateX(0)';

          setTimeout(() => {
            next.style.opacity = '';
            next.style.transform = '';
            isTransitioning = false;
          }, 400);
        });

        currentSlide = index;
      }, 300);
    };

    const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
    const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

    if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(autoplayTimer); prevSlide(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(autoplayTimer); nextSlide(); startAutoplay(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { clearInterval(autoplayTimer); goToSlide(i); startAutoplay(); });
    });

    const startAutoplay = () => {
      autoplayTimer = setInterval(() => {
        if (!isTransitioning) nextSlide();
      }, 6000);
    };

    // Initialize
    updateHeight(slides[0]);
    startAutoplay();

    // Pause on hover
    reviewTrack.closest('.review-carousel').addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    reviewTrack.closest('.review-carousel').addEventListener('mouseleave', startAutoplay);

    // Pause on tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(autoplayTimer);
      else startAutoplay();
    });
  }

  /* ------------------------------------------
     FAQ Accordion
     ------------------------------------------ */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => i.classList.remove('open'));

      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });

  /* Contact form removed — replaced with voice-first CTA */

  /* ------------------------------------------
     Interactive Chat Demo
     ------------------------------------------ */
  var chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {

    // Conversation tree: each step has agent messages, then user choices that lead to next step
    var chatTree = {
      start: {
        agent: ["Hey! What\u2019s going on \u2014 are you actively looking, or just getting a feel for what\u2019s out there?"],
        choices: [
          { text: "Actively looking \u2014 moving soon", next: "timeline" },
          { text: "Just exploring options", next: "explore" },
          { text: "Relocating for work", next: "relocation" }
        ]
      },
      timeline: {
        agent: ["Nice \u2014 when do you need to be in? And what city are you looking at?"],
        choices: [
          { text: "Chicago, next 4\u20136 weeks", next: "chicago_details" },
          { text: "Dallas area, couple months", next: "dfw_details" },
          { text: "Not sure on city yet", next: "help_city" }
        ]
      },
      explore: {
        agent: ["No problem. What\u2019s making you think about a move? Lease ending, new job, just want something better?"],
        choices: [
          { text: "Lease ends soon", next: "timeline" },
          { text: "Looking for a better deal", next: "better_deal" },
          { text: "New job, need to relocate", next: "relocation" }
        ]
      },
      relocation: {
        agent: ["Relocations are what we do best \u2014 especially when you can\u2019t be there in person to tour. Which city is the job in?"],
        choices: [
          { text: "Chicago", next: "chicago_details" },
          { text: "Dallas / Houston / Austin", next: "dfw_details" },
          { text: "Denver / Atlanta / Nashville", next: "other_market" }
        ]
      },
      chicago_details: {
        agent: ["Chicago \u2014 great. We\u2019ve got 2,763 buildings there. Quick question: what matters more to you \u2014 being walkable and close to work, or getting more space for your money?"],
        choices: [
          { text: "Walkable, close to downtown", next: "chi_walkable" },
          { text: "More space, don\u2019t mind a commute", next: "chi_space" },
          { text: "Dog-friendly is my #1", next: "chi_dogs" }
        ]
      },
      dfw_details: {
        agent: ["Texas \u2014 4,294 buildings in DFW alone, plus Houston and Austin. Biggest inventory we\u2019ve got. What\u2019s your budget range looking like?"],
        choices: [
          { text: "Under $1,500", next: "texas_budget" },
          { text: "$1,500 \u2013 $2,200", next: "texas_mid" },
          { text: "Flexible, just want the best deal", next: "texas_mid" }
        ]
      },
      help_city: {
        agent: ["We can help with that. We cover Chicago, DFW, Houston, Austin, San Antonio, Denver, Atlanta, and Nashville. Where\u2019s the job? Or what\u2019s drawing you?"],
        choices: [
          { text: "Tell me where I get most for my money", next: "best_value" },
          { text: "Job\u2019s remote, I\u2019m flexible", next: "best_value" },
          { text: "Let me just talk to someone", next: "handoff" }
        ]
      },
      chi_walkable: {
        thinking: "Filtering 2,763 buildings\u2026 walk score 80+, Loop-adjacent, transit access\u2026",
        agent: ["South Loop and West Loop are your best bets. 14 buildings under $2K with walk scores above 90. 3 are running move-in specials this month. Two waive the pet deposit. Want me to walk you through the trade-offs between the two neighborhoods?"],
        choices: [
          { text: "Yes, walk me through it", next: "handoff" },
          { text: "Just send me the options", next: "handoff" }
        ]
      },
      chi_space: {
        thinking: "Filtering for $/sqft value\u2026 Lakeview, Lincoln Park, Wicker Park\u2026",
        agent: ["Lakeview gets you 15\u201320% more square footage than downtown for the same price. $2.10/sqft vs $2.80 in the Loop. 8 buildings running concessions right now \u2014 one\u2019s offering 6 weeks free."],
        choices: [
          { text: "Tell me more about that deal", next: "handoff" },
          { text: "What about Lincoln Park?", next: "handoff" }
        ]
      },
      chi_dogs: {
        thinking: "Checking pet policies across 2,763 buildings\u2026 breed restrictions, deposits, pet rent\u2026",
        agent: ["Good call asking first \u2014 42% of Chicago buildings have breed or weight restrictions. We\u2019ve verified pet policies on all of them. What kind of dog? That changes which buildings work."],
        choices: [
          { text: "Large breed, 70+ lbs", next: "handoff" },
          { text: "Small dog, under 30 lbs", next: "handoff" },
          { text: "Two dogs", next: "handoff" }
        ]
      },
      texas_budget: {
        thinking: "Scanning Texas markets\u2026 under $1,500, best $/sqft\u2026",
        agent: ["San Antonio is your best bang for buck \u2014 median $1,095 in Stone Oak, new construction, $1.64/sqft. DFW suburbs like Frisco have similar value. 9 buildings in Stone Oak alone running concessions right now."],
        choices: [
          { text: "Show me Stone Oak options", next: "handoff" },
          { text: "What about DFW?", next: "handoff" }
        ]
      },
      texas_mid: {
        thinking: "Analyzing 7,000+ Texas buildings\u2026 concessions, $/sqft, approval policies\u2026",
        agent: ["At that range you\u2019ve got options everywhere. Uptown Dallas: $2.40/sqft, 206 buildings. Midtown Houston: $2.20/sqft, 34 buildings. Austin downtown: $3.61 but with 5 buildings running 6\u20138 weeks free. Where\u2019s the job?"],
        choices: [
          { text: "DFW area", next: "handoff" },
          { text: "Houston", next: "handoff" },
          { text: "Not sure yet", next: "handoff" }
        ]
      },
      better_deal: {
        agent: ["What are you paying now, and what city? I can tell you in about 30 seconds whether you\u2019re overpaying relative to the market."],
        choices: [
          { text: "$1,800 in Chicago", next: "chi_walkable" },
          { text: "Over $2K in Dallas", next: "dfw_details" },
          { text: "I\u2019d rather just see options", next: "timeline" }
        ]
      },
      best_value: {
        agent: ["Purely on $/sqft: San Antonio ($1.64), then Houston ($2.05), then DFW ($2.15). Chicago and Austin are pricier but have more concessions running right now. What\u2019s your budget? That\u2019ll narrow it fast."],
        choices: [
          { text: "Under $1,500", next: "texas_budget" },
          { text: "$1,500 \u2013 $2,500", next: "texas_mid" },
          { text: "Let me talk to someone", next: "handoff" }
        ]
      },
      handoff: {
        agent: ["Perfect. Let me get you connected \u2014 call, text, or drop your info below and we\u2019ll reach out. Usually takes us a few minutes to get back to you with the full breakdown."],
        choices: [
          { text: "\ud83d\udcde Call now", next: "_call" },
          { text: "\ud83d\udcac Text us", next: "_text" },
          { text: "\u2709\ufe0f Leave my info", next: "_form" }
        ]
      }
    };

    function addMsg(type, text, cb) {
      // Show typing dots for agent messages
      if (type === 'agent' || type === 'thinking') {
        var dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(dots);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(function () {
          dots.remove();
          var el = document.createElement('div');
          el.className = type === 'thinking' ? 'chat-msg agent-thinking' : 'chat-msg agent';
          el.textContent = text;
          chatMessages.appendChild(el);
          chatMessages.scrollTop = chatMessages.scrollHeight;
          if (cb) cb();
        }, type === 'thinking' ? 1500 : 800);
      } else {
        var el = document.createElement('div');
        el.className = 'chat-msg user';
        el.textContent = text;
        chatMessages.appendChild(el);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        if (cb) cb();
      }
    }

    function showChoices(choices) {
      var wrap = document.createElement('div');
      wrap.className = 'chat-choices';
      choices.forEach(function (choice) {
        var btn = document.createElement('button');
        btn.className = 'chat-choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', function () {
          // Remove choice buttons
          wrap.remove();
          // Show user message
          addMsg('user', choice.text, function () {
            // Handle special actions
            if (choice.next === '_call') {
              window.location.href = 'tel:+13124689893';
              return;
            }
            if (choice.next === '_text') {
              window.location.href = 'sms:+13124689893';
              return;
            }
            if (choice.next === '_form') {
              document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
              return;
            }
            // Advance to next step
            setTimeout(function () { playStep(choice.next); }, 400);
          });
        });
        wrap.appendChild(btn);
      });
      chatMessages.appendChild(wrap);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function playStep(stepId) {
      var step = chatTree[stepId];
      if (!step) return;

      var agentMsgs = step.agent || [];
      var thinkingText = step.thinking || null;
      var idx = 0;

      function nextAgent() {
        if (thinkingText && idx === 0) {
          addMsg('thinking', thinkingText, function () {
            setTimeout(doAgent, 400);
          });
          thinkingText = null;
          return;
        }
        doAgent();
      }

      function doAgent() {
        if (idx < agentMsgs.length) {
          addMsg('agent', agentMsgs[idx], function () {
            idx++;
            if (idx < agentMsgs.length) {
              setTimeout(nextAgent, 600);
            } else if (step.choices) {
              setTimeout(function () { showChoices(step.choices); }, 400);
            }
          });
        } else if (step.choices) {
          showChoices(step.choices);
        }
      }

      nextAgent();
    }

    // Start when scrolled into view
    var chatStarted = false;
    var chatObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !chatStarted) {
          chatStarted = true;
          chatObserver.disconnect();
          playStep('start');
        }
      });
    }, { threshold: 0.3 });

    chatObserver.observe(chatMessages);
  }

});
