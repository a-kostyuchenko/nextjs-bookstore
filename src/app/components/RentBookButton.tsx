"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface RentBookButtonProps {
  bookId: string;
}

export default function RentBookButton({ bookId }: RentBookButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState("TWO_WEEKS");

  const handleRentBook = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          rentalPeriod,
        }),
      });

      if (response.ok) {
        router.push("/profile/rentals");
      } else {
        const error = await response.json();
        console.error("Ошибка аренды книги:", error);
        alert("Произошла ошибка при аренде книги");
      }
    } catch (error) {
      console.error("Ошибка аренды книги:", error);
      alert("Произошла ошибка при аренде книги");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Арендовать
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Выберите период аренды:</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rentalPeriod"
                    value="TWO_WEEKS"
                    checked={rentalPeriod === "TWO_WEEKS"}
                    onChange={() => setRentalPeriod("TWO_WEEKS")}
                    className="mr-2"
                  />
                  <span>2 недели</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rentalPeriod"
                    value="ONE_MONTH"
                    checked={rentalPeriod === "ONE_MONTH"}
                    onChange={() => setRentalPeriod("ONE_MONTH")}
                    className="mr-2"
                  />
                  <span>1 месяц</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rentalPeriod"
                    value="THREE_MONTHS"
                    checked={rentalPeriod === "THREE_MONTHS"}
                    onChange={() => setRentalPeriod("THREE_MONTHS")}
                    className="mr-2"
                  />
                  <span>3 месяца</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Отмена
              </button>
              <button
                onClick={handleRentBook}
                disabled={isLoading}
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {isLoading ? "Обработка..." : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
