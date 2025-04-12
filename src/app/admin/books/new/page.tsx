import BookForm from "@/app/components/BookForm";

export default function NewBookPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Добавление новой книги</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <BookForm />
      </div>
    </div>
  );
}
