export default function NotFound() {
  return (
    <div className="min-h-screen bg-grid flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[48px] font-semibold text-text-primary mb-2">404</h1>
        <p className="text-[14px] text-text-secondary mb-6">Page not found</p>
        <a href="/" className="text-accent text-[13px] hover:underline">
          Go home
        </a>
      </div>
    </div>
  );
}
