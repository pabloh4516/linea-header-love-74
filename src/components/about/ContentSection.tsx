interface ContentSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const ContentSection = ({ title, children, className = "" }: ContentSectionProps) => {
  return (
    <section className={`px-6 py-16 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-3xl font-light text-foreground mb-8 text-center">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
};

export default ContentSection;