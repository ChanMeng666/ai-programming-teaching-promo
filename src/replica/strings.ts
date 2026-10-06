// Every word the PRODUCT says, byte-faithful. Each entry names the product file
// it mirrors; capture/verify.mjs reads that file as text and asserts the literal
// occurs in it (whitespace-normalised, because JSX wraps lines). A string the
// product does not say is a lie about the product: fix this file, not the gate.

const s = <T extends string>(text: T, file: string) => ({ text, file });

export const STR = {
  nav: {
    tutorials: s('Tutorials', 'docusaurus.config.js'),
    blog: s('Blog', 'docusaurus.config.js'),
    board: s('Message Board', 'docusaurus.config.js'),
    capstone: s('Capstone 2026', 'docusaurus.config.js'),
    version: s('TECHNEST 2026', 'docusaurus.config.js'),
    chan: s('Chan Meng', 'docusaurus.config.js'),
    newsletter: s('Newsletter', 'docusaurus.config.js'),
  },
  hero: {
    eyebrow: s('AI Programming Education', 'src/components/Home/Hero/index.js'),
    title: s('Learn to build with AI.', 'src/components/Home/Hero/index.js'),
    sub: s('A hands-on, beginner-friendly path from your first line of code to a live project — with AI as your co-pilot the whole way.', 'src/components/Home/Hero/index.js'),
    start: s('Start Learning', 'src/components/Home/Hero/index.js'),
    blog: s('Read the Blog', 'src/components/Home/Hero/index.js'),
  },
  programs: {
    eyebrow: s('Curriculum', 'src/components/Home/Programs/index.js'),
    heading: s('Pick your programme.', 'src/components/Home/Programs/index.js'),
    badge: s('Cohort complete', 'src/components/Home/Programs/index.js'),
    technest: s('TECHNEST 2026', 'src/components/Home/Programs/index.js'),
    technestDesc: s('Our flagship 2026 programme — an eight-week, project-first path from dev-tools setup to a deployed capstone.', 'src/components/Home/Programs/index.js'),
    technestCta: s('Start the programme', 'src/components/Home/Programs/index.js'),
    explore: s('Explore', 'src/components/Home/Programs/index.js'),
    cards: [
      { title: s('Peyvand Academy 2026', 'src/components/Home/Programs/index.js'), desc: s('A focused workshop series pairing newcomers with AI tooling to ship real work fast.', 'src/components/Home/Programs/index.js') },
      { title: s('HER WAKA 2026', 'src/components/Home/Programs/index.js'), desc: s('A supportive on-ramp into tech, guiding first-time coders from idea to a working project.', 'src/components/Home/Programs/index.js') },
      { title: s('Summer 2025', 'src/components/Home/Programs/index.js'), desc: s('The Forward with Her summer curriculum — basics, personal website, and hands-on practice.', 'src/components/Home/Programs/index.js') },
      { title: s('Winter 2024', 'src/components/Home/Programs/index.js'), desc: s('The original Forward with Her archive — the complete beginner track from setup to deployment.', 'src/components/Home/Programs/index.js') },
    ],
  },
  docs: {
    programme: s('Programme', 'versioned_sidebars/version-2026-technest-sidebars.json'),
    teaching: s('Teaching Phase (Weeks 1–8)', 'versioned_sidebars/version-2026-technest-sidebars.json'),
    capstoneCat: s('Capstone (Weeks 9–12)', 'versioned_sidebars/version-2026-technest-sidebars.json'),
    objectives: s('Learning Objectives', 'versioned_docs/version-2026-technest/weeks/week-02-portfolio-deploy.mdx'),
    objectivesLead: s('By the end of this session, students should be able to:', 'versioned_docs/version-2026-technest/weeks/week-02-portfolio-deploy.mdx'),
    objective: s('Objective', 'versioned_docs/version-2026-technest/capstone/capstone-spec.mdx'),
  },
  chat: {
    header: s('AI Assistant', 'src/components/ChatWidget/ChatBox.js'),
    welcomeTitle: s("Hi! I'm your AI Assistant", 'src/components/ChatWidget/ChatBox.js'),
    welcomeText: s('Feel free to ask me anything about AI programming!', 'src/components/ChatWidget/ChatBox.js'),
    placeholder: s('Type your question...', 'src/components/ChatWidget/ChatInput.js'),
  },
  showcase: {
    eyebrow: s('Live Showcase', 'src/pages/capstone-showcase.js'),
    title: s('TECHNEST 2026 Capstone Showcase', 'src/pages/capstone-showcase.js'),
    winners: s('Award Winners', 'src/pages/capstone-showcase.js'),
    team: s('Team', 'src/pages/capstone-showcase.js'),
    visit: s('Visit site', 'src/pages/capstone-showcase.js'),
    github: s('GitHub', 'src/pages/capstone-showcase.js'),
    demo: s('Watch demo', 'src/pages/capstone-showcase.js'),
    certificate: s('Certificate', 'src/pages/capstone-showcase.js'),
    ranks: [s('1st', 'src/pages/capstone-showcase.js'), s('2nd', 'src/pages/capstone-showcase.js'), s('3rd', 'src/pages/capstone-showcase.js')],
  },
  cert: {
    awardedTo: s('Awarded to', 'src/components/Certificate/index.js'),
    forWord: s('for', 'src/components/Certificate/index.js'),
    linkedin: s('Add to LinkedIn profile', 'src/components/Certificate/index.js'),
    download: s('Download certificate', 'src/components/Certificate/index.js'),
    view: s('View the project', 'src/components/Certificate/index.js'),
    details: s('Credential details', 'src/components/Certificate/index.js'),
    kCredential: s('Credential', 'src/components/Certificate/index.js'),
    kAwarded: s('Awarded to', 'src/components/Certificate/index.js'),
    kIssuedBy: s('Issued by', 'src/components/Certificate/index.js'),
    kDate: s('Date of issue', 'src/components/Certificate/index.js'),
    kId: s('Credential ID', 'src/components/Certificate/index.js'),
    kExpires: s('Expires', 'src/components/Certificate/index.js'),
    never: s('Does not expire', 'src/components/Certificate/index.js'),
    instructorSuffix: s(', instructor', 'src/components/Certificate/index.js'),
  },
  instructor: {
    eyebrow: s('Your instructor', 'src/components/Home/Instructor/index.js'),
    heading: s('Taught by someone who still ships.', 'src/components/Home/Instructor/index.js'),
    body: s('Chan Meng builds production AI systems for paying customers, then teaches the same methods here. She has run five cohorts since 2024 and keeps every lesson free and in both languages — because the material that got her started was free too.', 'src/components/Home/Instructor/index.js'),
    name: s('Chan Meng', 'src/components/Home/Instructor/index.js'),
    role: s('AI Agent Architect &amp; Full-stack Engineer &middot; Auckland, NZ', 'src/components/Home/Instructor/index.js'),
    chips: [
      s('5 cohorts since 2024', 'src/components/Home/Instructor/index.js'),
      s('153 lessons &times; 2 languages', 'src/components/Home/Instructor/index.js'),
      s('Apache-2.0 open source', 'src/components/Home/Instructor/index.js'),
    ],
    why: s('Why this is free', 'src/components/Home/Instructor/index.js'),
    portfolio: s('Her work and writing', 'src/components/Home/Instructor/index.js'),
  },
} as const;

/** The product writes a few entities in JSX; the browser shows the character. */
export const shown = (text: string) => text.replace(/&amp;/g, '&').replace(/&middot;/g, '·').replace(/&times;/g, '×');
