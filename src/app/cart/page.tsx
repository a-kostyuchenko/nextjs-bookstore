"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  bookId: string;
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
  orderItems: OrderItem[];
}

export default function CartPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart");
        if (!response.ok) {
          throw new Error("Не удалось загрузить корзину");
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error("Ошибка загрузки корзины:", err);
        setError("Произошла ошибка при загрузке корзины");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Не удалось обновить количество");
      }

      if (order) {
        const updatedItems = order.orderItems.map((item) =>
          item.id === itemId
            ? { ...item, quantity: newQuantity }
            : item
        );

        const newTotalAmount = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        setOrder({
          ...order,
          orderItems: updatedItems,
          totalAmount: newTotalAmount,
        });
      }
    } catch (err) {
      console.error("Ошибка обновления количества:", err);
      alert("Произошла ошибка при обновлении количества");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить товар");
      }

      if (order) {
        const updatedItems = order.orderItems.filter(
          (item) => item.id !== itemId
        );

        const newTotalAmount = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        setOrder({
          ...order,
          orderItems: updatedItems,
          totalAmount: newTotalAmount,
        });
      }
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      alert("Произошла ошибка при удалении товара");
    }
  };

  const handleCheckout = async () => {
    if (!order || order.orderItems.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) {
        throw new Error("Не удалось оформить заказ");
      }

      router.push("/profile/orders");
      router.refresh();
    } catch (err) {
      console.error("Ошибка оформления заказа:", err);
      alert("Произошла ошибка при оформлении заказа");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Корзина</h1>
        <div className="text-center py-8">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Корзина</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!order || order.orderItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Корзина</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">Ваша корзина пуста</h2>
          <p className="text-gray-600 mb-4">
            Добавьте книги в корзину, чтобы сделать заказ
          </p>
          <Link
            href="/books"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Перейти к книгам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Корзина</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <ul className="divide-y divide-gray-200">
          {order.orderItems.map((item) => (
            <li key={item.id} className="flex py-6 px-4 sm:px-6">
              <div className="flex-shrink-0 relative h-24 w-24 rounded-md overflow-hidden">
                {item.book.imageUrl ? (
                  <Image
                    src={item.book.imageUrl}
                    alt={item.book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Нет фото</span>
                  </div>
                )}
              </div>

              <div className="ml-4 flex-1 flex flex-col">
                <div>
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link
                        href={`/books/${item.book.id}`}
                        className="hover:underline"
                      >
                        {item.book.title}
                      </Link>
                    </h3>
                    <p className="ml-4 text-lg font-medium text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} ₽
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.book.author}
                  </p>
                </div>

                <div className="flex-1 flex items-end justify-between text-sm">
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                    >
                      -
                    </button>
                    <span className="text-gray-700 mx-2">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="font-medium text-red-600 hover:text-red-500"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
          <p>Итого</p>
          <p>{order.totalAmount.toFixed(2)} ₽</p>
        </div>
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isProcessing ? "Оформление..." : "Оформить заказ"}
        </button>
      </div>
    </div>
  );
}
