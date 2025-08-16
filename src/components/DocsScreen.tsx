import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';

interface DocsScreenProps {
    isTocOpen: boolean;
    setIsTocOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

interface DocsContent {
  title: string;
  tableOfContents: string;
  overview: {
    title: string;
    content: string;
  };
  applications: {
    title: string;
    subtitle: string;
    description: string;
    list: Array<{
      emoji: string;
      title: string;
      description: string;
    }>;
  };
  targetUser: {
    title: string;
    content: string;
  };
  keyAdvantages: {
    title: string;
    content: string;
    list: string[];
  };
  model: {
    title: string;
    content: string;
    framework: {
      title: string;
      content: string;
    };
  };
  tutorial: {
    title: string;
    subtitle: string;
    gettingStarted: {
      title: string;
      access: {
        title: string;
        content: string;
      };
      registration: {
        title: string;
        content: string;
      };
    };
  };
  usagePolicy: {
    title: string;
    subtitle: string;
    content: string;
  };
  faqs: {
    title: string;
    general: {
      title: string;
      items: Array<{
        question: string;
        answer: string;
      }>;
    };
    technical: {
      title: string;
      items: Array<{
        question: string;
        answer: string;
      }>;
    };
  };
}

export const DocsScreen: React.FC<DocsScreenProps> = ({ isTocOpen, setIsTocOpen }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [docsContent, setDocsContent] = useState<DocsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    const loadDocsContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/locales/docs/${language}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load docs: ${response.status}`);
        }
        const content = await response.json();
        setDocsContent(content);
      } catch (err) {
        console.error('Error loading docs content:', err);
        setError(t('docs.error'));
      } finally {
        setLoading(false);
      }
    };

    loadDocsContent();
  }, [language, t]);

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
  }, [docsContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('docs.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !docsContent) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || t('docs.error')}</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', title: docsContent.overview.title, level: 1 },
    { id: 'applications', title: docsContent.applications.title, level: 2 },
    { id: 'target-user', title: docsContent.targetUser.title, level: 2 },
    { id: 'key-advantages', title: docsContent.keyAdvantages.title, level: 2 },
    { id: 'model', title: docsContent.model.title, level: 1 },
    { id: 'framework', title: docsContent.model.framework.title, level: 2 },
    { id: 'tutorial', title: docsContent.tutorial.title, level: 1 },
    { id: 'getting-started', title: docsContent.tutorial.gettingStarted.title, level: 2 },
    { id: 'usage-policy', title: docsContent.usagePolicy.title, level: 1 },
    { id: 'faqs', title: docsContent.faqs.title, level: 1 },
  ];

  const tocItems = sections.map(({ id, title, level }) => {
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
          {title}
        </a>
      </li>
    );
  });

  return (
    <>
      {/* TOC Drawer */}
      <div className={`fixed inset-0 z-30 transition-opacity duration-300 ${isTocOpen ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`} onClick={() => setIsTocOpen(false)}></div>
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 transform transition-transform duration-300 ${isTocOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="p-4 overflow-y-auto h-full custom-scrollbar ios-safe-top ios-safe-bottom">
            <div className="pt-16 pb-4">
              <ul>
                  {tocItems}
              </ul>
            </div>
        </nav>
      </aside>

      <div className="px-6 divide-y divide-slate-200 dark:divide-slate-700">
        {/* Overview Section */}
        <section id="overview" ref={el => { sectionRefs.current.set('overview', el); }} className="py-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {docsContent.overview.title}
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
            {docsContent.overview.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* Applications Section */}
        <section id="applications" ref={el => { sectionRefs.current.set('applications', el); }} className="py-4 scroll-mt-20">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {docsContent.applications.title}
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">{docsContent.applications.subtitle}</p>
          <p className="text-slate-700 dark:text-slate-300 mb-6">{docsContent.applications.description}</p>
          <div className="space-y-6">
            {docsContent.applications.list.map((app, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  {app.emoji} {app.title}
                </h4>
                <p className="text-slate-700 dark:text-slate-300">{app.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target User Section */}
        <section id="target-user" ref={el => { sectionRefs.current.set('target-user', el); }} className="py-4 scroll-mt-20">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {docsContent.targetUser.title}
          </h3>
          <p className="text-slate-700 dark:text-slate-300">{docsContent.targetUser.content}</p>
        </section>

        {/* Key Advantages Section */}
        <section id="key-advantages" ref={el => { sectionRefs.current.set('key-advantages', el); }} className="py-4 scroll-mt-20">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {docsContent.keyAdvantages.title}
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">{docsContent.keyAdvantages.content}</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
            {docsContent.keyAdvantages.list.map((advantage, index) => (
              <li key={index}>{advantage}</li>
            ))}
          </ul>
        </section>

        {/* Model Section */}
        <section id="model" ref={el => { sectionRefs.current.set('model', el); }} className="py-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {docsContent.model.title}
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">{docsContent.model.content}</p>
          
          <div id="framework" ref={el => { sectionRefs.current.set('framework', el); }} className="scroll-mt-20">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              {docsContent.model.framework.title}
            </h3>
            <p className="text-slate-700 dark:text-slate-300">{docsContent.model.framework.content}</p>
          </div>
        </section>

        {/* Tutorial Section */}
        <section id="tutorial" ref={el => { sectionRefs.current.set('tutorial', el); }} className="py-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {docsContent.tutorial.title}
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">{docsContent.tutorial.subtitle}</p>
          
          <div id="getting-started" ref={el => { sectionRefs.current.set('getting-started', el); }} className="scroll-mt-20">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              {docsContent.tutorial.gettingStarted.title}
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  {docsContent.tutorial.gettingStarted.access.title}
                </h4>
                <p className="text-slate-700 dark:text-slate-300">{docsContent.tutorial.gettingStarted.access.content}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  {docsContent.tutorial.gettingStarted.registration.title}
                </h4>
                <p className="text-slate-700 dark:text-slate-300">{docsContent.tutorial.gettingStarted.registration.content}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Policy Section */}
        <section id="usage-policy" ref={el => { sectionRefs.current.set('usage-policy', el); }} className="py-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {docsContent.usagePolicy.title}
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">{docsContent.usagePolicy.subtitle}</p>
          <p className="text-slate-700 dark:text-slate-300">{docsContent.usagePolicy.content}</p>
        </section>

        {/* FAQs Section */}
        <section id="faqs" ref={el => { sectionRefs.current.set('faqs', el); }} className="py-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            {docsContent.faqs.title}
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                {docsContent.faqs.general.title}
              </h3>
              <div className="space-y-4">
                {docsContent.faqs.general.items.map((item, index) => (
                  <details key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <summary className="font-medium cursor-pointer text-slate-800 dark:text-slate-100">
                      {item.question}
                    </summary>
                    <div className="mt-3 text-slate-700 dark:text-slate-300">
                      {item.answer.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="mb-1">{line}</p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                {docsContent.faqs.technical.title}
              </h3>
              <div className="space-y-4">
                {docsContent.faqs.technical.items.map((item, index) => (
                  <details key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <summary className="font-medium cursor-pointer text-slate-800 dark:text-slate-100">
                      {item.question}
                    </summary>
                    <div className="mt-3 text-slate-700 dark:text-slate-300">
                      {item.answer.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="mb-1">{line}</p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-4 mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          {t('login.footer')}
        </footer>
      </div>
    </>
  );
};
