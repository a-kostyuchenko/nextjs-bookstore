"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface BookFilterProps {
  categories: string[];
  authors: string[];
  years: number[];
}

export default function BookFilter({ categories, authors, years }: BookFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [author, setAuthor] = useState(searchParams.get("author") || "");
  const [year, setYear] = useState(searchParams.get("year") || "");

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (author) params.set("author", author);
    if (year) params.set("year", year);

    router.push(`/books?${params.toString()}`);
  };

  const resetFilters = () => {
    setCategory("");
    setAuthor("");
    setYear("");
    router.push("/books");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Фильтры</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Категория
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3"
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Автор
          </label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3"
          >
            <option value="">Все авторы</option>
            {authors.map((auth) => (
              <option key={auth} value={auth}>
                {auth}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Год написания
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3"
          >
            <option value="">Все годы</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
          >
            Применить
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Сбросить
          </button>
        </div>
      </div>
    </div>
  );
}
