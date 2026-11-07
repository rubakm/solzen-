/**
 * Default website content.
 * The site shows these until the backend returns saved content from the admin panel
 * (and falls back to them if the backend can't be reached).
 */

export const DEFAULT_CONTENT = {
  team: [
    {
      id: 'rubak',
      initials: 'RM',
      name: 'Rubak M',
      role: 'Founder & CEO',
      bio: 'Leads SOLZEN’s direction, school partnerships and product validation, working directly with schools in Chennai.',
      linkedin: 'https://linkedin.com/company/solzen',
      photo: ''
    },
    {
      id: 'padma',
      initials: 'PG',
      name: 'Padma Ganesh P',
      role: 'Founder & Product Lead',
      bio: 'Drives strategic product development, user experience design, and core educational workflows across interactive learning platforms.',
      linkedin: 'https://www.linkedin.com/in/padma-ganesh-p',
      photo: ''
    },
    {
      id: 'vignesh',
      initials: 'VS',
      name: 'Vignesh R S',
      role: 'Technology Lead',
      bio: 'Directs interactive visual systems, frontend architecture, and cognitive modelling technologies to make complex concepts intuitive.',
      linkedin: 'https://linkedin.com/company/solzen',
      photo: ''
    }
  ],

  insights: [
    {
      id: 'understand',
      tag: 'Learning Science',
      time: '5 min read',
      title: 'What does it mean to truly understand something?',
      subtitle: 'Exploring the cognitive transition from rote memorisation to intuitive mastery.',
      link: ''
    },
    {
      id: 'right-answer',
      tag: 'Perspective',
      time: '4 min read',
      title: 'Beyond the myth of the “right answer”',
      subtitle: 'Why conceptual reasoning and error analysis build more resilient problem-solvers.',
      link: ''
    },
    {
      id: 'invisible',
      tag: 'Research Notes',
      time: '6 min read',
      title: 'Making invisible cognitive connections visible',
      subtitle: 'How multi-modal visual scaffolding assists learners through complex threshold concepts.',
      link: ''
    }
  ],

  updates: [
    {
      id: 'nirmaan',
      date: 'March 2026',
      tag: 'Ecosystem',
      title: 'Nirmaan Pre-Incubation Engagement at IIT Madras',
      desc: 'SOLZEN is supported within the Nirmaan ecosystem at IIT Madras, collaborating on foundational validation and research-oriented development.',
      images: []
    },
    {
      id: 'pilot',
      date: 'February 2026',
      tag: 'Research',
      title: 'Formative Diagnostic Pedagogy Pilot',
      desc: 'Commenced structured pedagogical observations focusing on student conceptual bottlenecks across technical disciplines.',
      images: []
    },
    {
      id: 'framework',
      date: 'January 2026',
      tag: 'Milestone',
      title: 'Four-Stage Learning Pipeline Validation',
      desc: 'Formalised the Understand → Assess → Reinforce → Apply framework for structured interactive curriculum deployment.',
      images: []
    }
  ],

  // Photos shown in the gallery below the updates (added from the admin panel)
  gallery: [],

  socials: [
    { id: 'linkedin', platform: 'linkedin', url: 'https://linkedin.com/company/solzen' },
    { id: 'x', platform: 'x', url: 'https://x.com/solzen_in' },
    { id: 'email', platform: 'email', url: 'mailto:info@solzen.in' }
  ]
};

export const SOCIAL_PLATFORMS = {
  linkedin: {
    label: 'LinkedIn',
    icon: 'M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-5.03c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21h-4V9.75Z'
  },
  x: {
    label: 'X (Twitter)',
    icon: 'M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z'
  },
  instagram: {
    label: 'Instagram',
    icon: 'M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16Zm0 4.78a5.02 5.02 0 1 0 0 10.04 5.02 5.02 0 0 0 0-10.04Zm0 8.27a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5Zm5.22-9.65a1.17 1.17 0 1 0 0 2.34 1.17 1.17 0 0 0 0-2.34Z'
  },
  youtube: {
    label: 'YouTube',
    icon: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z'
  },
  facebook: {
    label: 'Facebook',
    icon: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z'
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1 14.6-11.67 9.37 9.37 0 0 1 2.77 6.67c0 5.21-4.24 9.44-9.44 9.44ZM20.07 3.92A11.28 11.28 0 0 0 12.04.6C5.79.6.7 5.69.7 11.94c0 2 .52 3.95 1.52 5.66L.6 23.4l5.95-1.56a11.3 11.3 0 0 0 5.48 1.4h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.31-8.02Z'
  },
  email: {
    label: 'Email',
    icon: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-8 5.6-8-5.6ZM5.6 7 12 11.5 18.4 7H5.6Z'
  }
};

// Backend for content + admin. While developing (npm run dev) this is the local backend
// started by start-solzen.bat; the production build uses VITE_API_URL.
export function getApiBase() {
  const url = import.meta.env.DEV
    ? import.meta.env.VITE_DEV_API_URL || 'http://localhost:5000'
    : import.meta.env.VITE_API_URL || '';
  return url.replace(/\/$/, '');
}

// Uploaded photos are stored on the backend (/uploads/...). Other paths (e.g. /team/x.jpg in /public) are used as-is.
export function mediaUrl(src) {
  if (!src) return '';
  if (src.startsWith('/uploads/')) return `${getApiBase()}${src}`;
  return src;
}
