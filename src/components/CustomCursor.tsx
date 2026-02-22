import { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    decay: number;
    size: number;
    length: number;
    angle: number;
    color: string;
}

const COLORS = [
    '#34d399', // emerald-400
    '#6ee7b7', // emerald-300
    '#10b981', // emerald-500
    '#a7f3d0', // emerald-200
    '#059669', // emerald-600
    '#5eead4', // teal-300
];

export function CustomCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const rafRef = useRef<number>(0);
    const [pos, setPos] = useState({ x: -100, y: -100 });
    const [visible, setVisible] = useState(false);
    const [clicking, setClicking] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        /* ── Fit canvas to viewport ── */
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        /* ── Spawn scatter particles on mouse move ── */
        const onMove = (e: MouseEvent) => {
            setPos({ x: e.clientX, y: e.clientY });
            setVisible(true);

            const count = 4 + Math.floor(Math.random() * 4); // 4‒7 per move
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.2 + Math.random() * 3.5;
                particles.current.push({
                    x: e.clientX + (Math.random() - 0.5) * 8,
                    y: e.clientY + (Math.random() - 0.5) * 8,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    decay: 0.018 + Math.random() * 0.025,
                    size: 1 + Math.random() * 2,
                    length: 4 + Math.random() * 10,
                    angle: Math.random() * Math.PI,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                });
            }
            if (particles.current.length > 300) {
                particles.current.splice(0, particles.current.length - 250);
            }
        };

        /* ── Radial burst on click ── */
        const onClick = (e: MouseEvent) => {
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const speed = 2.5 + Math.random() * 5.5;
                particles.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    decay: 0.010 + Math.random() * 0.016,
                    size: 1.5 + Math.random() * 2.5,
                    length: 6 + Math.random() * 14,
                    angle: angle,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                });
            }
        };

        const onDown = () => setClicking(true);
        const onUp = () => setClicking(false);
        const onLeave = () => setVisible(false);
        const onEnter = () => setVisible(true);

        window.addEventListener('mousemove', onMove);
        window.addEventListener('click', onClick);
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        document.documentElement.addEventListener('mouseleave', onLeave);
        document.documentElement.addEventListener('mouseenter', onEnter);

        /* ── rAF render loop ── */
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.current = particles.current.filter(p => p.life > 0);

            for (const p of particles.current) {
                p.life -= p.decay;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy *= 0.96;
                p.vy += 0.04; // subtle gravity

                if (p.life <= 0) continue;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life) * 0.9;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle + Math.atan2(p.vy, p.vx));
                ctx.fillStyle = p.color;
                ctx.beginPath();
                // Pill-shaped dash
                ctx.roundRect(-p.length / 2, -p.size / 2, p.length, p.size, p.size / 2);
                ctx.fill();
                ctx.restore();
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('click', onClick);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('resize', resize);
            document.documentElement.removeEventListener('mouseleave', onLeave);
            document.documentElement.removeEventListener('mouseenter', onEnter);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <>
            {/* Canvas particle layer */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none"
                style={{ zIndex: 99998 }}
            />
            {/* Precise cursor dot */}
            <div
                className="fixed pointer-events-none rounded-full bg-emerald-400"
                style={{
                    zIndex: 99999,
                    left: pos.x,
                    top: pos.y,
                    width: clicking ? 6 : 8,
                    height: clicking ? 6 : 8,
                    transform: `translate(-50%, -50%) scale(${clicking ? 0.7 : 1})`,
                    opacity: visible ? 1 : 0,
                    transition: 'width 80ms, height 80ms, transform 80ms, opacity 120ms',
                    boxShadow: '0 0 8px rgba(52, 211, 153, 0.85)',
                }}
            />
        </>
    );
}
