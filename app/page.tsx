"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [glitchText, setGlitchText] = useState("DeepShit");

  useEffect(() => {
    setMounted(true);

    // Glitch effect for the main title
    const glitchWords = [
      "DeepShit",
      "D33p5h1t",
      "DeɅpSh1t",
      "ÐeepShit",
      "DeepShit",
    ];
    let glitchIndex = 0;

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        // 15% chance to glitch
        setGlitchText(
          glitchWords[Math.floor(Math.random() * (glitchWords.length - 1)) + 1]
        );
        setTimeout(() => setGlitchText("DeepShit"), 150);
      }
    }, 2000);

    return () => clearInterval(glitchInterval);
  }, []);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/critique");
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({ status: "error", error: "Health check failed" });
    } finally {
      setChecking(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Aggressive Background - Matrix-style falling code */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="matrix-bg h-full w-full"></div>
      </div>

      {/* Scanlines overlay */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="scanlines"></div>
      </div>

      {/* Brutal Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-6xl mx-auto px-4">
          {/* Main Title with Glitch Effect */}
          <h1 className="text-8xl md:text-[12rem] font-black mb-8 glitch-text">
            <span className="glitch" data-text={glitchText}>
              {glitchText}
            </span>
          </h1>

          {/* Aggressive Subtitle */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-red-500 mb-4 typewriter">
              Your Code Is Trash.
            </h2>
            <h3 className="text-xl md:text-3xl text-gray-300 brutal-font">
              Let us prove it to you.
            </h3>
          </div>

          {/* Terminal-style description */}
          <div className="bg-black border-2 border-green-500 rounded-none p-6 mb-12 text-left max-w-4xl mx-auto terminal-glow">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-500 font-mono ml-4">
                ~/deepshit-terminal
              </span>
            </div>
            <div className="font-mono text-green-400 space-y-2">
              <div className="typing-animation">
                <span className="text-red-400">ERROR:</span> Your code contains{" "}
                {Math.floor(Math.random() * 47) + 3} critical vulnerabilities
              </div>
              <div className="typing-animation-delay">
                <span className="text-yellow-400">WARNING:</span> Performance
                bottlenecks detected in {Math.floor(Math.random() * 12) + 1}{" "}
                functions
              </div>
              <div className="typing-animation-delay-2">
                <span className="text-blue-400">INFO:</span> DeepSeek-R1 AI
                ready to roast your codebase harder than Stack Overflow
              </div>
              <div className="typing-animation-delay-3">
                <span className="text-green-400">$</span>{" "}
                <span className="blink">▌</span>
              </div>
            </div>
          </div>

          {/* Brutal CTA Button */}
          <button
            onClick={checkHealth}
            disabled={checking}
            className="group bg-red-600 hover:bg-red-700 text-white px-12 py-6 text-2xl font-black uppercase border-4 border-red-400 hover:border-red-300 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-brutal"
          >
            {checking ? (
              <span className="flex items-center gap-4">
                <div className="loading-skull">💀</div>
                ANALYZING YOUR TRASH...
              </span>
            ) : (
              <span className="flex items-center gap-4">
                🔥 ROAST MY CODE 🔥
              </span>
            )}
          </button>

          {/* Health Status - Terminal Style */}
          {healthStatus && (
            <div className="mt-8 bg-black border-2 border-green-500 p-6 text-left max-w-2xl mx-auto terminal-glow">
              <div className="font-mono text-green-400">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-4 h-4 rounded-full ${
                      healthStatus.status === "healthy"
                        ? "bg-green-400 pulse"
                        : "bg-red-400"
                    }`}
                  ></span>
                  <span className="text-white font-bold">
                    {healthStatus.status === "healthy"
                      ? "SYSTEM ONLINE - READY TO DESTROY"
                      : "SYSTEM ERROR - WE'RE FUCKED"}
                  </span>
                </div>
                {healthStatus.timestamp && (
                  <div className="text-sm text-gray-400">
                    Last system check:{" "}
                    {new Date(healthStatus.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* What We Do - Aggressive Grid */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-6xl font-black text-center mb-4 text-red-500">
            What We Do
          </h2>
          <p className="text-center text-2xl text-gray-300 mb-16">
            We find bugs faster than you create them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🛡️",
                title: "Security Audit",
                desc: "Because your 'secure' code has more holes than Swiss cheese",
                color: "border-red-500 text-red-400",
                bgClass: "security-card",
              },
              {
                icon: "⚡",
                title: "Performance Check",
                desc: "Your nested loops make snails look like Usain Bolt",
                color: "border-yellow-500 text-yellow-400",
                bgClass: "performance-card",
              },
              {
                icon: "🔍",
                title: "Code Review",
                desc: "We'll find bugs your tests missed (because you didn't write any)",
                color: "border-blue-500 text-blue-400",
                bgClass: "review-card",
              },
              {
                icon: "🎯",
                title: "Best Practices",
                desc: "Your code comments are as useful as a chocolate teapot",
                color: "border-purple-500 text-purple-400",
                bgClass: "practices-card",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`brutal-card bg-black border-4 ${item.color} p-6 transform hover:scale-105 transition-all duration-200 ${item.bgClass}`}
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Hacker Style */}
      <section className="py-20 bg-gradient-to-r from-red-900/20 to-black relative z-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black mb-16 text-white">
            The Damage Report
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "47,392",
                label: "Bugs Destroyed",
                color: "text-red-400",
              },
              { number: "∞", label: "Egos Crushed", color: "text-yellow-400" },
              {
                number: "99.97%",
                label: "Accuracy Rate",
                color: "text-green-400",
              },
            ].map((stat, index) => (
              <div key={index} className="brutal-stat">
                <div
                  className={`text-7xl font-black ${stat.color} mb-4 counter-animation`}
                >
                  {stat.number}
                </div>
                <div className="text-xl text-gray-300 uppercase tracking-wider font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Terminal Steps */}
      <section className="py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-6xl font-black text-center mb-16 text-red-500">
            How We Destroy Your Code
          </h2>

          <div className="space-y-8">
            {[
              {
                step: "01",
                cmd: "git clone your-shitty-repo",
                desc: "We download your disaster",
              },
              {
                step: "02",
                cmd: "deepseek analyze --brutal-mode",
                desc: "AI dissects every line",
              },
              {
                step: "03",
                cmd: "generate-roast --no-mercy",
                desc: "Truth bombs deployed",
              },
              {
                step: "04",
                cmd: "developer.cry() && improve()",
                desc: "You fix it (hopefully)",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-8 group">
                <div className="text-6xl font-black text-red-500 w-20">
                  {item.step}
                </div>
                <div className="flex-1 bg-black border-2 border-green-500 p-4 font-mono terminal-glow">
                  <div className="text-green-400">
                    <span className="text-red-400">$</span> {item.cmd}
                  </div>
                  <div className="text-gray-400 mt-2 group-hover:text-white transition-colors">
                    # {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Brutal Style */}
      <footer className="py-12 border-t-4 border-red-500 bg-black relative z-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-6">
            <h3 className="text-4xl font-black text-red-500 mb-2">
              DeepShit MCP Code Critic
            </h3>
            <p className="text-gray-400 text-xl">
              Making developers question their life choices since 2025 💀
            </p>
          </div>
          <div className="flex justify-center gap-8 text-gray-400 font-mono">
            <span>Powered by DeepSeek-R1</span>
            <span className="text-red-500">×</span>
            <span>MCP Protocol</span>
            <span className="text-red-500">×</span>
            <span>Zero Fucks Given</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .glitch-text {
          font-family: "Courier New", monospace;
        }

        .glitch {
          position: relative;
          display: inline-block;
          background: linear-gradient(45deg, #ff0000, #ff6600, #ff0000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: glitch-animation 2s infinite;
        }

        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #ff0000, #ff6600, #ff0000);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glitch::before {
          animation: glitch-animation-1 0.5s infinite;
          clip: rect(0, 900px, 0, 0);
        }

        .glitch::after {
          animation: glitch-animation-2 0.5s infinite;
          clip: rect(0, 900px, 0, 0);
        }

        @keyframes glitch-animation {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        @keyframes glitch-animation-1 {
          0% {
            clip: rect(42px, 9999px, 44px, 0);
            transform: translateX(-1px);
          }
          5% {
            clip: rect(12px, 9999px, 59px, 0);
            transform: translateX(1px);
          }
          10% {
            clip: rect(85px, 9999px, 140px, 0);
            transform: translateX(-1px);
          }
          100% {
            clip: rect(42px, 9999px, 44px, 0);
            transform: translateX(0);
          }
        }

        @keyframes glitch-animation-2 {
          0% {
            clip: rect(65px, 9999px, 119px, 0);
            transform: translateX(1px);
          }
          5% {
            clip: rect(25px, 9999px, 30px, 0);
            transform: translateX(-1px);
          }
          10% {
            clip: rect(75px, 9999px, 95px, 0);
            transform: translateX(1px);
          }
          100% {
            clip: rect(65px, 9999px, 119px, 0);
            transform: translateX(0);
          }
        }

        .typewriter {
          animation: typing 3s steps(20, end),
            blink-caret 0.5s step-end infinite alternate;
        }

        .brutal-font {
          font-family: "Courier New", monospace;
          text-shadow: 2px 2px 0px #ff0000;
        }

        .terminal-glow {
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }

        .shadow-brutal {
          box-shadow: 8px 8px 0px rgba(255, 0, 0, 0.8);
        }

        .typing-animation {
          animation: typing-1 2s steps(40, end) 0.5s both;
        }

        .typing-animation-delay {
          animation: typing-1 2s steps(40, end) 1.5s both;
        }

        .typing-animation-delay-2 {
          animation: typing-1 2s steps(40, end) 2.5s both;
        }

        .typing-animation-delay-3 {
          animation: typing-1 1s steps(10, end) 3.5s both;
        }

        @keyframes typing-1 {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .blink {
          animation: blink-animation 1s infinite;
        }

        @keyframes blink-animation {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        .pulse {
          animation: pulse-animation 2s infinite;
        }

        @keyframes pulse-animation {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        .loading-skull {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .brutal-card {
          position: relative;
          transition: all 0.3s ease;
        }

        .brutal-card:hover {
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
        }

        .brutal-stat {
          position: relative;
        }

        .counter-animation {
          animation: counter-glow 3s ease-in-out infinite alternate;
        }

        @keyframes counter-glow {
          0% {
            text-shadow: 0 0 10px currentColor;
          }
          100% {
            text-shadow: 0 0 30px currentColor, 0 0 40px currentColor;
          }
        }

        .scanlines {
          background: linear-gradient(
            transparent 50%,
            rgba(0, 255, 0, 0.03) 50%
          );
          background-size: 100% 4px;
          animation: scanlines-move 0.1s linear infinite;
        }

        @keyframes scanlines-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 4px;
          }
        }

        .matrix-bg {
          background-image: radial-gradient(
              1px 1px at 20px 30px,
              #00ff00,
              transparent
            ),
            radial-gradient(1px 1px at 40px 70px, #00ff00, transparent),
            radial-gradient(1px 1px at 90px 40px, #00ff00, transparent),
            radial-gradient(1px 1px at 130px 80px, #00ff00, transparent),
            radial-gradient(1px 1px at 160px 30px, #00ff00, transparent);
          background-repeat: repeat;
          background-size: 200px 100px;
          animation: matrix-rain 20s linear infinite;
        }

        @keyframes matrix-rain {
          to {
            background-position: 200px 100px;
          }
        }
      `}</style>
    </div>
  );
}
