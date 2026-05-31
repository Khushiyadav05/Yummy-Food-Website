// =========================================
// YummyFood Ultimate Interactive Scripts (Enhanced)
// =========================================

// --- 0. Preloader ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      document.body.classList.remove('loading');
    }, 1000); // Artificial delay for a clean reveal
  } else {
    document.body.classList.remove('loading');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Guard body scrolling check
  document.body.classList.add('loading');

  // --- Web Audio API Synthesizer ---
  const SoundSynth = {
    ctx: null,
    isEnabled() {
      return localStorage.getItem('yummy_audio') !== 'false';
    },
    init() {
      if (!this.ctx && this.isEnabled()) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    playBlip() {
      if (!this.isEnabled()) return;
      try {
        this.init();
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {}
    },
    playTick() {
      if (!this.isEnabled()) return;
      try {
        this.init();
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } catch (e) {}
    },
    playTriumph() {
      if (!this.isEnabled()) return;
      try {
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.25);
        });
      } catch (e) {}
    },
    playCash() {
      if (!this.isEnabled()) return;
      try {
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        // High pitch metal bell chingle sound
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1400, now);
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.linearRampToValueAtTime(0.001, now + 0.12);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.12);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1700, now + 0.06);
        gain2.gain.setValueAtTime(0.08, now + 0.06);
        gain2.gain.linearRampToValueAtTime(0.001, now + 0.06 + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.06 + 0.25);
      } catch (e) {}
    }
  };

  // --- Utility: Toast Notification ---
  const toastContainer = document.getElementById('toast-container');
  function showToast(message, iconClass = 'ph-check-circle') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="ph ${iconClass}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- 1. Dark Mode Toggle ---
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('i');
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeIcon) themeIcon.className = 'ph ph-sun';
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      if (themeIcon) themeIcon.className = isDark ? 'ph ph-sun' : 'ph ph-moon';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      showToast(isDark ? 'Dark Mode Enabled' : 'Light Mode Enabled', isDark ? 'ph-moon' : 'ph-sun');
    });
  }

  // --- 2. Live Search & Category Filters ---
  const searchInput = document.getElementById('search-input');
  const menuItems = document.querySelectorAll('.menu-item');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const noResultMsg = document.getElementById('no-results-msg');

  function filterMenu() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    let visibleCount = 0;

    menuItems.forEach(item => {
      const name = item.dataset.name.toLowerCase();
      const category = item.dataset.category;
      
      const matchesSearch = name.includes(query);
      const matchesCategory = activeFilter === 'all' || category === activeFilter;

      if (matchesSearch && matchesCategory) {
        item.style.display = 'flex';
        visibleCount++;
        setTimeout(() => item.style.opacity = '1', 50);

        if (query !== '') {
          if (name.startsWith(query)) {
            item.style.order = '-2'; // Highest priority (exact prefix match)
          } else {
            item.style.order = '-1'; // Partial match
          }
        } else {
          item.style.order = '0'; // Reset order
        }
      } else {
        item.style.opacity = '0';
        setTimeout(() => item.style.display = 'none', 300);
        item.style.order = '0';
      }
    });

    if (noResultMsg) noResultMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  if (searchInput) searchInput.addEventListener('input', filterMenu);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      SoundSynth.playBlip();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterMenu();
    });
  });

  // --- 3. Satisfying Add-to-Cart Particle Animation ---
  function animateAddToCart(clickedBtn, imgUrl) {
    const cartToggle = document.getElementById('cart-toggle');
    if (!cartToggle) return;

    const particle = document.createElement('div');
    particle.className = 'cart-particle';
    if (imgUrl) {
      particle.style.backgroundImage = `url('${imgUrl}')`;
    }

    const btnRect = clickedBtn.getBoundingClientRect();
    const cartRect = cartToggle.getBoundingClientRect();

    particle.style.left = `${btnRect.left + window.scrollX + (btnRect.width / 2) - 15}px`;
    particle.style.top = `${btnRect.top + window.scrollY + (btnRect.height / 2) - 15}px`;

    document.body.appendChild(particle);

    // Trigger smooth bezier curve animation to cart badge
    setTimeout(() => {
      particle.style.transform = `translate(${cartRect.left - btnRect.left}px, ${cartRect.top - btnRect.top}px) scale(0.1)`;
      particle.style.opacity = '0.1';
    }, 50);

    setTimeout(() => {
      particle.remove();
      // Shake the cart toggle icon
      cartToggle.classList.add('cart-shake');
      setTimeout(() => cartToggle.classList.remove('cart-shake'), 400);
    }, 850);
  }

  // --- 4. Advanced Grouped Cart System & Yummy Points Club ---
  let cartItems = JSON.parse(localStorage.getItem('yummy_cart')) || [];
  let yummyPoints = parseInt(localStorage.getItem('yummy_points'));
  if (isNaN(yummyPoints)) {
    yummyPoints = 150; // Starting bonus pool points
    localStorage.setItem('yummy_points', 150);
  }

  const cartSidebar = document.getElementById('cart-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  
  function toggleSidebar() {
    cartSidebar?.classList.toggle('open');
    sidebarOverlay?.classList.toggle('active');
  }

  document.getElementById('cart-toggle')?.addEventListener('click', toggleSidebar);
  document.getElementById('close-sidebar')?.addEventListener('click', toggleSidebar);
  sidebarOverlay?.addEventListener('click', toggleSidebar);

  function updateCart() {
    localStorage.setItem('yummy_cart', JSON.stringify(cartItems));

    // Calculate dynamic quantities & totals
    const totalCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) cartBadge.textContent = totalCount;
    
    let subtotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const subtotalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    // Free Delivery Goal Calculations ($30.00 goal)
    const trackerText = document.getElementById('delivery-tracker-text');
    const trackerFill = document.getElementById('delivery-tracker-fill');
    if (trackerText && trackerFill) {
      if (subtotal === 0) {
        trackerText.innerHTML = `Add <span class="highlight">$30.00</span> more to get <strong>FREE Delivery</strong>!`;
        trackerFill.style.width = '0%';
      } else if (subtotal >= 30) {
        trackerText.innerHTML = `🎉 You've unlocked <strong>FREE Delivery!</strong>`;
        trackerFill.style.width = '100%';
      } else {
        const remaining = 30 - subtotal;
        trackerText.innerHTML = `Add <span class="highlight">$${remaining.toFixed(2)}</span> more to get <strong>FREE Delivery</strong>!`;
        const percentage = Math.min((subtotal / 30) * 100, 100);
        trackerFill.style.width = `${percentage}%`;
      }
    }

    // Render Loyalty Club Widget dynamically in Sidebar Cart
    if (cartSidebar) {
      let loyaltyCard = document.getElementById('loyalty-club-card');
      if (!loyaltyCard) {
        loyaltyCard = document.createElement('div');
        loyaltyCard.id = 'loyalty-club-card';
        loyaltyCard.className = 'loyalty-club-card';
        
        // Insert below the delivery goal tracker
        const trackerPanel = cartSidebar.querySelector('.delivery-tracker-panel');
        if (trackerPanel) {
          trackerPanel.insertAdjacentElement('afterend', loyaltyCard);
        }
      }

      loyaltyCard.innerHTML = `
        <div class="loyalty-header">
          <span class="loyalty-title"><i class="ph-fill ph-coin"></i> Yummy Points Club</span>
          <span class="loyalty-balance" id="loyalty-pts-val">${yummyPoints} PTS</span>
        </div>
        <div class="loyalty-rewards-list">
          <div class="reward-item-row">
            <div class="reward-details">
              <span class="reward-name">🥤 Free Coca Cola</span>
              <span class="reward-cost"><i class="ph-fill ph-coin"></i> 100 PTS</span>
            </div>
            <button class="btn-redeem" data-reward="coke" ${yummyPoints < 100 ? 'disabled' : ''}>Redeem</button>
          </div>
          <div class="reward-item-row">
            <div class="reward-details">
              <span class="reward-name">🍞 Free Garlic Bread</span>
              <span class="reward-cost"><i class="ph-fill ph-coin"></i> 250 PTS</span>
            </div>
            <button class="btn-redeem" data-reward="bread" ${yummyPoints < 250 ? 'disabled' : ''}>Redeem</button>
          </div>
        </div>
      `;

      // Bind Redemption Events
      loyaltyCard.querySelectorAll('.btn-redeem').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const type = e.target.dataset.reward;
          if (type === 'coke') {
            if (yummyPoints >= 100) {
              yummyPoints -= 100;
              localStorage.setItem('yummy_points', yummyPoints);
              addToCart("Free Coca Cola 🥤", "$0.00");
              showToast("Coke redeemed successfully!", "ph-coin");
            }
          } else if (type === 'bread') {
            if (yummyPoints >= 250) {
              yummyPoints -= 250;
              localStorage.setItem('yummy_points', yummyPoints);
              addToCart("Free Garlic Bread 🍞", "$0.00");
              showToast("Garlic Bread redeemed!", "ph-coin");
            }
          }
          updateCart();
        });
      });
    }

    // Render Grouped Items
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    container.innerHTML = '';
    if (cartItems.length === 0) {
      container.innerHTML = `<div class="empty-cart-msg"><i class="ph ph-shopping-cart-simple"></i><p>Your cart is empty.</p></div>`;
      return;
    }
    
    cartItems.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>$${(item.price * item.quantity).toFixed(2)} <span style="font-size:0.75rem; color:var(--text-light); font-weight:400;">($${item.price.toFixed(2)} each)</span></p>
        </div>
        <div class="cart-item-actions">
          <div class="cart-item-qty">
            <button class="qty-btn dec-qty" data-index="${index}"><i class="ph ph-minus"></i></button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn inc-qty" data-index="${index}"><i class="ph ph-plus"></i></button>
          </div>
          <button class="icon-btn remove-item" style="color:var(--text-light);" data-index="${index}"><i class="ph ph-trash"></i></button>
        </div>`;
      container.appendChild(div);
    });

    // Add interactivity to quantity controls
    document.querySelectorAll('.dec-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        if (cartItems[idx].quantity > 1) {
          cartItems[idx].quantity--;
        } else {
          cartItems.splice(idx, 1);
        }
        updateCart();
      });
    });

    document.querySelectorAll('.inc-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        cartItems[idx].quantity++;
        updateCart();
      });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        cartItems.splice(idx, 1);
        updateCart();
      });
    });
  }

  function addToCart(name, priceStr, imgUrl = null, clickedBtn = null) {
    SoundSynth.playBlip();
    const price = parseFloat(priceStr.replace('$', ''));
    
    // Check if item already exists
    const existingIndex = cartItems.findIndex(item => item.name === name);
    if (existingIndex > -1) {
      cartItems[existingIndex].quantity++;
    } else {
      cartItems.push({ name, price, quantity: 1, image: imgUrl });
    }
    
    if (clickedBtn && imgUrl) {
      animateAddToCart(clickedBtn, imgUrl);
    }
    
    updateCart();
    showToast(`Added ${name} to cart!`, 'ph-shopping-cart');
  }

  // Bind homepage Add to Cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-item');
      if (!card) return;
      addToCart(
        card.dataset.name, 
        card.querySelector('.price-tag').textContent, 
        card.dataset.img, 
        e.currentTarget
      );
    });
  });

  // Redirect to Checkout Drawer button
  document.querySelectorAll('.checkout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        showToast('Add items to your cart first!', 'ph-warning');
        return;
      }
      window.location.href = 'checkout.html';
    });
  });

  // Initialize Cart on Load
  updateCart();

  // --- 5. Quick View Modal, Dynamic Customizer & Mock Reviews ---
  const modalOverlay = document.getElementById('quick-view-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const addModalBtn = document.getElementById('modal-add-btn');

  let currentModalItem = null;

  // Food Category Customization Specs
  const customizationsSpecs = {
    pizza: {
      sizes: [
        { label: "Regular Size", add: 0.00 },
        { label: "Medium Size (+ $3.00)", add: 3.00 },
        { label: "Large Size (+ $5.00)", add: 5.00 }
      ],
      extras: [
        { label: "Extra Mozzarella Cheese (+$1.50)", name: "Extra Cheese", add: 1.50 },
        { label: "Spicy Pepperoni (+$2.00)", name: "Pepperoni", add: 2.00 },
        { label: "Local Farm Mushrooms (+$1.00)", name: "Mushrooms", add: 1.00 }
      ]
    },
    burger: {
      sizes: [
        { label: "Single Patty Smash", add: 0.00 },
        { label: "Double Beef Patty (+ $2.50)", add: 2.50 },
        { label: "Triple Beef Patty (+ $4.00)", add: 4.00 }
      ],
      extras: [
        { label: "Melted Cheddar Cheese (+$1.00)", name: "Cheddar", add: 1.00 },
        { label: "Crispy Maple Bacon (+$1.50)", name: "Crispy Bacon", add: 1.50 },
        { label: "Sliced Avocado (+$1.50)", name: "Avocado", add: 1.50 }
      ]
    },
    asian: {
      sizes: [
        { label: "Single Portion", add: 0.00 },
        { label: "Full/Sharing Portion (+ $4.00)", add: 4.00 }
      ],
      extras: [
        { label: "Sunny Side Fried Egg (+$1.00)", name: "Fried Egg", add: 1.00 },
        { label: "Sautéed Baby Veggies (+$0.80)", name: "Extra Veggies", add: 0.80 },
        { label: "Homemade Hot Chili Oil (+$0.50)", name: "Chili Oil", add: 0.50 }
      ]
    }
  };

  // Render Customizer inside Modal
  let activeBasePrice = 0;
  let activeCustomizerSelected = { size: "", sizeAdd: 0, extras: [] };

  function renderCustomizer(category, basePrice) {
    const modalInfo = document.querySelector('.modal-info');
    if (!modalInfo) return;

    let custWrapper = document.getElementById('modal-customizer-wrapper');
    if (custWrapper) custWrapper.remove();

    const spec = customizationsSpecs[category] || customizationsSpecs.asian; // fallback
    activeBasePrice = basePrice;
    
    // Set default selection
    activeCustomizerSelected = { 
      size: spec.sizes[0].label.split(" (")[0], 
      sizeAdd: spec.sizes[0].add, 
      extras: [] 
    };

    custWrapper = document.createElement('div');
    custWrapper.id = 'modal-customizer-wrapper';
    custWrapper.className = 'modal-customizer';

    // Build sizes radios
    let sizesHTML = '';
    spec.sizes.forEach((s, idx) => {
      sizesHTML += `
        <label class="customizer-row">
          <div class="customizer-item-left">
            <input type="radio" name="customizer-size" class="cust-size-radio" data-label="${s.label.split(" (")[0]}" data-add="${s.add}" ${idx === 0 ? 'checked' : ''} />
            <span>${s.label}</span>
          </div>
        </label>`;
    });

    // Build extras checkboxes
    let extrasHTML = '';
    spec.extras.forEach(e => {
      extrasHTML += `
        <label class="customizer-row">
          <div class="customizer-item-left">
            <input type="checkbox" class="cust-extra-check" data-name="${e.name}" data-add="${e.add}" />
            <span>${e.label.split(" (")[0]}</span>
          </div>
          <span class="customizer-price-add">+$${e.add.toFixed(2)}</span>
        </label>`;
    });

    custWrapper.innerHTML = `
      <div class="customizer-title">Select Size</div>
      <div class="customizer-options">${sizesHTML}</div>
      <div class="customizer-title">Add Extras</div>
      <div class="customizer-options">${extrasHTML}</div>
    `;

    // Insert above Reviews
    const reviewsPanel = document.getElementById('modal-reviews-wrapper');
    if (reviewsPanel) {
      modalInfo.insertBefore(custWrapper, reviewsPanel);
    } else {
      modalInfo.insertBefore(custWrapper, addModalBtn);
    }

    // Dynamic Price Calculator bindings
    function recalculateModalPrice() {
      let finalPrice = activeBasePrice + activeCustomizerSelected.sizeAdd;
      
      // Calculate extras
      activeCustomizerSelected.extras = [];
      let extrasAdd = 0;
      custWrapper.querySelectorAll('.cust-extra-check:checked').forEach(chk => {
        const add = parseFloat(chk.dataset.add);
        activeCustomizerSelected.extras.push(chk.dataset.name);
        extrasAdd += add;
      });

      finalPrice += extrasAdd;
      modalPrice.textContent = `$${finalPrice.toFixed(2)}`;
    }

    // Bind size radios
    custWrapper.querySelectorAll('.cust-size-radio').forEach(r => {
      r.addEventListener('change', (e) => {
        activeCustomizerSelected.size = e.target.dataset.label;
        activeCustomizerSelected.sizeAdd = parseFloat(e.target.dataset.add);
        recalculateModalPrice();
      });
    });

    // Bind extras checks
    custWrapper.querySelectorAll('.cust-extra-check').forEach(chk => {
      chk.addEventListener('change', recalculateModalPrice);
    });

    recalculateModalPrice(); // Initial calculation
  }

  // Render Reviews list dynamically inside Modal Info
  function renderReviews(productName) {
    let reviewsList = JSON.parse(localStorage.getItem(`yummy_revs_${productName}`));
    
    // Default Mock Reviews
    if (!reviewsList) {
      if (productName.includes("Pizza")) {
        reviewsList = [
          { user: "David K.", rating: 5, text: "Real woodfired taste! Very light crust and authentic sauce." },
          { user: "Emily R.", rating: 5, text: "Basil was incredibly fresh. Perfect mozzarella ratio." }
        ];
      } else if (productName.includes("Burger")) {
        reviewsList = [
          { user: "John D.", rating: 5, text: "Absolutely insane crust on the beef patty! Loved the secret sauce." },
          { user: "Chloe M.", rating: 4, text: "Great smoky flavor, but a bit greasy. Def ordering again!" }
        ];
      } else if (productName.includes("Biryani")) {
        reviewsList = [
          { user: "Ravi S.", rating: 5, text: "Aromatic basmati rice and rich blend of spices. Best biryani in town!" },
          { user: "Priya P.", rating: 4, text: "Incredibly flavorful, meat was tender. Raita was refreshing." }
        ];
      } else {
        reviewsList = [
          { user: "Liam T.", rating: 5, text: "Authentic soy-sauce blend with massive wok hei flavor!" },
          { user: "Ken Y.", rating: 4, text: "Tasty noodles loaded with fresh, crisp veggies." }
        ];
      }
      localStorage.setItem(`yummy_revs_${productName}`, JSON.stringify(reviewsList));
    }

    const modalInfo = document.querySelector('.modal-info');
    if (!modalInfo) return;

    // Check if reviews wrapper already exists
    let reviewsWrapper = document.getElementById('modal-reviews-wrapper');
    if (reviewsWrapper) reviewsWrapper.remove();

    reviewsWrapper = document.createElement('div');
    reviewsWrapper.id = 'modal-reviews-wrapper';
    reviewsWrapper.className = 'reviews-section';
    
    let itemsHTML = '';
    reviewsList.forEach(rev => {
      const starsHTML = '⭐'.repeat(rev.rating);
      itemsHTML += `
        <div class="review-item">
          <div class="review-header">
            <span class="review-user">${rev.user}</span>
            <span class="review-stars">${starsHTML}</span>
          </div>
          <p class="review-text">"${rev.text}"</p>
        </div>`;
    });

    reviewsWrapper.innerHTML = `
      <h4 class="reviews-title">Foodie Reviews <span><i class="ph-fill ph-chat-circle"></i> ${reviewsList.length}</span></h4>
      <div class="reviews-list-container">${itemsHTML}</div>
      
      <!-- Add Review Form -->
      <form class="add-review-form">
        <span class="add-review-title">Leave a Review</span>
        <div class="review-rating-select" id="star-selector">
          <i class="ph-fill ph-star active" data-rating="1"></i>
          <i class="ph-fill ph-star active" data-rating="2"></i>
          <i class="ph-fill ph-star active" data-rating="3"></i>
          <i class="ph-fill ph-star active" data-rating="4"></i>
          <i class="ph-fill ph-star active" data-rating="5"></i>
        </div>
        <div class="review-input-row">
          <input type="text" id="review-username" placeholder="Your name" required />
          <input type="text" id="review-message" placeholder="Add your review..." required />
          <button type="submit" class="btn btn-primary">Post</button>
        </div>
      </form>
    `;

    // Append above Add to Cart button
    modalInfo.insertBefore(reviewsWrapper, addModalBtn);

    // Bind Star Selector Interactive controls
    const stars = document.querySelectorAll('#star-selector i');
    let selectedRating = 5;
    stars.forEach(st => {
      st.addEventListener('click', (e) => {
        const rating = parseInt(e.target.dataset.rating);
        selectedRating = rating;
        stars.forEach((s, idx) => {
          if (idx < rating) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });

    // Form Submission Event
    const reviewForm = reviewsWrapper.querySelector('.add-review-form');
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = document.getElementById('review-username').value.trim();
      const text = document.getElementById('review-message').value.trim();
      if (!userName || !text) return;

      reviewsList.push({ user: userName, rating: selectedRating, text: text });
      localStorage.setItem(`yummy_revs_${productName}`, JSON.stringify(reviewsList));
      showToast('Thank you for your feedback!', 'ph-heart');
      
      // Re-render
      renderReviews(productName);
    });
  }

  // Open Quick View Modal
  document.querySelectorAll('.quick-view-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-item');
      if (!card) return;
      currentModalItem = card;

      modalImg.src = card.dataset.img;
      modalTitle.textContent = card.dataset.name;
      modalDesc.textContent = card.dataset.desc;
      
      const basePrice = parseFloat(card.querySelector('.price-tag').textContent.replace('$', ''));
      modalPrice.textContent = `$${basePrice.toFixed(2)}`;

      // Render Dynamic Reviews for this specific item
      renderReviews(card.dataset.name);

      // Render Interactive Customizer
      renderCustomizer(card.dataset.category, basePrice);

      modalOverlay.classList.add('active');
    });
  });

  function closeQuickView() {
    modalOverlay?.classList.remove('active');
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeQuickView);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay) closeQuickView();
    });
  }

  if (addModalBtn) {
    addModalBtn.addEventListener('click', () => {
      if (currentModalItem) {
        // Collect custom selections & build dynamic item name
        let customizedName = currentModalItem.dataset.name;
        let details = [activeCustomizerSelected.size];
        
        if (activeCustomizerSelected.extras.length > 0) {
          details.push(activeCustomizerSelected.extras.join(", "));
        }
        customizedName += ` (${details.join(" • ")})`;

        addToCart(
          customizedName, 
          modalPrice.textContent, 
          currentModalItem.dataset.img, 
          addModalBtn
        );
        closeQuickView();
      }
    });
  }

  // --- 6. Testimonials Carousel ---
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide]?.classList.add('active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  if(slides.length > 0) {
    nextBtn?.addEventListener('click', () => { nextSlide(); resetSlideInterval(); });
    prevBtn?.addEventListener('click', () => { prevSlide(); resetSlideInterval(); });
    function resetSlideInterval() { clearInterval(slideInterval); slideInterval = setInterval(nextSlide, 4000); }
    slideInterval = setInterval(nextSlide, 4000);
  }

  // --- 7. Back To Top & Parallax ---
  const backToTopBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Parallax Hero effect
  const heroContent = document.querySelector('.hero-content');
  const heroSec = document.querySelector('.hero');
  if (heroContent && heroSec) {
    heroSec.addEventListener('mousemove', (e) => {
      const x = (window.innerWidth / 2 - e.pageX) / 35;
      const y = (window.innerHeight / 2 - e.pageY) / 35;
      heroContent.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
  }

  // Intersection Observer
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // --- 8. Checkout Page & Promo Code System ---
  const checkoutItemsContainer = document.getElementById('checkout-cart-items');
  const checkoutSubtotal = document.getElementById('checkout-subtotal');
  const checkoutTotal = document.getElementById('checkout-total');
  const checkoutDeliveryFee = document.getElementById('checkout-delivery-fee');
  const discountLineItem = document.getElementById('discount-line-item');
  const checkoutDiscount = document.getElementById('checkout-discount');
  const promoInput = document.getElementById('promo-input');
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const promoMessage = document.getElementById('promo-message');

  if (checkoutItemsContainer) {
    let subtotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    let deliveryFee = subtotal >= 30 ? 0.00 : 4.99; // Free delivery above $30
    let discountPercent = 0;
    let discountFlat = 0;
    let finalDiscountValue = 0;
    let promoCodeApplied = "";

    function renderCheckoutSummary() {
      checkoutItemsContainer.innerHTML = '';
      if (cartItems.length === 0) {
        checkoutItemsContainer.innerHTML = '<p style="color:var(--text-light); font-style:italic;">Your cart is empty.</p>';
        if (checkoutSubtotal) checkoutSubtotal.textContent = '$0.00';
        if (checkoutDeliveryFee) checkoutDeliveryFee.textContent = '$0.00';
        if (checkoutTotal) checkoutTotal.textContent = '$0.00';
        return;
      }

      cartItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'summary-line';
        div.innerHTML = `<span>${item.name} <strong style="color:var(--primary)">x${item.quantity}</strong></span><span>$${(item.price * item.quantity).toFixed(2)}</span>`;
        checkoutItemsContainer.appendChild(div);
      });

      // Update Delivery visual fee
      if (checkoutDeliveryFee) {
        checkoutDeliveryFee.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
        if (deliveryFee === 0) {
          checkoutDeliveryFee.style.color = '#10b981';
          checkoutDeliveryFee.style.fontWeight = '700';
        } else {
          checkoutDeliveryFee.style.color = 'var(--text-dark)';
          checkoutDeliveryFee.style.fontWeight = '500';
        }
      }

      if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;

      // Coupon Discount calculations
      finalDiscountValue = (subtotal * (discountPercent / 100)) + discountFlat;
      if (finalDiscountValue > 0) {
        if (discountLineItem) discountLineItem.style.display = 'flex';
        if (checkoutDiscount) checkoutDiscount.textContent = `-$${finalDiscountValue.toFixed(2)}`;
      } else {
        if (discountLineItem) discountLineItem.style.display = 'none';
      }

      const totalVal = Math.max(0, subtotal - finalDiscountValue + deliveryFee);
      if (checkoutTotal) checkoutTotal.textContent = `$${totalVal.toFixed(2)}`;
    }

    renderCheckoutSummary();

    // Coupons Application Action
    applyPromoBtn?.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!promoMessage) return;
      promoMessage.style.display = 'block';

      if (code === 'YUMMY20') {
        discountPercent = 20;
        discountFlat = 0;
        promoCodeApplied = "YUMMY20 (20% OFF)";
        promoMessage.textContent = 'Coupon applied successfully! 20% off your meal.';
        promoMessage.className = 'promo-msg success';
        showToast('Promo Code YUMMY20 Applied!', 'ph-ticket');
      } else if (code === 'FIRST50') {
        discountPercent = 50;
        discountFlat = 0;
        promoCodeApplied = "FIRST50 (50% OFF)";
        promoMessage.textContent = 'Awesome! 50% discount has been applied to subtotal.';
        promoMessage.className = 'promo-msg success';
        showToast('50% Off Code Applied!', 'ph-ticket');
      } else if (code === 'LUCKY30') {
        discountPercent = 30;
        discountFlat = 0;
        promoCodeApplied = "LUCKY30 (30% OFF)";
        promoMessage.textContent = 'Congrats! 30% discount has been applied to subtotal.';
        promoMessage.className = 'promo-msg success';
        showToast('30% Off Code Applied!', 'ph-ticket');
      } else if (code === 'FREECHEF') {
        discountPercent = 0;
        discountFlat = 12.50; // flat rate for Chef Special
        promoCodeApplied = "FREECHEF ($12.50 OFF)";
        promoMessage.textContent = 'Hooray! Free Chef Special discount ($12.50) has been applied!';
        promoMessage.className = 'promo-msg success';
        showToast('Free Chef Special Applied!', 'ph-ticket');
      } else if (code === 'TASTY10') {
        discountPercent = 10;
        discountFlat = 0;
        promoCodeApplied = "TASTY10 (10% OFF)";
        promoMessage.textContent = 'Tasty! 10% discount has been applied to subtotal.';
        promoMessage.className = 'promo-msg success';
        showToast('10% Off Code Applied!', 'ph-ticket');
      } else if (code === '') {
        promoMessage.style.display = 'none';
        discountPercent = 0;
        discountFlat = 0;
        promoCodeApplied = "";
      } else {
        discountPercent = 0;
        discountFlat = 0;
        promoCodeApplied = "";
        promoMessage.textContent = 'Invalid promo coupon code. Spin the wheel to get valid ones!';
        promoMessage.className = 'promo-msg error';
        showToast('Invalid Coupon!', 'ph-x-circle');
      }
      renderCheckoutSummary();
    });

    // --- 8.1 Premium Form Dynamic Validations & Masking ---

    // Generic Floating Label Validation helper
    function setupFloatingValidation(inputEl, validateFn, errorMsgText) {
      if (!inputEl) return () => true; // dummy checker
      const group = inputEl.closest('.input-group.floating');
      if (!group) return () => true;

      let indicator = group.querySelector('.validation-indicator');
      let errorEl = group.nextElementSibling;
      if (errorEl && !errorEl.classList.contains('error-message')) {
        errorEl = null;
      }

      function checkValue(eventTrigger) {
        const val = inputEl.value;
        const isValid = validateFn(val);

        if (isValid) {
          inputEl.classList.add('valid');
          inputEl.classList.remove('invalid');
          group.classList.add('is-valid');
          group.classList.remove('is-invalid');
          
          if (!indicator) {
            indicator = document.createElement('i');
            indicator.className = 'validation-indicator ph-bold ph-check-circle valid';
            group.appendChild(indicator);
          } else {
            indicator.className = 'validation-indicator ph-bold ph-check-circle valid';
          }
          
          if (errorEl) {
            errorEl.remove();
            errorEl = null;
          }
        } else {
          // Only show error visually if blurred or has substantial typing to avoid premature error flashing
          if (eventTrigger === 'blur' || (eventTrigger === 'input' && val.trim().length > 3)) {
            inputEl.classList.add('invalid');
            inputEl.classList.remove('valid');
            group.classList.add('is-invalid');
            group.classList.remove('is-valid');
            
            if (!indicator) {
              indicator = document.createElement('i');
              indicator.className = 'validation-indicator ph-bold ph-warning-circle invalid';
              group.appendChild(indicator);
            } else {
              indicator.className = 'validation-indicator ph-bold ph-warning-circle invalid';
            }

            if (!errorEl) {
              errorEl = document.createElement('span');
              errorEl.className = 'error-message';
              errorEl.textContent = errorMsgText;
              group.insertAdjacentElement('afterend', errorEl);
            }
          }
        }
        return isValid;
      }

      inputEl.addEventListener('input', () => checkValue('input'));
      inputEl.addEventListener('blur', () => checkValue('blur'));

      return () => checkValue('blur'); // trigger manual check on submit
    }

    // Interactive Checkout Card Brand Indicator & Masking
    const cardInput = document.getElementById('billing-card-number');
    const expiryInput = document.getElementById('billing-card-expiry');
    const cvvInput = document.getElementById('billing-card-cvv');

    function detectCardBrand(digits) {
      const badges = {
        visa: document.getElementById('badge-visa'),
        mastercard: document.getElementById('badge-mastercard'),
        amex: document.getElementById('badge-amex'),
        rupay: document.getElementById('badge-rupay')
      };

      // Hide all brand badges
      Object.values(badges).forEach(b => { if (b) b.style.display = 'none'; });

      if (!digits) return;

      if (digits.startsWith('4')) {
        if (badges.visa) badges.visa.style.display = 'inline-block';
      } else if (digits.startsWith('5')) {
        if (badges.mastercard) badges.mastercard.style.display = 'inline-block';
      } else if (digits.startsWith('34') || digits.startsWith('37')) {
        if (badges.amex) badges.amex.style.display = 'inline-block';
      } else if (digits.startsWith('6')) {
        if (badges.rupay) badges.rupay.style.display = 'inline-block';
      }
    }

    // 3D Credit Card Preview Elements
    const previewNum = document.getElementById('preview-card-number');
    const previewHolder = document.getElementById('preview-card-holder');
    const previewExpiry = document.getElementById('preview-card-expiry');
    const previewCvv = document.getElementById('preview-card-cvv');
    const previewBrandLogo = document.getElementById('preview-brand-logo');
    const cardPreviewContainer = document.getElementById('credit-card-preview');

    function syncCardPreview(value) {
      if (previewNum) {
        let padded = value.replace(/\s/g, '');
        let formatted = '';
        for (let i = 0; i < 16; i++) {
          if (i > 0 && i % 4 === 0) formatted += ' ';
          formatted += padded[i] ? padded[i] : '•';
        }
        previewNum.textContent = formatted;
      }

      // Sync Card Brand visual gradients
      if (cardPreviewContainer) {
        cardPreviewContainer.className = 'credit-card-3d';
        if (value.startsWith('4')) {
          cardPreviewContainer.classList.add('visa');
          if (previewBrandLogo) previewBrandLogo.textContent = 'Visa';
        } else if (value.startsWith('5')) {
          cardPreviewContainer.classList.add('mastercard');
          if (previewBrandLogo) previewBrandLogo.textContent = 'Mastercard';
        } else if (value.startsWith('34') || value.startsWith('37')) {
          cardPreviewContainer.classList.add('amex');
          if (previewBrandLogo) previewBrandLogo.textContent = 'Amex';
        } else if (value.startsWith('6')) {
          cardPreviewContainer.classList.add('rupay');
          if (previewBrandLogo) previewBrandLogo.textContent = 'RuPay';
        } else {
          if (previewBrandLogo) previewBrandLogo.textContent = 'CARD';
        }
      }
    }

    if (cardInput) {
      cardInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) formatted += ' ';
          formatted += value[i];
        }
        e.target.value = formatted;
        detectCardBrand(value);
        syncCardPreview(value);
      });
    }

    if (expiryInput) {
      expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 4);
        let formatted = '';
        if (value.length > 2) {
          formatted = value.substring(0, 2) + '/' + value.substring(2);
        } else {
          formatted = value;
        }
        e.target.value = formatted;
        if (previewExpiry) {
          previewExpiry.textContent = formatted || 'MM/YY';
        }
      });
    }

    if (cvvInput) {
      cvvInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 4);
        e.target.value = value;
        if (previewCvv) {
          previewCvv.textContent = '•'.repeat(value.length) || '•••';
        }
      });

      // 3D Flip CVV focus controls
      cvvInput.addEventListener('focus', () => {
        if (cardPreviewContainer) cardPreviewContainer.classList.add('flipped');
      });
      cvvInput.addEventListener('blur', () => {
        if (cardPreviewContainer) cardPreviewContainer.classList.remove('flipped');
      });
    }

    // Checkout floating validations registration
    const firstNameInput = document.getElementById('billing-first-name');
    const lastNameInput = document.getElementById('billing-last-name');
    const emailInput = document.getElementById('billing-email');
    const addressInput = document.getElementById('billing-address');

    let checkFirst = () => true, checkLast = () => true, checkEmailCheck = () => true;
    let checkAddressCheck = () => true, checkCardCheck = () => true, checkExpiryCheck = () => true, checkCvvCheck = () => true;

    function updateCardHolderPreview() {
      if (!previewHolder) return;
      const fn = firstNameInput ? firstNameInput.value.trim() : '';
      const ln = lastNameInput ? lastNameInput.value.trim() : '';
      const fullName = (fn + ' ' + ln).trim();
      previewHolder.textContent = fullName ? fullName.toUpperCase() : 'YOUR NAME';
    }

    if (firstNameInput) {
      checkFirst = setupFloatingValidation(firstNameInput, val => val.trim().length >= 2, "First name must be at least 2 letters.");
      firstNameInput.addEventListener('input', updateCardHolderPreview);
    }
    if (lastNameInput) {
      checkLast = setupFloatingValidation(lastNameInput, val => val.trim().length >= 2, "Last name must be at least 2 letters.");
      lastNameInput.addEventListener('input', updateCardHolderPreview);
    }

    if (emailInput) {
      checkEmailCheck = setupFloatingValidation(emailInput, val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()), "Please enter a valid email address.");
    }
    if (addressInput) {
      checkAddressCheck = setupFloatingValidation(addressInput, val => val.trim().length >= 10, "Full address must be at least 10 characters.");
    }
    if (cardInput) {
      checkCardCheck = setupFloatingValidation(cardInput, val => {
        const d = val.replace(/\D/g, '');
        return d.length === 16 || d.length === 15;
      }, "Card number must be 15 or 16 digits.");
    }
    if (expiryInput) {
      checkExpiryCheck = setupFloatingValidation(expiryInput, val => {
        if (!/^\d{2}\/\d{2}$/.test(val)) return false;
        const parts = val.split('/');
        const m = parseInt(parts[0]);
        const y = parseInt('20' + parts[1]);
        if (m < 1 || m > 12) return false;
        const exp = new Date(y, m, 1);
        return exp > new Date();
      }, "Card is expired or month is invalid.");
    }
    if (cvvInput) {
      checkCvvCheck = setupFloatingValidation(cvvInput, val => /^\d{3,4}$/.test(val), "CVV must be 3 or 4 digits.");
    }

    // Dynamic Address Suggestions Autocomplete & Distance Calculations
    const addressBox = document.getElementById('address-predictions-box');
    const predictionsPool = [
      "123 Spice Garden Street, Foodie Hills",
      "456 Savory Boulevard, Taste City",
      "789 Hunger Street, Grill Zone",
      "101 Sizzle Plaza, Gourmet District",
      "555 Mint Leaf Avenue, Aroma Town"
    ];

    const distanceMap = {
      "123 Spice Garden Street, Foodie Hills": { dist: 1.8, fee: 2.40 },
      "456 Savory Boulevard, Taste City": { dist: 3.4, fee: 3.20 },
      "789 Hunger Street, Grill Zone": { dist: 5.6, fee: 4.30 },
      "101 Sizzle Plaza, Gourmet District": { dist: 7.2, fee: 5.10 },
      "555 Mint Leaf Avenue, Aroma Town": { dist: 8.5, fee: 5.75 }
    };

    if (addressInput && addressBox) {
      addressInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        addressBox.innerHTML = '';
        if (val.length < 2) {
          addressBox.style.display = 'none';
          return;
        }

        const filtered = predictionsPool.filter(p => p.toLowerCase().includes(val));
        if (filtered.length === 0) {
          addressBox.style.display = 'none';
          return;
        }

        filtered.forEach(item => {
          const div = document.createElement('div');
          div.className = 'prediction-item';
          div.innerHTML = `<i class="ph ph-map-pin-line"></i> <span>${item}</span>`;
          div.addEventListener('click', () => {
            addressInput.value = item;
            addressBox.style.display = 'none';
            SoundSynth.playBlip();

            // Calculate simulated distance and dynamic delivery fee!
            const details = distanceMap[item] || { dist: 4.0, fee: 3.50 };
            
            // Remove previous badge if it exists
            const prevBadge = document.getElementById('live-distance-badge');
            if (prevBadge) prevBadge.remove();

            const badge = document.createElement('div');
            badge.id = 'live-distance-badge';
            badge.className = 'distance-badge-fee';
            badge.innerHTML = `<i class="ph ph-bicycle"></i> Distance: <strong>${details.dist} km</strong> | Delivery Fee: <strong>$${details.fee.toFixed(2)}</strong>`;
            addressInput.closest('.input-group.floating').insertAdjacentElement('afterend', badge);

            // Override global deliveryFee dynamically
            deliveryFee = subtotal >= 30 ? 0.00 : details.fee;

            // Recalculate totals
            renderCheckoutSummary();
            showToast(`Delivery fee updated based on distance!`, 'ph-bicycle');
          });
          addressBox.appendChild(div);
        });
        addressBox.style.display = 'block';
      });

      // Hide suggestions list when clicking outside
      document.addEventListener('click', (e) => {
        if (e.target !== addressInput && e.target !== addressBox) {
          addressBox.style.display = 'none';
        }
      });
    }

    // Gamified Fortune Spin-the-Wheel Coupon Logic
    const spinBtn = document.getElementById('spin-wheel-btn');
    const wheelSpinner = document.getElementById('wheel-spinner');

    if (spinBtn && wheelSpinner) {
      spinBtn.addEventListener('click', () => {
        spinBtn.disabled = true;
        spinBtn.textContent = "Spinning...";

        // Choose a random winning segment index out of [0, 1, 2, 4, 5] (exclude 3 TRYAGAIN to keep it rewarding)
        const pool = [
          { idx: 0, code: "LUCKY30", angle: 240, desc: "30% OFF using LUCKY30!" },
          { idx: 1, code: "FREECHEF", angle: 180, desc: "FREE Chef Special using FREECHEF!" },
          { idx: 2, code: "YUMMY20", angle: 120, desc: "20% OFF using YUMMY20!" },
          { idx: 4, code: "FIRST50", angle: 0, desc: "50% OFF using FIRST50!" },
          { idx: 5, code: "TASTY10", angle: 300, desc: "10% OFF using TASTY10!" }
        ];

        const win = pool[Math.floor(Math.random() * pool.length)];

        // Rotate wheel (6 full spins + target angle)
        const finalRotation = (360 * 6) + win.angle;
        wheelSpinner.style.transform = `rotate(${finalRotation}deg)`;

        // Play decelerating tick clicks matching rotation physics
        let ticks = 0;
        const totalDuration = 5000;
        const maxTicks = 35;
        
        function playWheelTick(tickNum) {
          if (tickNum >= maxTicks) return;
          SoundSynth.playTick();
          const progress = tickNum / maxTicks;
          const nextDelay = 50 + (progress * progress * 400); // Decelerates gradually
          setTimeout(() => {
            playWheelTick(tickNum + 1);
          }, nextDelay);
        }
        
        playWheelTick(0);

        // Landing calculations
        setTimeout(() => {
          SoundSynth.playTriumph();
          showToast(`Wheel landed! You won ${win.desc} 🎡`, 'ph-gift');

          const promoInputEl = document.getElementById('promo-input');
          const applyPromoBtnEl = document.getElementById('apply-promo-btn');
          
          if (promoInputEl) {
            promoInputEl.value = win.code;
            if (applyPromoBtnEl) {
              applyPromoBtnEl.click();
            }
          }

          spinBtn.textContent = "Coupon Claimed! 🎉";
          triggerWheelConfetti();
        }, totalDuration);
      });
    }

    function triggerWheelConfetti() {
      const parent = document.querySelector('.wheel-card');
      if (!parent) return;
      for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = `${Math.random() * 8 + 5}px`;
        particle.style.height = `${Math.random() * 12 + 6}px`;
        particle.style.background = ["#ff5e3a", "#10b981", "#fbbf24", "#8b5cf6", "#ef4444"][Math.floor(Math.random() * 5)];
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.borderRadius = '2px';
        particle.style.pointerEvents = 'none';
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.zIndex = '8';
        parent.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 120 + 40;
        const xDest = Math.cos(angle) * speed;
        const yDest = Math.sin(angle) * speed;

        setTimeout(() => {
          particle.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
          particle.style.transform = `translate(calc(-50% + ${xDest}px), calc(-50% + ${yDest}px)) rotate(${Math.random() * 360}deg)`;
          particle.style.opacity = '0';
        }, 30);

        setTimeout(() => {
          particle.remove();
        }, 1300);
      }
    }

    // Form Submission & Payments Processing & Loyalty Point Accrual & Order History Log
    const checkoutForm = document.getElementById('checkout-form-el');
    const checkoutLoader = document.getElementById('checkout-loader');

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
          showToast('Your cart is empty! Add food items first.', 'ph-warning');
          return;
        }

        // Run checkout validations
        const isFirstValid = checkFirst();
        const isLastValid = checkLast();
        const isEmailValid = checkEmailCheck();
        const isAddrValid = checkAddressCheck();
        const isCardValid = checkCardCheck();
        const isExpValid = checkExpiryCheck();
        const isCvvValid = checkCvvCheck();

        if (!isFirstValid || !isLastValid || !isEmailValid || !isAddrValid || !isCardValid || !isExpValid || !isCvvValid) {
          showToast("Please fill all checkout fields correctly!", "ph-warning");
          // Focus first invalid element
          const invalidEl = checkoutForm.querySelector('.invalid');
          if (invalidEl) invalidEl.focus();
          return;
        }

        // Trigger secure payments spinner loader
        checkoutLoader?.classList.add('active');

        // Accumulate Yummy Loyalty Points (10 points per dollar spent on subtotal)
        const pointsEarned = Math.round(subtotal * 10);

        setTimeout(() => {
          checkoutLoader?.classList.remove('active');

          // Add transaction inside Order History Database
          let historyList = JSON.parse(localStorage.getItem('yummy_order_history')) || [];
          const randomId = `YMY-${Math.floor(100000 + Math.random() * 900000)}`;
          
          const nowStr = new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });

          // Compile simple items log format
          const formattedItems = cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }));

          const finalPaidTotal = Math.max(0, subtotal - finalDiscountValue + deliveryFee);

          historyList.unshift({
            id: randomId,
            date: nowStr,
            items: formattedItems,
            coupon: promoCodeApplied || "NONE",
            total: finalPaidTotal.toFixed(2)
          });
          localStorage.setItem('yummy_order_history', JSON.stringify(historyList));

          // Save points balance
          yummyPoints += pointsEarned;
          localStorage.setItem('yummy_points', yummyPoints);

          SoundSynth.playCash();
          showToast(`Verified! You earned ${pointsEarned} Yummy Points! 🪙`, 'ph-coin');
          
          // Clear cart
          localStorage.removeItem('yummy_cart');
          cartItems = [];
          
          // Move directly to tracking dashboard
          setTimeout(() => {
            window.location.href = 'order-tracking.html';
          }, 1200);

        }, 2500); // 2.5s payment verification time
      });
    }

    // --- Contact Form submission handler ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      const nameInput = document.getElementById('contact-name');
      const contactEmailInput = document.getElementById('contact-email');
      const messageTextarea = document.getElementById('contact-message');
      const contactSubmitBtn = document.getElementById('contact-submit-btn');

      // Bind real-time validations
      const checkContactName = setupFloatingValidation(nameInput, val => val.trim().length >= 2, "Name must be at least 2 characters.");
      const checkContactEmail = setupFloatingValidation(contactEmailInput, val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()), "Enter a valid email address.");
      const checkContactMsg = setupFloatingValidation(messageTextarea, val => val.trim().length >= 10, "Message must be at least 10 characters.");

      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = checkContactName();
        const isEmailValid = checkContactEmail();
        const isMsgValid = checkContactMsg();

        if (!isNameValid || !isEmailValid || !isMsgValid) {
          showToast("Please enter all details correctly.", "ph-warning");
          return;
        }

        // Activate submit button loader
        contactSubmitBtn.classList.add('sending');
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.querySelector('span').textContent = 'Sending Message...';

        // Simulate network API request
        setTimeout(() => {
          contactSubmitBtn.classList.remove('sending');
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.querySelector('span').textContent = 'Send Message';

          // Show success modal
          const contactSuccessModal = document.getElementById('contact-success-modal');
          if (contactSuccessModal) contactSuccessModal.classList.add('active');

          // Reset contact form
          contactForm.reset();

          // Remove all validation UI states
          contactForm.querySelectorAll('.valid, .invalid').forEach(el => el.classList.remove('valid', 'invalid'));
          contactForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
          contactForm.querySelectorAll('.validation-indicator').forEach(el => el.remove());
          contactForm.querySelectorAll('.error-message').forEach(el => el.remove());

          showToast("Message Sent! Thank you 🚀", "ph-paper-plane-right");
        }, 2000);
      });

      // Bind success modal dismiss
      const closeContactModalBtn = document.getElementById('close-contact-modal');
      const contactSuccessModal = document.getElementById('contact-success-modal');
      if (closeContactModalBtn && contactSuccessModal) {
        closeContactModalBtn.addEventListener('click', () => {
          contactSuccessModal.classList.remove('active');
        });
        contactSuccessModal.addEventListener('click', (e) => {
          if (e.target === contactSuccessModal) contactSuccessModal.classList.remove('active');
        });
      }
    }
  }

  // --- 9. Live Interactive Order Tracking Page & Kitchen Cam ---
  const countdownTimer = document.getElementById('countdown-timer');
  const liveStatusBadge = document.getElementById('live-status-badge');
  const liveStatusTitle = document.getElementById('live-status-title');
  const liveStatusDesc = document.getElementById('live-status-desc');
  const stepperProgress = document.getElementById('stepper-progress');
  
  const courierRider = document.getElementById('courier-rider');
  const activePath = document.getElementById('route-active');

  const kitchenCamOverlay = document.getElementById('cam-offline-overlay');
  const camStatusLabel = document.getElementById('cam-status-label');
  const camRedDot = document.getElementById('cam-red-dot');

  if (countdownTimer) {
    // Timestamps
    const formatTime = (date) => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutes} ${ampm}`;
    };

    const now = new Date();
    document.getElementById('time-placed').textContent = formatTime(now);

    let currentStage = 1;
    let scooterInterval;

    // Helper to set timestamps of stages
    const setTimeForStep = (stepId) => {
      const el = document.getElementById(stepId);
      if (el) el.textContent = formatTime(new Date());
    };

    // Live Rider scooter progression mapping helper
    function updateScooterMap(percentage) {
      if (courierRider) courierRider.style.offsetDistance = `${percentage}%`;
      if (activePath) {
        // Map paths length is roughly 600px
        const strokeOffset = 600 - (600 * (percentage / 100));
        activePath.style.strokeDashoffset = strokeOffset;
      }
    }

    // Interactive order lifecycle sequence
    // STAGE 1: Order Placed (Instant)
    liveStatusBadge.textContent = 'Placed';
    liveStatusBadge.style.background = 'rgba(59, 130, 246, 0.1)';
    liveStatusBadge.style.color = '#3b82f6';
    liveStatusTitle.textContent = 'Order verified by restaurant!';
    liveStatusDesc.textContent = 'Kitchen will start preparing your customized selection shortly.';
    countdownTimer.textContent = '25 mins';
    stepperProgress.style.width = '15%';
    document.getElementById('step-placed').classList.add('completed');
    document.getElementById('step-preparing').classList.add('active');
    
    // Live camera online
    kitchenCamOverlay?.classList.remove('active');
    updateScooterMap(0);

    // STAGE 2: Preparing in Kitchen (Starts in 7 seconds)
    setTimeout(() => {
      currentStage = 2;
      setTimeForStep('time-preparing');
      document.getElementById('step-preparing').classList.remove('active');
      document.getElementById('step-preparing').classList.add('completed');
      document.getElementById('step-transit').classList.add('active');

      liveStatusBadge.textContent = 'Preparing';
      liveStatusBadge.style.background = 'rgba(245, 158, 11, 0.1)';
      liveStatusBadge.style.color = '#f59e0b';
      liveStatusTitle.textContent = 'Alex Rivera is packing your warm food!';
      liveStatusDesc.textContent = 'Our master chefs have prepared your customized ingredients inside the wok.';
      countdownTimer.textContent = '18 mins';
      stepperProgress.style.width = '45%';
      
      updateScooterMap(15);
      showToast('Wok sizzle! Chef is preparing your customized ingredients.', 'ph-chef-hat');
    }, 7000);

    // STAGE 3: Out for Delivery (Starts in 16 seconds)
    setTimeout(() => {
      currentStage = 3;
      setTimeForStep('time-transit');
      document.getElementById('step-transit').classList.remove('active');
      document.getElementById('step-transit').classList.add('completed');
      document.getElementById('step-delivered').classList.add('active');

      liveStatusBadge.textContent = 'On the Way';
      liveStatusBadge.style.background = 'rgba(255, 94, 58, 0.1)';
      liveStatusBadge.style.color = 'var(--primary)';
      liveStatusTitle.textContent = 'Alex Rivera is riding to your home!';
      liveStatusDesc.textContent = 'Our TVS Jupiter scooter rider is on his way to your home pin.';
      countdownTimer.textContent = '10 mins';
      stepperProgress.style.width = '75%';
      
      // Live Kitchen feed offline since food left kitchen
      kitchenCamOverlay?.classList.add('active');
      if (camStatusLabel) camStatusLabel.textContent = 'CAMERA OFFLINE';
      if (camRedDot) camRedDot.style.backgroundColor = 'var(--text-light)';

      showToast('Alex Rivera has picked up your order! Follow the route.', 'ph-moped');

      // Animate the scooter moving smoothly from 15% (restaurant) to 90% (near home) over 12 seconds
      let currentMapPercent = 15;
      scooterInterval = setInterval(() => {
        if (currentMapPercent < 90) {
          currentMapPercent += 0.5;
          updateScooterMap(currentMapPercent);
          
          // Countdown increments representation
          if (currentMapPercent >= 50 && currentMapPercent < 70) {
            countdownTimer.textContent = '6 mins';
          } else if (currentMapPercent >= 70) {
            countdownTimer.textContent = '2 mins';
          }
        } else {
          clearInterval(scooterInterval);
        }
      }, 100);

    }, 16000);

    // STAGE 4: Arrived at Doorstep (Starts in 32 seconds)
    setTimeout(() => {
      currentStage = 4;
      clearInterval(scooterInterval);
      setTimeForStep('time-delivered');
      
      document.getElementById('step-delivered').classList.remove('active');
      document.getElementById('step-delivered').classList.add('completed');

      liveStatusBadge.textContent = 'Delivered';
      liveStatusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
      liveStatusBadge.style.color = '#10b981';
      liveStatusTitle.textContent = 'Your order has been delivered successfully!';
      liveStatusDesc.textContent = 'Ring-dong! Alex Rivera is at your doorstep. Enjoy your piping hot meals!';
      countdownTimer.textContent = 'Arrived 🎉';
      stepperProgress.style.width = '100%';
      
      updateScooterMap(100);
      showToast('Ding Dong! Your delicious food has arrived.', 'ph-house-bold');
    }, 32000);

    // Interactive Driver Controls
    const callBtn = document.getElementById('call-driver-btn');
    const msgBtn = document.getElementById('message-driver-btn');

    callBtn?.addEventListener('click', () => {
      if (currentStage === 4) {
        showToast('Alex Rivera is at your gate. Open the door!', 'ph-check-circle');
      } else {
        showToast('Alex is driving right now. Driving safety is first!', 'ph-phone');
      }
    });

    msgBtn?.addEventListener('click', () => {
      if (currentStage === 4) {
        showToast('Courier Alex says: Food handed over. Enjoy your meals!', 'ph-chat-circle');
      } else if (currentStage === 3) {
        showToast('Rider Alex says: Driving near cross streets! Will reach in 2 mins.', 'ph-chat-circle');
      } else {
        showToast('Rider Alex says: I am waiting at the kitchen for your order.', 'ph-chat-circle');
      }
    });
  }

  // --- 10. Order History Receipts Dashboard Modal Handler ---
  const historyModal = document.getElementById('order-history-modal');
  const closeHistoryBtn = document.getElementById('close-history-modal');
  const historyItemsContainer = document.getElementById('history-items-container');

  function openOrderHistory(e) {
    if (e) e.preventDefault();
    
    // Load successfully completed orders
    const historyList = JSON.parse(localStorage.getItem('yummy_order_history')) || [];
    
    if (historyItemsContainer) {
      historyItemsContainer.innerHTML = '';
      if (historyList.length === 0) {
        historyItemsContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-light); padding: 4rem 0;">
            <i class="ph ph-receipt" style="font-size: 3.5rem; opacity: 0.3; margin-bottom: 1.25rem; display: block;"></i>
            <p style="font-size:1.1rem; font-weight:600;">You haven't ordered anything yet!</p>
            <p style="font-size:0.9rem; margin-top:0.25rem;">Order some warm food to compile your receipts.</p>
          </div>`;
      } else {
        historyList.forEach(order => {
          let itemsHTML = '';
          order.items.forEach(itm => {
            itemsHTML += `
              <div class="receipt-item-row">
                <span class="name">${itm.name} <strong style="color:var(--primary)">x${itm.quantity}</strong></span>
                <span class="price">$${(itm.price * itm.quantity).toFixed(2)}</span>
              </div>`;
          });

          const div = document.createElement('div');
          div.className = 'receipt-card';
          div.innerHTML = `
            <div class="receipt-header">
              <span class="receipt-id">${order.id}</span>
              <span class="receipt-date">${order.date}</span>
            </div>
            <div class="receipt-body">${itemsHTML}</div>
            <div class="receipt-footer">
              <span class="receipt-coupon-badge" style="display: ${order.coupon !== 'NONE' ? 'inline-block' : 'none'}">
                <i class="ph ph-ticket"></i> ${order.coupon}
              </span>
              <span class="receipt-total">Total: $${order.total}</span>
            </div>`;
          historyItemsContainer.appendChild(div);
        });
      }
    }

    historyModal?.classList.add('active');
  }

  function closeOrderHistory() {
    historyModal?.classList.remove('active');
  }

  // Bind Navbar History Triggers on all pages
  document.querySelectorAll('#nav-history-btn').forEach(btn => {
    btn.addEventListener('click', openOrderHistory);
  });

  if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', closeOrderHistory);
  if (historyModal) {
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) closeOrderHistory();
    });
  }

  // =========================================
  // --- 11. Settings Modal Controls & Accent Theme Customizer ---
  // =========================================
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsModalBtn = document.getElementById('close-settings-modal');

  function openSettings() {
    SoundSynth.playBlip();
    settingsModal?.classList.add('active');
  }

  function closeSettings() {
    settingsModal?.classList.remove('active');
  }

  settingsToggle?.addEventListener('click', openSettings);
  closeSettingsModalBtn?.addEventListener('click', closeSettings);
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettings();
    });
  }

  // Accent Theme Changer
  const accentMapping = {
    coral: { primary: '#ff5e3a', primaryDark: '#e24f2e' },
    mint: { primary: '#10b981', primaryDark: '#059669' },
    purple: { primary: '#8b5cf6', primaryDark: '#7c3aed' },
    teal: { primary: '#0ea5e9', primaryDark: '#0284c7' }
  };

  function applyThemeAccent(accentName) {
    const config = accentMapping[accentName];
    if (!config) return;
    
    // Set custom properties on document root
    document.documentElement.style.setProperty('--primary', config.primary);
    document.documentElement.style.setProperty('--primary-dark', config.primaryDark);
    
    // Update active visual state on dots in all settings panels (if present)
    document.querySelectorAll('.accent-dot').forEach(dot => {
      if (dot.dataset.accent === accentName) {
        dot.classList.add('active');
        dot.style.borderColor = 'var(--text-dark)';
      } else {
        dot.classList.remove('active');
        dot.style.borderColor = 'transparent';
      }
    });

    localStorage.setItem('yummy_accent', accentName);
  }

  // Bind accent selector clicks
  document.querySelectorAll('.accent-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const accent = e.currentTarget.dataset.accent;
      applyThemeAccent(accent);
      SoundSynth.playTriumph();
      showToast(`Accent theme updated to ${accent}!`, 'ph-palette');
    });
  });

  // Apply default/saved accent on load
  const savedAccent = localStorage.getItem('yummy_accent') || 'coral';
  applyThemeAccent(savedAccent);

  // Audio settings toggle handler
  const audioToggle = document.getElementById('sound-effects-toggle');
  const soundIcon = document.getElementById('sound-icon');
  
  if (audioToggle) {
    // Initial state
    const savedAudio = localStorage.getItem('yummy_audio') !== 'false';
    audioToggle.checked = savedAudio;
    if (soundIcon) soundIcon.className = savedAudio ? 'ph ph-speaker-high' : 'ph ph-speaker-slash';
    
    audioToggle.addEventListener('change', (e) => {
      const isEnabled = e.target.checked;
      localStorage.setItem('yummy_audio', isEnabled);
      if (soundIcon) soundIcon.className = isEnabled ? 'ph ph-speaker-high' : 'ph ph-speaker-slash';
      
      if (isEnabled) {
        SoundSynth.playBlip();
        showToast('Sound effects enabled!', 'ph-speaker-high');
      } else {
        showToast('Sound effects muted!', 'ph-speaker-slash');
      }
    });
  }

  // =========================================
  // --- 12. Voice-Guided Search (SpeechRecognition) ---
  // =========================================
  const voiceSearchBtn = document.getElementById('voice-search-btn');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    // Hide mic button if SpeechRecognition is not supported by user browser
    if (voiceSearchBtn) voiceSearchBtn.style.display = 'none';
  } else if (voiceSearchBtn) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isListening = false;

    voiceSearchBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
        return;
      }
      
      isListening = true;
      voiceSearchBtn.classList.add('listening');
      const searchInputEl = document.getElementById('search-input');
      if (searchInputEl) {
        searchInputEl.value = '';
        searchInputEl.placeholder = 'Listening... Speak now!';
      }
      SoundSynth.playBlip();
      recognition.start();
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const searchInputEl = document.getElementById('search-input');
      if (searchInputEl) {
        searchInputEl.value = transcript;
        searchInputEl.placeholder = 'Search for food...';
      }
      
      // Filter menu automatically
      if (typeof filterMenu === 'function') {
        filterMenu();
      }
      SoundSynth.playTriumph();
      showToast(`Searching for: "${transcript}"`, 'ph-microphone');
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      isListening = false;
      voiceSearchBtn.classList.remove('listening');
      const searchInputEl = document.getElementById('search-input');
      if (searchInputEl && searchInputEl.placeholder === 'Listening... Speak now!') {
        searchInputEl.placeholder = 'Search for food...';
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isListening = false;
      voiceSearchBtn.classList.remove('listening');
      const searchInputEl = document.getElementById('search-input');
      if (searchInputEl) searchInputEl.placeholder = 'Search for food...';
      showToast('Speech recognition failed. Try typing!', 'ph-x-circle');
    };
  }

  // =========================================
  // --- 13. 3D Credit Card Hover Parallax Tilt ---
  // =========================================
  const card3d = document.getElementById('credit-card-preview');
  if (card3d) {
    card3d.addEventListener('mousemove', (e) => {
      const rect = card3d.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element
      
      // Calculate rotation based on cursor position relative to center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = (centerY - y) / 10; // tilt up/down (rotateX)
      const tiltY = (x - centerX) / 15; // tilt left/right (rotateY)
      
      // Check if it's flipped to flip correctly
      if (card3d.classList.contains('flipped')) {
        card3d.style.transform = `rotateY(${180 + tiltY}deg) rotateX(${-tiltX}deg) scale(1.02)`;
      } else {
        card3d.style.transform = `rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale(1.02)`;
      }
    });

    card3d.addEventListener('mouseleave', () => {
      // Smoothly snap back to original orientation
      card3d.style.transition = 'transform 0.5s ease-out';
      if (card3d.classList.contains('flipped')) {
        card3d.style.transform = 'rotateY(180deg) scale(1)';
      } else {
        card3d.style.transform = 'rotateY(0deg) scale(1)';
      }
      // Remove transition after it's done so it doesn't lag mousemove
      setTimeout(() => {
        card3d.style.transition = '';
      }, 500);
    });
  }

  // =========================================
  // --- 14. Interactive Kitchen Cam angle switching ---
  // =========================================
  const camButtons = document.querySelectorAll('.cam-btn');
  const camFeedContainers = document.querySelectorAll('.cam-feed-container');
  const statusLabel = document.getElementById('cam-status-label');
  const infoBadge = document.getElementById('cam-info-badge');

  if (camButtons.length > 0) {
    camButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const camType = e.currentTarget.dataset.cam;
        
        // Update active class on buttons
        camButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Hide all feeds & show active one
        camFeedContainers.forEach(feed => {
          feed.style.display = 'none';
          feed.classList.remove('active-feed');
        });
        
        const activeFeed = document.getElementById(`feed-${camType}`);
        if (activeFeed) {
          activeFeed.style.display = camType === 'wok' ? 'block' : 'flex';
          activeFeed.classList.add('active-feed');
        }

        // Update titles & labels
        if (camType === 'wok') {
          if (statusLabel) statusLabel.textContent = 'LIVE CAMERA • STATION 4';
          if (infoBadge) infoBadge.textContent = 'WOK SPEED CAM';
          showToast('Viewing Wok camera feed', 'ph-video-camera');
        } else if (camType === 'chop') {
          if (statusLabel) statusLabel.textContent = 'LIVE CAMERA • STATION 1';
          if (infoBadge) infoBadge.textContent = 'CHOP BOARD CAM';
          showToast('Viewing Prep Chop Station', 'ph-video-camera');
        } else if (camType === 'pack') {
          if (statusLabel) statusLabel.textContent = 'LIVE CAMERA • STATION 7';
          if (infoBadge) infoBadge.textContent = 'PACK DESK CAM';
          showToast('Viewing Packaging Desk', 'ph-video-camera');
        }

        SoundSynth.playBlip();
      });
    });
  }
});
