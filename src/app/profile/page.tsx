"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { addDays, format, isPast } from "date-fns";
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

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: {
    id: string;
    quantity: number;
    book: {
      id: string;
      title: string;
    };
  }[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Загружаем активные аренды
        const rentalsResponse = await fetch("/api/rentals");
        if (!rentalsResponse.ok) {
          throw new Error("Не удалось загрузить аренды");
        }
        const rentalsData = await rentalsResponse.json();
        setActiveRentals(rentalsData.filter((rental: Rental) => !rental.isReturned).slice(0, 3));

        // Загружаем последние заказы
        const ordersResponse = await fetch("/api/orders");
        if (!ordersResponse.ok) {
          throw new Error("Не удалось загрузить заказы");
        }
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.slice(0, 3));
      } catch (err) {
        console.error("Ошибка загрузки данных профиля:", err);
        setError("Произошла ошибка при загрузке данных профиля");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchProfileData();
    }
  }, [session]);

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

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "В обработке";
      case "PAID":
        return "Оплачен";
      case "CANCELLED":
        return "Отменен";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Мой профиль</h1>
        <div className="text-center py-8">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Мой профиль</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Мой профиль</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 p-6">
        <h2 className="text-xl font-semibold mb-2">Личная информация</h2>
        {session?.user && (
          <div>
            <p className="text-gray-700 mb-1">Имя: {session.user.name}</p>
            <p className="text-gray-700">Email: {session.user.email}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Активные аренды</h2>
            <Link
              href="/profile/rentals"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Все аренды
            </Link>
          </div>

          {activeRentals.length > 0 ? (
            <div className="space-y-4">
              {activeRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-medium text-lg mb-1">
                    {rental.book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {rental.book.author}
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Период: {getRentalPeriodText(rental.rentalPeriod)}</p>
                    <p>
                      Дата возврата:{" "}
                      {format(new Date(rental.endDate), "dd.MM.yyyy", {
                        locale: ru,
                      })}
                      {isPast(new Date(rental.endDate)) && (
                        <span className="text-red-500 ml-2">(просрочена)</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              У вас нет активных аренд
            </div>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Недавние заказы</h2>
            <Link
              href="/profile/orders"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Все заказы
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">
                      Заказ от{" "}
                      {format(new Date(order.createdAt), "dd.MM.yyyy", {
                        locale: ru,
                      })}
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        order.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {order.orderItems.length} товаров на сумму{" "}
                    {order.totalAmount.toFixed(2)} ₽
                  </p>
                  <div className="text-sm text-gray-500">
                    <p className="truncate">
                      {order.orderItems
                        .map((item) => `${item.book.title} (${item.quantity})`)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              У вас нет заказов
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
