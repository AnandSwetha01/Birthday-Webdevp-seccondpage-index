document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Canvas Heart Particle System
  // ==========================================
  const canvas = document.getElementById('heart-canvas');
  const ctx = canvas.getContext('2d');

  let particles = [];
  const particleCount = 45;

  // Resize canvas dynamically
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Heart Particle Class
  class HeartParticle {
    constructor() {
      this.reset(true); // Initial load can spread them across height
    }

    reset(isInit = false) {
      this.size = Math.random() * 14 + 8; // Size of the heart (diameter approx)
      this.x = Math.random() * canvas.width;
      // If initial loading, scatter particles on screen; otherwise spawn at bottom
      this.y = isInit ? Math.random() * canvas.height : canvas.height + this.size * 2;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.2 + 0.06;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseVal = Math.random() * Math.PI;
      // Pink hue shades
      const hue = Math.floor(Math.random() * 15) + 340; // Hue between 340 and 355 (Pink/Red)
      const saturation = Math.floor(Math.random() * 20) + 80; // Saturation 80% to 100%
      const lightness = Math.floor(Math.random() * 10) + 80; // Lightness 80% to 90% (Soft Pastel Pink)
      this.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.pulseVal) * 0.15;
      this.pulseVal += this.pulseSpeed;

      // Reset when particle floats off the screen
      if (this.y < -this.size * 2 || this.x < -this.size * 2 || this.x > canvas.width + this.size * 2) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      
      // Plump vector heart drawing math
      const x = this.x;
      const y = this.y;
      const s = this.size * (1 + Math.sin(this.pulseVal) * 0.08); // Subtle breathing scale
      
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.3);
      // Left side curve
      ctx.bezierCurveTo(x - s * 0.5, y - s * 0.35, x - s * 1.1, y + s * 0.1, x, y + s * 1.0);
      // Right side curve
      ctx.bezierCurveTo(x + s * 1.1, y + s * 0.1, x + s * 0.5, y - s * 0.35, x, y + s * 0.3);
      
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(255, 180, 190, 0.3)';
      ctx.fill();
      ctx.restore();
    }
  }

  // Initialize Particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new HeartParticle());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();

  // ==========================================
  // 2. Parallax Scroll Effect
  // ==========================================
  const cards = document.querySelectorAll('.story-card');
  const intro = document.getElementById('intro');
  const spotifyWidget = document.getElementById('spotify-widget');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Fade and translate intro screen on scroll
    if (intro) {
      const opacity = Math.max(0, 1 - scrolled / (window.innerHeight * 0.7));
      const translateVal = scrolled * 0.35;
      intro.style.opacity = opacity;
      intro.style.transform = `translateY(${translateVal}px)`;
      
      // Optimize layout: disable intro interaction when invisible
      if (opacity <= 0.01) {
        intro.style.pointerEvents = 'none';
        intro.style.visibility = 'hidden';
      } else {
        intro.style.pointerEvents = 'auto';
        intro.style.visibility = 'visible';
      }
    }

    // Toggle spotify widget visibility past intro section
    if (spotifyWidget) {
      if (scrolled > window.innerHeight * 0.4) {
        spotifyWidget.classList.add('visible');
      } else {
        spotifyWidget.classList.remove('visible');
      }
    }

    // Apply scroll parallax to story cards
    cards.forEach(card => {
      const speed = parseFloat(card.getAttribute('data-speed')) || 0;
      const cardTop = card.getBoundingClientRect().top + scrolled;
      const visibleRange = window.innerHeight;
      
      // Calculate translate value relative to when card is in view
      if (scrolled + visibleRange > cardTop - 300 && scrolled < cardTop + 500) {
        const offset = (scrolled + visibleRange / 2 - cardTop) * speed;
        card.style.transform = `translateY(${offset}px)`;
      }
    });
  });

  // ==========================================
  // 3. Scroll Reveal (Intersection Observer)
  // ==========================================
  const fadeElements = document.querySelectorAll('.fade-in-element');

  const observerOptions = {
    root: null, // Viewport
    threshold: 0.05, // Trigger early when element enters 5% of screen
    rootMargin: '0px 0px -100px 0px' // Offset trigger for a smoother layout lift
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        // Once visible, stop tracking it to save performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => {
    scrollObserver.observe(el);
  });

  // ==========================================
  // 4. Intro Scroll Button Click
  // ==========================================
  const scrollBtn = document.querySelector('.scroll-indicator');
  const storyContainer = document.getElementById('story-path');

  if (scrollBtn && storyContainer) {
    scrollBtn.addEventListener('click', () => {
      storyContainer.scrollIntoView({ behavior: 'smooth' });
    });
  }
// ==========================================
// 5. Video Gallery - Play in Fullscreen
// ==========================================
const videoItems = document.querySelectorAll('.video-item');

function requestVideoFullscreen(video) {
  if (video.requestFullscreen) {
    return video.requestFullscreen();
  }

  if (video.webkitRequestFullscreen) {
    return video.webkitRequestFullscreen();
  }

  if (video.webkitEnterFullscreen) {
    return video.webkitEnterFullscreen();
  }

  return Promise.resolve();
}

videoItems.forEach(item => {
  const video = item.querySelector('.story-video');
  const playBtn = item.querySelector('.video-play-btn');

  if (!video || !playBtn) return;

  // Pause all other videos
  function pauseOthers() {
    videoItems.forEach(otherItem => {
      if (otherItem !== item) {
        const otherVideo = otherItem.querySelector('.story-video');

        if (otherVideo) {
          otherVideo.pause();
          otherItem.classList.remove('is-playing');
        }
      }
    });
  }

  // Play video
  async function startPlayback(e) {
    if (e) e.stopPropagation();

    pauseOthers();

    try {
      // First play the video
      await video.play();

      item.classList.add('is-playing');

      // Then open fullscreen
      try {
        await requestVideoFullscreen(video);
      } catch (fullscreenError) {
        console.log('Fullscreen not available:', fullscreenError);
      }

    } catch (error) {
      console.error('Video playback failed:', error);

      // If Drive blocks direct playback
      alert('Video could not be played. Please check the Google Drive sharing permission.');
    }
  }

  // Play button
  playBtn.addEventListener('click', startPlayback);

  // Clicking video
  video.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  // When paused
  video.addEventListener('pause', () => {
    item.classList.remove('is-playing');
  });

  // When playing
  video.addEventListener('play', () => {
    item.classList.add('is-playing');
  });

  // When video ends
  video.addEventListener('ended', () => {
    item.classList.remove('is-playing');
  });

  // When fullscreen exits
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !video.paused) {
      video.pause();
    }
  });

  // Safari fullscreen exit
  document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement && !video.paused) {
      video.pause();
    }
  });
});
