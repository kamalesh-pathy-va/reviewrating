import Search from "./components/Search";

export default function Home() {
  return (
    <main className="p-6 h-3/4 flex bg-emerald-50">
      <section className="container mx-auto flex flex-col justify-center items-center flex-grow">
        <h1 className="text-4xl font-bold text-center">Welcome to Re-view</h1>
        <p className="text-center mt-4">The best place to find reviews for your favorite products</p>
        <div className="w-1/3 mt-6">
          <Search border={true} />
        </div>
      </section>
    </main>
  );
}
