function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Moola frontend
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight text-white">
            React and Tailwind are ready.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Build the money dashboard here and connect it to the Spring Boot API
            on port 8081.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="rounded-md bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
              type="button"
            >
              Start building
            </button>
            <a
              className="rounded-md border border-slate-700 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500"
              href="http://localhost:8081/swagger-ui/index.html"
            >
              Open API docs
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
