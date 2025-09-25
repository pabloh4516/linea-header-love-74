interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <header className="px-6 py-16 text-center border-b border-border">
      <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default PageHeader;