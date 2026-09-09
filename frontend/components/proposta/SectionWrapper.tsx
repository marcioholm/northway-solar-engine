import React from 'react';

type SectionLevel = 'hero' | 'content' | 'support';

const paddingMap = {
  hero: 'clamp(48px, 8vw, 80px) 24px',
  content: 'clamp(32px, 5vw, 56px) 24px',
  support: '24px',
};

const maxWidthMap = {
  hero: 700,
  content: 800,
  support: 800,
};

export function SectionWrapper({
  level = 'content',
  background = 'var(--surface)',
  children,
  className = '',
}: {
  level?: SectionLevel;
  background?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`proposal-page ${className}`}
      style={{
        padding: paddingMap[level],
        background,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: maxWidthMap[level], margin: '0 auto' }}>
        {children}
      </div>
    </section>
  );
}
