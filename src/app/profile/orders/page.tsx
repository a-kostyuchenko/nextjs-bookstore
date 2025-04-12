"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
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
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Не удалось загрузить заказы");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Ошибка загрузки заказов:", err);
        setError("Произошла ошибка при загрузке заказов");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <div className="text-center py-8">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">У вас пока нет заказов</h2>
          <p className="text-gray-600 mb-4">
            Закажите книги из нашего каталога для формирования истории заказов
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
      <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  Заказ от{" "}
                  {format(new Date(order.createdAt), "dd MMMM yyyy", {
                    locale: ru,
                  })}
                </p>
                <p className="text-sm text-gray-500">ID: {order.id}</p>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusClass(
                    order.status
                  )}`}
                >
                  {getOrderStatusText(order.status)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="py-4 flex">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.book.title}
                      </p>
                      <p className="text-sm text-gray-500">{item.book.author}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <p className="text-sm text-gray-700">
                        {item.quantity} × {item.price.toFixed(2)} ₽
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <p className="text-lg font-medium text-gray-900">Итого:</p>
                  <p className="text-lg font-medium text-gray-900">
                    {order.totalAmount.toFixed(2)} ₽
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
