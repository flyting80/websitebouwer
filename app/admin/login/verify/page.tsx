export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h1 className="text-xl font-bold text-stone-800 mb-2">Controleer je inbox</h1>
        <p className="text-stone-500 text-sm">
          We hebben een inloglink gestuurd. Klik op de link in de mail om toegang te krijgen tot Saf4.
        </p>
      </div>
    </div>
  );
}
