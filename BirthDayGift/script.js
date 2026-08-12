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

  function requestVideoFullscreen(el) {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen(); // Safari
    if (el.webkitEnterFullscreen) return el.webkitEnterFullscreen(); // iOS Safari (video element only)
    if (el.msRequestFullscreen) return el.msRequestFullscreen();
  }

  videoItems.forEach(item => {
    const video = item.querySelector('.story-video');
    const playBtn = item.querySelector('.video-play-btn');

    // Pause every other video when one starts playing
    function pauseOthers() {
      videoItems.forEach(other => {
        if (other !== item) {
          const otherVideo = other.querySelector('.story-video');
          otherVideo.pause();
          other.classList.remove('is-playing');
        }
      });
    }

    function startPlayback() {
      pauseOthers();
      item.classList.add('is-playing');
      // On iOS, fullscreen must be requested directly on the video element itself
      requestVideoFullscreen(video);
      video.play();
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startPlayback();
    });

    video.addEventListener('click', startPlayback);

    video.addEventListener('pause', () => {
      item.classList.remove('is-playing');
    });

    video.addEventListener('ended', () => {
      item.classList.remove('is-playing');
    });

    // When user exits fullscreen, pause the video too
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && !video.paused) {
        video.pause();
      }
    });
  });

  // ==========================================
  // 6. Audio Play / Pause with Fade
  // ==========================================
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  let isPlaying = false;
  let fadeInterval = null;

  function fadeAudioIn(audio, duration = 1500) {
    audio.volume = 0;
    audio.play();
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const targetVolume = 0.5; // Sweet spot volume
    const volumeStep = targetVolume / steps;

    clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
      if (audio.volume < targetVolume) {
        audio.volume = Math.min(targetVolume, audio.volume + volumeStep);
      } else {
        clearInterval(fadeInterval);
      }
    }, intervalTime);
  }

  function fadeAudioOut(audio, duration = 1000) {
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const volumeStep = audio.volume / steps;

    clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
      if (audio.volume > 0.02) {
        audio.volume = Math.max(0, audio.volume - volumeStep);
      } else {
        audio.pause();
        audio.volume = 0;
        clearInterval(fadeInterval);
      }
    }, intervalTime);
  }

  if (musicToggle && bgMusic) {
    // Explicit click to trigger audio
    musicToggle.addEventListener('click', () => {
      if (isPlaying) {
        fadeAudioOut(bgMusic);
        musicToggle.classList.remove('music-playing');
      } else {
        fadeAudioIn(bgMusic);
        musicToggle.classList.add('music-playing');
      }
      isPlaying = !isPlaying;
    });

    // Suggestive prompt: play audio when user clicks anywhere on the intro screen
    // (helps capture interaction for autoplay approval)
    const handleFirstInteraction = () => {
      if (!isPlaying) {
        fadeAudioIn(bgMusic);
        musicToggle.classList.add('music-playing');
        isPlaying = true;
      }
      document.removeEventListener('click', handleFirstInteraction);
    };

    // Only hook first-click audio if it wasn't started
    document.addEventListener('click', handleFirstInteraction);
  }
});
