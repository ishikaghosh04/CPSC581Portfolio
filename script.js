(() => {
  // Each key describes a possible cup image, its accessible text, label, and artwork bounds.
  const cupStates = {
    empty: {
      src: "assets/drink-menu/Empty_watercolor_cup_with_brown_straw-2-removebg-preview.png",
      alt: "Empty watercolor cup with a brown straw",
      label: "Your empty cup",
      bounds: [82, 168, 290, 516]
    },
    emptyBoba: {
      src: "assets/drink-menu/Empty_glass_with_boba_and_straw-1-removebg-preview.png",
      alt: "Empty watercolor cup with a brown straw and boba pearls",
      label: "Empty cup with boba",
      bounds: [96, 198, 278, 516]
    },
    matcha: {
      src: "assets/drink-menu/Watercolor_Iced_Matcha_with_Straw-1-removebg-preview.png",
      alt: "Watercolor iced matcha with a brown straw",
      label: "Iced Matcha",
      bounds: [94, 192, 276, 506]
    },
    matchaBoba: {
      src: "assets/drink-menu/Watercolor_iced_matcha_with_boba-2-removebg-preview.png",
      alt: "Watercolor iced matcha with a brown straw and boba pearls",
      label: "Iced Matcha with Boba",
      bounds: [94, 216, 276, 532]
    },
    brownSugar: {
      src: "assets/drink-menu/Watercolor_Dirty_Brown_Sugar_Milk_Tea-2-removebg-preview.png",
      alt: "Watercolor brown sugar milk tea with a brown straw",
      label: "Brown Sugar Milk Tea",
      bounds: [80, 154, 296, 530]
    },
    brownSugarBoba: {
      src: "assets/drink-menu/Iced_brown_sugar_boba_milk_tea-1-removebg-preview.png",
      alt: "Watercolor brown sugar milk tea with a brown straw and boba pearls",
      label: "Brown Sugar Milk Tea with Boba",
      bounds: [92, 188, 284, 520]
    },
    blackTea: {
      src: "assets/drink-menu/Hand-painted_iced_black_tea-3-removebg-preview.png",
      alt: "Hand-painted iced black tea with a brown straw",
      label: "Iced Black Tea",
      bounds: [86, 160, 288, 510]
    },
    blackTeaBoba: {
      src: "assets/drink-menu/Watercolor_Iced_Black_Tea_with_Boba-3-removebg-preview.png",
      alt: "Watercolor iced black tea with a brown straw and boba pearls",
      label: "Iced Black Tea with Boba",
      bounds: [92, 182, 282, 506]
    }
  };
  const recipes = {
    "matcha:false": { label: "Visit Project 1", href: "#project-one" },
    "blackTea:true": { label: "Visit Project 2", href: "#project-two" },
    "brownSugar:true": { label: "Visit Design Philosophy", href: "#philosophy" }
  };
  // Percent positions and pixel offsets spread the sparkle animation around the cup.
  const sparklePositions = [
    [14, 20, -12, -15], [85, 17, 12, -14], [8, 48, -15, 0],
    [91, 48, 15, 0], [16, 78, -12, 14], [84, 80, 12, 15],
    [31, 8, -5, -14], [69, 9, 6, -14], [7, 67, -14, 9],
    [93, 67, 14, 9]
  ];
  // Cache the controls and display elements that are updated when a drink choice changes.
  const ingredientButtons = [...document.querySelectorAll(".ingredient-button")];
  const drinkImage = document.getElementById("drink-image");
  const cupArt = document.getElementById("cup-art");
  const drinkLabel = document.getElementById("drink-label");
  const recipeLink = document.getElementById("recipe-link");
  const recipeLinkLabel = recipeLink.querySelector(".recipe-link-label");
  const sparkleLayer = document.querySelector(".sparkle-burst");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Remember each button's bounce timer so a quick second click can restart its animation.
  const bounceTimers = new WeakMap();
  // These values hold the current tea, boba choice, and last rendered drink combination.
  let selectedTea = null;
  let hasBoba = false;
  let currentDrinkKey = null;

  // Preload all cup artwork so switching ingredients does not wait for each image to download.
  Object.values(cupStates).forEach(({ src }) => {
    const image = new Image();
    image.src = src;
  });

  // Choose the image key from the selected tea and whether boba is currently enabled.
  function getDrinkKey() {
    if (!selectedTea) {
      return hasBoba ? "emptyBoba" : "empty";
    }
    return hasBoba ? `${selectedTea}Boba` : selectedTea;
  }

  // Create a short burst of stars unless the visitor has requested reduced motion.
  function playSparkleBurst() {
    if (reducedMotion.matches) {
      return;
    }

    sparklePositions.forEach(([left, top, x, y], index) => {
      const star = document.createElement("span");
      star.className = "sparkle-star";
      star.textContent = "★";
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.style.setProperty("--sparkle-x", `${x}px`);
      star.style.setProperty("--sparkle-y", `${y}px`);
      star.style.animationDelay = `${(index % 3) * 25}ms`;
      sparkleLayer.append(star);
      window.setTimeout(() => star.remove(), 700);
    });
  }

  // Update the cup image, align its artwork, label the drink, and sync button accessibility state.
  function renderDrink(animate = true) {
    const drinkKey = getDrinkKey();
    const drink = cupStates[drinkKey];
    const recipe = recipes[`${selectedTea}:${hasBoba}`];
    const stateChanged = currentDrinkKey !== null && drinkKey !== currentDrinkKey;
    // Scale and offset transparent image bounds so different cup files share the same position.
    const [left, top, right, bottom] = drink.bounds;
    const scale = 376 / (bottom - top);
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    drinkImage.alt = drink.alt;
    drinkLabel.textContent = drink.label;
    drinkImage.style.setProperty(
      "--cup-offset-x",
      `${-((centerX - 187.5) / 375) * scale * 100}%`
    );
    drinkImage.style.setProperty(
      "--cup-offset-y",
      `${-((centerY - 333) / 666) * scale * 100}%`
    );
    drinkImage.style.setProperty("--cup-scale", scale.toFixed(4));
    if (drinkImage.getAttribute("src") !== drink.src) {
      drinkImage.src = drink.src;
    }

    recipeLink.hidden = !recipe;
    if (recipe) {
      recipeLinkLabel.textContent = recipe.label;
      recipeLink.href = recipe.href;
    } else {
      recipeLink.removeAttribute("href");
    }

    // Keep aria-pressed in sync so assistive technology can tell which ingredients are active.
    ingredientButtons.forEach((button) => {
      const ingredient = button.dataset.ingredient;
      const selected = ingredient === "boba" ? hasBoba : selectedTea === ingredient;
      button.setAttribute("aria-pressed", String(selected));
    });

    // Only animate after a real selection change; this also triggers the sparkle burst.
    if (animate && stateChanged) {
      cupArt.classList.remove("is-changing");
      void cupArt.offsetWidth;
      cupArt.classList.add("is-changing");
      playSparkleBurst();
    }
    currentDrinkKey = drinkKey;
  }

  // Clicking a tea selects or clears it; clicking boba switches only the boba state.
  ingredientButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const ingredient = button.dataset.ingredient;
      if (ingredient === "boba") {
        hasBoba = !hasBoba;
      } else {
        selectedTea = selectedTea === ingredient ? null : ingredient;
      }

      // Render the matching cup image, then restart the clicked button's bounce animation.
      renderDrink();

      window.clearTimeout(bounceTimers.get(button));
      button.classList.remove("is-bouncing");
      void button.offsetWidth;
      button.classList.add("is-bouncing");
      bounceTimers.set(button, window.setTimeout(() => {
        button.classList.remove("is-bouncing");
      }, 460));
    });
  });

  // Show the initial empty cup without playing a change animation on page load.
  renderDrink(false);

  // Fill the decorative matcha glass as the visitor moves down the page.
  const liquid = document.getElementById("matcha-liquid");
  let updatePending = false;

  function updateScrollIndicator() {
    const page = document.scrollingElement || document.documentElement;
    const scrollableHeight = page.scrollHeight - page.clientHeight;
    const progress = scrollableHeight > 0
      ? Math.min(1, Math.max(0, page.scrollTop / scrollableHeight))
      : 0;

    liquid.style.height = `${(1 - progress) * 100}%`;
    updatePending = false;
  }

  // Use one animation-frame update for rapid scroll events to avoid doing repeated layout work.
  function scheduleScrollUpdate() {
    if (!updatePending) {
      updatePending = true;
      requestAnimationFrame(updateScrollIndicator);
    }
  }

  // Recalculate progress when scrolling, resizing, loading assets, or changing page dimensions.
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
  window.addEventListener("load", scheduleScrollUpdate);
  new ResizeObserver(scheduleScrollUpdate).observe(document.body);
  updateScrollIndicator();
})();
(() => {
  // These image paths are the leaves randomly used for the mouse-trail effect.
  const leafImages = [
    "assets/leaves/leaf-moss.png",
    "assets/leaves/leaf-olive.png",
    "assets/leaves/leaf-sage.png",
    "assets/leaves/leaf-amber.png",
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Return a random value between the supplied minimum and maximum.
  const random = (min, max) => min + Math.random() * (max - min);

  // Track recent pointer positions so leaves appear at spaced intervals, not on every tiny move.
  let lastSpawn = -Infinity;
  let lastX = -Infinity;
  let lastY = -Infinity;

  // Spawn and animate decorative leaves for mouse movement, but skip touch and reduced-motion users.
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || reducedMotion.matches) return;

    const { clientX: x, clientY: y, timeStamp } = event;
    if (timeStamp - lastSpawn < 160) return;
    if (Math.hypot(x - lastX, y - lastY) < 20) return;

    lastSpawn = timeStamp;
    lastX = x;
    lastY = y;

    // Position an accessible decorative image at the pointer; its empty alt keeps it out of speech.
    const leaf = document.createElement("img");
    leaf.className = "cursor-leaf";
    leaf.src = leafImages[Math.floor(Math.random() * leafImages.length)];
    leaf.alt = "";
    leaf.draggable = false;
    leaf.style.left = `${x}px`;
    leaf.style.top = `${y}px`;
    leaf.style.width = `${random(14, 25)}px`;
    document.body.append(leaf);

    // Randomize the leaf's fall direction, distance, tilt, and duration for a natural trail.
    const drift = random(50, 110) * (Math.random() < 0.5 ? -1 : 1);
    const fall = random(140, 230);
    const tilt = random(-45, 45);

    // Keyframes fade each leaf in, drift it down the screen, and fade it out.
    const flight = leaf.animate(
      [
        { transform: `translate(0, 0) rotate(${tilt}deg)`, opacity: 0 },
        { transform: `translate(${drift * 0.3}px, ${fall * 0.15}px) rotate(${tilt + 45}deg)`, opacity: 0.9, offset: 0.2 },
        { transform: `translate(${drift * 0.1}px, ${fall * 0.5}px) rotate(${tilt - 25}deg)`, opacity: 0.85, offset: 0.5 },
        { transform: `translate(${drift * 0.8}px, ${fall * 0.8}px) rotate(${tilt + 95}deg)`, opacity: 0.6, offset: 0.8 },
        { transform: `translate(${drift}px, ${fall}px) rotate(${tilt + 170}deg)`, opacity: 0 },
      ],
      { duration: random(2500, 3500), easing: "ease-in-out" }
    );

    // Remove the leaf whether its animation finishes normally or is canceled.
    flight.finished.then(() => leaf.remove(), () => leaf.remove());
  }, { passive: true });
})();
(() => {
  // Preload the evening storefront; the scene timer starts only after the image is ready.
  const hero = document.getElementById("home");
  const eveningScene = new Image();

  eveningScene.addEventListener("load", () => {
    // Switch between the morning and evening background every ten seconds.
    window.setInterval(() => {
      hero.classList.toggle("is-evening");
    }, 10_000);
  }, { once: true });

  eveningScene.src = "assets/store-front/evening-image.png";
})();