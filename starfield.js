(function () {
    const canvas = document.getElementById('starfieldCanvas');
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width;
    let height;
    let pixelRatio;
    let stars = [];
    let shootingStars = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        initStars();
    }

    function initStars() {
        stars = [];
        const count = Math.floor((width * height) / 6500);

        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * (height * 0.92),
                radius: Math.random() * 1.4 + 0.3,
                alpha: Math.random() * 0.7 + 0.2,
                twinkleSpeed: Math.random() * 0.015 + 0.004,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                isSparkle: Math.random() > 0.88
            });
        }
    }

    function spawnShootingStar() {
        const startX = width * (0.35 + Math.random() * 0.7);
        const startY = height * (0.05 + Math.random() * 0.35);
        const angle = Math.PI * (0.76 + Math.random() * 0.08);
        const speed = 11 + Math.random() * 7;

        shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: 130 + Math.random() * 110,
            alpha: 1,
            decay: 0.014 + Math.random() * 0.008
        });
    }

    function drawSky() {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#050914');
        skyGrad.addColorStop(0.55, '#0b1324');
        skyGrad.addColorStop(1, '#111d35');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        const glowGrad = ctx.createRadialGradient(
            width * 0.5,
            height * 0.25,
            10,
            width * 0.5,
            height * 0.25,
            Math.max(width, height) * 0.55
        );
        glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
        glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, height);
    }

    function drawStars() {
        for (const star of stars) {
            if (!prefersReducedMotion) {
                star.alpha += star.twinkleSpeed * star.twinkleDir;
                if (star.alpha >= 0.95) {
                    star.alpha = 0.95;
                    star.twinkleDir = -1;
                } else if (star.alpha <= 0.15) {
                    star.alpha = 0.15;
                    star.twinkleDir = 1;
                }
            }

            ctx.save();
            ctx.globalAlpha = star.alpha;
            ctx.fillStyle = star.isSparkle ? '#bae6fd' : '#e2e8f0';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();

            if (star.isSparkle && star.alpha > 0.65) {
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(star.x - 4, star.y);
                ctx.lineTo(star.x + 4, star.y);
                ctx.moveTo(star.x, star.y - 4);
                ctx.lineTo(star.x, star.y + 4);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    function drawShootingStars() {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];
            const velocityLength = Math.hypot(star.vx, star.vy);
            const tailX = star.x - (star.vx / velocityLength) * star.length;
            const tailY = star.y - (star.vy / velocityLength) * star.length;

            const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
            gradient.addColorStop(0, `rgba(224, 242, 254, ${star.alpha})`);
            gradient.addColorStop(0.3, `rgba(56, 189, 248, ${star.alpha * 0.65})`);
            gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');

            ctx.save();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(star.x, star.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            star.x += star.vx;
            star.y += star.vy;
            star.alpha -= star.decay;

            if (star.alpha <= 0 || star.x < -200 || star.y > height + 200) {
                shootingStars.splice(i, 1);
            }
        }

        if (!prefersReducedMotion && shootingStars.length < 2 && Math.random() < 0.012) {
            spawnShootingStar();
        }
    }

    function drawHills() {
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, height - 55);
        ctx.bezierCurveTo(width * 0.25, height - 85, width * 0.45, height - 40, width * 0.7, height - 70);
        ctx.bezierCurveTo(width * 0.85, height - 88, width * 0.95, height - 50, width, height - 60);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(10, 17, 32, 0.75)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, height - 32);
        ctx.bezierCurveTo(width * 0.2, height - 18, width * 0.48, height - 58, width * 0.75, height - 30);
        ctx.bezierCurveTo(width * 0.88, height - 18, width * 0.96, height - 42, width, height - 35);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = '#060a12';
        ctx.fill();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        drawSky();
        drawStars();
        drawShootingStars();
        drawHills();

        if (!prefersReducedMotion) {
            window.requestAnimationFrame(animate);
        }
    }

    window.addEventListener('resize', function () {
        resize();
        if (prefersReducedMotion) {
            animate();
        }
    });

    resize();
    if (!prefersReducedMotion) {
        window.setTimeout(spawnShootingStar, 800);
    }
    animate();
})();
