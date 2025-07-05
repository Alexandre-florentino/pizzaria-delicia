document.addEventListener('DOMContentLoaded', function() {
    
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('nav');
    const header = document.getElementById('header');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        mobileMenuBtn.innerHTML = nav.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
   
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
   
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
   
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            
            filterBtns.forEach(btn => btn.classList.remove('active'));
            
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            menuItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    const cartIcon = document.getElementById('cart-icon');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    
    cartIcon.addEventListener('click', openCart);
    cartOverlay.addEventListener('click', closeCartFunc);
    closeCart.addEventListener('click', closeCartFunc);
    
    function openCart() {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeCartFunc() {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const img = this.getAttribute('data-img');
            
            addToCart(id, name, price, img);
            updateCartUI();
            openCart();
        });
    });
    
    function addToCart(id, name, price, img) {
       
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                img,
                quantity: 1
            });
        }
        
        updateCartCount();
        saveCartToLocalStorage();
    }
    
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }
    
    function updateCartUI() {
       
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartTotal.textContent = 'R$ 0,00';
            checkoutBtn.style.display = 'none';
            return;
        }
        
        emptyCartMessage.style.display = 'none';
        checkoutBtn.style.display = 'block';
        
        let total = 0;
        
        cart.forEach(item => {
            total += item.price * item.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.img}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">R$ ${item.price.toFixed(2)}</span>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">Remover</button>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        
        cartTotal.textContent = `R$ ${total.toFixed(2)}`;
        
        
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFromCart(id);
                updateCartUI();
            });
        });
        
        
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                updateQuantity(id, -1);
                updateCartUI();
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                updateQuantity(id, 1);
                updateCartUI();
            });
        });
        
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const id = this.getAttribute('data-id');
                const newQuantity = parseInt(this.value);
                
                if (newQuantity < 1) {
                    this.value = 1;
                    return;
                }
                
                const item = cart.find(item => item.id === id);
                if (item) {
                    item.quantity = newQuantity;
                    updateCartCount();
                    saveCartToLocalStorage();
                    updateCartUI();
                }
            });
        });
    }
    
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartCount();
        saveCartToLocalStorage();
    }
    
    function updateQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            
            if (item.quantity < 1) {
                item.quantity = 1;
            }
            
            updateCartCount();
            saveCartToLocalStorage();
        }
    }
    
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    
    whatsappBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.');
            return;
        }
        
        const phoneNumber = '5511987654321'; 
        const pedidoText = cart.map(item => 
            `${item.name} - ${item.quantity}x R$ ${item.price.toFixed(2)}`
        ).join('%0A');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const message = `Olá, gostaria de fazer um pedido:%0A%0A${pedidoText}%0A%0ATotal: R$ ${total.toFixed(2)}%0A%0A*Nome:*%0A*Endereço:*%0A*Telefone:*`;
        
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    });
    
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) return;
        
        const phoneNumber = '5511987654321'; 
        const pedidoText = cart.map(item => 
            `${item.name} - ${item.quantity}x R$ ${item.price.toFixed(2)}`
        ).join('%0A');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const message = `Olá, gostaria de fazer um pedido:%0A%0A${pedidoText}%0A%0ATotal: R$ ${total.toFixed(2)}%0A%0A*Nome:*%0A*Endereço:*%0A*Telefone:*`;
        
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        
        closeCartFunc();
    });
    
   
    const newsletterForm = document.getElementById('newsletterForm');
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        
        if (!validateEmail(emailInput.value)) {
            alert('Por favor, insira um email válido.');
            return;
        }
        
        alert('Obrigado por assinar nossa newsletter!');
        this.reset();
    });
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const re = /^(\d{2})\s?(\d{4,5})\-?(\d{4})$/;
        return re.test(phone);
    }
    
    
    updateCartCount();
    updateCartUI();
    
   
    initMap();
    
    function initMap() {
        
        const pizzariaLocation = [-23.5505, -46.6333];
        
        const map = L.map('map').setView(pizzariaLocation, 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        L.marker(pizzariaLocation).addTo(map)
            .bindPopup('Pizzaria Delícia<br>Rua das Pizzas, 123')
            .openPopup();
    }
    
   
    const animateElements = document.querySelectorAll('[data-animate]');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
});