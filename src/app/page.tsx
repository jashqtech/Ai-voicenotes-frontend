"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./page.module.css";

/* ===== TYPES ===== */
type ScreenId = "record" | "library" | "calendar";

interface FaqItem {
  q: string;
  a: string;
}

/* ===== DATA ===== */
const FAQ_DATA: FaqItem[] = [
  {
    q: "How accurate is the AI transcription?",
    a: "Voicenote AI uses the AI for speech-to-text, delivering high accuracy transcription even with accents, technical jargon, and noisy environments. The model handles natural conversational speech with punctuation and speaker context.",
  },
  {
    q: "Does recording work in the background?",
    a: "Yes! Recording continues seamlessly even when you switch apps or lock your phone. You can start a meeting recording, minimize the app, and it keeps capturing everything until you manually stop it.",
  },
  {
    q: "How does the AI summary generation work?",
    a: "Once you stop recording, the transcript is sent to our FastAPI backend which prompts the AI model with a structured format. It extracts key discussion points, decisions, commitments, follow-up tasks, and action items — all automatically.",
  },
  {
    q: "What is semantic search and how does it help me?",
    a: "Semantic search understands the meaning of your question, not just keywords. On the Calendar screen, you can ask 'What commitments did I make last Tuesday?' and the system retrieves relevant context from your transcripts using vector embeddings.",
  },
  {
    q: "Is my data secure and private?",
    a: "Your recordings are processed securely through the AI and stored in our backend. Transcripts and summaries are tied to your account and never shared with third parties. You can delete any recording at any time.",
  },
];

const SCREEN_DATA = {
  record: {
    title: "Record Screen",
    desc: "The central hub of Voicenote AI. Start and stop recordings with a single tap. Continue capturing meetings even when the app is in the background.",
    bullets: [
      "One-tap start/stop recording",
      "Background recording support",
      "Auto-generates transcript + AI summary",
      "Ask questions about today's recording",
      "Combine multiple summaries",
    ],
  },
  library: {
    title: "Library Screen",
    desc: "All your previous summaries in one organized place. Search, play, share, or delete any recording — your entire meeting history is always at your fingertips.",
    bullets: [
      "Complete history of all sessions",
      "Search recordings & summaries",
      "Share summaries with your team",
      "Expand cards to see full summaries",
      "Quick delete for outdated notes",
    ],
  },
  calendar: {
    title: "Calendar Screen",
    desc: "Travel back in time. Select any date and ask natural language questions about what happened that day — powered by semantic search over your transcript embeddings.",
    bullets: [
      "Date-based recording navigation",
      "Natural language Q&A",
      "Context-aware AI answers",
      "Semantic search over all transcripts",
      "Examples: 'What decisions were made?'",
    ],
  },
};

/* ===== ICON COMPONENTS (inline SVG, zero-dependency) ===== */
const MicIcon = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const ChevronDown = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ===== PHONE MOCKUP SVG (renders app-like phone UI) ===== */
const PhoneMockupRecord = () => (
  <svg viewBox="0 0 230 480" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
    <rect width="230" height="480" rx="36" fill="#F8F8F8" />
    {/* Status bar */}
    {/* <text x="16" y="24" fontSize="10" fontWeight="600" fill="#111">2:37</text> */}
    {/* <rect x="16" y="38" width="90" height="18" rx="4" fill="#1A1A1A" />
    <text x="20" y="51" fontSize="11" fontWeight="800" fill="white">Voice Notes</text> */}
    {/* <text x="16" y="64" fontSize="9" fill="#888">Thursday, July 09</text> */}
    {/* Icons top right */}
    {/* <rect x="168" y="34" width="24" height="24" rx="12" fill="url(#micGrad)" />
    <rect x="196" y="34" width="24" height="24" rx="12" fill="url(#micGrad)" /> */}
    {/* "Tap to start" label */}
    <text x="115" y="82" fontSize="10" fill="#888" textAnchor="middle">Tap to start a new recording</text>
    {/* Big mic button */}
    <defs>
      <radialGradient id="micGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(249,115,22,0.25)" />
        <stop offset="100%" stopColor="rgba(249,115,22,0)" />
      </radialGradient>
      <linearGradient id="micGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
    <circle cx="115" cy="155" r="55" fill="url(#micGlow)" />
    <circle cx="115" cy="155" r="40" fill="url(#micGrad)" />
    <path d="M115 143a5 5 0 0 0-5 5v10a5 5 0 0 0 10 0v-10a5 5 0 0 0-5-5Z" fill="white" strokeWidth="0" />
    <path d="M122 155v3a7 7 0 0 1-14 0v-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <line x1="115" y1="165" x2="115" y2="169" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    {/* Summary card 1 */}
    <rect x="16" y="240" width="198" height="78" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1" />
    <text x="30" y="260" fontSize="7.5" fontWeight="700" fill="#F97316">✦ JEEL AGARWAL PROFESSIONAL PROFILE...</text>
    <text x="30" y="274" fontSize="8.5" fill="#444" style={{ lineHeight: 1.4 }}>This recording serves as a professional</text>
    <text x="30" y="285" fontSize="8.5" fill="#444">introduction for Jeel Agarwal, a full-stack</text>
    <text x="30" y="296" fontSize="8.5" fill="#444">developer specializing in Flutter for mobile...</text>
    <text x="30" y="310" fontSize="8" fill="#BBB">Jul 09, 2026</text>
    {/* Summary card 2 */}
    <rect x="16" y="328" width="198" height="76" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1" />
    <text x="30" y="347" fontSize="7.5" fontWeight="700" fill="#F97316">✦ BLOCKCHAIN DEVELOPMENT LANGUAGE...</text>
    <text x="30" y="360" fontSize="8.5" fill="#444">The recording features a brief discussion</text>
    <text x="30" y="371" fontSize="8.5" fill="#444">regarding the programming languages</text>
    <text x="30" y="382" fontSize="8.5" fill="#444">utilized in blockchain development. The foc...</text>
    <text x="30" y="395" fontSize="8" fill="#BBB">Jul 08, 2026</text>
    {/* Combine button */}
    <rect x="16" y="418" width="198" height="36" rx="18" fill="url(#micGrad)" />
    <text x="115" y="440" fontSize="10" fontWeight="600" fill="white" textAnchor="middle">☑ Combine Summaries</text>
    {/* Bottom nav */}
    <rect x="0" y="458" width="230" height="22" fill="#F8F8F8" />
    <text x="45" y="472" fontSize="8" fontWeight="700" fill="#F97316" textAnchor="middle">● Record</text>
    <text x="115" y="472" fontSize="8" fill="#AAA" textAnchor="middle">Library</text>
    <text x="185" y="472" fontSize="8" fill="#AAA" textAnchor="middle">Calendar</text>
  </svg>
);

const PhoneMockupLibrary = () => (
  <svg viewBox="0 0 230 480" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
    <rect width="230" height="480" rx="36" fill="#F8F8F8" />
    <defs>
      <linearGradient id="micGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
    {/* <rect x="16" y="24" width="90" height="18" rx="4" fill="#1A1A1A" />
    <text x="20" y="37" fontSize="12" fontWeight="800" fill="white">Library</text> */}
    <text x="16" y="51" fontSize="9" fill="#888">10 recordings</text>
    {/* Search bar */}
    <rect x="16" y="60" width="198" height="26" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
    <text x="35" y="77" fontSize="9" fill="#BBB">Search recordings or summaries...</text>
    {/* Featured card */}
    <rect x="16" y="97" width="198" height="90" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
    <text x="28" y="114" fontSize="8" fontWeight="700" fill="#333">Important Notes</text>
    <text x="28" y="127" fontSize="7.5" fill="#666">- Jeel Agarwal holds a BE in Computer Science</text>
    <text x="28" y="138" fontSize="7.5" fill="#666">from SAL Institute of Technology.</text>
    <text x="28" y="149" fontSize="7.5" fill="#666">- SmiGo won the BCX Digital Innovation Award</text>
    <text x="28" y="160" fontSize="7.5" fill="#666">in 2024.</text>
    {/* Action buttons */}
    <rect x="22" y="170" width="42" height="14" rx="7" fill="white" stroke="#F97316" strokeWidth="1" />
    <text x="43" y="180" fontSize="7" fill="#F97316" textAnchor="middle">▶ Play</text>
    <rect x="68" y="170" width="42" height="14" rx="7" fill="white" stroke="#DDD" strokeWidth="1" />
    <text x="89" y="180" fontSize="7" fill="#555" textAnchor="middle">⬆ Share</text>
    <rect x="114" y="170" width="42" height="14" rx="7" fill="white" stroke="#FECACA" strokeWidth="1" />
    <text x="135" y="180" fontSize="7" fill="#EF4444" textAnchor="middle">🗑 Delete</text>
    {/* List items */}
    {[
      { title: "Blockchain Development Language Discussion", date: "Jul 08" },
      { title: "Professional Background Summary", date: "Jul 07" },
      { title: "AI Voice Notes Application Development", date: "Jul 01" },
    ].map((item, i) => (
      <g key={i}>
        <rect x="16" y={200 + i * 68} width="198" height="60" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <circle cx="36" cy={224 + i * 68} r="12" fill={`rgba(249,115,22,${0.08 + i * 0.01})`} />
        <text x="36" y={228 + i * 68} fontSize="10" fill="#F97316" textAnchor="middle">♪</text>
        <text x="55" y={217 + i * 68} fontSize="8" fontWeight="700" fill="#222">{item.title.slice(0, 28)}</text>
        <text x="55" y={228 + i * 68} fontSize="7.5" fontWeight="600" fill="#333">{item.title.slice(28)}</text>
        <text x="55" y={239 + i * 68} fontSize="7.5" fill="#AAA">{item.date}</text>
      </g>
    ))}
    {/* Bottom nav */}
    <rect x="0" y="458" width="230" height="22" fill="#F8F8F8" />
    <text x="45" y="472" fontSize="8" fill="#AAA" textAnchor="middle">Record</text>
    <text x="115" y="472" fontSize="8" fontWeight="700" fill="#F97316" textAnchor="middle">● Library</text>
    <text x="185" y="472" fontSize="8" fill="#AAA" textAnchor="middle">Calendar</text>
  </svg>
);

const PhoneMockupCalendar = () => (
  <svg viewBox="0 0 230 480" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
    <rect width="230" height="480" rx="36" fill="#F8F8F8" />
    <defs>
      <linearGradient id="micGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#F97316" />
      </linearGradient>
    </defs>
    {/* <rect x="16" y="24" width="90" height="18" rx="4" fill="#1A1A1A" />
    <text x="20" y="37" fontSize="12" fontWeight="800" fill="white">Calendar</text> */}
    <text x="16" y="52" fontSize="9" fill="#888">Ask about any day</text>
    {/* Mini calendar */}
    <rect x="16" y="65" width="198" height="140" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1" />
    <text x="115" y="82" fontSize="9" fontWeight="700" fill="#333" textAnchor="middle">July 2026</text>
    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
      <text key={i} x={28 + i * 28} y="97" fontSize="8" fill="#AAA" textAnchor="middle">{d}</text>
    ))}
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((d, i) => {
      const row = Math.floor(i / 7);
      const col = i % 7;
      const isToday = d === 9;
      return (
        <g key={d}>
          {isToday && <circle cx={28 + col * 28} cy={114 + row * 24} r="11" fill="url(#micGrad3)" />}
          <text x={28 + col * 28} y={118 + row * 24} fontSize="9" fontWeight={isToday ? "700" : "400"} fill={isToday ? "white" : "#333"} textAnchor="middle">{d}</text>
        </g>
      );
    })}
    {/* Q&A section */}
    <text x="28" y="222" fontSize="9" fontWeight="700" fill="#333">Ask about Jul 09</text>
    {/* Question bubble */}
    <rect x="60" y="232" width="148" height="28" rx="10" fill="#F5F3FF" stroke="rgba(124,58,237,0.15)" strokeWidth="1" />
    <text x="80" y="250" fontSize="8" fill="#7C3AED">What tasks were assigned today?</text>
    {/* Answer bubble */}
    <rect x="22" y="268" width="168" height="48" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
    <text x="34" y="283" fontSize="7.5" fill="#444">Based on today's recording, the following</text>
    <text x="34" y="295" fontSize="7.5" fill="#444">tasks were assigned: 1) Finalize landing</text>
    <text x="34" y="307" fontSize="7.5" fill="#444">page. 2) Setup DNS. 3) QA sync Monday.</text>
    {/* AI badge */}
    <rect x="22" y="322" width="58" height="14" rx="7" fill="rgba(124,58,237,0.08)" />
    <text x="51" y="332" fontSize="7" fontWeight="700" fill="#7C3AED" textAnchor="middle">✦ AI</text>
    {/* Input bar */}
    <rect x="16" y="415" width="156" height="30" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1" />
    <text x="30" y="433" fontSize="8" fill="#BBB">Ask a question...</text>
    <rect x="178" y="415" width="30" height="30" rx="10" fill="url(#micGrad3)" />
    <text x="193" y="433" fontSize="10" fill="white" textAnchor="middle">→</text>
    {/* Bottom nav */}
    <rect x="0" y="458" width="230" height="22" fill="#F8F8F8" />
    <text x="45" y="472" fontSize="8" fill="#AAA" textAnchor="middle">Record</text>
    <text x="115" y="472" fontSize="8" fill="#AAA" textAnchor="middle">Library</text>
    <text x="185" y="472" fontSize="8" fontWeight="700" fill="#F97316" textAnchor="middle">● Calendar</text>
  </svg>
);

const PHONE_COMPONENTS: Record<ScreenId, React.FC> = {
  record: PhoneMockupRecord,
  library: PhoneMockupLibrary,
  calendar: PhoneMockupCalendar,
};

/* ===== SCROLL ANIMATION HOOK ===== */
function useScrollAnimation() {
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.current?.observe(el));

    return () => observer.current?.disconnect();
  }, []);
}

/* ===== COUNTER ANIMATION ===== */
function useCountUp(target: number, duration = 2000, startOnVisible = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnVisible);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!startOnVisible) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

/* ===== MAIN COMPONENT ===== */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("record");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll listener for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize scroll-triggered animations
  useScrollAnimation();

  // Counter refs (stats bar)
  const recordingsCounter = useCountUp(50000, 2000);
  const accuracyCounter = useCountUp(98, 1800);
  const summariesCounter = useCountUp(200000, 2200);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const PhoneComponent = PHONE_COMPONENTS[activeScreen];
  const screenInfo = SCREEN_DATA[activeScreen];

  return (
    <div className={styles.wrapper}>
      {/* ============================
          NAVBAR
      ============================= */}
      <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ""}`}>
        <div className={styles.navInner}>
          {/* Brand */}
          <a className={styles.navBrand} href="#" aria-label="Voicenote AI">
            <div className={styles.navLogoIcon}>
              <MicIcon size={18} color="white" />
            </div>
            <span className={styles.navBrandText}>
              Voicenote<span> AI</span>
            </span>
          </a>

          {/* Links */}
          {/* <nav aria-label="Primary navigation">
            <ul className={styles.navLinks} role="list">
              {[
                { label: "Features", id: "features" },
                { label: "How It Works", id: "how-it-works" },
                { label: "Screens", id: "screens" },
                { label: "Tech", id: "tech" },
                { label: "FAQ", id: "faq" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    className={styles.navLink}
                    onClick={() => scrollTo(link.id)}
                    aria-label={`Navigate to ${link.label}`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav> */}

          {/* CTAs */}
          <div className={styles.navCtas}>
            <button
              className={styles.navBtnSecondary}
              onClick={() => scrollTo("how-it-works")}
            >
              Learn More
            </button>
            <button
              id="nav-download-btn"
              className={styles.navBtnPrimary}
              onClick={() => scrollTo("download")}
            >
              Download App
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ============================
            HERO SECTION
        ============================= */}
        <section className={styles.hero} aria-label="Hero">
          {/* Background decorations */}
          <div className={styles.heroBg} aria-hidden="true">
            <div className={styles.heroBgGradient} />
            <div className={styles.heroBgGrid} />
          </div>

          <div className={styles.heroInner}>
            {/* Badge */}
            {/* <div className={styles.heroBadge} aria-label="New app announcement">
              <span className={styles.heroBadgeDot} />
              Powered by Gemini AI
            </div> */}

            {/* Tagline */}
            <p className={styles.heroTagline}>speak · summarise · remember</p>

            {/* H1 */}
            <h1 className={styles.heroTitle}>
              Your Meetings,{" "}
              <span className={styles.heroTitleGradient}>
                Intelligently Captured
              </span>
            </h1>

            {/* Subtitle */}
            <p className={styles.heroSubtitle}>
              Record conversations, get instant summaries, extract key points, and chat with your recordings using AI — all on your phone.
            </p>

            {/* CTAs */}
            <div className={styles.heroCtas}>
              <button
                id="hero-download-btn"
                className={styles.btnPrimary}
                onClick={() => scrollTo("download")}
                aria-label="Download the app"
              >
                Download Free
                <ArrowRight size={16} />
              </button>
              <button
                id="hero-screens-btn"
                className={styles.btnSecondary}
                onClick={() => scrollTo("screens")}
                aria-label="See app screens"
              >
                See App Screens
              </button>
            </div>

            {/* Phone mockups */}
            <div className={styles.heroPhones} aria-label="App mockups">
              {/* Left secondary phone */}
              <div className={`${styles.phoneContainer} ${styles.phoneSecondaryLeft}`}>
                <div className={`${styles.phoneMockup} ${styles.phoneSecondary}`}>
                  <PhoneMockupLibrary />
                </div>
              </div>

              {/* Primary center phone */}
              <div className={`${styles.phoneContainer} ${styles.phonePrimary}`}>
                <div className={styles.phoneMockup}>
                  <PhoneMockupRecord />
                </div>
              </div>

              {/* Right secondary phone */}
              <div className={`${styles.phoneContainer} ${styles.phoneSecondaryRight}`}>
                <div className={`${styles.phoneMockup} ${styles.phoneSecondary}`}>
                  <PhoneMockupCalendar />
                </div>
              </div>

              {/* Glow behind phones */}
              <div className={styles.phoneGlow} aria-hidden="true" />
            </div>

            {/* Scroll indicator */}
            {/* <div className={styles.scrollIndicator} aria-hidden="true">
              <span className={styles.scrollLine} />
              <span>Scroll</span>
            </div> */}
          </div>
        </section>

        {/* ============================
            STATS BAR
        ============================= */}
        {/* <div className={styles.statsBar} aria-label="App statistics">
          <div className={styles.statsBarInner}>
            <div className={styles.statItem}>
              <span ref={recordingsCounter.ref} className={styles.statValue}>
                {recordingsCounter.count.toLocaleString()}+
              </span>
              <span className={styles.statLabel}>Recordings Processed</span>
            </div>
            <div className={styles.statDivider} aria-hidden="true" />
            <div className={styles.statItem}>
              <span ref={accuracyCounter.ref} className={styles.statValue}>
                {accuracyCounter.count}%
              </span>
              <span className={styles.statLabel}>Transcription Accuracy</span>
            </div>
            <div className={styles.statDivider} aria-hidden="true" />
            <div className={styles.statItem}>
              <span ref={summariesCounter.ref} className={styles.statValue}>
                {(summariesCounter.count / 1000).toFixed(0)}K+
              </span>
              <span className={styles.statLabel}>AI Summaries Generated</span>
            </div>
            <div className={styles.statDivider} aria-hidden="true" />
            <div className={styles.statItem}>
              <span className={styles.statValue}>3</span>
              <span className={styles.statLabel}>Powerful Screens</span>
            </div>
          </div>
        </div> */}

        {/* ============================
            FEATURES SECTION
        ============================= */}
        <section
          id="features"
          className={`${styles.section} ${styles.featuresSection}`}
          aria-labelledby="features-heading"
        >
          <div className={styles.sectionInner}>
            <div className={`${styles.sectionHeader} animate-on-scroll`}>
              <span className={styles.sectionLabel}>
                <span>✦</span> Core Capabilities
              </span>
              <h2 id="features-heading" className={styles.sectionTitle}>
                Everything you need to capture,{" "}
                <span className="gradient-text">understand & act</span>
              </h2>
              <p className={styles.sectionSubtitle}>
                From the moment you tap record, Voicenote AI takes care of
                everything — transcription, summarization, and intelligent
                retrieval.
              </p>
            </div>

            <div className={styles.featuresGrid}>
              {/* Feature 1 — Background Recording */}
              <div className={`${styles.featureCard} animate-on-scroll delay-1`}>
                <div className={`${styles.featureIconWrap} ${styles.featureIconPurple}`}>
                  🎙️
                </div>
                <h3 className={styles.featureCardTitle}>
                  Background Recording
                </h3>
                <p className={styles.featureCardText}>
                  Recording continues uninterrupted even when you switch apps or
                  lock your phone. Capture full meetings without keeping the app
                  open.
                </p>
              </div>

              {/* Feature 2 — AI Transcription */}
              <div className={`${styles.featureCard} animate-on-scroll delay-2`}>
                <div className={`${styles.featureIconWrap} ${styles.featureIconOrange}`}>
                  📝
                </div>
                <h3 className={styles.featureCardTitle}>
                  AI-Powered Transcription
                </h3>
                <p className={styles.featureCardText}>
                  Every word captured with high precision. The AI
                  converts speech to clean, formatted text — automatically when
                  you stop recording.
                </p>
              </div>

              {/* Feature 3 — Structured Summary */}
              <div className={`${styles.featureCard} animate-on-scroll delay-3`}>
                <div className={`${styles.featureIconWrap} ${styles.featureIconPurple}`}>
                  ✨
                </div>
                <h3 className={styles.featureCardTitle}>
                  Structured AI Summary
                </h3>
                <p className={styles.featureCardText}>
                  Get key discussion points, important decisions, commitments,
                  follow-up tasks, and action items — organized and ready to
                  share.
                </p>
              </div>

              {/* Feature 4 — Semantic Q&A */}
              <div className={`${styles.featureCard} animate-on-scroll delay-1`}>
                <div className={`${styles.featureIconWrap} ${styles.featureIconOrange}`}>
                  💬
                </div>
                <h3 className={styles.featureCardTitle}>
                  Semantic Q&amp;A
                </h3>
                <p className={styles.featureCardText}>
                  Ask natural questions about any recording: "What commitments
                  did I make today?" The AI finds the exact answer from your
                  transcript context.
                </p>
              </div>

              {/* Feature 5 — Library */}
              <div className={`${styles.featureCard} animate-on-scroll delay-2`}>
                <div className={`${styles.featureIconWrap} ${styles.featureIconPurple}`}>
                  📚
                </div>
                <h3 className={styles.featureCardTitle}>
                  Full Recording Library
                </h3>
                <p className={styles.featureCardText}>
                  Every session saved and searchable. View, play, share, or
                  delete any past recording from the organized library screen
                  with instant search.
                </p>
              </div>

              {/* Feature 6 — Calendar */}
              <div className={`${styles.featureCard} animate-on-scroll delay-3`}>
                <div className={`${styles.featureIconWrap} ${styles.featureIconOrange}`}>
                  📅
                </div>
                <h3 className={styles.featureCardTitle}>
                  Calendar-Based Queries
                </h3>
                <p className={styles.featureCardText}>
                  Travel back to any date. Pick a day on the calendar and ask
                  "What did I discuss?" — powered by vector embeddings and
                  AI's contextual reasoning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================
            HOW IT WORKS SECTION
        ============================= */}
        <section
          id="how-it-works"
          className={`${styles.section} ${styles.howSection}`}
          aria-labelledby="how-heading"
        >
          <div className={styles.sectionInner}>
            <div className={`${styles.sectionHeader} ${styles.sectionHeaderCentered} animate-on-scroll`}>
              {/* <span className={styles.sectionLabel}>
                <span>⚙️</span> Workflow
              </span> */}
              <h2 id="how-heading" className={styles.sectionTitle}>
                From speech to insights in{" "}
                <span className="gradient-text">4 simple steps</span>
              </h2>
              <p className={styles.sectionSubtitle}>
                A seamless pipeline from raw audio to structured, actionable
                intelligence — all happening automatically in the background.
              </p>
            </div>

            <div className={styles.stepsContainer}>
              {[
                {
                  // icon: "🎙️",
                  title: "Record",
                  desc: "Tap record and speak naturally. The app captures everything — meetings, calls, brainstorms — even in the background.",
                },
                {
                  // icon: "🔤",
                  title: "Transcribe",
                  desc: "When you stop, the audio is sent to the AI which generates a complete, accurate transcript of your recording.",
                },
                {
                  // icon: "✦",
                  title: "Summarize",
                  desc: "The FastAPI backend uses AI to extract key points, decisions, commitments, and action items from the transcript.",
                },
                {
                  // icon: "💬",
                  title: "Ask Anytime",
                  desc: "Ask questions about any past recording using the Calendar screen. Semantic search retrieves the right context instantly.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`${styles.stepCard} animate-on-scroll delay-${i + 1}`}
                >
                  <div className={styles.stepNumber}>
                    <span className={styles.stepNumBadge}>{i + 1}</span>
                    {/* Step {i + 1} */}
                  </div>
                  <span className={styles.stepIcon} aria-hidden="true">
                    {/* {step.icon} */}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================
            AI DEMO SECTION
        ============================= */}
        <section
          id="ai-demo"
          className={`${styles.section} ${styles.aiSection}`}
          aria-labelledby="ai-heading"
        >
          <div className={styles.sectionInner}>
            <div className={styles.aiGrid}>
              {/* Left: text */}
              <div className={`animate-on-scroll`}>
                <span className={styles.sectionLabel}>
                  <span>✦</span> AI Intelligence
                </span>
                <h2 id="ai-heading" className={styles.sectionTitle}>
                  Every recording becomes a{" "}
                  <span className="gradient-text">structured document</span>
                </h2>
                <p className={styles.sectionSubtitle} style={{ marginBottom: "1.75rem" }}>
                  Voicenote AI doesn't just transcribe — it understands context.
                  The AI model extracts the information that matters most so
                  you never miss a commitment or decision.
                </p>

                <ul className={styles.screenBullets} style={{ marginBottom: "2rem" }}>
                  {[
                    "Key discussion points & highlights",
                    "Important decisions made",
                    "Commitments & follow-ups",
                    "Action items & task lists",
                    "Overall meeting summary",
                  ].map((item, i) => (
                    <li key={i} className={`${styles.screenBullet} ${styles.screenBulletLight}`}>
                      <span className={styles.bulletCheck} aria-hidden="true">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  id="ai-demo-cta"
                  className={styles.btnPurple}
                  onClick={() => scrollTo("screens")}
                >
                  See App in Action
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Right: AI summary demo card */}
              <div className={`animate-on-scroll delay-2`}>
                <div className={styles.aiDemoCard}>
                  <div className={styles.aiDemoHeader}>
                    <div className={styles.trafficDots}>
                      <span className={`${styles.tdDot} ${styles.tdRed}`} />
                      <span className={`${styles.tdDot} ${styles.tdYellow}`} />
                      <span className={`${styles.tdDot} ${styles.tdGreen}`} />
                    </div>
                    <span className={styles.aiDemoTitle}>
                      Voicenote AI — Summary Output
                    </span>
                  </div>
                  <div className={styles.aiDemoBody}>
                    {/* Transcript snippet */}
                    <div>
                      <div className={styles.aiLabel}>Transcript Excerpt</div>
                      <div className={styles.aiTranscriptBlock}>
                        &ldquo;...let's finalize the landing page design by Friday.
                        Sarah will handle the copywriting. Dave needs to set up the
                        DNS records, and we'll do a final QA sync on Monday at 10
                        AM...&rdquo;
                      </div>
                    </div>

                    {/* AI summary output */}
                    <div>
                      <div className={styles.aiLabel}>
                        <span style={{ color: "var(--accent-purple)", marginRight: "0.35rem" }}>✦</span>
                        AI Generated Summary
                      </div>
                      <div className={styles.aiSummaryBlock}>
                        {[
                          { label: "Decision", text: "Launch deadline: next Tuesday" },
                          { label: "Task", text: "Finalize landing page design by Friday" },
                          { label: "Assigned", text: "Sarah → Copywriting" },
                          { label: "Assigned", text: "Dave → DNS records setup" },
                          { label: "Meeting", text: "QA sync scheduled: Monday 10 AM" },
                        ].map((item, i) => (
                          <div key={i} className={styles.aiSummaryItem}>
                            <span className={styles.aiItemDot} aria-hidden="true" />
                            <span className={styles.aiItemLabel}>{item.label}</span>
                            <span style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action badge */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span className={styles.aiActionBadge}>
                        <span aria-hidden="true">✓</span> 5 Action Items
                      </span>
                      <span className={styles.aiActionBadge} style={{ background: "var(--accent-purple-bg)", borderColor: "rgba(124,58,237,0.15)", color: "var(--accent-purple)" }}>
                        <span aria-hidden="true">✦</span> AI Powered
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================
            APP SCREENS SHOWCASE
        ============================= */}
        <section
          id="screens"
          className={`${styles.section} ${styles.screensSection}`}
          aria-labelledby="screens-heading"
        >
          <div className={styles.screensSectionBg} aria-hidden="true" />
          <div className={styles.sectionInner}>
            <div className={styles.screensContent}>
              {/* Left: info panel */}
              <div className={`${styles.screensText} animate-on-scroll`}>
                <span className={styles.sectionLabel}>
                  <span></span> App Experience
                </span>
                <h2 id="screens-heading" className={styles.sectionTitle}>
                  Three User App screens,{" "}
                  <span className="gradient-text">one seamless workflow</span>
                </h2>

                {/* Screen tabs */}
                <div
                  className={styles.screenTabs}
                  role="tablist"
                  aria-label="App screens"
                >
                  {(Object.keys(SCREEN_DATA) as ScreenId[]).map((key) => (
                    <button
                      key={key}
                      role="tab"
                      id={`tab-${key}`}
                      aria-selected={activeScreen === key}
                      aria-controls={`panel-${key}`}
                      className={`${styles.screenTab} ${activeScreen === key ? styles.screenTabActive : ""
                        }`}
                      onClick={() => setActiveScreen(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>

                <div
                  id={`panel-${activeScreen}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${activeScreen}`}
                >
                  <p className={styles.screenDesc}>{screenInfo.desc}</p>
                  <ul className={styles.screenBullets} aria-label="Features">
                    {screenInfo.bullets.map((b, i) => (
                      <li key={i} className={styles.screenBullet}>
                        <span className={styles.bulletCheck} aria-hidden="true">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: phone frame */}
              <div
                className={`${styles.screensPhoneDisplay} animate-on-scroll delay-3`}
                aria-label={`${screenInfo.title} preview`}
              >
                <div className={styles.screensGlow} aria-hidden="true" />
                <div className={styles.screensPhoneFrame}>
                  <PhoneComponent />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================
            USE CASES SECTION
        ============================= */}
        <section
          id="use-cases"
          className={`${styles.section} ${styles.useCasesSection}`}
          aria-labelledby="usecases-heading"
        >
          <div className={styles.sectionInner}>
            <div className={`${styles.sectionHeader} ${styles.sectionHeaderCentered} animate-on-scroll`}>
              <span className={styles.sectionLabel}>
                <span></span> Who It&apos;s For
              </span>
              <h2 id="usecases-heading" className={styles.sectionTitle}>
                Built for people who{" "}
                <span className="gradient-text">think out loud</span>
              </h2>
              <p className={styles.sectionSubtitle}>
                Whether you&apos;re in meetings all day, brainstorming solo, or
                juggling client calls — Voicenote AI keeps you organized.
              </p>
            </div>

            <div className={styles.useCasesGrid}>
              {[
                {
                  emoji: "💼",
                  title: "Professionals & Managers",
                  text: "Capture every meeting decision and follow-up without breaking focus. Get a shareable summary ready before the call even ends.",
                  q: '"What commitments did I make today?"',
                },
                {
                  emoji: "🎓",
                  title: "Students & Researchers",
                  text: "Record lectures, seminars, or interviews. Let AI generate structured notes so you spend time learning, not transcribing.",
                  q: '"Summarize key concepts from today\'s lecture"',
                },
                {
                  emoji: "🏗️",
                  title: "Developers & Founders",
                  text: "Brainstorm features, capture user interviews, and turn ideas into task lists — all from voice recordings.",
                  q: '"What features did we discuss on Monday?"',
                },
                {
                  emoji: "🩺",
                  title: "Healthcare Professionals",
                  text: "Document patient interactions and clinical notes hands-free. AI organizes observations, decisions, and next steps.",
                  q: '"What were the treatment decisions last Tuesday?"',
                },
                {
                  emoji: "✍️",
                  title: "Journalists & Writers",
                  text: "Record interviews and have accurate transcripts in minutes. Query specific quotes or topics across months of recordings.",
                  q: '"What quotes did the interviewee give about AI?"',
                },
                {
                  emoji: "🔧",
                  title: "Field Teams & Consultants",
                  text: "Capture site visits, client discussions, and field notes on the go. Access organized summaries at any time, from anywhere.",
                  q: '"What issues were flagged on the site visit?"',
                },
              ].map((uc, i) => (
                <div
                  key={i}
                  className={`${styles.useCaseCard} animate-on-scroll delay-${(i % 3) + 1}`}
                  role="article"
                >
                  <div
                    className={styles.useCaseEmoji}
                    aria-hidden="true"
                  >
                    {uc.emoji}
                  </div>
                  <h3 className={styles.useCaseTitle}>{uc.title}</h3>
                  <p className={styles.useCaseText}>{uc.text}</p>
                  <p className={styles.useCaseQuestion} aria-label="Example question">
                    {uc.q}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================
            TECH STACK SECTION
        ============================= */}
        <section
          id="tech"
          className={`${styles.section} ${styles.techSection}`}
          aria-labelledby="tech-heading"
        >
          <div className={styles.sectionInner}>
            <div className={`${styles.sectionHeader} ${styles.sectionHeaderCentered} animate-on-scroll`}>
              <span className={styles.sectionLabel}>
                <span></span> Built With
              </span>
              <h2 id="tech-heading" className={styles.sectionTitle}>
                Modern technology,{" "}
                <span className="gradient-text">production-grade stack</span>
              </h2>
              <p className={styles.sectionSubtitle}>
                Voicenote AI is built on a robust, scalable architecture
                combining Flutter&apos;s native performance with AI&apos;s AI
                capabilities and FastAPI&apos;s speed.
              </p>
            </div>

            <div className={styles.techGrid}>
              {[
                {
                  icon: "📱",
                  title: "Flutter",
                  sub: "Cross-Platform Frontend",
                  desc: "Native-performance mobile app running on iOS & Android from a single codebase. Background recording handled natively.",
                  badge: "Frontend",
                  badgeClass: styles.badgePurple,
                },
                {
                  icon: "⚡",
                  title: "FastAPI",
                  sub: "Python Backend",
                  desc: "Lightning-fast Python backend handling transcript processing, summary generation, embedding storage, and semantic retrieval.",
                  badge: "Backend",
                  badgeClass: styles.badgeGray,
                },
                {
                  icon: "✦",
                  title: "Gemini API",
                  sub: "Google AI Services",
                  desc: "Powers speech-to-text transcription, intelligent summary generation, and vector embeddings for semantic Q&A search.",
                  badge: "AI Layer",
                  badgeClass: styles.badgeOrange,
                },
              ].map((tech, i) => (
                <div
                  key={i}
                  className={`${styles.techCard} animate-on-scroll delay-${i + 1}`}
                  role="article"
                >
                  <div
                    className={styles.techCardIcon}
                    aria-hidden="true"
                  >
                    {tech.icon}
                  </div>
                  <h3 className={styles.techCardTitle}>{tech.title}</h3>
                  <p className={styles.techCardSub}>{tech.sub}</p>
                  <p
                    style={{
                      fontSize: "0.87rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.5rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {tech.desc}
                  </p>
                  <span className={`${styles.techCardBadge} ${tech.badgeClass}`}>
                    {tech.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================
            FAQ SECTION
        ============================= */}
        <section
          id="faq"
          className={`${styles.section} ${styles.faqSection}`}
          aria-labelledby="faq-heading"
        >
          <div className={styles.sectionInner}>
            <div className={`${styles.sectionHeader} ${styles.sectionHeaderCentered} animate-on-scroll`}>
              <span className={styles.sectionLabel}>
                <span></span> FAQ
              </span>
              <h2 id="faq-heading" className={styles.sectionTitle}>
                Frequently asked{" "}
                <span className="gradient-text">questions</span>
              </h2>
              <p className={styles.sectionSubtitle}>
                Everything you need to know about Voicenote AI — from how
                recordings work to privacy and AI accuracy.
              </p>
            </div>

            <div className={styles.faqList} role="list">
              {FAQ_DATA.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""} animate-on-scroll delay-${(i % 3) + 1}`}
                    role="listitem"
                  >
                    <button
                      id={`faq-btn-${i}`}
                      className={styles.faqBtn}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                    >
                      <span className={styles.faqQuestion}>{item.q}</span>
                      <span
                        className={styles.faqChevron}
                        style={{
                          display: "inline-flex",
                          transition: "transform 0.3s ease",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          color: isOpen ? "var(--accent-purple)" : "var(--text-muted)",
                        }}
                        aria-hidden="true"
                      >
                        <ChevronDown size={18} />
                      </span>
                    </button>
                    {/* JS-controlled height — most reliable accordion approach */}
                    <div
                      id={`faq-answer-${i}`}
                      role="region"
                      aria-labelledby={`faq-btn-${i}`}
                      className={styles.faqAnswer}
                      style={{
                        maxHeight: isOpen ? "500px" : "0",
                        paddingBottom: isOpen ? "1.25rem" : "0",
                        paddingTop: isOpen ? "0.25rem" : "0",
                      }}
                    >
                      {item.a}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================
            DOWNLOAD / CTA SECTION
        ============================= */}
        <section
          id="download"
          className={`${styles.section} ${styles.ctaSection}`}
          aria-labelledby="download-heading"
        >
          <div className={styles.ctaBg} aria-hidden="true" />
          <div className={styles.sectionInner}>
            <div className={styles.ctaContent}>
              {/* Waveform decoration */}
              <div className={styles.waveformDecor} aria-hidden="true">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={styles.waveformBar} />
                ))}
              </div>

              {/* <p className={styles.ctaTagline}>speak · summarise · remember</p> */}

              <h2 id="download-heading" className={styles.ctaTitle}>
                Start capturing smarter{" "}
                <span>meetings today</span>
              </h2>

              <p className={styles.ctaSubtitle}>
                Download Voicenote AI for free. Record, transcribe, summarize, and
                Ask your conversations — all from your pocket.
              </p>

              <div className={styles.downloadButtons}>
                {/* App Store */}
                <a
                  href="#"
                  className={`${styles.downloadBtn} ${styles.downloadBtnDark}`}
                  aria-label="Download on the App Store"
                >
                  <span className={styles.downloadBtnIcon} aria-hidden="true">
                    🍎
                  </span>
                  <span className={styles.downloadBtnText}>
                    <span className={styles.downloadBtnSub}>Download on the</span>
                    <span className={styles.downloadBtnName}>App Store</span>
                  </span>
                </a>

                {/* Play Store */}
                <a
                  href="#"
                  className={`${styles.downloadBtn} ${styles.downloadBtnLight}`}
                  aria-label="Get it on Google Play"
                >
                  <span className={styles.downloadBtnIcon} aria-hidden="true">
                    ▶
                  </span>
                  <span className={styles.downloadBtnText}>
                    <span className={styles.downloadBtnSub}>Get it on</span>
                    <span className={styles.downloadBtnName}>Google Play</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================
          FOOTER
      ============================= */}
      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          {/* Brand col */}
          <div className={styles.footerBrand}>
            <div className={styles.footerBrandRow}>
              <div className={styles.navLogoIcon}>
                <MicIcon size={16} color="white" />
              </div>
              <span className={styles.footerBrandName}>Voicenote AI</span>
            </div>
            <p className={styles.footerDesc}>
              Intelligently capture, summarize, and ask your meetings and
              conversations.
            </p>
            <p className={styles.footerTagline}>speak · summarise · remember</p>
          </div>

          {/* Product col */}
          <div className={styles.footerCol}>
            <h3 className={styles.footerColTitle}>Product</h3>
            <ul className={styles.footerLinks} role="list">
              {["Features", "How It Works", "App Screens", "Tech Stack"].map(
                (l) => (
                  <li key={l}>
                    <button
                      className={styles.footerLink}
                      onClick={() =>
                        scrollTo(l.toLowerCase().replace(/ /g, "-"))
                      }
                    >
                      {l}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal col */}
          <div className={styles.footerCol}>
            <h3 className={styles.footerColTitle}>Legal</h3>
            <ul className={styles.footerLinks} role="list">
              {["Privacy Policy", "Terms of Service", "Contact Us", "FAQ"].map(
                (l) => (
                  <li key={l}>
                    <a href="#" className={styles.footerLink}>
                      {l}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className={styles.footerBottom}>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} Voicenote AI. All rights reserved.
            Built with Flutter & PythonI.
          </p>
          <div className={styles.footerBottomRight}>
            <a href="#" className={styles.footerBottomLink}>
              Privacy
            </a>
            <a href="#" className={styles.footerBottomLink}>
              Terms
            </a>
            <a href="#" className={styles.footerBottomLink}>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
