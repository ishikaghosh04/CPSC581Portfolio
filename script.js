(() => {
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
  const sparklePositions = [
    [14, 20, -12, -15], [85, 17, 12, -14], [8, 48, -15, 0],
    [91, 48, 15, 0], [16, 78, -12, 14], [84, 80, 12, 15],
    [31, 8, -5, -14], [69, 9, 6, -14], [7, 67, -14, 9],
    [93, 67, 14, 9]
  ];
  const ingredientButtons = [...document.querySelectorAll(".ingredient-button")];
  const drinkImage = document.getElementById("drink-image");
  const cupArt = document.getElementById("cup-art");
  const drinkLabel = document.getElementById("drink-label");
  const sparkleLayer = document.querySelector(".sparkle-burst");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const bounceTimers = new WeakMap();
  let selectedTea = null;
  let hasBoba = false;
  let currentDrinkKey = null;

  Object.values(cupStates).forEach(({ src }) => {
    const image = new Image();
    image.src = src;
  });

  function getDrinkKey() {
    if (!selectedTea) {
      return hasBoba ? "emptyBoba" : "empty";
    }
    return hasBoba ? `${selectedTea}Boba` : selectedTea;
  }

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

  function renderDrink(animate = true) {
    const drinkKey = getDrinkKey();
    const drink = cupStates[drinkKey];
    const stateChanged = currentDrinkKey !== null && drinkKey !== currentDrinkKey;
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

    ingredientButtons.forEach((button) => {
      const ingredient = button.dataset.ingredient;
      const selected = ingredient === "boba" ? hasBoba : selectedTea === ingredient;
      button.setAttribute("aria-pressed", String(selected));
    });

    if (animate && stateChanged) {
      cupArt.classList.remove("is-changing");
      void cupArt.offsetWidth;
      cupArt.classList.add("is-changing");
      playSparkleBurst();
    }
    currentDrinkKey = drinkKey;
  }

  ingredientButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const ingredient = button.dataset.ingredient;
      if (ingredient === "boba") {
        hasBoba = !hasBoba;
      } else {
        selectedTea = selectedTea === ingredient ? null : ingredient;
      }

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

  renderDrink(false);

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

  function scheduleScrollUpdate() {
    if (!updatePending) {
      updatePending = true;
      requestAnimationFrame(updateScrollIndicator);
    }
  }

  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
  window.addEventListener("load", scheduleScrollUpdate);
  new ResizeObserver(scheduleScrollUpdate).observe(document.body);
  updateScrollIndicator();
})();
(() => {
  const leafImages = [
    "assets/leaves/leaf-moss.png",
    "assets/leaves/leaf-olive.png",
    "assets/leaves/leaf-sage.png",
    "assets/leaves/leaf-amber.png",
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const random = (min, max) => min + Math.random() * (max - min);

  let lastSpawn = -Infinity;
  let lastX = -Infinity;
  let lastY = -Infinity;

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || reducedMotion.matches) return;

    const { clientX: x, clientY: y, timeStamp } = event;
    if (timeStamp - lastSpawn < 160) return;
    if (Math.hypot(x - lastX, y - lastY) < 20) return;

    lastSpawn = timeStamp;
    lastX = x;
    lastY = y;

    const leaf = document.createElement("img");
    leaf.className = "cursor-leaf";
    leaf.src = leafImages[Math.floor(Math.random() * leafImages.length)];
    leaf.alt = "";
    leaf.draggable = false;
    leaf.style.left = `${x}px`;
    leaf.style.top = `${y}px`;
    leaf.style.width = `${random(14, 25)}px`;
    document.body.append(leaf);

    const drift = random(50, 110) * (Math.random() < 0.5 ? -1 : 1);
    const fall = random(140, 230);
    const tilt = random(-45, 45);

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

    flight.finished.then(() => leaf.remove(), () => leaf.remove());
  }, { passive: true });
})();