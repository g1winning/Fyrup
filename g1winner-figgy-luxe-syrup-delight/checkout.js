// Stripe integration
const stripe = Stripe('pk_test_51N...'); // Replace with your test publishable key
const elements = stripe.elements();
let cardElement;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    let cart = JSON.parse(localStorage.getItem('fyrup-cart')) || [];
    
    // Mobile menu toggle (from script.js)
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (menuClose) {
        menuClose.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }
    
    // Initialize card element for Stripe
    const style = {
        base: {
            color: '#4a5568',
            fontFamily: '"Raleway", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#a0aec0'
            }
        },
        invalid: {
            color: '#e53e3e',
            iconColor: '#e53e3e'
        }
    };

    cardElement = elements.create('card', {style: style});
    cardElement.mount('#card-element');

    // Handle real-time validation errors from the card Element
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    // Update cart display
    updateCartDisplay();

    // Handle form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const submitButton = document.getElementById('submit-button');
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    address: {
                        line1: document.getElementById('address').value,
                        city: document.getElementById('city').value,
                        postal_code: document.getElementById('postcode').value,
                        country: document.getElementById('country').value
                    }
                }
            });

            if (error) {
                const errorElement = document.getElementById('card-errors');
                errorElement.textContent = error.message;
                submitButton.disabled = false;
                submitButton.textContent = 'Pay Now';
            } else {
                // Here you would typically send the paymentMethod.id to your server
                // to create a payment intent and confirm the payment
                // For demo purposes, we'll just show a success message
                console.log('PaymentMethod:', paymentMethod);
                
                // Clear cart after successful payment
                localStorage.removeItem('fyrup-cart');
                
                // Show success message (in a real app, redirect to success page)
                alert('Payment successful! Thank you for your order.');
                
                // Reset form
                paymentForm.reset();
                document.getElementById('cart').classList.add('hidden');
                document.getElementById('checkout-form').classList.add('hidden');
                submitButton.disabled = false;
                submitButton.textContent = 'Pay Now';
            }
        });
    }
});

function addToCart(productId, price) {
    let cart = JSON.parse(localStorage.getItem('fyrup-cart')) || [];
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            price: price,
            quantity: 1
        });
    }
    
    localStorage.setItem('fyrup-cart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('fyrup-cart')) || [];
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartElement = document.getElementById('cart');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (cart.length === 0) {
        cartElement.classList.add('hidden');
        checkoutForm.classList.add('hidden');
        return;
    }
    
    cartElement.classList.remove('hidden');
    
    // Calculate total
    let total = 0;
    let itemsHtml = '';
    
    cart.forEach(item => {
        const itemTotal = (item.price * item.quantity) / 100;
        total += itemTotal;
        
        let productName = '';
        switch(item.id) {
            case '250ml-bottle':
                productName = '250ml Bottle';
                break;
            case '4l-drum':
                productName = '4L Drum';
                break;
            case 'recipe-book':
                productName = 'Recipe Book';
                break;
            case 't-shirt':
                productName = 'Fyrup T-Shirt';
                break;
        }
        
        itemsHtml += `
            <div class="flex justify-between items-center py-2 border-b border-purple-100">
                <div>
                    <span class="font-medium">${productName}</span>
                    <span class="text-sm text-purple-600 ml-2">x${item.quantity}</span>
                </div>
                <span class="text-purple-800">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    cartItemsElement.innerHTML = itemsHtml;
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    
    // Show checkout form if not already visible
    checkoutForm.classList.remove('hidden');
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('fyrup-cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('fyrup-cart', JSON.stringify(cart));
    updateCartDisplay();
}