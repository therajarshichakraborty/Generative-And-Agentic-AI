(function () {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  let stars = [];
  let shootingStars = [];

  const STAR_COUNT = 150;
  const SHOOTING_STAR_INTERVAL_MIN = 800;
  const SHOOTING_STAR_INTERVAL_MAX = 2400;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        color: getRandomStarColor()
      });
    }
  }

  function getRandomStarColor() {
    const colors = [
      'rgba(255, 255, 255,',
      'rgba(220, 235, 255,',
      'rgba(200, 220, 255,',
      'rgba(235, 210, 255,',
      'rgba(180, 240, 255,'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width * 1.2;
      this.y = Math.random() * (height * 0.4);
      this.length = Math.random() * 120 + 80;
      this.speed = Math.random() * 10 + 12;
      this.angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15); // ~45 deg
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.radius = Math.random() * 1.5 + 1.2;
      this.alpha = 1;
      this.fade = Math.random() * 0.015 + 0.012;
      this.active = true;
      
      const colors = [
        { r: 255, g: 255, b: 255 },
        { r: 0, g: 240, b: 255 },
        { r: 168, g: 130, b: 255 },
        { r: 255, g: 200, b: 255 }
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.fade;

      if (this.alpha <= 0 || this.x > width + 200 || this.y > height + 200) {
        this.active = false;
      }
    }

    draw(ctx) {
      if (!this.active || this.alpha <= 0) return;

      ctx.save();
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
      gradient.addColorStop(0.7, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${this.alpha})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.radius;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glowing head
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`;
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.restore();
    }
  }

  function spawnShootingStar() {
    if (shootingStars.length < 5) {
      shootingStars.push(new ShootingStar());
    }
    const nextInterval = Math.random() * (SHOOTING_STAR_INTERVAL_MAX - SHOOTING_STAR_INTERVAL_MIN) + SHOOTING_STAR_INTERVAL_MIN;
    setTimeout(spawnShootingStar, nextInterval);
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw background twinkling stars
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      star.alpha += star.twinkleSpeed * star.twinkleDir;
      if (star.alpha >= 0.95) {
        star.twinkleDir = -1;
      } else if (star.alpha <= 0.15) {
        star.twinkleDir = 1;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${star.color}${star.alpha})`;
      ctx.fill();
    }

    // Draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.update();
      s.draw(ctx);
      if (!s.active) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  
  // Initial setup
  resize();
  setTimeout(spawnShootingStar, 500);
  // Add an immediate shooting star on load for instant visual feedback
  shootingStars.push(new ShootingStar());
  requestAnimationFrame(animate);
})();
