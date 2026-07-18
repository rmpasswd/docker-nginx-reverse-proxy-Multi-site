/**
 * Boostrm — Launch Your MVP in 100 Hours
 * Main Interactive Logic
 */

/**
 * 1. Vite Module Preload Polyfill
 * Ensures modulepreload link elements work in browsers without native support.
 */
(function polyfillModulePreload() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processLink(link);
  }
  
  new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.tagName === "LINK" && node.rel === "modulepreload") {
            processLink(node);
          }
        }
      }
    }
  }).observe(document, { childList: true, subtree: true });
  
  function getFetchOptions(link) {
    const options = {};
    if (link.integrity) options.integrity = link.integrity;
    if (link.referrerPolicy) options.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") {
      options.credentials = "include";
    } else if (link.crossOrigin === "anonymous") {
      options.credentials = "omit";
    } else {
      options.credentials = "same-origin";
    }
    return options;
  }
  
  function processLink(link) {
    if (link.ep) return; // ep = elements processed flag
    link.ep = true;
    const options = getFetchOptions(link);
    fetch(link.href, options);
  }
})();


/**
 * 2. Smooth Scrolling for Anchor Links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", event => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;
    
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    
    event.preventDefault();
    
    // Retrieve navigation height from CSS variable (fallback to 68px)
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h") || "68", 10);
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
  });
});


/**
 * 3. Sticky Navigation & Scrollspy (Active Section Link Highlight)
 */
const navigation = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section[id]");

function handleScroll() {
  // Sticky shadow effect on scroll
  if (window.scrollY > 20) {
    navigation?.classList.add("scrolled");
  } else {
    navigation?.classList.remove("scrolled");
  }
  
  // Find current active section
  const triggerPoint = window.scrollY + window.innerHeight / 3;
  let activeSectionId = sections[0]?.id || "";
  
  sections.forEach(section => {
    if (section.offsetTop <= triggerPoint) {
      activeSectionId = section.id;
    }
  });
  
  // Update active state in nav link pills
  navLinks.forEach(link => {
    const href = link.getAttribute("href") || "";
    if (href === `#${activeSectionId}`) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", handleScroll, { passive: true });
// Run once on load to initialize correct states
handleScroll();


/**
 * 4. Mobile Navigation Toggle
 */
const mobileToggle = document.querySelector(".nav-mobile-toggle");
const navLinksWrap = document.querySelector(".nav-links-wrap");

mobileToggle?.addEventListener("click", () => {
  const isOpen = mobileToggle.classList.toggle("open");
  navLinksWrap.classList.toggle("open", isOpen);
  mobileToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close mobile navigation when a nav link is clicked
navLinksWrap?.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    mobileToggle?.classList.remove("open");
    navLinksWrap?.classList.remove("open");
    mobileToggle?.setAttribute("aria-expanded", "false");
  });
});


/**
 * 5. FAQ Accordion Toggle
 */
document.querySelectorAll(".faq-q").forEach(questionBtn => {
  questionBtn.addEventListener("click", () => {
    const currentItem = questionBtn.closest(".faq-item");
    if (!currentItem) return;
    const isOpen = currentItem.classList.contains("faq-item--open");
    
    // Close all FAQ items
    document.querySelectorAll(".faq-item").forEach(item => {
      item.classList.remove("faq-item--open");
      item.querySelector(".faq-q")?.setAttribute("aria-expanded", "false");
      const icon = item.querySelector(".faq-icon");
      if (icon) {
        icon.textContent = "+";
      }
    });
    
    // Toggle current item if it was closed
    if (!isOpen) {
      currentItem.classList.add("faq-item--open");
      questionBtn.setAttribute("aria-expanded", "true");
      const icon = questionBtn.querySelector(".faq-icon");
      if (icon) {
        icon.textContent = "−";
      }
    }
  });
});


/**
 * 6. Intersection Observer for Scroll Reveals
 */
const revealElements = document.querySelectorAll(
  ".hero-content, .hero-card, .about-top, .demo-shell, .work-step, .faq-left, .faq-item, .footer-brand, .footer-col"
);

// Add reveal base class
revealElements.forEach(el => el.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        // Stagger entrance animations
        setTimeout(() => target.classList.add("in"), index * 60);
        revealObserver.unobserve(target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach(el => revealObserver.observe(el));


/**
 * 7. Dashboard Demo Cursor Interactive Animation
 */
const cursor = document.getElementById("demoCursor");
const demoBody = document.querySelector(".demo-body");
const deployBtn = document.getElementById("demoBtnDeploy");

// Calculate coordinates relative to .demo-body container
function getRelativeCoords(targetEl, xAlign, yAlign) {
  if (!demoBody || !cursor || !targetEl) return { x: 0, y: 0 };
  
  const bodyRect = demoBody.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  
  const x = targetRect.left - bodyRect.left + targetRect.width * xAlign;
  const y = targetRect.top - bodyRect.top + targetRect.height * yAlign;
  
  return { x, y };
}

function moveCursor(x, y) {
  if (cursor) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let isAnimationRunning = false;

async function startDemoAnimation() {
  if (!cursor || !demoBody || isAnimationRunning) return;
  isAnimationRunning = true;
  
  const progressCard = demoBody.querySelector(".demo-card--1");
  const deployCard = demoBody.querySelector(".demo-card--2");
  const statusCard = demoBody.querySelector(".demo-card--3");
  const sidebarItems = demoBody.querySelectorAll(".demo-sidebar-item");
  
  // Set initial cursor position and make it visible
  moveCursor(20, 20);
  cursor.style.opacity = "1";
  
  while (true) {
    // 1. Move to Progress Card
    const progressCoords = getRelativeCoords(progressCard, 0.5, 0.5);
    moveCursor(progressCoords.x, progressCoords.y);
    progressCard?.classList.add("hovered");
    await delay(900);
    progressCard?.classList.remove("hovered");
    
    // 2. Move to projects in Sidebar
    const projectCoords = getRelativeCoords(sidebarItems[1] || null, 0.5, 0.5);
    moveCursor(projectCoords.x, projectCoords.y);
    sidebarItems[1]?.classList.add("hovered");
    await delay(700);
    sidebarItems[1]?.classList.remove("hovered");
    
    // 3. Move to Deploy Button and click
    const deployCoords = getRelativeCoords(deployCard, 0.5, 0.75);
    moveCursor(deployCoords.x, deployCoords.y);
    await delay(600);
    
    cursor.classList.add("click");
    deployBtn?.classList.add("clicked");
    await delay(220);
    cursor.classList.remove("click");
    deployBtn?.classList.remove("clicked");
    
    // 4. Move to Status Badge
    const statusCoords = getRelativeCoords(statusCard, 0.5, 0.5);
    moveCursor(statusCoords.x, statusCoords.y);
    statusCard?.classList.add("hovered");
    await delay(800);
    statusCard?.classList.remove("hovered");
    
    // 5. Reset to original position
    moveCursor(20, 20);
    await delay(1200);
  }
}

const demoObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      startDemoAnimation();
      demoObserver.disconnect();
    }
  },
  { threshold: 0.3 }
);

if (demoBody) {
  demoObserver.observe(demoBody);
}


/**
 * 8. Hero Card Bar Chart Entrance Animation Reset on Mouse Hover
 */
const progressBars = document.querySelectorAll(".bar");
const heroCard = document.querySelector(".hero-card");

heroCard?.addEventListener("mouseenter", () => {
  progressBars.forEach(bar => {
    // Reset animation by removing and reapplying the animation property
    bar.style.animation = "none";
    bar.offsetWidth; // Trigger reflow
    bar.style.animation = "";
  });
});
