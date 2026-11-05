(() => {
  const drinkStates = {
    empty: {
      src: "assets/drink-menu/Empty_watercolor_cup_with_brown_straw-2-removebg-preview.png",
      alt: "Empty cup"
    },
    emptyBoba: {
      src: "assets/drink-menu/Empty_glass_with_boba_and_straw-1-removebg-preview.png",
      alt: "Empty cup with boba pearls"
    },
    matcha: {
      src: "assets/drink-menu/Watercolor_Iced_Matcha_with_Straw-1-removebg-preview.png",
      alt: "Iced matcha"
    },
    matchaBoba: {
      src: "assets/drink-menu/Watercolor_iced_matcha_with_boba-2-removebg-preview.png",
      alt: "Iced matcha with boba pearls"
    },
    blackTea: {
      src: "assets/drink-menu/Hand-painted_iced_black_tea-3-removebg-preview.png",
      alt: "Iced black tea"
    },
    blackTeaBoba: {
      src: "assets/drink-menu/Watercolor_Iced_Black_Tea_with_Boba-3-removebg-preview.png",
      alt: "Iced black tea with boba pearls"
    },
    brownSugar: {
      src: "assets/drink-menu/Watercolor_Dirty_Brown_Sugar_Milk_Tea-2-removebg-preview.png",
      alt: "Brown sugar milk tea"
    },
    brownSugarBoba: {
      src: "assets/drink-menu/Iced_brown_sugar_boba_milk_tea-1-removebg-preview.png",
      alt: "Brown sugar milk tea with boba pearls"
    }
  };
  const recipes = {
    "matcha:false": { label: "Visit Project 1", heading: "project-title" },
    "blackTea:true": { label: "Visit Project 2", heading: "project-two-title" },
    "brownSugar:true": { label: "Visit Design Philosophy", heading: "philosophy-title" }
  };
  const ingredientButtons = [...document.querySelectorAll(".ingredient-button")];
  const drinkImage = document.getElementById("drink-image");
  const recipeLink = document.getElementById("recipe-link");
  const hero = document.querySelector(".hero");
  const sceneImage = document.querySelector(".hero-scene");
  const sceneButtons = [...document.querySelectorAll(".scene-button")];
  const helpTrigger = document.querySelector(".ishika-help-trigger");
  const helpDialog = document.getElementById("ishika-help");
  const helpClose = document.querySelector(".ishika-help-close");
  const leafLayer = document.querySelector(".leaf-layer");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let selectedTea = null;
  let hasBoba = false;

  function renderDrink() {
    const drinkKey = selectedTea
      ? `${selectedTea}${hasBoba ? "Boba" : ""}`
      : hasBoba ? "emptyBoba" : "empty";
    const drink = drinkStates[drinkKey];
    const recipe = recipes[`${selectedTea}:${hasBoba}`];

    drinkImage.src = drink.src;
    drinkImage.alt = drink.alt;
    ingredientButtons.forEach((button) => {
      const selected = button.dataset.ingredient === "boba"
        ? hasBoba
        : button.dataset.ingredient === selectedTea;
      button.setAttribute("aria-pressed", String(selected));
    });

    recipeLink.hidden = !recipe;
    if (recipe) {
      recipeLink.textContent = recipe.label;
      recipeLink.dataset.heading = recipe.heading;
    } else {
      delete recipeLink.dataset.heading;
    }
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
    });
  });

  recipeLink.addEventListener("click", () => {
    const heading = document.getElementById(recipeLink.dataset.heading);
    if (!heading) {
      throw new Error(`Missing recipe destination heading: ${recipeLink.dataset.heading}`);
    }

    heading.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    heading.focus({ preventScroll: true });
  });

  const scenes = {
    morning: {
      src: "assets/Ishika%20Store%20Front%20Img2.png",
      alt: "Pixel-art morning scene of Ishika’s Boba Tea Store, with the shop sign and characters outside."
    },
    evening: {
      src: "assets/Ishika%20Store%20Front%20Img1.png",
      alt: "Pixel-art evening scene of Ishika’s Boba Tea Store, with the shop sign and characters outside."
    }
  };

  sceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sceneName = button.dataset.scene;
      const scene = scenes[sceneName];
      hero.dataset.scene = sceneName;
      sceneImage.src = scene.src;
      sceneImage.alt = scene.alt;
      sceneButtons.forEach((sceneButton) => {
        sceneButton.setAttribute(
          "aria-pressed",
          String(sceneButton.dataset.scene === sceneName)
        );
      });
    });
  });

  function closeHelp(returnFocus = true) {
    helpDialog.hidden = true;
    helpTrigger.setAttribute("aria-expanded", "false");
    if (returnFocus) {
      helpTrigger.focus();
    }
  }

  helpTrigger.addEventListener("click", () => {
    const isOpen = helpTrigger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeHelp();
      return;
    }

    helpDialog.hidden = false;
    helpTrigger.setAttribute("aria-expanded", "true");
    helpClose.focus();
  });

  helpClose.addEventListener("click", () => closeHelp());

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !helpDialog.hidden) {
      closeHelp();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!helpDialog.hidden
      && !helpDialog.contains(event.target)
      && !helpTrigger.contains(event.target)) {
      closeHelp(false);
    }
  });

  const leafAssets = [
    "assets/leaves/leaf-amber.png",
    "assets/leaves/leaf-moss.png",
    "assets/leaves/leaf-olive.png",
    "assets/leaves/leaf-sage.png"
  ];
  let nextLeafAt = 0;

  function releaseLeaf() {
    const leaf = document.createElement("img");
    const drift = Math.round(Math.random() * 150 - 75);
    const rotation = Math.round(Math.random() * 300 - 150);
    const duration = (3 + Math.random() * 2.5).toFixed(2);
    leaf.className = "drifting-leaf";
    leaf.src = leafAssets[Math.floor(Math.random() * leafAssets.length)];
    leaf.alt = "";
    leaf.style.setProperty("--leaf-left", `${10 + Math.random() * 80}%`);
    leaf.style.setProperty("--leaf-top", `${Math.random() * 19}%`);
    leaf.style.setProperty("--leaf-drift-x", `${drift}px`);
    leaf.style.setProperty("--leaf-rotation", `${rotation}deg`);
    leaf.style.setProperty("--leaf-duration", `${duration}s`);
    leaf.addEventListener("animationend", () => leaf.remove(), { once: true });
    leafLayer.append(leaf);
  }

  const stage = document.querySelector(".storefront-stage");
  stage.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || reducedMotion.matches || !finePointer.matches) {
      return;
    }

    const now = performance.now();
    if (now >= nextLeafAt) {
      releaseLeaf();
      nextLeafAt = now + 2800 + Math.random() * 3800;
    }
  });
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      leafLayer.replaceChildren();
    }
  });

  renderDrink();
})();
