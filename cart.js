// Shopping Cart System - Complete Implementation
// This file handles all cart functionality across the website

class ShoppingCart {
    constructor() {
        this.cart = this.loadCartFromStorage();
        this.initializeCart();
    }

    // Load cart from localStorage
    loadCartFromStorage() {
        const stored = localStorage.getItem('greenHavenCart');
        return stored ? JSON.parse(stored) : [];
    }

    // Save cart to localStorage
    saveCartToStorage() {
        localStorage.setItem('greenHavenCart', JSON.stringify(this.cart));
    }

    // Initialize cart on page load
    initializeCart() {
        this.updateCartUI();
        this.setupEventListeners();
    }

    // Add product to cart
    addToCart(id, name, price, quantity = 1) {
        // Check if product already exists in cart
        const existingItem = this.cart.find(item => item.id === id);

        if (existingItem) {
            // Update quantity if product exists
            existingItem.quantity += parseInt(quantity);
            this.showNotification(`"${name}" quantity updated to ${existingItem.quantity}`);
        } else {
            // Add new product to cart
            this.cart.push({
                id,
                name,
                price: parseFloat(price),
                quantity: parseInt(quantity)
            });
            this.showNotification(`"${name}" added to your cart!`);
        }

        this.saveCartToStorage();
        this.updateCartUI();
    }

    // Remove product from cart
    removeFromCart(id) {
        const itemIndex = this.cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            const itemName = this.cart[itemIndex].name;
            this.cart.splice(itemIndex, 1);
            this.saveCartToStorage();
            this.updateCartUI();
            this.showNotification(`"${itemName}" removed from cart`);
        }
    }

    // Update item quantity
    updateQuantity(id, quantity) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            quantity = parseInt(quantity);
            if (quantity <= 0) {
                this.removeFromCart(id);
            } else {
                item.quantity = quantity;
                this.saveCartToStorage();
                this.updateCartUI();
            }
        }
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification('Cart cleared');
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get total items count
    getCartItemsCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Update Cart UI
    updateCartUI() {
        this.updateCartCount();
        this.updateCartDropdown();
        this.updateCheckoutButton();
    }

    // Update cart count badge
    updateCartCount() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = this.getCartItemsCount();
        }
    }

    // Update cart dropdown display
    updateCartDropdown() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartTotalElement = document.querySelector('.cart-total span:last-child');
        
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #999;">Your cart is empty</p>';
        } else {
            this.cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-details" style="flex: 1;">
                        <h4 style="margin-bottom: 5px; font-size: 14px;">${item.name}</h4>
                        <p style="margin: 5px 0; font-size: 13px; color: #666;">Price: ₹${item.price.toFixed(2)}</p>
                        <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
                            <label style="font-size: 12px; margin: 0;">Qty:</label>
                            <input type="number" class="cart-qty-input" data-id="${item.id}" value="${item.quantity}" min="1" max="10" style="width: 50px; padding: 4px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <p style="margin: 5px 0; font-weight: bold; font-size: 13px;">Subtotal: ₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button class="cart-remove-btn" data-id="${item.id}" style="
                        background: #e74c3c; 
                        color: white; 
                        border: none; 
                        padding: 8px 12px; 
                        border-radius: 4px; 
                        cursor: pointer; 
                        font-size: 12px; 
                        height: fit-content;
                    ">Remove</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }

        // Update cart total
        if (cartTotalElement) {
            cartTotalElement.textContent = `₹${this.getCartTotal().toFixed(2)}`;
        }

        // Add event listeners for quantity inputs and remove buttons
        document.querySelectorAll('.cart-qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateQuantity(e.target.dataset.id, e.target.value);
            });
        });

        document.querySelectorAll('.cart-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.removeFromCart(e.target.dataset.id);
            });
        });
    }

    // Update checkout button
    updateCheckoutButton() {
        const checkoutBtn = document.querySelector('.cart-dropdown .btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
            checkoutBtn.style.opacity = this.cart.length === 0 ? '0.5' : '1';
            checkoutBtn.style.cursor = this.cart.length === 0 ? 'not-allowed' : 'pointer';
            checkoutBtn.textContent = this.cart.length === 0 ? 'Cart Empty' : 'Checkout';
        }
    }

    // Setup event listeners for Add to Cart buttons
    setupEventListeners() {
        // Add to Cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-name');
                const price = button.getAttribute('data-price');
                
                // Get quantity from input field if available, otherwise default to 1
                let quantity = 1;
                const quantityInput = button.closest('.plant-card')?.querySelector('input[type="number"]');
                if (quantityInput) {
                    quantity = quantityInput.value || 1;
                }

                if (id && name && price) {
                    this.addToCart(id, name, price, quantity);
                }
            });
        });

        // Cart icon toggle
        const cartIcon = document.querySelector('.cart-icon');
        const cartDropdown = document.querySelector('.cart-dropdown');
        if (cartIcon && cartDropdown) {
            cartIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                cartDropdown.classList.toggle('active');
            });

            // Close cart when clicking outside
            document.addEventListener('click', (e) => {
                if (!cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
                    cartDropdown.classList.remove('active');
                }
            });
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.cart-dropdown .btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                if (this.cart.length > 0) {
                    this.showNotification('Proceeding to checkout...');
                    setTimeout(() => {
                        // You can redirect to a checkout page or process payment here
                        alert(`Order Total: ₹${this.getCartTotal().toFixed(2)}\n\nThank you for your order!`);
                        this.clearCart();
                    }, 1000);
                }
            });
        }
    }

    // Show notification popup
    showNotification(message) {
        let notification = document.getElementById('cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(76, 175, 80, 0.95);
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                display: none;
                z-index: 10000;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                font-size: 15px;
                font-weight: 500;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Initialize cart when DOM is ready
let shoppingCart;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        shoppingCart = new ShoppingCart();
    });
} else {
    shoppingCart = new ShoppingCart();
}
