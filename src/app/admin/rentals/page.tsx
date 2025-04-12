"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, isPast } from "date-fns";
import { ru } from "date-fns/locale";

interface Rental {
  id: string;
  startDate: string;
  endDate: string;
  isReturned: boolean;
  reminderSent: boolean;
  rentalPeriod: string;
  user: {
    name: string;
    email: string;
  };
  book: {
    title: string;
    author: string;
  };
}

export default function AdminRentalsPage() {
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderStatus, setReminderStatus] = useState<{
    isLoading: boolean;
    success: boolean;
    message: string;
  }>({
    isLoading: false,
    success: false,
    message: "",
  });

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await fetch("/api/admin/rentals");
        if (!response.ok) {
          throw new Error("Не удалось загрузить аренды");
        }
        const data = await response.json();
        setRentals(data);
      } catch (err) {
        setError("Произошла ошибка при загрузке аренд");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const handleSendReminders = async () => {
    setReminderStatus({
      isLoading: true,
      success: false,
      message: "Отправка уведомлений...",
    });

    try {
      const response = await fetch("/api/admin/rental-reminders", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Не удалось отправить уведомления");
      }

      const data = await response.json();
      setReminderStatus({
        isLoading: false,
        success: true,
        message: `Уведомления отправлены: ${data.total} (${data.upcoming} предстоящих, ${data.overdue} просроченных)`,
      });

      router.refresh();
    } catch (err) {
      console.error("Ошибка отправки уведомлений:", err);
      setReminderStatus({
        isLoading: false,
        success: false,
        message: "Произошла ошибка при отправке уведомлений",
      });
    }
  };

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

  const getStatusText = (rental: Rental) => {
    if (rental.isReturned) {
      return "Возвращена";
    }

    const endDate = new Date(rental.endDate);
    if (isPast(endDate)) {
      return "Просрочена";
    }

    return "Активна";
  };

  const getStatusClass = (rental: Rental) => {
    if (rental.isReturned) {
      return "bg-green-100 text-green-800";
    }

    const endDate = new Date(rental.endDate);
    if (isPast(endDate)) {
      return "bg-red-100 text-red-800";
    }

    return "bg-blue-100 text-blue-800";
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Управление арендами</h1>
        </div>
        <div className="text-center py-8">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Управление арендами</h1>
        </div>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление арендами</h1>
        <button
          onClick={handleSendReminders}
          disabled={reminderStatus.isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {reminderStatus.isLoading
            ? "Отправка..."
            : "Отправить напоминания"}
        </button>
      </div>

      {reminderStatus.message && (
        <div
          className={`p-4 mb-6 ${
            reminderStatus.success
              ? "bg-green-100 border-l-4 border-green-500 text-green-700"
              : "bg-red-100 border-l-4 border-red-500 text-red-700"
          }`}
        >
          <p>{reminderStatus.message}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Книга
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Пользователь
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Дата начала
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Дата окончания
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Период
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Статус
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Уведомление
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentals.length > 0 ? (
                rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rental.book.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rental.book.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rental.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rental.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rental.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rental.endDate).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(rental.endDate), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRentalPeriodText(rental.rentalPeriod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          rental
                        )}`}
                      >
                        {getStatusText(rental)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rental.reminderSent ? "Отправлено" : "Не отправлено"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    Нет активных аренд
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
