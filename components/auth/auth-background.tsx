"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    color: string;
}

export default function AuthBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let mouseX = 0;
        let mouseY = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener("mousemove", handleMouseMove);

        const colors = [
            "rgba(139, 92, 246, ", // purple
            "rgba(59, 130, 246, ", // blue
            "rgba(236, 72, 153, ", // pink
            "rgba(167, 139, 250, " // light purple
        ];

        const particles: Particle[] = Array.from({ length: 60 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.5 + 0.1,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));

        let tick = 0;

        const draw = () => {
            tick++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Radial mouse glow
            const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 350);
            grad.addColorStop(0, "rgba(139, 92, 246, 0.07)");
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid
            ctx.strokeStyle = "rgba(139, 92, 246, 0.04)";
            ctx.lineWidth = 1;
            const gridSize = 60;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Animated chart line (bottom area)
            ctx.beginPath();
            ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
            ctx.lineWidth = 1.5;
            const lineY = canvas.height * 0.75;
            for (let x = 0; x < canvas.width; x += 2) {
                const y = lineY + Math.sin(x * 0.02 + tick * 0.015) * 20 + Math.sin(x * 0.007 + tick * 0.008) * 35 + Math.sin(x * 0.003 + tick * 0.005) * 15;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Second chart line
            ctx.beginPath();
            ctx.strokeStyle = "rgba(59, 130, 246, 0.1)";
            ctx.lineWidth = 1;
            const lineY2 = canvas.height * 0.65;
            for (let x = 0; x < canvas.width; x += 2) {
                const y = lineY2 + Math.sin(x * 0.015 + tick * 0.012 + 2) * 18 + Math.sin(x * 0.006 + tick * 0.007 + 1) * 28;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Particles
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Mouse repulsion (gentle)
                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    p.vx += (dx / dist) * 0.015;
                    p.vy += (dy / dist) * 0.015;
                }

                // Speed cap
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 1) {
                    p.vx = (p.vx / speed) * 1;
                    p.vy = (p.vy / speed) * 1;
                }

                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 6);
                glow.addColorStop(0, p.color + p.alpha + ")");
                glow.addColorStop(1, p.color + "0)");
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 6, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha * 2 + ")";
                ctx.fill();
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}
