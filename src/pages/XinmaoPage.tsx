import XinmaoTable from '../components/XinmaoTable';

export default function XinmaoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          <span className="text-gradient">Xinmao</span> Database
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Detailed attribute and skill information for Xinmao items.
        </p>
      </header>

      <main>
        <XinmaoTable />
      </main>
    </div>
  );
}
