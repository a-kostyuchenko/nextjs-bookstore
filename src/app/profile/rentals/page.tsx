"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { ru } from "date-fns/locale";

interface Rental {
  id: string;
  startDate: string;
  endDate: string;
  isReturned: boolean;
  rentalPeriod: string;
  book: {
    id: string;
    title: string;
    author: string;
    imageUrl: string | null;
  };
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [pastRentals, setPastRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await fetch("/api/rentals");
        if (!response.ok) {
          throw new Error("Не удалось загрузить аренды");
        }
        const data = await response.json();
        setRentals(data);

        const active = data.filter((rental: Rental) => !rental.isReturned);
        const past = data.filter((rental: Rental) => rental.isReturned);

        setActiveRentals(active);
        setPastRentals(past);
      } catch (err) {
        console.error("Ошибка загрузки аренд:", err);
        setError("Произошла ошибка при загрузке аренд");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const getRentalPeriodText = (period: string) => {
    switch (period) {
      case "TWO_WEEKS":
        return "2 недели";
      case "ONE_MONTH":
        return "1 месяц";
      case "THREE_MONTHS":
        return "3 месяца";
      default:
        return period;
    }
  };

  const handleReturnBook = async (rentalId: string) => {
    try {
      const response = await fetch(`/api/rentals/${rentalId}/return`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Не удалось вернуть книгу");
      }

      setActiveRentals((prev) =>
        prev.filter((rental) => rental.id !== rentalId)
      );

      const returnedRental = rentals.find((rental) => rental.id === rentalId);
      if (returnedRental) {
        const updatedRental = { ...returnedRental, isReturned: true };
        setPastRentals((prev) => [updatedRental, ...prev]);
      }
    } catch (err) {
      console.error("Ошибка возврата книги:", err);
      alert("Произошла ошибка при возврате книги");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои аренды</h1>
        <div className="text-center py-8">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои аренды</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои аренды</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">У вас пока нет аренд</h2>
          <p className="text-gray-600 mb-4">
            Арендуйте книги из нашего каталога для формирования истории аренд
          </p>
          <Link
            href="/books"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Перейти к каталогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Мои аренды</h1>

      <div className="space-y-8">
        {activeRentals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Активные аренды</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="relative h-16 w-12 mr-3">
                        {rental.book.imageUrl ? (
                          <Image
                            src={rental.book.imageUrl}
                            alt={rental.book.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Нет фото</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1 line-clamp-1">
                          {rental.book.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {rental.book.author}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 space-y-1 mb-4">
                      <p>
                        Период: {getRentalPeriodText(rental.rentalPeriod)}
                      </p>
                      <p>
                        Начало:{" "}
                        {format(new Date(rental.startDate), "dd.MM.yyyy", {
                          locale: ru,
                        })}
                      </p>
                      <p className="flex items-center">
                        <span>
                          Возврат:{" "}
                          {format(new Date(rental.endDate), "dd.MM.yyyy", {
                            locale: ru,
                          })}
                        </span>
                        {isPast(new Date(rental.endDate)) ? (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                            Просрочено
                          </span>
                        ) : (
                          <span className="ml-2 text-xs text-gray-400">
                            (через{" "}
                            {formatDistanceToNow(new Date(rental.endDate), {
                              locale: ru,
                            })}
                            )
                          </span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => handleReturnBook(rental.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      Вернуть книгу
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pastRentals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">История аренд</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {pastRentals.map((rental) => (
                  <li key={rental.id} className="p-4">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {rental.book.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {rental.book.author}
                        </p>
                      </div>
                      <div className="text-sm text-right">
                        <p className="text-gray-900">
                          {format(new Date(rental.startDate), "dd.MM.yyyy", {
                            locale: ru,
                          })}{" "}
                          —{" "}
                          {format(new Date(rental.endDate), "dd.MM.yyyy", {
                            locale: ru,
                          })}
                        </p>
                        <p className="text-gray-500">
                          {getRentalPeriodText(rental.rentalPeriod)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
