
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
