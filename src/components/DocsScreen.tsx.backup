import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { BackIcon, MenuIcon } from './Icons';

interface DocsScreenProps {
    isTocOpen: boolean;
    setIsTocOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}


interface Section {
  id: string;
  level: 1 | 2 | 3;
  titleKey: string;
  content: React.ReactNode;
}

// Data extracted and converted from the provided HTML
const DOCS_DATA: Section[] = [
  {
    id: 'overview', level: 1, titleKey: 'docs.overview.title', content: <>
      <p>In the era of intelligent education, AI has been continuously expanding the depth and breadth of educational governance. UNESCO, as a key advocate for global education and knowledge sharing, has been actively promoting international cooperation, aiming to foster a future of education that is fairer, more inclusive, and more sustainable.</p>
      <p>Confronting the core difficulties of imprecise policy document retrieval, cross-policy comparison and evaluation, and challenges in dynamic policy trend forecasting, the Education Policy and Planning AI Agents (EduPX) focuses on assisting educational decision-making, planning, implementation, and the optimization of education governance. It provides policy developers, decision-makers, as well as educational and research institutions and international education organizations with scientific policy support and strategic insights.</p>
      <p>Looking ahead, EduPX will further empower educational decision-making, planning, implementation, and the optimization of education governance via AI technology. It also drives fairness and sustainability in global education systems through scientific and efficient approaches.</p>
    </>
  },
  {
    id: 'applications', level: 2, titleKey: 'docs.applications.title', content: <>
      <p>Currently, EduPX supports five primary application scenarios:</p>
      <p>EduPX is an GenAI-powered platform designed to enhance the efficiency, precision, and foresight of education policy-making. It provides intelligent support across five core application scenarios, each leveraging large language models and domain-specific agents to assist policy developers and decision-makers.</p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>1. Precise Policy Retrieval</strong>
          <p>EduPX helps users quickly locate relevant education policy documents from a vast, multi-source database using semantic search and intent-aware matching.</p>
        </li>
        <li><strong>2. Policy Knowledge Q&A</strong>
          <p>Through natural language interaction, EduPX agents provide instant, authoritative answers to complex policy-related queries, grounded in verified document sources.</p>
        </li>
        <li><strong>3. Cross-National Policy Comparison</strong>
          <p>EduPX enables structured comparison of policies across countries or regions, highlighting similarities, differences, and contextual insights for informed benchmarking.</p>
        </li>
        <li><strong>4. Policy Drafting Assistance</strong>
          <p>The system assists in drafting policy documents by generating structure outlines, content suggestions, and phrasing based on best practices and user-defined goals.</p>
        </li>
        <li><strong>5. Policy Trend Forecasting</strong>
          <p>EduPX leverages temporal and cross-domain data to forecast future policy directions and identify emerging themes, supporting strategic planning and anticipatory governance.</p>
        </li>
      </ul>
    </>
  },
  {
    id: 'faqs', level: 1, titleKey: 'docs.faqs.title', content: <>
      <details className="py-2" open>
        <summary className="font-semibold cursor-pointer">General</summary>
        <div className="pl-4 mt-2 space-y-4">
          <details className="pt-2">
            <summary className="font-medium cursor-pointer">Q: What should I do if I encounter a runtime error?</summary>
            <div className="pl-4 mt-1 border-l-2 border-slate-200 dark:border-slate-700">
              <p>A:</p>
              <ol className="list-decimal pl-5">
                <li>Locate the 🔄 circular arrow symbol (a small loop icon) at the bottom-right corner of the chat content.</li>
                <li>Click it and wait for the process to complete.</li>
                <li>If the issue persists, try clicking it again—sometimes multiple attempts are needed.</li>
              </ol>
            </div>
          </details>
          <details className="pt-2">
            <summary className="font-medium cursor-pointer">Q: Why is my message failing to send?</summary>
            <div className="pl-4 mt-1 border-l-2 border-slate-200 dark:border-slate-700">
              <p>A:</p>
              <ol className="list-decimal pl-5">
                <li>Check your internet connection.</li>
                <li>Refresh the page (click the browser’s reload button or press F5).</li>
                <li>If the issue persists, the server may be under maintenance—please try again later.</li>
              </ol>
            </div>
          </details>
        </div>
      </details>
    </>
  },
];

const SectionRenderer: React.FC<{ section: Section, sectionRef: (el: HTMLElement | null) => void }> = ({ section, sectionRef }) => {
  const HeadingTag = `h${section.level + 1}` as keyof JSX.IntrinsicElements;
  const { t } = useTranslation();

  return (
    <section id={section.id} ref={sectionRef} className="py-4 scroll-mt-20">
      <HeadingTag className="text-xl font-bold text-slate-800 dark:text-slate-100">
        {t(section.titleKey)}
      </HeadingTag>
      <div className="prose prose-slate dark:prose-invert max-w-none mt-2 text-slate-700 dark:text-slate-300 leading-relaxed">
        {section.content}
      </div>
    </section>
  );
};


export const DocsScreen: React.FC<DocsScreenProps> = ({ isTocOpen, setIsTocOpen }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsTocOpen(false);
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px', threshold: 0 }
    );

    const currentRefs = sectionRefs.current;
    currentRefs.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      currentRefs.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const tocItems = DOCS_DATA.map(({ id, level, titleKey }) => {
    const isActive = activeSection === id;
    return (
      <li key={id}>
        <a
          href={`#${id}`}
          onClick={(e) => { e.preventDefault(); handleTocClick(id); }}
          className={`block py-1.5 transition-colors ${
            level === 1 ? 'font-semibold' : ''
          } ${
            level === 2 ? 'pl-4' : ''
          } ${
            level === 3 ? 'pl-8' : ''
          } ${
            isActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          {t(titleKey)}
        </a>
      </li>
    );
  });

  return (
    <>
      {/* TOC Drawer */}
      <div className={`fixed inset-0 z-30 transition-opacity duration-300 ${isTocOpen ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`} onClick={() => setIsTocOpen(false)}></div>
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 transform transition-transform duration-300 ${isTocOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('docs.tocTitle')}</h3>
        </div>
        <nav className="p-4 overflow-y-auto h-[calc(100%-4.5rem)] custom-scrollbar">
            <ul>
                {tocItems}
            </ul>
        </nav>
      </aside>

      <div className="px-6 divide-y divide-slate-200 dark:divide-slate-700">
          {DOCS_DATA.map(section => (
              <SectionRenderer 
                  key={section.id} 
                  section={section}
                  sectionRef={el => sectionRefs.current.set(section.id, el)}
              />
          ))}
          <footer className="pt-4 mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('login.footer')}
          </footer>
      </div>
    </>
  );
};
