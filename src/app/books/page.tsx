import { prisma } from "@/app/lib/prisma";
import BookCard from "@/app/components/BookCard";
import BookFilter from "@/app/components/BookFilter";

interface BooksPageProps {
  searchParams: {
    category?: string;
    author?: string;
    year?: string;
  };
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const where = {
    isAvailable: true,
    ...(searchParams.category ? { category: searchParams.category } : {}),
    ...(searchParams.author ? { author: searchParams.author } : {}),
    ...(searchParams.year ? { year: parseInt(searchParams.year) } : {}),
  };

  const books = await prisma.book.findMany({
    where,
    orderBy: {
      title: "asc",
    },
  });

  const categories = await prisma.book.findMany({
    where: { isAvailable: true },
    select: { category: true },
    distinct: ["category"],
  });

  const authors = await prisma.book.findMany({
    where: { isAvailable: true },
    select: { author: true },
    distinct: ["author"],
  });

  const years = await prisma.book.findMany({
    where: { isAvailable: true },
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Наши книги</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <BookFilter
            categories={categories.map((c) => c.category)}
            authors={authors.map((a) => a.author)}
            years={years.map((y) => y.year)}
          />
        </div>

        <div className="md:w-3/4">
          {books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <h2 className="text-xl font-semibold mb-2">Книги не найдены</h2>
              <p className="text-gray-600">
                По заданным фильтрам книги не найдены. Попробуйте изменить параметры поиска.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
