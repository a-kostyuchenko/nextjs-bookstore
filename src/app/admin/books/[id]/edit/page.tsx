import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import BookForm from "@/app/components/BookForm";

interface EditBookPageProps {
  params: {
    id: string;
  };
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const book = await prisma.book.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Редактирование книги</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <BookForm book={book} isEditing={true} />
      </div>
    </div>
  );
}
