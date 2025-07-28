interface Experience {
  date: string;
  position: string;
  company: string;
  location: string;
  description: string;
  url: string;
  highlights?: string[];
}

interface Certification {
  date: string;
  name: string;
  issuer: string;
  url: string;
  credentialId?: string;
}

export const personalInfo = {
  name: "Kazuma Ohashi",
  email: "kazuma0129.work@gmail.com",
  phone: "+81 90 2988 2901",
  location: "Tokyo, Japan",
  summary: "Software engineer with strong expertise in frontend and backend development, specializing in JavaScript, TypeScript, and Node.js. Proven track record in developing and maintaining high-performance applications and tools. Experienced in working with cross-functional teams in both Japanese and English environments. Demonstrated leadership in frontend development for LIFF SDK, with a commitment to contributing to open-source software."
} as const;

export const links = [
  {
    name: "GitHub",
    url: "https://github.com/kazuma0129",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/kazuma0129",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/kazuma_0129",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/kazuma0129/",
  },
] as const;

export const openSourceContributions = [
  {
    title: "RFC to Vue.js: Trusted Types API",
    description: "Proposed the introduction of the Trusted Types API to enhance security",
    url: "https://github.com/vuejs/rfcs/discussions/614",
    type: "RFC",
  },
  {
    title: "Vue.js ESLint Plugin Enhancement",
    description: "Added option to specify tags to ignore in vue/no-deprecated-slot-attribute rule",
    url: "https://github.com/vuejs/eslint-plugin-vue/pull/2314",
    type: "Pull Request",
  },
  {
    title: "sendgrid-type-gen",
    description: "A tool enhancing email template integration for TypeScript projects",
    url: "https://www.npmjs.com/package/sendgrid-type-gen",
    type: "NPM Package",
  },
  {
    title: "LIFF CLI",
    description: "Official CLI tool for LINE Front-end Framework development",
    url: "https://www.npmjs.com/package/@line/liff-cli",
    type: "NPM Package",
  },
] as const;

export const achievements = [
  {
    date: "Oct 2024",
    title: "Vue Fes 2024 Speaker",
    description: "Official speaker at Vue Fes 2024, Japan's largest Vue.js conference",
    url: "https://vuefes.jp/2024/en/sessions/kazuma-ohashi",
  },
  {
    date: "Dec 2024",
    title: "UIT INSIDE Podcast ep.169",
    description: "Discussed Trusted Types API and Vue.js RFC contribution",
    url: "https://uit-inside.linecorp.com/episode/169",
  },
  {
    date: "Aug 2024",
    title: "UIT INSIDE Podcast ep.155",
    description: "Vue 3 + Vite Migration Discussion - Strategic migration plan for secure login infrastructure",
    url: "https://uit-inside.linecorp.com/episode/155",
  },
  {
    date: "Aug 2022",
    title: "UIT INSIDE Podcast ep.129",
    description: "Clean up unnecessary exports! The CLI tool ts-prune that everyone wanted",
    url: "https://uit-inside.linecorp.com/episode/129",
  },
  {
    date: "Dec 2020",
    title: "Technical Speaker - CyberAgent × FUN Alumni Event",
    description: "Presented on modern web development technologies",
    url: "https://connpass.com/event/182984/",
  },
  {
    date: "Oct 2019",
    title: "Technical Workshop Facilitator - JAWS-SG Hakodate",
    description: "Led hands-on Alexa development workshop for beginners",
    url: "https://jaws-sg.connpass.com/event/146666/",
  },
] as const;

export const experience: Experience[] = [
  {
    date: "May 2022 - Present",
    position: "Software Engineer",
    company: "LINE Corporation / LY Corporation",
    location: "Tokyo, Japan",
    description: "Led frontend development for LIFF SDK. Designed and implemented new APIs, established OSS maintenance policies, and contributed to open-source projects. Worked in bilingual environment with technical documentation in English.",
    url: "https://www.lycorp.co.jp/en/",
    highlights: [
      "Led frontend development for LIFF SDK",
      "Implemented and open-sourced LIFF CLI tool",
      "Designed LIFF Plugin for auto-filling user information",
      "Migrated LINE Login frontend from Vue.js v2 to v3",
      "Introduced SAST tools and security improvements",
    ]
  },
  {
    date: "Apr 2023 - Jul 2023",
    position: "Software Engineer (Contract)",
    company: "PLUGO Inc.",
    location: "Tokyo, Japan",
    description: "Backend development for electric vehicle charging service. Developed APIs, created documentation, and built tools for improving developer experience with TypeScript and SendGrid integration.",
    url: "https://plugo.co.jp/en/",
    highlights: [
      "Developed notification system for EV charging completion",
      "Created and deployed sendgrid-type-gen tool for the team",
      "Built APIs and documentation for service features"
    ]
  },
  {
    date: "Apr 2020 - Apr 2022",
    position: "Software Engineer",
    company: "CyberAgent, Inc.",
    location: "Tokyo, Japan",
    description: "Backend development for fensi fan economy platform and EXILE/LDH mobile services. Worked on architecture design, performance tuning, and security improvements across multiple projects.",
    url: "https://www.cyberagent.co.jp/en/",
    highlights: [
      "Designed and developed live streaming functionality using AWS Chime",
      "Implemented authentication and EC system features",
      "Performed vulnerability remediation and infrastructure maintenance",
      "Collaborated with cross-functional teams on native applications"
    ]
  },
];

export const certifications: Certification[] = [
  {
    date: "Apr 2023",
    name: "Registered Information Security Specialist (情報処理安全確保支援士)",
    issuer: "Information-technology Promotion Agency (IPA)",
    credentialId: "025850",
    url: "https://www.ipa.go.jp/shiken/kubun/sc.html",
  },
  {
    date: "Jul 2022",
    name: "Information Security Management Examination",
    issuer: "Information-technology Promotion Agency (IPA)",
    url: "https://www.ipa.go.jp/shiken/kubun/sg.html",
  },
  {
    date: "Dec 2018",
    name: "Applied Information Technology Engineer Examination",
    issuer: "Information-technology Promotion Agency (IPA)",
    url: "https://www.ipa.go.jp/shiken/kubun/ap.html",
  },
  {
    date: "Nov 2017",
    name: "Fundamental Information Technology Engineer Examination",
    issuer: "Information-technology Promotion Agency (IPA)",
    url: "https://www.ipa.go.jp/shiken/kubun/fe.html",
  },
  {
    date: "Dec 2014",
    name: "Information Technology Passport Examination",
    issuer: "Information-technology Promotion Agency (IPA)",
    url: "https://www.ipa.go.jp/shiken/kubun/ip.html",
  },
];

export const publications = [
  {
    title: "Distributed Locking in Production Systems",
    description: "Technical blog post on implementing distributed locks in enterprise applications",
    url: "https://cam-inc.co.jp/p/techblog/461029949445243945",
    type: "Technical Blog",
  },
  {
    title: "AWS Training Program: Insights and Learnings",
    description: "Reflection on AWS cloud infrastructure training and best practices",
    url: "https://cam-inc.co.jp/p/techblog/432843405245023035",
    type: "Technical Blog",
  },
  {
    title: "Resolving Firestore Circular Structure JSON Errors",
    description: "Technical solution for Firebase Firestore serialization issues",
    url: "https://qiita.com/kazuma0129/items/fa0a67ebd54034339466",
    type: "Technical Article",
  },
] as const;

export const education = [
  {
    degree: "Bachelor of Systems Information Science",
    institution: "Future University Hakodate",
    location: "Hakodate, Hokkaido, Japan",
    date: "Apr 2016 - Mar 2020",
    url: "https://www.fun.ac.jp/en",
  },
] as const;

export const skills = [
  {
    category: "Programming Languages",
    items: ["JavaScript", "TypeScript", "HTML5", "CSS"],
  },
  {
    category: "Frontend Technologies",
    items: ["React.js", "Vue.js", "Next.js"],
  },
  {
    category: "Backend Technologies",
    items: ["Node.js", "Express.js", "Redis"],
  },
  {
    category: "Databases",
    items: ["MongoDB", "MySQL"],
  },
  {
    category: "DevOps & Tools",
    items: ["Git", "GitHub", "GitLab", "Kubernetes", "Docker", "Terraform", "SonarQube"],
  },
  {
    category: "Cloud Platforms",
    items: ["AWS", "GCP"],
  },
  {
    category: "Testing & QA",
    items: ["Unit Testing", "Performance Tuning", "SAST"],
  },
  {
    category: "Other",
    items: ["REST APIs", "Microservices Architecture", "Burp Suite"],
  },
] as const;

export const languages = [
  {
    name: "Japanese",
    level: "Native proficiency",
  },
  {
    name: "English",
    level: "Conversational proficiency (TOEIC 620)",
  },
] as const;
