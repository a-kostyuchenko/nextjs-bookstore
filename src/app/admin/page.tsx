"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeRentals: 0,
    ordersThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Не удалось загрузить статистику");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Ошибка загрузки статистики:", err);
        setError("Произошла ошибка при загрузке статистики");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSendReminders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/rental-reminders", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Не удалось отправить уведомления");
      }

      const data = await response.json();
      alert(`Уведомления отправлены: ${data.total} (${data.upcoming} предстоящих, ${data.overdue} просроченных)`);
    } catch (err) {
      console.error("Ошибка отправки уведомлений:", err);
      alert("Произошла ошибка при отправке уведомлений");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>
        <div className="text-center py-8">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Всего книг</h2>
          <p className="text-3xl font-bold">{stats.totalBooks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Пользователей</h2>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Активных аренд</h2>
          <p className="text-3xl font-bold">{stats.activeRentals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-500 mb-2">Заказов в этом месяце</h2>
          <p className="text-3xl font-bold">{stats.ordersThisMonth}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">Управление книгами</h2>
          <p className="text-gray-600 mb-4">
            Добавляйте, редактируйте и удаляйте книги из каталога
          </p>
          <Link
            href="/admin/books"
            className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
          >
            Перейти к книгам
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">Управление арендами</h2>
          <p className="text-gray-600 mb-4">
            Просматривайте активные аренды и отправляйте напоминания
          </p>
          <Link
            href="/admin/rentals"
            className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
          >
            Перейти к арендам
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">Отправка напоминаний</h2>
          <p className="text-gray-600 mb-4">
            Отправьте автоматические напоминания об окончании срока аренды
          </p>
          <button
            onClick={handleSendReminders}
            disabled={isLoading}
            className="mt-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center disabled:opacity-50"
          >
            {isLoading ? "Отправка..." : "Отправить напоминания"}
          </button>
        </div>
      </div>
    </div>
  );
}
