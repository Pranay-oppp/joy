document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar & Active States
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        // Sticky Header
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active State Link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-links');

    mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            navbar.style.backgroundColor = '#ffffff';
            navbar.classList.add('scrolled'); // Force scrolled state for text colors
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            if (window.scrollY <= 50) {
                navbar.classList.remove('scrolled');
                navbar.style.backgroundColor = 'transparent';
            }
        }
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // 3. Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 4. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal-up');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Prompt initial reveal

    // 5. Order Online Toggle
    const btnPickup = document.getElementById('btn-pickup');
    const btnDelivery = document.getElementById('btn-delivery');
    const orderMetaText = document.getElementById('order-meta-text');

    if (btnPickup && btnDelivery) {
        btnPickup.addEventListener('click', () => {
            btnPickup.classList.add('active');
            btnDelivery.classList.remove('active');
            orderMetaText.innerHTML = '<i class="fas fa-clock"></i> Ready in 15-20 minutes';
        });

        btnDelivery.addEventListener('click', () => {
            btnDelivery.classList.add('active');
            btnPickup.classList.remove('active');
            orderMetaText.innerHTML = '<i class="fas fa-motorcycle"></i> Delivered in 35-45 minutes';
        });
    }

    // 6. Menu Filter Toggle
    const filterBtns = document.querySelectorAll('.menu-btn');
    const menuCats = document.querySelectorAll('.menu-category');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            menuCats.forEach(cat => {
                if (filter === 'all' || cat.classList.contains(filter)) {
                    cat.style.display = 'block';
                } else {
                    cat.style.display = 'none';
                }
            });
        });
    });
    // 7. Shopping Cart Logic
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const addToCartBtns = document.querySelectorAll('.btn-cart');

    // Payment Modal Elements
    const paymentModalOverlay = document.getElementById('payment-modal-overlay');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentBtn = document.getElementById('close-payment');
    const paymentForm = document.getElementById('payment-form');
    const paymentTotalAmount = document.getElementById('payment-total-amount');
    const paymentSuccess = document.getElementById('payment-success');
    const closeSuccessBtn = document.getElementById('close-success-btn');

    let cart = [];

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                count += item.quantity;

                const itemHTML = `
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                            <div class="cart-item-controls">
                                <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                            </div>
                        </div>
                        <button class="remove-item" onclick="removeItem(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHTML;
            });
        }

        cartBadge.innerText = count;
        cartTotalPrice.innerText = `$${total.toFixed(2)}`;
        paymentTotalAmount.innerText = `$${total.toFixed(2)}`;
    }

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card, .menu-item');

            let name, priceText;
            if (card.classList.contains('card')) {
                name = card.querySelector('h4').innerText.trim();
                priceText = card.querySelector('.price').innerText.replace('$', '').trim();
            } else {
                name = card.querySelector('h5').innerText.trim();
                priceText = card.querySelector('.mi-price').innerText.replace('$', '').trim();
            }

            const cleanName = name.replace(/<i.*<\/i>/, '').trim();
            const price = parseFloat(priceText);

            const existingItem = cart.find(item => item.name === cleanName);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name: cleanName, price, quantity: 1 });
            }

            updateCartUI();

            // Button feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Added';
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-outline-primary');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            }, 1000);
        });
    });

    window.updateQty = (index, change) => {
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            updateCartUI();
        }
    };

    window.removeItem = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    const toggleCart = () => {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    };

    if (cartToggleBtn) {
        cartToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCart();
        });
    }
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Payment Logic
    const togglePaymentModal = () => {
        if (paymentModalOverlay && paymentModal) {
            paymentModalOverlay.classList.toggle('active');
            paymentModal.classList.toggle('active');
            // Reset form
            if (paymentModal.classList.contains('active')) {
                paymentForm.style.display = 'block';
                paymentSuccess.style.display = 'none';
                paymentForm.reset();
            }
        }
    };

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            toggleCart(); // Close cart
            togglePaymentModal(); // Open payment
        });
    }

    if (closePaymentBtn) closePaymentBtn.addEventListener('click', togglePaymentModal);
    if (paymentModalOverlay) paymentModalOverlay.addEventListener('click', togglePaymentModal);

    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent submit

            // Simulate payment processing
            const submitBtn = paymentForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Processing...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Success
                paymentForm.style.display = 'none';
                paymentSuccess.style.display = 'block';
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;

                // Clear cart
                cart = [];
                updateCartUI();
            }, 1500);
        });
    }

    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', togglePaymentModal);
});
