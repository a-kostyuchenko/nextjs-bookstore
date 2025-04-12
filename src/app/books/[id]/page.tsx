import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma";
import AddToCartButton from "@/app/components/AddToCartButton";
import RentBookButton from "@/app/components/RentBookButton";

interface BookDetailPageProps {
  params: {
    id: string;
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="relative h-80 w-full">
              {book.imageUrl ? (
                <Image
                  src={book.imageUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">Нет изображения</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            <div className="flex justify-between">
              <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
              {book.isAvailable ? (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  В наличии
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Нет в наличии
                </span>
              )}
            </div>

            <div className="text-gray-600 mb-4">
              <p>Автор: {book.author}</p>
              <p>Категория: {book.category}</p>
              <p>Год: {book.year}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Описание</h2>
              <p className="text-gray-700">{book.description}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-blue-600">{book.price} ₽</p>
                  <p className="text-sm text-gray-500">Аренда от {book.rentalPrice} ₽</p>
                </div>

                {book.isAvailable && (
                  <div className="flex space-x-4">
                    <AddToCartButton bookId={book.id} />
                    <RentBookButton bookId={book.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
