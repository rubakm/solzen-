import { StrictMode, useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import emailjs from '@emailjs/browser';
import './styles.css';
import './intro.css';
import BrandIntro from './BrandIntro';
import ConceptDemo from './ConceptDemo';
import AdminPanel from './AdminPanel';
import { DEFAULT_CONTENT, SOCIAL_PLATFORMS, getApiBase, mediaUrl } from './content';
import Gallery, { UpdatePhotos } from './Gallery';

const Arrow = () => <span className="arrow">↗</span>;

// Office address (footer + contact)
const ADDRESS_LINES = ['SOLZEN', 'Nirmaan, Sudha and Shankar Innovation Hub', 'IIT Madras, Chennai'];
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Sudha and Shankar Innovation Hub, IIT Madras, Chennai');
const PinIcon = ({ className = '' }) => (
  <svg className={`pin-icon ${className}`} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.27 6.38 11.66 6.65 11.93a1.2 1.2 0 0 0 1.7 0c.27-.27 6.65-6.66 6.65-11.93A7.5 7.5 0 0 0 12 2Zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z"
    />
  </svg>
);

// SOLZEN sparkle (✦) — the brand's four-point star, drawn as SVG so it stays crisp
const SPARKLE_PATH = 'M12 0C12.8 6.7 17.3 11.2 24 12C17.3 12.8 12.8 17.3 12 24C11.2 17.3 6.7 12.8 0 12C6.7 11.2 11.2 6.7 12 0Z';
const Sparkle = ({ className = '' }) => (
  <svg className={`sparkle ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={SPARKLE_PATH} />
  </svg>
);
const Logo = () => (
  <a className="logo" href="#home" aria-label="SOLZEN home">
    <img src="/solzen-mark.png" alt="SOLZEN" />
    <span>SOLZEN</span>
  </a>
);

const steps = [
  ['01', 'Understand', 'Start with the underlying idea, not just the answer. Visualise core principles and build intuition first.'],
  ['02', 'Assess', 'Make progress visible with thoughtful, conceptual evidence. Identify misconceptions early without anxiety.'],
  ['03', 'Reinforce', 'Strengthen cognitive connections where they matter most with adaptive, targeted reinforcement.'],
  ['04', 'Apply', 'Turn deep understanding into confident action, real-world execution and critical problem-solving.']
];

const thinking = [
  ['Concept-first', 'Start with understanding rather than memorisation.'],
  ['Human-centred', 'Connect explanations with how learners naturally think.'],
  ['Visual', 'Make difficult ideas easier to see, connect and explore.'],
  ['Measurable', 'Use evidence of learning to guide what comes next.'],
  ['Applicable', 'Move learning toward confident problem-solving and action.']
];

const techPillars = [
  ['01', 'Conceptual Visualisation', 'Making invisible relationships and abstract mental models tangible, intuitive and exploratory.'],
  ['02', 'Interactive Exploration', 'Active inquiry environments built around the way learners naturally think, discover and test hypotheses.'],
  ['03', 'Continuous Diagnostic Assessment', 'Formative, low-anxiety evidence signals that reveal depth of understanding rather than mere recall.'],
  ['04', 'Personalised Reinforcement', 'Dynamic cognitive pathways that strengthen retention right when neural connections need reinforcement most.'],
  ['05', 'Regional & Localised Learning', 'Contextualised pedagogical framing and linguistic accessibility designed for diverse learning ecosystems.']
];

// To add a profile photo, set `photo` on a member (e.g. photo: '/team/padma.jpg' in /public).
// Initials are shown as a fallback until a photo is provided.



const SocialIcons = ({ links = [], className = '' }) => (
  <div className={`social-icons ${className}`}>
    {links
      .filter(l => SOCIAL_PLATFORMS[l.platform] && l.url)
      .map(l => {
        const p = SOCIAL_PLATFORMS[l.platform];
        const external = l.url.startsWith('http');
        return (
          <a
            key={l.id || l.platform}
            href={l.url}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            aria-label={`SOLZEN on ${p.label}`}
            title={p.label}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d={p.icon} fill="currentColor" />
            </svg>
          </a>
        );
      })}
  </div>
);

const orbitSections = {
  explore: {
    id: 'explore',
    num: '00',
    category: 'OVERVIEW',
    label: 'EXPLORE',
    title: 'Making Learning Deeper.',
    subtitle: 'Making Understanding Actionable.',
    desc: 'SOLZEN is building a new pedagogical approach — moving beyond memorisation toward deeper understanding, measurable progress and real-world application.',
    actionLabel: 'Explore SOLZEN',
    actionHref: '#about',
    accent: 'Pedagogical Architecture'
  },
  about: {
    id: 'about',
    num: '01',
    category: 'THE CORE PROBLEM',
    label: 'ABOUT',
    title: 'Beyond Memorisation',
    subtitle: 'Visualising abstract concepts',
    desc: 'Students struggle to visualise underlying principles. We address where memorisation ends and durable, applicable understanding begins.',
    actionLabel: 'Explore Core Problem',
    actionHref: '#about',
    accent: 'Cognitive Depth',
    x: 142,
    y: 152,
    lx: 126,
    ly: 136,
    anchor: 'end'
  },
  approach: {
    id: 'approach',
    num: '02',
    category: 'LEARNING PIPELINE',
    label: 'APPROACH',
    title: 'Depth Has a Process',
    subtitle: 'Understand · Assess · Reinforce · Apply',
    desc: 'A structured four-stage learning rhythm: start with underlying intuition, assess conceptual evidence, adaptively reinforce, and apply knowledge.',
    actionLabel: 'View learning pipeline',
    actionHref: '#approach',
    accent: '4-Stage Pipeline',
    x: 412,
    y: 140,
    lx: 430,
    ly: 124,
    anchor: 'start'
  },
  technology: {
    id: 'technology',
    num: '03',
    category: 'CAPABILITIES',
    label: 'TECHNOLOGY',
    title: 'Technology × Learning',
    subtitle: 'Broad capabilities, kept high-level',
    desc: 'Five public research pillars: conceptual visualisation, active inquiry exploration, continuous diagnostics, personalized reinforcement, and localized learning.',
    actionLabel: 'Explore 5 tech pillars',
    actionHref: '#technology',
    accent: '5 Research Pillars',
    x: 494,
    y: 262,
    lx: 512,
    ly: 262,
    anchor: 'start'
  },
  team: {
    id: 'team',
    num: '04',
    category: 'LEADERSHIP',
    label: 'TEAM',
    title: 'The People Behind SOLZEN',
    subtitle: 'Product, systems & cognitive modeling',
    desc: 'Led by Padma Ganesh P, Rubeak, and Vignesh R S — combining product vision, distributed systems, and cognitive modeling technologies.',
    actionLabel: 'Meet our leadership',
    actionHref: '#team',
    accent: 'Research Leadership',
    x: 418,
    y: 415,
    lx: 436,
    ly: 435,
    anchor: 'start'
  },
  insights: {
    id: 'insights',
    num: '05',
    category: 'RESEARCH JOURNAL',
    label: 'INSIGHTS',
    title: 'Learning Science Insights',
    subtitle: 'Threshold concepts & cognitive depth',
    desc: 'Essays on true understanding, moving beyond right answers, and making invisible mental models visible through multi-modal scaffolding.',
    actionLabel: 'Read research insights',
    actionHref: '#insights',
    accent: 'Learning Science',
    x: 280,
    y: 512,
    lx: 280,
    ly: 542,
    anchor: 'middle'
  },
  updates: {
    id: 'updates',
    num: '06',
    category: 'MILESTONES',
    label: 'UPDATES',
    title: 'News & Announcements',
    subtitle: 'IIT Madras Nirmaan ecosystem engagement',
    desc: 'Supported within the Nirmaan Pre-Incubation ecosystem at IIT Madras, validating formative diagnostic pedagogy and our four-stage framework.',
    actionLabel: 'See recent updates',
    actionHref: '#updates',
    accent: 'Ecosystem News',
    x: 132,
    y: 410,
    lx: 112,
    ly: 434,
    anchor: 'end'
  },
  connect: {
    id: 'connect',
    num: '07',
    category: 'COLLABORATION',
    label: 'CONNECT',
    title: 'Start a Conversation',
    subtitle: 'Partnerships & institutional collaboration',
    desc: 'Open channels for educational institutions, research collaborators, media inquiries, and career opportunities.',
    actionLabel: 'Connect with our team',
    actionHref: '#contact',
    accent: 'Partnership Channels',
    x: 72,
    y: 268,
    lx: 54,
    ly: 268,
    anchor: 'end'
  }
};

const orbitNodes = [
  orbitSections.about,
  orbitSections.approach,
  orbitSections.technology,
  orbitSections.team,
  orbitSections.insights,
  orbitSections.updates,
  orbitSections.connect
];

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const isNavigatingRef = useRef(false);
  const navTimeoutRef = useRef(null);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Approach', href: '#approach' },
    { label: 'Technology', href: '#technology' },
    { label: 'Team', href: '#team' },
    { label: 'Insights', href: '#insights' },
    { label: 'Updates', href: '#updates' },
    { label: 'Contact', href: '#contact' }
  ];

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
          setScrollProgress(pageHeight > 0 ? Math.min(100, (window.scrollY / pageHeight) * 100) : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Track active section as user scrolls
    const sectionIds = ['home', 'about', 'approach', 'technology', 'team', 'insights', 'updates', 'contact'];
    const syncHashState = () => {
      const hashId = window.location.hash.replace('#', '');
      if (!sectionIds.includes(hashId)) return;

      setActiveSection(hashId);
      const target = document.getElementById(hashId);
      if (target && hashId !== 'home') {
        window.requestAnimationFrame(() => {
          const headerOffset = 82;
          const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'auto' });
        });
      }
    };
    const observer = new IntersectionObserver(
      entries => {
        if (isNavigatingRef.current) return;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    syncHashState();
    window.addEventListener('hashchange', syncHashState);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', syncHashState);
      observer.disconnect();
      clearTimeout(navTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setOpen(false);

    isNavigatingRef.current = true;
    clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 850);

    if (href === '#home') {
      setActiveSection('home');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', '#home');
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      setActiveSection(href.slice(1));
      const headerOffset = 82;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
      window.history.pushState(null, '', href);
    }
  };

  return (
    <header
      className={`header ${scrolled ? 'scrolled' : ''}`}
      style={{ '--scroll-progress': `${scrollProgress}%` }}
    >
      <a
        className="logo"
        href="#home"
        onClick={e => handleNavClick(e, '#home')}
        aria-label="SOLZEN home"
      >
        <img src="/solzen-mark.png" alt="SOLZEN" />
        <span>SOLZEN</span>
      </a>

      <button
        className={`menu ${open ? 'menu-active' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="site-nav"
      >
        <span />
        <span />
      </button>

      {open && (
        <div
          className="nav-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav id="site-nav" aria-label="Main" className={open ? 'nav nav-open' : 'nav'}>
        <div className="nav-links-wrap">
          {navItems.map(item => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <a
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={e => handleNavClick(e, item.href)}
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <a
          onClick={e => handleNavClick(e, '#contact')}
          className="nav-contact"
          href="#contact"
        >
          Connect / Partner <Arrow />
        </a>
      </nav>
      <span className="scroll-progress" aria-hidden="true" />
    </header>
  );
}

function LegalModal({ type, onClose }) {
  const boxRef = useRef(null);
  useEffect(() => {
    if (!type) return undefined;
    const prev = document.activeElement;
    boxRef.current?.focus();
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [type, onClose]);
  if (!type) return null;

  const content = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Commitment to Student & Institutional Privacy',
      body: (
        <>
          <p>
            SOLZEN (solzen.in) is committed to rigorous privacy standards. Because our educational direction involves students and potentially minors, data protection is treated as a fundamental requirement rather than an afterthought.
          </p>
          <p>
            <strong>Core Privacy Principles:</strong>
          </p>
          <ul>
            <li>No personal learner data is tracked or sold to third-party ad networks.</li>
            <li>Marketing website inquiries are handled through secure, controlled channels with strict access authorization.</li>
            <li>We do not collect student profiles or minor information on this public informational site.</li>
            <li>All future interactive platforms comply with Indian and international data privacy protection standards.</li>
          </ul>
          <p>
            For privacy inquiries or data requests, contact: <em>privacy@solzen.in</em>.
          </p>
        </>
      )
    },
    terms: {
      title: 'Terms of Use',
      subtitle: 'Public Website Guidelines',
      body: (
        <>
          <p>
            Welcome to SOLZEN. By accessing solzen.in, you agree to these Terms of Use governing public informational access to our website.
          </p>
          <p>
            <strong>Intellectual Property &amp; Confidentiality:</strong>
          </p>
          <ul>
            <li>All brand names, learning frameworks, articles, and trademarks are proprietary to SOLZEN.</li>
            <li>Content on this website is provided for informational and partnership exploration purposes.</li>
            <li>Unauthorised reproduction, automated scraping, or misuse of site materials is prohibited.</li>
          </ul>
        </>
      )
    },
    cookies: {
      title: 'Cookie Policy',
      subtitle: 'Minimal & Essential Usage',
      body: (
        <>
          <p>
            SOLZEN maintains a minimal cookie footprint. We only employ necessary technical cookies required for website routing, display preferences, and anti-spam verification.
          </p>
          <ul>
            <li>No invasive cross-site advertising or tracking cookies are utilized.</li>
            <li>Session cookies automatically expire upon closing your browser.</li>
          </ul>
        </>
      )
    }
  }[type];

  if (!content) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        tabIndex={-1}
        ref={boxRef}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        <h3 id="legal-title">{content.title}</h3>
        <p className="modal-subtitle">{content.subtitle}</p>
        <div className="modal-body">{content.body}</div>
      </div>
    </div>
  );
}

function ExploreOrbit() {
  // Three brand pillars sit on the outer ring (angles -150°, -30°, 90°, r = 230 in a 560 box)
  const pillars = [
    { label: 'Understand', left: '14.4%', top: '29.5%' },
    { label: 'Apply', left: '85.6%', top: '29.5%' },
    { label: 'Advance', left: '50%', top: '91.1%' }
  ];

  return (
    <div className="hero-object hero-orbit-clean" id="hero-learning-sculpture" aria-hidden="true">
      <div className="hero-glow" />

      <div className="orbit-stage">
        <svg viewBox="0 0 560 560" className="orbit-svg-clean">
          <defs>
            <radialGradient id="planetGrad" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#21614F" />
              <stop offset="55%" stopColor="#0B332B" />
              <stop offset="100%" stopColor="#051612" />
            </radialGradient>
            <radialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(201, 139, 60, 0.22)" />
              <stop offset="60%" stopColor="rgba(201, 139, 60, 0.06)" />
              <stop offset="100%" stopColor="rgba(201, 139, 60, 0)" />
            </radialGradient>
            <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E7BE7C" />
              <stop offset="100%" stopColor="#B57A2E" />
            </linearGradient>
            <clipPath id="centerLogoClip">
              <circle cx="280" cy="280" r="40" />
            </clipPath>
          </defs>

          {/* Soft halo behind the core */}
          <circle cx="280" cy="280" r="150" fill="url(#coreHalo)" />

          {/* Three calm, concentric rings */}
          <circle cx="280" cy="280" r="230" className="ring ring-outer" />
          <circle cx="280" cy="280" r="168" className="ring ring-mid" />
          <circle cx="280" cy="280" r="106" className="ring ring-inner" />

          {/* Revolving beads — one per ring, different speeds */}
          <g className="revolve revolve-outer">
            <circle cx="280" cy="50" r="5.5" className="bead bead-gold" />
          </g>
          <g className="revolve revolve-mid">
            <circle cx="448" cy="280" r="4.5" className="bead bead-forest" />
          </g>
          <g className="revolve revolve-inner">
            <circle cx="280" cy="386" r="3.5" className="bead bead-gold-soft" />
          </g>

          {/* Pillar anchor points on the outer ring */}
          <circle cx="80.8" cy="165" r="4" className="anchor" />
          <circle cx="479.2" cy="165" r="4" className="anchor" />
          <circle cx="280" cy="510" r="4" className="anchor" />

          {/* Central SOLZEN core */}
          <circle cx="280" cy="280" r="74" className="core-pulse" />
          <circle cx="280" cy="280" r="66" className="core-ring" />
          <circle cx="280" cy="280" r="58" fill="url(#planetGrad)" className="core-sphere" />
          <circle cx="280" cy="280" r="41" className="core-disc" />
          <image
            href="/solzen-mark.png"
            x="240"
            y="240"
            width="80"
            height="80"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#centerLogoClip)"
          />
        </svg>

        {pillars.map(p => (
          <span key={p.label} className="orbit-pill" style={{ left: p.left, top: p.top }}>
            <i />{p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function App() {
  // Intro loading screen appears on initial application mount / every page reload
  const [opening, setOpening] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');
  const [activeModal, setActiveModal] = useState(null);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [adminOpen, setAdminOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === '#admin');

  // Load content saved from the admin panel; keep defaults for anything not saved yet.
  const applyContent = saved => {
    setContent(prev => {
      const next = { ...prev };
      ['team', 'insights', 'updates', 'socials', 'gallery'].forEach(k => {
        if (saved && Array.isArray(saved[k])) next[k] = saved[k];
      });
      return next;
    });
  };

  useEffect(() => {
    const base = getApiBase();
    if (!base) return undefined;
    const ctrl = new AbortController();
    fetch(`${base}/api/content`, { signal: ctrl.signal })
      .then(r => (r.ok ? r.json() : null))
      .then(data => data && data.content && applyContent(data.content))
      .catch(() => {
        /* backend unreachable: keep built-in content */
      });
    return () => ctrl.abort();
  }, []);

  // Admin shortcut: Ctrl + Alt + A (also opens with #admin in the URL)
  useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey && e.altKey && e.code === 'KeyA') {
        e.preventDefault();
        setAdminOpen(true);
      }
    };
    const onHash = () => window.location.hash === '#admin' && setAdminOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  const closeAdmin = () => {
    setAdminOpen(false);
    if (window.location.hash === '#admin') window.history.replaceState(null, '', window.location.pathname);
  };
  const [activeOrbitId, setActiveOrbitId] = useState('explore');
  const [hoveredOrbitId, setHoveredOrbitId] = useState(null);
  const [isInteractingOrbit, setIsInteractingOrbit] = useState(false);

  // EmailJS Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: '', text: '' });

  const handleIntroComplete = () => {
    setOpening(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('show')),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.animate:not(.show)').forEach(el => observer.observe(el));
    return () => {
      observer.disconnect();
    };
    // Re-run when content changes so newly added team cards also animate in
  }, [content]);

  const handleContactMember = memberName => {
    setFormData(prev => ({
      ...prev,
      subject: `Inquiry regarding ${memberName}`,
      message: `Hello, I would like to connect with ${memberName} regarding: `
    }));
    setFormStatus({ type: '', text: '' });
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPurpose = category => {
    setFormData(prev => ({
      ...prev,
      subject: `${category} Inquiry`
    }));
    setFormStatus({ type: '', text: '' });
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      const headerOffset = 82;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  const isValidEmail = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formStatus.text) {
      setFormStatus({ type: '', text: '' });
    }
  };

  const submit = async e => {
    e.preventDefault();
    if (formLoading) return;

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      setFormStatus({ type: 'error', text: 'Please enter your full name.' });
      return;
    }

    if (!trimmedEmail) {
      setFormStatus({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormStatus({ type: 'error', text: 'Please enter a valid email address (e.g. name@organisation.com).' });
      return;
    }

    if (!trimmedSubject) {
      setFormStatus({ type: 'error', text: 'Please enter a subject for your message.' });
      return;
    }

    if (!trimmedMessage) {
      setFormStatus({ type: 'error', text: 'Please enter your message.' });
      return;
    }

    const backendUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!backendUrl && (!serviceId || !templateId || !publicKey)) {
      setFormStatus({
        type: 'error',
        text: 'No mail configuration detected. Please set VITE_API_URL in your .env or run the local backend server.'
      });
      return;
    }

    setFormLoading(true);
    setFormStatus({ type: '', text: '' });

    try {
      if (backendUrl) {
        // Send to Solzen Node.js / Express backend with Gmail Nodemailer
        const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            subject: trimmedSubject,
            message: trimmedMessage,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data.error || `Server responded with status ${res.status}`);
        }
      } else {
        // Fallback to EmailJS SDK
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: trimmedName,
            from_email: trimmedEmail,
            subject: trimmedSubject,
            message: trimmedMessage,
            name: trimmedName,
            email: trimmedEmail,
            reply_to: trimmedEmail,
          },
          { publicKey }
        );
      }

      setFormStatus({
        type: 'success',
        text: 'Thank you! Your message has been safely received. A member of our team will respond shortly.'
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Contact submission error:', err);
      const detail = (err && (err.text || err.message)) || 'Service unreachable';
      setFormStatus({
        type: 'error',
        text: `Failed to send message (${detail}). Please check your connection or reach us at contact@solzen.in.`
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      {opening && <BrandIntro onComplete={handleIntroComplete} />}

      <div className={opening ? 'site site-wait' : 'site'}>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />

        <main id="main" tabIndex={-1}>
          {/* 1. HERO SECTION */}
          <section className="hero" id="home">
            <div className="hero-noise" />
            <div className="hero-copy animate show">
              <h1>
                Making Learning Deeper.<br />
                <i>
                  Making Understanding Actionable.
                  <span className="hero-sparkles" aria-hidden="true">
                    <Sparkle className="sparkle-hero" />
                    <Sparkle className="sparkle-hero-mini" />
                  </span>
                </i>
              </h1>
              <p className="lede">
                SOLZEN is building a new approach to learning — one that moves beyond memorisation toward deeper understanding, measurable progress and real-world application.
              </p>
              <div className="hero-actions">
                <a className="button dark hero-primary-cta" href="#about" onClick={e => handleScrollToSection(e, 'about')}>
                  <span>Explore SOLZEN</span> <span className="cta-arrow" aria-hidden="true">↓</span>
                </a>
                <a className="underlink hero-secondary-link" href="#contact" onClick={e => handleScrollToSection(e, 'contact')}>
                  <span>Connect With Us</span> <Arrow />
                </a>
              </div>
            </div>

            <ExploreOrbit
              activeOrbitId={activeOrbitId}
              setActiveOrbitId={setActiveOrbitId}
              hoveredOrbitId={hoveredOrbitId}
              setHoveredOrbitId={setHoveredOrbitId}
              isInteractingOrbit={isInteractingOrbit}
              setIsInteractingOrbit={setIsInteractingOrbit}
            />

            <div className="hero-foot">
              <span>Scroll to discover</span>
              <i />
            </div>
          </section>

          {/* 2. ABOUT SOLZEN — RETHINKING HOW WE LEARN */}
          <section className="about-section shell" id="about">
            <div className="about-layout-grid">
              {/* Left Column: Interactive AI Knowledge Visualizer */}
              <div className="about-visual-column">
                <ConceptDemo />
              </div>

              {/* Right Column: Engaging Content Hierarchy & 3 Elegant Cards */}
              <div className="about-content-column">
                <div className="about-header-block">
                  <div className="about-eyebrow">
                    <Sparkle className="about-eyebrow-spark" />
                    <span>RETHINKING HOW WE LEARN</span>
                  </div>
                  <h2 className="about-main-heading">
                    From memorising information to <span className="about-gold-accent">understanding</span> ideas.
                  </h2>
                  <p className="about-supporting-text">
                    SOLZEN helps learners uncover the connections behind complex concepts, build lasting mental models, and turn knowledge into meaningful action.
                  </p>
                </div>

                {/* Three Elegant Distinct Content Cards */}
                <div className="about-cards-list">
                  {/* Card 1: The Learning Gap */}
                  <article className="about-card card-gap">
                    <div className="about-card-badge-row">
                      <div className="about-card-icon gap-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeDasharray="4 3" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <span className="about-card-step">Challenge</span>
                    </div>
                    <h3 className="about-card-title">The Learning Gap</h3>
                    <p className="about-card-desc">
                      Information is everywhere, yet understanding remains difficult. Learners often struggle to connect concepts, visualise underlying principles, and apply what they know.
                    </p>
                  </article>

                  {/* Card 2: The SOLZEN Approach */}
                  <article className="about-card card-approach highlight-card">
                    <div className="about-card-badge-row">
                      <div className="about-card-icon approach-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          <polyline points="2 17 12 22 22 17" />
                          <polyline points="2 12 12 17 22 12" />
                        </svg>
                      </div>
                      <span className="about-card-step gold-step">Architecture</span>
                    </div>
                    <h3 className="about-card-title">The SOLZEN Approach</h3>
                    <p className="about-card-desc">
                      We transform complex ideas into clear visual explanations, interconnected concepts, and intuitive learning experiences that make deeper understanding easier.
                    </p>
                  </article>

                  {/* Card 3: The Outcome */}
                  <article className="about-card card-outcome">
                    <div className="about-card-badge-row">
                      <div className="about-card-icon outcome-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <span className="about-card-step">Outcome</span>
                    </div>
                    <h3 className="about-card-title">The Outcome</h3>
                    <p className="about-card-desc">
                      Move beyond short-term memorisation toward durable understanding, stronger reasoning, and confident real-world problem-solving.
                    </p>
                  </article>
                </div>

                {/* Refined Downward CTA */}
                <div className="about-cta-row">
                  <a
                    className="button dark about-explore-cta"
                    href="#approach"
                    onClick={e => handleScrollToSection(e, 'approach')}
                  >
                    <span>Explore Our Learning Approach</span>
                    <span className="cta-arrow" aria-hidden="true">↓</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 4. LEARNING PHILOSOPHY & FRAMEWORK (PDF Section 4 & 21) */}
          <section className="approach" id="approach">
            <div className="shell">
              <div className="approach-intro animate">
                <div>
                  <p className="kicker gold">A learning rhythm</p>
                  <h2>Depth has a <i>process.</i></h2>
                </div>
                <p>
                  Our work is shaped by a simple conviction: people learn best when understanding is invited, progress is visible and application feels possible.
                </p>
              </div>
              <div className="steps">
                {steps.map(([n, title, text]) => (
                  <article className="step animate" key={title}>
                    <span>{n}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <b aria-hidden="true">↗</b>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* 5. HOW WE THINK (PDF Section 4 & 21) */}
          <section className="think shell">
            <div className="think-layout">
              <div className="animate">
                <p className="section-label">How we think</p>
                <h2>
                  Made for<br />
                  the way minds <i>move.</i>
                </h2>
                <p className="copy-intro">
                  Learning is human before it is technical. Everything we build begins with how the human mind naturally explores and connects ideas.
                </p>
              </div>
              <div className="principle-list">
                {thinking.map(([title, text]) => (
                  <div className="principle animate" key={title}>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. TECHNOLOGY × LEARNING (PDF Section 4 & 21) */}
          <section className="tech-section" id="technology">
            <div className="shell">
              <div className="tech-head">
                <div>
                  <p className="kicker">Technology × Learning</p>
                  <h2>Broad capabilities, <i>kept high-level.</i></h2>
                </div>
                <p className="tech-intro-text">
                  We explore technological frontiers strictly to serve cognitive depth. Our public research focuses on five broad pillars without disclosing proprietary implementation details.
                </p>
              </div>
              <div className="tech-grid">
                {techPillars.map(([, title, desc]) => (
                  <div className="tech-card animate" key={title}>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. TEAM SECTION (PDF Section 6 & 21) */}
          <section className="team" id="team">
            <div className="shell">
            <div className="section-head">
              <div>
                <p className="kicker">Leadership &amp; Research</p>
                <h2>The people behind <i>SOLZEN.</i></h2>
              </div>
              <a className="underlink" href="#contact">Connect with our team <Arrow /></a>
            </div>

            <div className="team-grid-cards">
              {content.team.map(m => (
                <div className="team-card animate" key={m.id || m.name}>
                  <div className="team-card-top">
                    <div className="team-avatar">
                      {m.photo ? (
                        <img src={mediaUrl(m.photo)} alt={m.name} loading="lazy" decoding="async" />
                      ) : (
                        <span aria-hidden="true">{m.initials}</span>
                      )}
                    </div>
                    <div className="team-meta">
                      <h3>{m.name}</h3>
                      <span className="team-role">{m.role}</span>
                    </div>
                  </div>
                  <p className="team-bio">{m.bio}</p>
                  <div className="team-actions">
                    <a
                      className="team-linkedin"
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} on LinkedIn`}
                    >
                      LinkedIn <Arrow />
                    </a>
                    <button
                      className="team-contact-btn"
                      onClick={() => handleContactMember(m.name)}
                    >
                      Contact Member <Arrow />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <blockquote className="animate">
              “Better learning is not a feature. It’s a philosophy.”
              <cite>— SOLZEN Core Principle</cite>
            </blockquote>
            </div>
          </section>

          {/* 8. LATEST INSIGHTS & UPDATES (PDF Section 8, 9 & 21) */}
          <section className="journal shell" id="insights">
            <div className="section-head" id="updates">
              <div>
                <p className="kicker">Notes &amp; Announcements</p>
                <h2>From our <i>journal &amp; updates.</i></h2>
              </div>
              <div className="content-tabs" role="tablist" aria-label="Journal">
                <button
                  className={activeTab === 'insights' ? 'tab-btn active' : 'tab-btn'}
                  role="tab"
                  id="tab-insights"
                  aria-selected={activeTab === 'insights'}
                  aria-controls="panel-insights"
                  onClick={() => setActiveTab('insights')}
                >
                  Insights &amp; Ideas
                </button>
                <button
                  className={activeTab === 'updates' ? 'tab-btn active' : 'tab-btn'}
                  role="tab"
                  id="tab-updates"
                  aria-selected={activeTab === 'updates'}
                  aria-controls="panel-updates"
                  onClick={() => setActiveTab('updates')}
                >
                  News &amp; Updates
                </button>
              </div>
            </div>

            <div
              id="panel-insights"
              role="tabpanel"
              aria-labelledby="tab-insights"
              className={`journal-grid ${activeTab === 'insights' ? 'tab-content-active' : 'tab-content-hidden'}`}
            >
              {content.insights.map((art, i) => (
                <a
                  href={art.link || '#contact'}
                  target={art.link ? '_blank' : undefined}
                  rel={art.link ? 'noopener noreferrer' : undefined}
                  className={`story story-${String((i % 3) + 1).padStart(2, '0')} animate show`}
                  key={art.id || art.title}
                >
                  <div className="art">
                    <i />
                  </div>
                  <p>{art.tag}{art.time && <> <b>·</b> {art.time}</>}</p>
                  <h3>{art.title}</h3>
                  <Arrow />
                </a>
              ))}
            </div>

            <div
              id="panel-updates"
              role="tabpanel"
              aria-labelledby="tab-updates"
              className={`updates-list ${activeTab === 'updates' ? 'tab-content-active' : 'tab-content-hidden'}`}
            >
              {content.updates.map(item => (
                <div className="update-item" key={item.id || item.title}>
                  <div className="update-date">{item.date}</div>
                  <div className="update-content">
                    {item.tag && <span className="update-tag">{item.tag}</span>}
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <UpdatePhotos images={item.images} title={item.title} />
                  </div>
                  <a className="underlink" href="#contact" style={{ alignSelf: 'center' }}>
                    Inquire <Arrow />
                  </a>
                </div>
              ))}
            </div>

            {/* Gallery (below the updates; managed in the admin panel, not in the menu) */}
            <Gallery items={content.gallery} />
          </section>

          {/* 9. VISION SECTION (PDF Section 4 & 21) */}
          <section className="statement">
            <div className="statement-grid">
              <span className="statement-rule" />
              <p>
                The future of learning is not about consuming more information.{' '}
                <i>It is about understanding better.</i>
              </p>
              <span className="statement-index"><Sparkle className="sparkle-statement" />SOLZEN</span>
            </div>
          </section>

          {/* 10. CONTACT SECTION (PDF Section 11 & 21) */}
          <section className="contact" id="contact">
            <div className="shell contact-wrap">
              <div>
                <p className="kicker gold">Let’s begin</p>
                <h2>Start a <i>conversation.</i></h2>
                <p className="contact-intro">
                  Whether you are exploring a partnership, have an educational or research perspective to share, or want to discuss institutional collaboration — we’d like to hear from you.
                </p>
                <div className="contact-channels">
                  <p className="contact-channels-title">What would you like to talk about?</p>
                  <div className="contact-chips">
                    {['General', 'Partnership', 'Institutional Research', 'Media', 'Career'].map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`contact-chip ${formData.subject === `${c} Inquiry` ? 'is-active' : ''}`}
                        aria-pressed={formData.subject === `${c} Inquiry`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, subject: `${c} Inquiry` }));
                          setFormStatus({ type: '', text: '' });
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="incubation-block">
                  <div className="incubation-card">
                    <img src="/nirmaan-logo.png" alt="Nirmaan, IIT Madras" width="64" height="64" />
                    <p>
                      <span className="incubation-label">Incubated at</span>
                      <strong>Nirmaan, IIT Madras</strong>
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={submit} className="contact-form-card" noValidate>
                <div className="form-field">
                  <label htmlFor="contact-name">
                    Full Name <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    disabled={formLoading}
                    autoComplete="name"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-email">
                    Email Address <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@organisation.com"
                    disabled={formLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-subject">
                    Subject <span className="req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Partnership, Institutional Research, or General Inquiry"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-message">
                    Message <span className="req" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="4"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us a little more about your context and goals..."
                    disabled={formLoading}
                  />
                </div>

                <button
                  className={`button dark contact-submit-btn ${formLoading ? 'loading' : ''}`}
                  type="submit"
                  disabled={formLoading}
                  aria-busy={formLoading}
                >
                  {formLoading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send message</span>
                      <Arrow />
                    </>
                  )}
                </button>

                {formStatus.text && (
                  <div
                    className={`form-status ${formStatus.type}`}
                    role="alert"
                    aria-live="polite"
                  >
                    <span className="status-icon" aria-hidden="true">
                      {formStatus.type === 'success' ? '✓' : '!'}
                    </span>
                    <p className="status-text">{formStatus.text}</p>
                  </div>
                )}
              </form>
            </div>
          </section>
        </main>

        {/* 11. BRAND MOTTO STRIP & FOOTER (PDF Section 7, 18 & 19) */}
        <footer>
          <div className="brand-motto-strip" aria-label="Mission: Make learning deeper, measurable and applicable. Motto: Understand. Apply. Advance.">
            <div className="motto-track" aria-hidden="true">
              {[0, 1].map(k => (
                <div className="motto-group" key={k}>
                  <span>Understand</span><Sparkle />
                  <span>Apply</span><Sparkle />
                  <span>Advance</span><Sparkle />
                  <span><b>Make learning deeper, measurable and applicable</b></span><Sparkle />
                  <span>Incubated at Nirmaan, IIT Madras</span><Sparkle />
                </div>
              ))}
            </div>
          </div>

          <div className="shell" style={{ paddingTop: '50px' }}>
            <div className="footer-main">
              <div className="footer-brand">
                <Logo />
                <p>
                  SOLZEN builds deeper, more applicable learning experiences — moving beyond memorisation toward lasting conceptual understanding.
                </p>
                <div className="footer-northstar">
                  <span>North Star</span>
                  Make difficult concepts visible, measurable and applicable.
                </div>
              </div>

              <div className="footer-col">
                <h3>Company</h3>
                <ul>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#approach">Learning Approach</a></li>
                  <li><a href="#technology">Technology Pillars</a></li>
                  <li><a href="#team">Team &amp; Research</a></li>
                  <li><a href="#updates">News &amp; Updates</a></li>
                </ul>
              </div>

              <div className="footer-col">
                <h3>Connect</h3>
                <ul>
                  <li><a href="#contact" onClick={() => handleSelectPurpose('General')}>General Inquiries</a></li>
                  <li><a href="#contact" onClick={() => handleSelectPurpose('Partnership')}>Partnerships</a></li>
                  <li><a href="#contact" onClick={() => handleSelectPurpose('Institutional Research')}>Institutions</a></li>
                  <li><a href="#contact" onClick={() => handleSelectPurpose('Career')}>Careers</a></li>
                </ul>
              </div>

              <div className="footer-col">
                <h3>Follow SOLZEN</h3>
                <SocialIcons links={content.socials} className="footer-socials" />
                <ul>
                  <li><a href="mailto:info@solzen.in">info@solzen.in</a></li>
                </ul>
                <a className="footer-address-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer" aria-label={`${ADDRESS_LINES.join(', ')} (opens Google Maps)`}>
                  <PinIcon />
                  <span>
                    <strong>SOLZEN</strong>
                    Nirmaan, Sudha and Shankar Innovation Hub, IIT Madras, Chennai
                  </span>
                </a>
              </div>
            </div>

            <div className="footer-bottom">
              <span>© 2026 SOLZEN (solzen.in). All rights reserved.</span>
              <div className="footer-meta-links">
                <button type="button" onClick={() => setActiveModal('privacy')}>Privacy Policy</button>
                <button type="button" onClick={() => setActiveModal('terms')}>Terms of Use</button>
                <button type="button" onClick={() => setActiveModal('cookies')}>Cookie Policy</button>
              </div>
            </div>
          </div>
        </footer>

        {/* Legal Modals */}
        <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />

        {adminOpen && <AdminPanel content={content} onSaved={applyContent} onClose={closeAdmin} />}
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
