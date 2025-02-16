import type { Products } from '$lib/server/db/schema/schema';
import type { CartItem } from '$lib/utility/schemas';
import { writable } from 'svelte/store';


export const productsSelected = writable<Products[]>([]);

function createCart(items: CartItem[] = []) {
  const { subscribe, update } = writable<CartItem[]>(items)

  function addProducts(items: Products[]) {
    const newItems = items.map(item => ({ ...item, quantity: 1, total: 0, unitPrice: 0 }))
    update(cart => {
      const ids = new Set(cart.map(({ id }) => id));
      return [...cart, ...newItems.filter(({ id }) => !ids.has(id))];
    })
  }

  function deleteProduct(id: number) {
    update(cart => {
      const finalCart = cart.filter(item => item.id !== id);
      return finalCart
    })
  }

  function changeQuantity(quantity: number, id: number) {
    update(cart => {
      const finalCart = cart.map(item => {
        if (item.id === id) {
          item.quantity = quantity
          return item
        }
        return item
      });
      return finalCart
    })
  }

  function calculateQuantity(id: number, sign: "minus" | "plus") {
    update(cart => {
      const finalCart = cart.map(item => {
        if (item.id === id) {
          if (sign === "plus") {
            item.quantity = item.quantity + 1
            return item
          }
          if (sign === "minus" && item.quantity === 1) {
            return item
          } else {
            item.quantity = item.quantity - 1
            return item
          }
        }
        return item
      });
      return finalCart
    })
  }

  function reset() {
    update(() => [])
  }

  return { subscribe, addProducts, deleteProduct, changeQuantity, calculateQuantity, reset }
}

export const cartItems = createCart()
