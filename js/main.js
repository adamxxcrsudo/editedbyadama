/**
 * Adam Carr Portfolio - Main JavaScript
 * Video Editor themed portfolio with interactions
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initCounterAnimation();
  initPortfolioFilter();
  initVideoCards();
  initTimelineAnimation();
  initSmoothScroll();
  initScrollProgress();
  initBackToTop();
  initFeaturedVideo();
});

/**
 * Navigation functionality
 */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll behavior for nav background
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.classList.toggle('active');
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -80% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle?.classList.remove('active');
    });
  });
}

/**
 * Scroll-triggered animations
 */
function initScrollAnimations() {
  const animateElements = document.querySelectorAll(
    '.section-header, .about-grid, .project-card, .review-card, .skill-card, .contact-content, .timeline-container'
  );

  animateElements.forEach(el => el.classList.add('animate-on-scroll'));

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach(el => observer.observe(el));
}

/**
 * Animated number counters
 */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        el.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target;
        // Add plus sign for larger numbers
        if (target >= 100) {
          el.textContent = target + '+';
        }
      }
    };

    updateCounter();
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

/**
 * Portfolio filtering
 */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter projects
      projectCards.forEach((card, index) => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          card.style.display = '';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/**
 * Video card interactions
 */
function initVideoCards() {
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    const video = card.querySelector('.project-video');
    const playBtn = card.querySelector('.play-btn');
    const fallback = card.querySelector('.video-fallback');

    if (!video) return;

    // Check if video source exists
    const hasVideo = video.src && video.src.includes('.mp4');

    if (hasVideo && fallback) {
      fallback.style.display = 'none';
    }

    // Play on hover
    let playPromise = null;

    card.addEventListener('mouseenter', () => {
      if (!video.src || video.readyState < 2) return;

      playPromise = video.play().catch(() => {
        // Autoplay was prevented, that's fine
      });
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });

    // Play button toggle
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (video.paused) {
          video.play();
          card.classList.add('playing');
        } else {
          video.pause();
          card.classList.remove('playing');
        }
      });
    }

    // Update progress bar
    if (hasVideo) {
      video.addEventListener('loadedmetadata', () => {
        const progress = card.querySelector('.timeline-progress');
        if (progress) {
          video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100;
            progress.style.width = `${percent}%`;
          });
        }
      });
    }
  });
}

/**
 * Interactive timeline animation
 * Playhead moves as user scrolls through the section
 */
function initTimelineAnimation() {
  const processSection = document.querySelector('.process');
  const timelinePlayhead = document.querySelector('.timeline-playhead');
  const processDetails = document.querySelectorAll('.process-detail');
  const clips = document.querySelectorAll('.clip');

  if (!processSection || !timelinePlayhead) return;

  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -10% 0px',
    threshold: Array.from({ length: 11 }, (_, i) => i / 10)
  };

  let currentStep = 1;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ratio = entry.intersectionRatio;
        const rect = entry.boundingClientRect;
        const sectionHeight = entry.target.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate playhead position (0-100%)
        const sectionTop = rect.top;
        const travel = viewportHeight + sectionHeight;
        const progress = Math.max(0, Math.min(1, (viewportHeight - sectionTop) / travel));

        // Move playhead (20% start to 95% end)
        const playheadPosition = 20 + (progress * 75);
        timelinePlayhead.style.left = `${playheadPosition}%`;

        // Determine which step is active
        let activeStep = 1;
        if (progress > 0.85) activeStep = 7;
        else if (progress > 0.72) activeStep = 6;
        else if (progress > 0.58) activeStep = 5;
        else if (progress > 0.45) activeStep = 4;
        else if (progress > 0.32) activeStep = 3;
        else if (progress > 0.18) activeStep = 2;

        // Update active details
        if (activeStep !== currentStep) {
          currentStep = activeStep;
          processDetails.forEach(detail => {
            detail.classList.remove('active');
            if (parseInt(detail.dataset.step) === activeStep) {
              detail.classList.add('active');
            }
          });

          // Highlight active clip
          clips.forEach(clip => {
            const clipStep = parseInt(clip.dataset.step);
            if (clipStep === activeStep) {
              clip.style.transform = 'scale(1.05)';
              clip.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
            } else {
              clip.style.transform = '';
              clip.style.boxShadow = '';
            }
          });
        }
      }
    });
  }, observerOptions);

  observer.observe(processSection);
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.querySelector('.nav').offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Magnetic button effect (premium interaction)
 */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/**
 * Parallax effect for hero background
 */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  const waveformBg = document.querySelector('.waveform-bg');
  const playheadLine = document.querySelector('.timeline-bg .playhead-line');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (waveformBg && scrollY < window.innerHeight) {
      waveformBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    }

    if (playheadLine && scrollY < window.innerHeight) {
      const progress = scrollY / window.innerHeight;
      playheadLine.style.left = `${50 + progress * 30}%`;
    }
  }, { passive: true });
}

/**
 * Skill cards hover animation
 */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.background = 'rgba(59, 130, 246, 0.1)';
  });

  card.addEventListener('mouseleave', function() {
    this.style.background = '';
  });
});

/**
 * Review cards stagger animation
 */
const reviewCards = document.querySelectorAll('.review-card');
const reviewObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 100);
      reviewObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

reviewCards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = 'all 0.5s ease';
  reviewObserver.observe(card);
});

/**
 * Scroll progress indicator
 */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/**
 * Back to top button
 */
function initBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Featured video interaction
 */
function initFeaturedVideo() {
  const featured = document.querySelector('.featured-project');
  if (!featured) return;

  const video = featured.querySelector('.featured-video');
  const playBtn = featured.querySelector('.play-btn');
  const fallback = featured.querySelector('.video-fallback-featured');

  if (!video) return;

  // Check if video exists
  const hasVideo = video.src && video.src.includes('.mp4');

  if (hasVideo && fallback) {
    fallback.style.display = 'none';
  }

  // Play on hover
  featured.addEventListener('mouseenter', () => {
    if (!video.src || video.readyState < 2) return;
    video.play().catch(() => {});
  });

  featured.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });

  // Play button
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (video.paused) {
        video.play();
        video.muted = false;
      } else {
        video.pause();
      }
    });
  }
}
