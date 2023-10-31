/**
 * @fileoverview This file defines the SiteTour prototype constructor and its methods.
 * @author Ashwin Balaji S
 * @created 2023-10-19
 */

"use strict";

/**
 * Represents a JsonHandler object.
 * @constructor
 */
const JsonHandler = function () {
  this.path;
};

// Prototype method to fetch JSON data
JsonHandler.prototype.fetch = async function (path) {
  // This method fetches JSON data from the specified path.
  this.path = path;
  try {
    const jsonResponse = await fetch(this.path);

    if (!jsonResponse.ok)
      throw new Error("Error occurred while fetching JSON!");

    const data = await jsonResponse.json();

    return data;
  } catch (error) {
    console.log(error.message);
  }
};

/**
 * Represents a OverlayMask object.
 * @constructor
 */
const OverlayMask = function () {
  this.element;
  this.elementPosition;
  this.bodyEl = document.getElementsByTagName("body")[0];
  this.gap = 5;
};


// Method to set the theme color of the overlay mask
OverlayMask.prototype.setTheme = function (maskColor) {
  const root_theme = document.querySelector(":root");
  root_theme.style.setProperty("--maskColor", maskColor);
};

// Method to add an overlay backdrop to a specified element
OverlayMask.prototype.addBackdrop = function (elementId) {
  this.element = document.getElementById(elementId);
  if (!this.element) throw new Error("Element not found");
  this.elementPosition = this.element.getBoundingClientRect();

  !document.getElementById("tour--backdrop-container") &&
    this._insertBackdropMarkup();

  this.parentEl = document.getElementById("tour--backdrop-container");

  // Methods for adding left, top, right, and bottom overlays
  this._addLeftOverlay();
  this._addTopOverlay();
  this._addRightOverlay();
  this._addBottomOverlay();
};

// Method to show the overlay backdrop
OverlayMask.prototype.showBackdrop = function () {
  document.getElementById("tour--backdrop-container").classList.add("show");
};

// Method to remove the overlay backdrop
OverlayMask.prototype.removeBackdrop = function () {
  document.getElementById("tour--backdrop-container").classList.remove("show");
};

// Private method to add a left overlay
OverlayMask.prototype._addLeftOverlay = function () {
  const leftOverlayEl = this.parentEl.querySelector("#tour--backdrop-left");
  const styles = {
    width: `${this.elementPosition.left - this.gap}px`,
    height: "100vh",
    top: 0,
    left: 0,
  };

  Object.assign(leftOverlayEl.style, styles);
};

// Private method to add a right overlay
OverlayMask.prototype._addRightOverlay = function () {
  const rightOverlayEl = this.parentEl.querySelector("#tour--backdrop-right");
  const styles = {
    width: `${window.innerWidth - (this.elementPosition.right + this.gap)}px`,
    height: "100vh",
    top: 0,
    right: 0,
  };

  Object.assign(rightOverlayEl.style, styles);
};

// Private method to add a top overlay
OverlayMask.prototype._addTopOverlay = function () {
  const topOverlayEl = this.parentEl.querySelector("#tour--backdrop-top");
  const styles = {
    width: `${this.elementPosition.width + 2 * this.gap}px`,
    height: `${this.elementPosition.top - this.gap}px`,
    top: 0,
    left: `${this.elementPosition.left - this.gap}px`,
  };

  Object.assign(topOverlayEl.style, styles);
};

// Private method to add a bottom overlay
OverlayMask.prototype._addBottomOverlay = function () {
  const rightOverlayEl = this.parentEl.querySelector("#tour--backdrop-bottom");

  const styles = {
    width: `${this.elementPosition.width + 2 * this.gap}px`,
    height: `${
      window.innerHeight - (this.elementPosition.bottom + this.gap)
    }px`,
    bottom: 0,
    left: `${this.elementPosition.left - this.gap}px`,
  };

  Object.assign(rightOverlayEl.style, styles);
};

// Method to add a highlighter (currently not implemented)
OverlayMask.prototype.addHighlighter = function () {
  const highlighterEl = this.parentEl.querySelector(
    "tour--backdrop-highlighter"
  );

  const styles = {
    width: `${this.elementPosition.width + 2 * this.gap}px`,
    height: `${
      window.innerHeight - (this.elementPosition.bottom + this.gap)
    }px`,
    bottom: 0,
    left: `${this.elementPosition.left - this.gap}px`,
  };
};

// Private method to insert the backdrop markup
OverlayMask.prototype._insertBackdropMarkup = function () {
  const markup = `
      <div id="tour--backdrop-container" class="show">
        <div id="tour--backdrop-left"></div>
        <div id="tour--backdrop-top"></div>
        <div id="tour--backdrop-right"></div>
        <div id="tour--backdrop-bottom"></div>
        <div id="tour--backdrop-highlighter"></div>
      </div>
    `;

  this.bodyEl.insertAdjacentHTML("beforeend", markup);
};

/**
 * Represents a SiteTour object.
 * @constructor
 */
const SiteTour = function () {
  this.began = false;
  this.bodyEl = document.getElementsByTagName("body")[0];
  this.jsonData;
  this.parentEl;
  this.activeElJsonData;
  this.activeEl;
  this.overlayMaskinstance;
  this.firstElId;
  this.lastElId;
  this.themeChangerEl;
};

// Method to enable the site tour
SiteTour.prototype.enableTour = function () {
  this.disableScroll();
  this.setTheme();
  this.enableThemeChanger();
  this.showWelcomeModal();
};

// Method to show the welcome modal
SiteTour.prototype.showWelcomeModal = function () {
  const modalContent = this.jsonData.welcomeModalContent;
  const markup = `
      <tour-modal id="tour--welcome-modal" class="modal modal-top-center show">
        <div class="modal-content">
          <header class="modal-header">
            <h2 class="modal-title">${modalContent.title}</h2>
          </header>
          <main class="modal-body">
            <p>${modalContent.body}</p>
          </main>
          <footer class="modal-footer">
            <button type="button" id="tour--skip-btn" class="">
              Skip
            </button>
            <button type="button" id="tour--start-btn" class="">Start</button>
          </footer>
        </div>
      </tour-modal>
  `;

  this.bodyEl.insertAdjacentHTML("beforeend", markup);

  this.parentEl = document.getElementById("tour--welcome-modal");

  const skipBtnEl = this.parentEl.querySelector(
    "#tour--welcome-modal #tour--skip-btn"
  );
  const startBtnEl = this.parentEl.querySelector(
    "#tour--welcome-modal #tour--start-btn"
  );

  startBtnEl.focus();

  startBtnEl.addEventListener("click", this.startTour.bind(this));
  skipBtnEl.addEventListener("click", this.closeWelcomeModal.bind(this));
};

// Method to start the site tour
SiteTour.prototype.startTour = async function () {
  this.began = true;
  this.closeWelcomeModal();
  tourEl.style.display = "none";

  this.traverseInstance = this.traverse();

  this.overlayMaskinstance = new OverlayMask();

  await this.next();

  if (!this.isElementInViewPort(this.activeElJsonData.id)) {
    await this.scrollToElement(this.activeElJsonData.id);
    this.showDescription();
  } else {
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.showDescription();
  }
};


// Method to end the site tour
SiteTour.prototype.endTour = function () {
  this.began = false;
  document.getElementById("tour--backdrop-container").remove();
  document.getElementById("tour--description-modal").remove();
  document.getElementById("tour--theme-changer").remove();

  tourEl.style.display = "block";

  !this.began && this.enableScroll();
};

// Displays the description modal for the current tour element.
SiteTour.prototype.showDescription = function () {
  this.overlayMaskinstance.setTheme(this.activeElJsonData.maskColor);

  this.overlayMaskinstance.addBackdrop(this.activeElJsonData.id);

  this.showDescriptionModal();
};

// Displays the description modal for the current tour element.
SiteTour.prototype.showDescriptionModal = function () {
  const content = this.activeElJsonData.content;
  const markup = `
    <description-modal id="tour--description-modal" class="modal">
      <div class="modal-content">
        <span id="tour--close-modal" class="close">
        <span class="material-symbols-outlined">
        close
        </span>
        </span>
        <header class="modal-header">
          <h2 class="modal-title" >${content.title}</h2>
        </header>
        <main class="modal-body">
          <p class='modal-description'>${content.description}</p>
        </main>
        <footer class="modal-footer">
          <button type="button" id="tour--prev-btn">
            Prev
          </button>
          <button type="button" id="tour--next-btn">Next</button>
          <button type="button" id="tour--end-btn">End Tour</button>
        </footer>
      </div>
      <div id="tour--triangle-clippath"></div>
    </description-modal>`;

  this.bodyEl.insertAdjacentHTML("beforeend", markup);

  this.parentEl = document.getElementById("tour--description-modal");

  const prevBtnEl = this.parentEl.querySelector(
    "#tour--description-modal #tour--prev-btn"
  );
  const nextBtnEl = this.parentEl.querySelector(
    "#tour--description-modal #tour--next-btn"
  );

  const tourEndBtn = this.parentEl.querySelector(
    "#tour--description-modal #tour--end-btn"
  );

  prevBtnEl.addEventListener("click", this.previous.bind(this));
  nextBtnEl.addEventListener("click", this.next.bind(this));
  tourEndBtn.addEventListener("click", this.endTour.bind(this));

  const closeModal = this.parentEl.querySelector(
    "#tour--description-modal #tour--close-modal"
  );

  closeModal.addEventListener("click", this.endTour.bind(this));

  document.addEventListener("keydown", (event) => {
    if (event.code === "Tab") {
      event.preventDefault(); // disable focus

      if (this.activeElJsonData.id !== this.firstElId && event.shiftKey) {
        // shift + tab
        prevBtnEl.click();
      } else if (
        this.activeElJsonData.id !== this.lastElId &&
        !event.shiftKey
      ) {
        // Tab
        nextBtnEl.click();
      }
    }
  });
  this.toggleTraverseButtons();
  this.positionDescriptionModal();
};

// Positions the clip path for the description modal.
SiteTour.prototype.positionModalClippath = function (position) {
  const clippathEl = document.getElementById("tour--triangle-clippath");
  const modalRect = this.parentEl.getBoundingClientRect();
  const clippathSize = 7;
  const left = 7;
  let styles;
  switch (position) {
    case "right":
      styles = {
        top: `9px`,
        left: `-${left}px`,
        "border-left": `none`,
        "border-right": `${clippathSize}px solid var(--theme)`,
        "border-top": `${clippathSize}px solid transparent`,
        "border-bottom": `${clippathSize}px solid transparent`,
      };
      break;
    case "left":
      styles = {
        top: `9px`,
        left: `${modalRect.width}px`,
        "border-left": `${clippathSize}px solid var(--theme)`,
        "border-right": `none`,
        "border-top": `${clippathSize}px solid transparent`,
        "border-bottom": `${clippathSize}px solid transparent`,
      };
      break;
    case "bottom":
      styles = {
        top: `-5px`,
        left: `${modalRect.width / 2 - clippathSize}px`,
        "border-left": `${clippathSize}px solid transparent`,
        "border-right": `${clippathSize}px solid transparent`,
        "border-top": `none`,
        "border-bottom": `${clippathSize}px solid var(--theme)`,
      };
      break;
    case "top":
      styles = {
        top: `${modalRect.height}px`,
        left: `${modalRect.width / 2 - clippathSize}px`,
        "border-left": `${clippathSize}px solid transparent`,
        "border-right": `${clippathSize}px solid transparent`,
        "border-top": `${clippathSize}px solid var(--theme)`,
        "border-bottom": `none`,
      };
      break;
    default:
      throw new Error(
        `${this.activeElJsonData.id}'s modal content is larger than available screen size`
      );
  }

  Object.assign(clippathEl.style, styles);
};

// Positions the description modal relative to the tour element.
SiteTour.prototype.positionDescriptionModal = function () {
  const elementRect = this.activeEl.getBoundingClientRect();
  const modalRect = this.parentEl.getBoundingClientRect();
  const position = this.findModalPosition(elementRect, modalRect);
  this.positionModalClippath(position);
  const backdropGap = 5; //gap between element and each backdrop
  const middleGap = 20; //gap btw element and modal
  let styles;
  switch (position) {
    case "right":
      styles = {
        left: `${elementRect.right + middleGap}px`,
        top: `${elementRect.top - backdropGap}px`,
      };

      break;
    case "left":
      styles = {
        left: `${elementRect.left - (modalRect.width + middleGap)}px`,
        top: `${elementRect.top - backdropGap}px`,
      };

      break;
    case "bottom":
      styles = {
        left: `${
          elementRect.left - (modalRect.width / 2 - elementRect.width / 2)
        }px`,
        top: `${elementRect.bottom + middleGap}px`,
      };

      break;
    case "top":
      styles = {
        left: `${
          elementRect.left - (modalRect.width / 2 - elementRect.width / 2)
        }px`,
        top: `${elementRect.top - (modalRect.height + middleGap)}px`,
      };

      break;
    default:
      throw new Error(
        `${this.activeElJsonData.id}'s modal content is larger than available screen size`
      );
  }
  Object.assign(this.parentEl.style, styles);
  this.parentEl.classList.add("show");
  this.enableThemeChanger();
};

/**
 * Determines the best position for displaying the description modal relative to the tour element based on available space.
 */
SiteTour.prototype.findModalPosition = function (elementRect, modalRect) {
  // Algorithm can be found in algorithm.txt
  // Check RIGHT
  if (
    window.innerWidth - elementRect.right > modalRect.width &&
    window.innerHeight - elementRect.top > modalRect.height
  ) {
    return "right";
  }

  // Check LEFT
  if (
    elementRect.left > modalRect.width &&
    window.innerHeight - elementRect.top > modalRect.height
  ) {
    return "left";
  }

  // Check BOTTOM
  if (
    window.innerHeight - elementRect.bottom - elementRect.bottom >
      modalRect.height &&
    elementRect.left > modalRect.width / 2 - elementRect.width / 2 &&
    window.innerWidth - elementRect.right >
      modalRect.width / 2 - elementRect.width / 2
  ) {
    return "bottom";
  }

  // Check TOP
  if (
    elementRect.top > modalRect.height &&
    elementRect.left > modalRect.width / 2 - elementRect.width / 2 &&
    window.innerWidth - elementRect.right >
      modalRect.width / 2 - elementRect.width / 2
  ) {
    return "top";
  }

  return false;
};

// Closes and removes the welcome modal when the tour is started or skipped.
SiteTour.prototype.closeWelcomeModal = function () {
  this.parentEl?.classList.remove("show");

  this.themeChangerEl.remove();

  this.parentEl.remove();

  tourEl.style.display = "block";

  !this.began && this.enableScroll();
};

// Clears the tour-related elements and restores the normal view.
SiteTour.prototype.clear = function (elementId) {
  this.began = false;
  const parentEl = document.getElementById(elementId);
  this.themeChangerEl.style.display = "none";
  tourEl.style.display = "block";

  if (parentEl.id === "tour--welcome-modal") parentEl && parentEl.remove();
  this.themeChangerEl.remove();

  !this.began && this.enableScroll();
};

//  A generator function that iterates through tour elements and yields them for navigation.
SiteTour.prototype.traverse = function* () {
  let currentIndex = 0;
  const elements = this.jsonData.elements;
  while (true) {
    yield elements[currentIndex];
    currentIndex =
      this.action === "prev"
        ? Math.max(currentIndex - 1, 0)
        : Math.min(currentIndex + 1, elements.length - 1);
  }
};

// Controls the visibility and state of the previous, next, and end tour buttons in the description modal.
SiteTour.prototype.toggleTraverseButtons = function () {
  const prevBtnEl = document.querySelector(
    "#tour--description-modal #tour--prev-btn"
  );
  const nextBtnEl = document.querySelector(
    "#tour--description-modal #tour--next-btn"
  );

  const tourEndBtn = this.parentEl.querySelector(
    "#tour--description-modal #tour--end-btn"
  );

  if (this.activeElJsonData.id === this.firstElId) {
    tourEndBtn.style.display = "none";
    prevBtnEl.style.display = "block";
    nextBtnEl.style.display = "block";
    prevBtnEl.classList.add("tour--disable");
    nextBtnEl.classList.remove("tour--disable");
  } else if (this.activeElJsonData.id === this.lastElId) {
    prevBtnEl.style.display = "none";
    nextBtnEl.style.display = "none";
    tourEndBtn.style.display = "block";
  } else {
    prevBtnEl.classList.remove("tour--disable");
    nextBtnEl.classList.remove("tour--disable");
    tourEndBtn.style.display = "none";
  }
};

// Moves to the next tour element and updates the description modal and overlay.
SiteTour.prototype.next = async function () {
  this.action = "next";
  this.activeElJsonData = this.traverseInstance.next().value;
  this.parentEl.classList.remove("show");
  if (this.activeElJsonData) {
    this.activeEl = document.getElementById(this.activeElJsonData.id);
    if (this.parentEl.id === "tour--description-modal") {
      this.overlayMaskinstance.removeBackdrop();
      this.toggleTraverseButtons();
      if (!this.isElementInViewPort(this.activeElJsonData.id)) {
        await this.scrollToElement(this.activeElJsonData.id);
        this.updateBackdropAndContent();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.updateBackdropAndContent();
      }
      this.overlayMaskinstance.showBackdrop();
    }
  }
};

//  Moves to the previous tour element and updates the description modal and overlay.
SiteTour.prototype.previous = async function () {
  this.action = "prev";
  this.activeElJsonData = this.traverseInstance.next().value;
  this.parentEl.classList.remove("show");
  if (this.activeElJsonData) {
    this.activeEl = document.getElementById(this.activeElJsonData.id);
    if (this.parentEl.id === "tour--description-modal") {
      this.overlayMaskinstance.removeBackdrop();
      this.toggleTraverseButtons();
      if (!this.isElementInViewPort(this.activeElJsonData.id)) {
        await this.scrollToElement(this.activeElJsonData.id);
        this.updateBackdropAndContent();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.updateBackdropAndContent();
      }
      this.overlayMaskinstance.showBackdrop();
    }
  }
};

// Updates the backdrop and content in the description modal when navigating through elements.
SiteTour.prototype.updateBackdropAndContent = function () {
  this.overlayMaskinstance.setTheme(this.activeElJsonData.maskColor);
  this.overlayMaskinstance.addBackdrop(this.activeElJsonData.id);

  if (this.parentEl.id === "tour--description-modal") {
    const title = this.parentEl.getElementsByClassName("modal-title")[0];
    title.innerHTML = this.activeElJsonData.content.title;
    const description =
      this.parentEl.getElementsByClassName("modal-description")[0];
    description.innerHTML = this.activeElJsonData.content.description;
    this.positionDescriptionModal();
  }
};

// Checks if an HTML element is currently in the viewport.
SiteTour.prototype.isElementInViewPort = function (elementId) {
  const rect = document.getElementById(elementId).getBoundingClientRect();

  return (
    rect.top >= 10 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) - 10 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Scrolls to a specified element with smooth behavior.
SiteTour.prototype.scrollToElement = async function (elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementRect = element.getBoundingClientRect();
    const offset = elementRect.top - 100;

    // Scroll to the element with smooth behavior
    await new Promise((resolve) => {
      window.scrollBy({
        top: offset,
        behavior: "smooth",
      });

      // Listen for the scroll event to know when scrolling is complete
      const scrollListener = () => {
        if (!this.isElementInViewPort(elementId)) {
          requestAnimationFrame(scrollListener);
        } else {
          window.removeEventListener("scroll", scrollListener);
          setTimeout(() => {
            resolve();
          }, 500);
        }
      };

      window.addEventListener("scroll", scrollListener);
    });
  }
};

// Sets the theme colors for the site tour based on JSON data.
SiteTour.prototype.setTheme = function () {
  const root_theme = document.querySelector(":root");

  Object.keys(this.jsonData.theme).forEach((constant) =>
    root_theme.style.setProperty(`--${constant}`, this.jsonData.theme[constant])
  );
};

// Enables a theme changer button to toggle between light and dark themes.
SiteTour.prototype.enableThemeChanger = function () {
  const themeChanger = document.getElementById("tour--theme-changer");

  if (!themeChanger) {
    this.themeChangerEl = themeChanger;
    const markup = `
        <div id="tour--theme-changer">
          <span class="material-symbols-outlined">
            contrast
          </span>
        </div>`;

    this.bodyEl.insertAdjacentHTML("beforeend", markup);
    this.themeChangerEl = document.getElementById("tour--theme-changer");

    this.themeChangerEl.addEventListener("click", () => {
      if (this.bodyEl.classList.contains("dark")) {
        this.bodyEl.classList.remove("dark");
      } else {
        this.bodyEl.classList.add("dark");
      }
    });
  }
};

// Disables scrolling on the page during the tour.
SiteTour.prototype.disableScroll = function () {
  this.bodyEl.classList.add("tour--stop-scrolling");
};

// Re-enables scrolling on the page after the tour is completed or skipped.
SiteTour.prototype.enableScroll = function () {
  this.bodyEl.classList.remove("tour--stop-scrolling");
};

/**
 * Represents main function.
 * @function
 */
const createTour = async function () {
  try {
    const jsonHandlerInstance = new JsonHandler();
    const jsonData = await jsonHandlerInstance.fetch("./tour.json");

    if (!jsonData.displayStatus) return;

    const siteTourInstance = new SiteTour();

    // Sort elements based on given order
    jsonData.elements.sort((a, b) => a.order - b.order);

    siteTourInstance.jsonData = jsonData;

    if (
      siteTourInstance.jsonData &&
      Object.keys(siteTourInstance.jsonData).length
    ) {
      siteTourInstance.firstElId = jsonData.elements[0].id;
      siteTourInstance.lastElId = jsonData.elements.at(-1).id;
      //------------ remove later
      isTourStarted = true;
      tourEl.style.display = "none";
      //------------

      siteTourInstance.enableTour();
    } else {
      throw new Error("Empty JSON!");
    }
  } catch (error) {
    console.log(error);
  }
};

// start point
let isTourStarted = false;
const tourEl = document.getElementById("start-tour");
isTourStarted || tourEl.addEventListener("click", createTour);
