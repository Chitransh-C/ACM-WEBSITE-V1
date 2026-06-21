import React, { useEffect, useRef, useCallback, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';

// ─── Section Data ─────────────────────────────────────────────────────────────

interface Section {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  highlights: { label: string; value: string }[];
  items: string[];
  btnText: string;
  btnHref?: string;
}

const SECTIONS: Record<string, Section> = {
  about: {
    id: 'about',
    badge: '◆ OUR CHAPTER',
    title: '01 / ACM MITS STUDENT CHAPTER',
    subtitle: 'ADVANCING COMPUTING AS A SCIENCE & PROFESSION',
    desc: 'The MITS ACM Student Chapter is a vibrant, award-winning community of developers, researchers, and tech innovators based at Madhav Institute of Technology & Science, Gwalior. We are an officially recognized chapter of the global Association for Computing Machinery — the world\'s largest educational and scientific computing society.',
    highlights: [
      { label: 'Founded', value: '2018' },
      { label: 'Active Members', value: '120+' },
      { label: 'Domain', value: 'CS & IT' },
      { label: 'Institution', value: 'MITS Gwalior' },
    ],
    items: [
      'Nurture student interest in competitive coding, software architecture, and algorithm design.',
      'Bridge the industry-academia gap through expert-led masterclasses and guest lectures.',
      'Foster collaborative learning via open-source projects, hackathons, and peer programming.',
      'Connect members to global ACM resources, research publications, and networking opportunities.',
      'Support interdisciplinary innovation through cross-domain technical challenges.',
    ],
    btnText: 'Read Our Chapter Charter',
    btnHref: '#',
  },
  services: {
    id: 'services',
    badge: '◆ TECH WINGS',
    title: '02 / SPECIAL INTEREST GROUPS',
    subtitle: 'SPECIALIZED TEAMS DRIVING DEEP TECHNICAL GROWTH',
    desc: 'Our chapter operates through three specialized Special Interest Groups (SIGs), each focused on a distinct domain of modern computing. Members can join one or more SIGs based on their interests, participate in domain-specific projects, and climb the technical ladder with guidance from senior members and mentors.',
    highlights: [
      { label: 'SIG-CODE', value: 'Algorithms & CP' },
      { label: 'SIG-AI', value: 'ML & Vision' },
      { label: 'SIG-DEV', value: 'Full Stack & Cloud' },
      { label: 'Projects', value: '25+ Live' },
    ],
    items: [
      'SIG-CODE: Weekly competitive programming contests, CP rating challenges, and ICPC prep sessions.',
      'SIG-AI: Hands-on ML model training, dataset curation workshops, and paper reading clubs.',
      'SIG-DEV: Full-stack development sprints, open-source contributions, and DevOps bootcamps.',
      'Cross-SIG Collaborations: Annual multi-domain product builds involving all three wings.',
      'Mentorship: Regular code reviews, one-on-one sessions with senior leads and alumni.',
    ],
    btnText: 'Apply to a SIG Wing',
    btnHref: '#',
  },
  events: {
    id: 'events',
    badge: '◆ EVENTS & ACTIVITIES',
    title: '03 / CHAPTER ACTIVITY CALENDAR',
    subtitle: 'INNOVATING THROUGH COMPETITIONS, BOOTCAMPS & MEETUPS',
    desc: 'Our event calendar runs throughout the academic year with flagship events, mini-hackathons, workshops, and monthly tech talks. Every event is designed to push participants beyond textbooks and into real-world problem-solving scenarios.',
    highlights: [
      { label: 'Flagship', value: 'MITS Hacks' },
      { label: 'Duration', value: '36 Hours' },
      { label: 'Participants', value: '500+' },
      { label: 'Prize Pool', value: '₹1,50,000' },
    ],
    items: [
      'MITS Hacks 2026: Gwalior\'s premier 36-hour hackathon — open to all engineering students nationally.',
      'ACM Code-a-Thon: Bi-weekly competitive programming contests with global ICPC-style judging.',
      'Peer-2-Peer Bootcamps: Weekend intensive sessions mentored by senior chapter members.',
      'Tech Talk Series: Monthly guest lectures from industry professionals at top MNCs.',
      'Open Mic Devs: Informal monthly lightning-talk sessions where members share projects & ideas.',
    ],
    btnText: 'Register for MITS Hacks 2026',
    btnHref: '#',
  },
  team: {
    id: 'team',
    badge: '◆ LEADERSHIP COUNCIL',
    title: '04 / EXECUTIVE COMMITTEE 2025–26',
    subtitle: 'MEET THE MINDS LEADING THE CHARGE',
    desc: 'Our executive committee comprises elected student officers and appointed domain leads, overseen by distinguished faculty sponsors. Together they manage chapter operations, curate events, oversee SIG activities, and maintain ACM international standards.',
    highlights: [
      { label: 'Faculty Sponsors', value: '3 Professors' },
      { label: 'Officers', value: '12 Students' },
      { label: 'Core Team', value: '30+ Members' },
      { label: 'Term', value: '2025–2026' },
    ],
    items: [
      'Dr. Sanjeev Khanna — Faculty Sponsor & Advisory Chair, Dept. of CS',
      'Chitransh — Student Chairperson & Tech Lead',
      'Tanya Sharma — Student Vice-Chairperson & Events Head',
      'Aman Verma — Competitive Programming Coordinator (SIG-CODE)',
      'Priya Jain — AI/ML Research Lead (SIG-AI)',
      'Rohan Dixit — Full Stack & DevOps Lead (SIG-DEV)',
    ],
    btnText: 'View Full Committee Roster',
    btnHref: '#',
  },
  contact: {
    id: 'contact',
    badge: '◆ MEMBERSHIP DRIVE',
    title: '05 / GET INVOLVED WITH ACM MITS',
    subtitle: 'JOIN THE WORLD\'S LARGEST COMPUTING COMMUNITY',
    desc: 'Whether you\'re a first-year student curious about coding, or a final-year researcher looking to publish, ACM MITS has a place for you. Become an official member of the global ACM network, get access to the ACM Digital Library, and be part of a community of 100,000+ computing professionals worldwide.',
    highlights: [
      { label: 'Global Members', value: '100,000+' },
      { label: 'Fee', value: '₹499 / Year' },
      { label: 'Benefits', value: 'ACM DL Access' },
      { label: 'Status', value: 'Open Enrollment' },
    ],
    items: [
      '1. Fill out the MITS ACM Chapter Membership form on the official portal.',
      '2. Pay the annual membership fee and receive your official ACM Global Member ID.',
      '3. Join our Discord server and GitHub organization for immediate project access.',
      '4. Attend the next onboarding session and meet your wing mentors.',
      '5. Start contributing — every idea, code commit, and talk matters.',
    ],
    btnText: '→ Register on the Online Portal',
    btnHref: '#',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContentModalProps {
  activeSection: string | null;
  onScrolledThrough: (direction: 'forward' | 'backward') => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ContentModal: React.FC<ContentModalProps> = ({
  activeSection,
  onScrolledThrough,
}) => {
  const backdropRef  = useRef<HTMLDivElement>(null);
  const modalRef     = useRef<HTMLDivElement>(null);
  // Lenis wrapper = scrollable viewport div (overflow:hidden, fixed height)
  const wrapperRef   = useRef<HTMLDivElement>(null);
  // Lenis content = tall inner div
  const innerRef     = useRef<HTMLDivElement>(null);

  const lenisRef     = useRef<Lenis | null>(null);
  const rafRef       = useRef<number>(0);
  const closingRef   = useRef(false);
  // keep track of which section we're rendering during close animation
  const [renderedSection, setRenderedSection] = useState<string | null>(null);

  // ── Open/close driven by activeSection ──────────────────────────────────
  useEffect(() => {
    if (activeSection) {
      // New section opening
      setRenderedSection(activeSection);
      closingRef.current = false;
    } else if (renderedSection) {
      // Section closed externally — animate out
      closingRef.current = true;
      // animate-out then clear rendered section
      if (backdropRef.current && modalRef.current) {
        gsap.to(modalRef.current, {
          scale: 0.06,
          opacity: 0,
          duration: 0.28,
          ease: 'power2.in',
        });
        gsap.to(backdropRef.current, {
          opacity: 0,
          duration: 0.32,
          ease: 'power2.in',
          onComplete: () => {
            setRenderedSection(null);
            closingRef.current = false;
          },
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // ── Animate open whenever renderedSection changes to a new value ─────────
  useEffect(() => {
    if (!renderedSection || !backdropRef.current || !modalRef.current) return;

    // Reset scroll
    if (wrapperRef.current) wrapperRef.current.scrollTop = 0;
    if (lenisRef.current)   lenisRef.current.scrollTo(0, { immediate: true });

    // Kill any running tweens on these elements
    gsap.killTweensOf([backdropRef.current, modalRef.current]);

    // Backdrop fade in
    gsap.fromTo(backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    // Modal: tiny seed → full size
    gsap.fromTo(modalRef.current,
      { scale: 0.04, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)', delay: 0.05 }
    );
  }, [renderedSection]);

  // ── Lenis setup — one instance per renderedSection ───────────────────────
  useEffect(() => {
    if (!renderedSection || !wrapperRef.current || !innerRef.current) return;

    const lenis = new Lenis({
      wrapper:       wrapperRef.current,
      content:       innerRef.current,
      eventsTarget:  wrapperRef.current,
      duration:      1.6,
      easing:        (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:   'vertical',
      smoothWheel:   true,
      syncTouch:     true,
      overscroll:    false,
      wheelMultiplier: 1.2,
    });

    lenisRef.current = lenis;

    // Detect overscroll at edges using virtual-scroll data
    // (Lenis uses CSS transforms, so scrollTop is always 0)
    lenis.on('virtual-scroll', ({ deltaY }) => {
      if (closingRef.current) return;
      const atTop    = lenis.scroll <= 0;
      const atBottom = lenis.scroll >= lenis.limit - 1;

      if (deltaY < 0 && atTop) {
        triggerCloseRef.current('backward');
      } else if (deltaY > 0 && atBottom) {
        triggerCloseRef.current('forward');
      }
    });

    const tick = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderedSection]);

  // triggerClose exposed via ref so the Lenis virtual-scroll callback (which captures
  // a stale closure) can always call the latest version.
  const triggerCloseRef = useRef<(direction: 'forward' | 'backward') => void>(() => {});

  const triggerClose = useCallback((direction: 'forward' | 'backward') => {
    if (closingRef.current) return;
    closingRef.current = true;

    if (backdropRef.current && modalRef.current) {
      gsap.to(modalRef.current, {
        scale: 0.06, opacity: 0, duration: 0.28, ease: 'power2.in',
      });
      gsap.to(backdropRef.current, {
        opacity: 0, duration: 0.32, ease: 'power2.in',
        onComplete: () => {
          setRenderedSection(null);
          onScrolledThrough(direction);
          closingRef.current = false;
        },
      });
    } else {
      setRenderedSection(null);
      onScrolledThrough(direction);
      closingRef.current = false;
    }
  }, [onScrolledThrough]);

  // Keep ref in sync
  useEffect(() => { triggerCloseRef.current = triggerClose; }, [triggerClose]);

  // ── Nothing to render ────────────────────────────────────────────────────
  if (!renderedSection) return null;

  const section = SECTIONS[renderedSection];
  if (!section) return null;

  return (
    /* ── Backdrop ── */
    <div
      ref={backdropRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(4, 6, 18, 0.82)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        opacity: 0,
        pointerEvents: 'auto',
      }}
      /* clicking the dark backdrop also closes forward */
      onClick={(e) => { if (e.target === e.currentTarget) triggerClose('forward'); }}
      /* prevent wheel events from bubbling to the window-level scene scroll handler */
      onWheel={(e) => e.stopPropagation()}
    >
      {/* ── Modal shell ── */}
      <div
        ref={modalRef}
        style={{
          position: 'relative',
          width: 'min(820px, 93vw)',
          height: 'min(580px, 86vh)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '18px',
          border: '1px solid rgba(0,229,255,0.16)',
          background: 'linear-gradient(160deg, rgba(10,16,30,0.99) 0%, rgba(4,6,18,1) 100%)',
          boxShadow: '0 0 100px rgba(0,229,255,0.10), 0 60px 160px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          opacity: 0,
          transformOrigin: 'center center',
        }}
      >
        {/* ── Corner glows ── */}
        <div style={{ position:'absolute', top:'-60px', left:'-60px', width:'200px', height:'200px',
          background:'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)',
          pointerEvents:'none', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:'200px', height:'200px',
          background:'radial-gradient(circle, rgba(77,124,254,0.07) 0%, transparent 70%)',
          pointerEvents:'none', borderRadius:'50%' }} />

        {/* ── Scan-line decorative overlay ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.012) 3px, rgba(0,229,255,0.012) 4px)',
        }} />

        {/* ── HEADER ── */}
        <div style={{
          flexShrink: 0, position: 'relative', zIndex: 2,
          padding: '20px 28px 16px',
          borderBottom: '1px solid rgba(0,229,255,0.09)',
          background: 'rgba(0,229,255,0.03)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
        }}>
          <div>
            {/* Badge */}
            <span style={{
              display: 'inline-block', fontFamily: 'monospace', fontSize: '9px',
              color: '#00e5ff', background: 'rgba(0,229,255,0.08)',
              border: '1px solid rgba(0,229,255,0.18)', padding: '2px 10px',
              borderRadius: '4px', letterSpacing: '2.5px', marginBottom: '10px',
            }}>
              {section.badge}
            </span>

            {/* Title */}
            <h2 style={{
              fontFamily: "'Outfit','Inter',sans-serif", fontSize: '21px',
              fontWeight: 800, color: '#f0f6ff', letterSpacing: '-0.3px', margin: '0 0 5px',
            }}>
              {section.title}
            </h2>

            {/* Subtitle */}
            <div style={{
              fontFamily: 'monospace', fontSize: '9px', color: '#00e5ff',
              letterSpacing: '2px', opacity: 0.6,
            }}>
              {section.subtitle}
            </div>
          </div>

          {/* Close button */}
          <button
            aria-label="Close panel"
            onClick={() => triggerClose('forward')}
            style={{
              flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%',
              border: '1px solid rgba(0,229,255,0.22)', background: 'rgba(0,229,255,0.05)',
              color: '#00e5ff', fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,255,0.16)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,255,0.05)'; }}
          >
            ✕
          </button>
        </div>

        {/* ── SCROLL VIEWPORT (Lenis wrapper) ── */}
        <div
          ref={wrapperRef}
          style={{
            flex: 1,
            overflow: 'hidden',   /* Lenis requires overflow:hidden on the wrapper */
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* ── LENIS INNER CONTENT ── */}
          <div
            ref={innerRef}
            style={{ padding: '28px 28px 40px' }}
          >
            {/* Description */}
            <p style={{
              color: '#8fa3c0', fontSize: '14px', lineHeight: '1.78',
              marginBottom: '26px',
              borderLeft: '2px solid rgba(0,229,255,0.28)', paddingLeft: '16px',
            }}>
              {section.desc}
            </p>

            {/* Highlights grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px', marginBottom: '28px',
            }}>
              {section.highlights.map((h) => (
                <div key={h.label} style={{
                  padding: '14px 10px', borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.09)',
                }}>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '17px', fontWeight: 700,
                    color: '#00e5ff', marginBottom: '5px',
                  }}>{h.value}</div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '8px', color: '#3d5270',
                    textTransform: 'uppercase', letterSpacing: '1.5px',
                  }}>{h.label}</div>
                </div>
              ))}
            </div>

            {/* Section label */}
            <div style={{
              fontFamily: 'monospace', fontSize: '9px', color: '#2a3f5a',
              textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '14px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span>Key Details</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,229,255,0.07)' }} />
            </div>

            {/* Bullet list */}
            <ul style={{ listStyle: 'none', margin: '0 0 32px', padding: 0 }}>
              {section.items.map((item, idx) => (
                <li key={idx} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  color: '#7e96b8', fontSize: '13px', lineHeight: '1.65',
                  marginBottom: '10px', padding: '11px 14px', borderRadius: '8px',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.018)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.025)',
                }}>
                  <span style={{ color: '#00e5ff', flexShrink: 0, marginTop: '2px' }}>▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={section.btnHref || '#'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '15px 24px',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.11) 0%, rgba(77,124,254,0.11) 100%)',
                border: '1px solid rgba(0,229,255,0.28)', borderRadius: '10px',
                color: '#ffffff', fontFamily: "'Outfit','Inter',sans-serif",
                fontSize: '13px', fontWeight: 700, letterSpacing: '1.2px',
                textTransform: 'uppercase', textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.25s ease', boxSizing: 'border-box',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = 'linear-gradient(135deg, rgba(0,229,255,0.22) 0%, rgba(77,124,254,0.22) 100%)';
                el.style.boxShadow  = '0 0 24px rgba(0,229,255,0.20)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = 'linear-gradient(135deg, rgba(0,229,255,0.11) 0%, rgba(77,124,254,0.11) 100%)';
                el.style.boxShadow  = 'none';
              }}
            >
              {section.btnText}
            </a>

            {/* Hint */}
            <div style={{
              textAlign: 'center', fontFamily: 'monospace', fontSize: '9px',
              color: '#1e3050', marginTop: '22px', letterSpacing: '2px',
            }}>
              ↕ SCROLL TO READ  ·  SCROLL PAST END TO CONTINUE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModal;
