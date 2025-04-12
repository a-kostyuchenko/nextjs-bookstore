"use client";

import Image from "next/image";
import Link from "next/link";
import { Book } from "@prisma/client";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
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
      <div className="p-4">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-gray-600">{book.author}</p>
        <p className="text-sm text-gray-500">Год: {book.year}</p>
        <p className="text-sm text-gray-500">Категория: {book.category}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-blue-600 font-bold">{book.price} ₽</span>
          <Link
            href={`/books/${book.id}`}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}
