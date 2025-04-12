"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface AddToCartButtonProps {
  bookId: string;
}

export default function AddToCartButton({ bookId }: AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        router.push("/cart");
      } else {
        const error = await response.json();
        console.error("Ошибка добавления в корзину:", error);
        alert("Произошла ошибка при добавлении книги в корзину");
      }
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
      alert("Произошла ошибка при добавлении книги в корзину");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
    >
      {isLoading ? "Добавление..." : "Купить"}
    </button>
  );
}
