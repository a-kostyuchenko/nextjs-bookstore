import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import BookCard from "@/app/components/BookCard";

export default async function HomePage() {
  const categories = await prisma.book.findMany({
    where: { isAvailable: true },
    select: { category: true },
    distinct: ["category"],
    take: 5,
  });

  // Получаем новые поступления (последние 3 книги)
  const newBooks = await prisma.book.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-blue-600 rounded-lg overflow-hidden shadow-xl mb-12">
        <div className="md:flex">
          <div className="p-8 md:w-1/2 flex items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Добро пожаловать в наш книжный магазин
              </h1>
              <p className="text-blue-100 mb-6">
                Обширная коллекция книг, которые можно купить или арендовать.
                Найдите свою следующую любимую книгу прямо сейчас!
              </p>
              <Link
                href="/books"
                className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                Смотреть каталог
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 h-64 md:h-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-transparent md:hidden"></div>
            <Image
              src="/hero-books.jpg"
              alt="Книжная полка"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Категории книг</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, index) => (
            <Link
              key={index}
              href={`/books?category=${encodeURIComponent(cat.category)}`}
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <span className="font-medium text-gray-800">{cat.category}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Новые поступления</h2>
          <Link
            href="/books"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Смотреть все
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
