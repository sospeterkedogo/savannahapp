export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8">Sorry, the page you are looking for does not exist. Please check the URL or click <a href="/" className="text-blue-500 hover:underline">here</a> to go back to the homepage.</p>
    </main>
  );
}
