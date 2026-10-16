import { Link } from "react-router-dom";
import { useRef, useState, type MouseEvent } from "react";

function BlueprintDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 10 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="w-full max-w-md transition-transform duration-300 ease-out"
      style={{ transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      <svg viewBox="0 0 440 320" className="w-full">
        <defs>
          <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#1B212C" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="440" height="320" fill="url(#grid)" />

        {[
          { x: 20, y: 40, w: 120, h: 44, label: "Backlog" },
          { x: 20, y: 130, w: 120, h: 44, label: "Sprint" },
          { x: 20, y: 220, w: 120, h: 44, label: "Review" },
        ].map((b, i) => (
          <g key={b.label}>
            <rect
              x={b.x} y={b.y} width={b.w} height={b.h}
              fill="none" stroke="#9AA4B2" strokeWidth="1.2"
              className="animate-draw"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
            <text x={b.x + 12} y={b.y + 27} fill="#F4F6F8" fontFamily="IBM Plex Mono" fontSize="12">
              {b.label}
            </text>
          </g>
        ))}

        <rect x={260} y={100} width={150} height={110} fill="none" stroke="#C98A4B" strokeWidth="1.5"
          className="animate-draw" style={{ animationDelay: "0.5s" }} />
        <text x={275} y={128} fill="#C98A4B" fontFamily="IBM Plex Mono" fontSize="12">AI Assist</text>
        <text x={275} y={150} fill="#9AA4B2" fontFamily="IBM Plex Mono" fontSize="10">— task breakdown</text>
        <text x={275} y={168} fill="#9AA4B2" fontFamily="IBM Plex Mono" fontSize="10">— bug analysis</text>
        <text x={275} y={186} fill="#9AA4B2" fontFamily="IBM Plex Mono" fontSize="10">— sprint plan</text>

        <path d="M140 62 L260 140" stroke="#9AA4B2" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M140 152 L260 155" stroke="#9AA4B2" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M140 242 L260 170" stroke="#9AA4B2" strokeWidth="1" strokeDasharray="3 3" />

        <circle cx="140" cy="62" r="3" fill="#C98A4B" className="animate-pulse-dot" />
        <circle cx="140" cy="152" r="3" fill="#C98A4B" className="animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
        <circle cx="140" cy="242" r="3" fill="#C98A4B" className="animate-pulse-dot" style={{ animationDelay: "0.8s" }} />
      </svg>
    </div>
  );
}

const FEATURES = [
  { label: "Projects & sprints", detail: "Plan work in sprints, track every task, bug and status in one board." },
  { label: "Roles & permissions", detail: "Owners, members and viewers — each sees and does exactly what they should." },
  { label: "Live updates", detail: "Task changes and assignments show up for your team instantly, no refresh." },
  { label: "Notifications", detail: "Know the moment you're assigned a task or added to a project." },
  { label: "AI assistance", detail: "Generate task breakdowns, acceptance criteria and bug analysis from real project data." },
  { label: "Built for teams", detail: "Invite teammates, assign work, and keep everyone aligned on what's next." },
];

const STEPS = [
  { n: "1", title: "Create a project", detail: "Set up a project and invite your team in seconds." },
  { n: "2", title: "Plan the work", detail: "Break down work into tasks, assign owners, set sprints." },
  { n: "3", title: "Let AI help", detail: "Get task breakdowns, acceptance criteria and bug analysis on demand." },
  { n: "4", title: "Ship together", detail: "Track status live, see updates the moment they happen." },
];

const BEFORE = [
  "Status updates scattered across chat and spreadsheets",
  "No clear owner for half the open tasks",
  "Bug reports with no structure or follow-up",
  "Permissions are all-or-nothing",
];

const AFTER = [
  "One board for every task, bug and sprint",
  "Every task has an owner and a status",
  "AI helps analyze and triage bugs as they come in",
  "Owners, members and viewers — scoped access by project",
];

const FAQS = [
  { q: "Is DevFlow free to use?", a: "Yes — creating an account, projects and tasks is free to get started." },
  { q: "How does the AI assistance work?", a: "It reads your real project data — tasks, bugs, sprint state — and generates breakdowns, acceptance criteria and analysis grounded in that data, not generic answers." },
  { q: "Can I control who sees what?", a: "Every project has owners, members and viewers. Viewers can read but not edit; members can manage tasks; owners control membership." },
  { q: "Do updates happen in real time?", a: "Yes — task changes, assignments and new members show up live for everyone in the project, no refresh needed." },
];

export default function LandingPage() {
  return (
    <div className="font-sans bg-graphite text-[#F4F6F8]">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-mono text-lg font-semibold tracking-tight">DevFlow</span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-textmuted">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how-it-works" className="hover:text-white">How it works</a>
            <a href="#ai" className="hover:text-white">AI assistance</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-textmuted hover:text-white px-3 py-2">
              Log in
            </Link>
            <Link
              to="/login?register=1"
              className="text-sm bg-brass text-graphite font-medium px-4 py-2 rounded-sm hover:brightness-110"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border relative overflow-hidden">
        <div
          className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-brass/10 blur-3xl animate-float"
          aria-hidden="true"
        />
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <h1 className="font-mono text-4xl md:text-5xl font-semibold leading-tight">
              Your engineering team's work, planned and tracked in one place
            </h1>
            <p className="mt-6 text-textmuted text-lg max-w-md">
              Projects, tasks, bugs, sprints and your team — with an AI layer that
              understands your actual project data, not a generic chatbot bolted on the side.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login?register=1"
                className="bg-brass text-graphite font-medium px-6 py-3 rounded-sm hover:brightness-110"
              >
                Get started free
              </Link>
              <a
                href="#how-it-works"
                className="border border-border text-textmuted px-6 py-3 rounded-sm hover:border-brass hover:text-white"
              >
                See how it works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-xs font-mono text-textmuted">
              <span>✓ Real-time sync</span>
              <span>✓ Role-based access</span>
              <span>✓ AI-assisted planning</span>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <BlueprintDiagram />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-mono text-2xl md:text-3xl font-semibold max-w-xl">
            Everything your team needs to ship, without switching tools
          </h2>
          <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-8">
            {FEATURES.map((f) => (
              <div key={f.label} className="border-l-2 border-brass pl-5">
                <h3 className="font-mono text-base font-semibold">{f.label}</h3>
                <p className="mt-1 text-sm text-textmuted max-w-sm">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-mono text-2xl md:text-3xl font-semibold">How it works</h2>
          <div className="mt-12 grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-5 left-0 right-0 border-t border-dashed border-border" />
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="w-10 h-10 rounded-full bg-surface border border-brass text-brass font-mono flex items-center justify-center relative z-10">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-textmuted">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-mono text-2xl md:text-3xl font-semibold">Without DevFlow vs. with DevFlow</h2>
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-mono text-textmuted mb-4">Without</h3>
              <ul className="space-y-3">
                {BEFORE.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-textmuted">
                    <span className="text-red-400">×</span>{b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-mono text-brass mb-4">With DevFlow</h3>
              <ul className="space-y-3">
                {AFTER.map((a) => (
                  <li key={a} className="flex gap-3 text-sm text-[#F4F6F8]">
                    <span className="text-teal">✓</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI spotlight */}
      <section id="ai" className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-mono text-2xl md:text-3xl font-semibold">
              AI that actually knows your project
            </h2>
            <p className="mt-5 text-textmuted max-w-md">
              DevFlow's AI layer reads your real tasks, bugs and sprint data — not a blank
              chat window. Ask it to break down a feature, analyze a bug, or plan your next sprint.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-sm p-5 font-mono text-sm text-textmuted">
            <p className="text-brass">$ devflow ai breakdown "Add OAuth login"</p>
            <p className="mt-3">→ Add Google OAuth provider config</p>
            <p>→ Build login callback route</p>
            <p>→ Link OAuth identity to existing user</p>
            <p>→ Write acceptance criteria + edge cases</p>
            <span className="inline-block w-2 h-4 bg-brass ml-1 align-middle animate-pulse-dot" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-20 max-w-2xl">
          <h2 className="font-mono text-2xl md:text-3xl font-semibold">Questions, answered</h2>
          <div className="mt-10 divide-y divide-border">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium">{f.q}</span>
                  <span className="text-brass font-mono group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-textmuted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="font-mono text-2xl font-semibold">
            Start planning your next sprint today
          </h2>
          <Link
            to="/login?register=1"
            className="bg-brass text-graphite px-6 py-3 rounded-sm font-medium hover:brightness-110"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-textmuted">
          <span className="font-mono text-white">DevFlow</span>
          <p>Engineering project management, with AI built in.</p>
        </div>
      </footer>
    </div>
  );
}