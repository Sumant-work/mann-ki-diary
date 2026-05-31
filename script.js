const CONTENT_URL = "content/site.json";

const $ = (selector) => document.querySelector(selector);
const memoryList = $("#memoryList");
const galleryGrid = $("#galleryGrid");
const thoughtGrid = $("#thoughtGrid");
const thoughtPrev = $("#thoughtPrev");
const thoughtNext = $("#thoughtNext");
const thoughtStatus = $("#thoughtStatus");
const letterBoard = $("#letterBoard");
const mediaLightbox = $("#mediaLightbox");
const mediaBackdrop = $("#mediaBackdrop");
const mediaClose = $("#mediaClose");
const mediaTitle = $("#mediaTitle");
const lightboxVideo = $("#lightboxVideo");
const lightboxImage = $("#lightboxImage");
const searchInput = $("#searchInput");
const moodFilter = $("#moodFilter");
const menuBtn = $("#menuBtn");
const navLinks = $("#navLinks");

let siteData = normalizeSiteData({});
let thoughtPage = 0;
const THOUGHTS_PER_PAGE = 3;

function normalizeSiteData(data) {
  return {
    siteName: data.siteName || "Mann Ki Diary",
    eyebrow: data.eyebrow || "A quiet corner for real feelings",
    heroTitle: data.heroTitle || "Where moments become memories.",
    heroSubtitle: data.heroSubtitle || "Stories, photos, thoughts, and little pieces of life.",
    featuredQuote: data.featuredQuote || "Some feelings deserve a beautiful place to rest.",
    featuredBy: data.featuredBy || "- My heart",
    aboutTitle: data.aboutTitle || "A peaceful personal archive.",
    aboutText: data.aboutText || "A place for stories, emotions, dreams, growth, silence and memories.",
    footerText: data.footerText || "Made with memories, softness and hope.",
    memories: Array.isArray(data.memories) ? data.memories : [],
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    thoughts: Array.isArray(data.thoughts) ? data.thoughts : [],
    letters: Array.isArray(data.letters) ? data.letters : []
  };
}

async function loadSiteData() {
  const response = await fetch(CONTENT_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Content request failed with ${response.status}`);
  }

  siteData = normalizeSiteData(await response.json());
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node && value) node.textContent = value;
}

function hydrateSiteText() {
  document.title = siteData.siteName || "Mann Ki Diary";
  setText("brandName", siteData.siteName);
  setText("eyebrowText", siteData.eyebrow);
  setText("heroTitle", siteData.heroTitle);
  setText("heroSubtitle", siteData.heroSubtitle);
  setText("featuredQuote", siteData.featuredQuote);
  setText("featuredBy", siteData.featuredBy);
  setText("aboutTitle", siteData.aboutTitle);
  setText("aboutText", siteData.aboutText);
  setText("footerText", siteData.footerText);
}

function getTags(memory) {
  return (memory.tags || [])
    .map((tag) => (typeof tag === "string" ? tag : tag && tag.tag))
    .filter(Boolean);
}

function getUniqueMoods() {
  return [...new Set(siteData.memories.map((item) => item.mood).filter(Boolean))].sort();
}

function hydrateMoodFilter() {
  moodFilter.innerHTML = `<option value="all">All moods</option>`;

  getUniqueMoods().forEach((mood) => {
    const option = document.createElement("option");
    option.value = mood.toLowerCase();
    option.textContent = mood;
    moodFilter.appendChild(option);
  });
}

function memoryTemplate(memory) {
  const tags = getTags(memory).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const image = memory.image
    ? `
        <details class="memory-post">
          <summary class="memory-preview">
            <img src="${escapeAttribute(memory.image)}" alt="" loading="lazy" />
            <span class="memory-preview-text">
              <strong>
                <span class="closed-label">Tap to open post</span>
                <span class="open-label">Tap to close post</span>
              </strong>
              <small>Full poster image</small>
            </span>
          </summary>
          <a class="memory-image" href="${escapeAttribute(memory.image)}" aria-label="Open ${escapeAttribute(memory.title || "memory image")}">
            <img src="${escapeAttribute(memory.image)}" alt="${escapeAttribute(memory.title || "Memory image")}" loading="lazy" />
          </a>
        </details>
      `
    : "";

  return `
    <article class="memory-card reveal${image ? " has-image" : ""}">
      <div class="memory-date">
        ${escapeHtml(memory.date || "A memory")}
        <span>${escapeHtml(memory.mood || "Feeling")}</span>
      </div>
      <div class="memory-content">
        <h3>${escapeHtml(memory.title || "Untitled")}</h3>
        <p>${escapeHtml(memory.text || "Write your memory here.")}</p>
        <div class="tags">${tags}</div>
        ${image}
      </div>
    </article>
  `;
}

function renderMemories() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedMood = moodFilter.value;

  const filtered = siteData.memories.filter((memory) => {
    const searchable = [memory.date, memory.mood, memory.title, memory.text, ...getTags(memory)]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const matchesMood = selectedMood === "all" || (memory.mood || "").toLowerCase() === selectedMood;
    return matchesSearch && matchesMood;
  });

  memoryList.innerHTML = filtered.length
    ? filtered.map(memoryTemplate).join("")
    : `<div class="empty-state">No memory found. Try another word or mood.</div>`;

  observeReveals();
}

function galleryTemplate(item, index) {
  let visual = `<div class="gallery-placeholder" aria-hidden="true">🌸</div>`;

  if (item.video) {
    const title = item.title || `Video ${index + 1}`;
    const preview = item.image
      ? `<img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(title)}" loading="lazy" />`
      : `<video src="${escapeAttribute(item.video)}" autoplay muted loop playsinline preload="metadata"></video>`;
    const image = item.image ? ` data-gallery-image="${escapeAttribute(item.image)}"` : "";
    visual = `
        <a class="gallery-photo has-video" href="${escapeAttribute(item.video)}" data-gallery-video="${escapeAttribute(item.video)}"${image} data-gallery-title="${escapeAttribute(title)}" aria-label="Open ${escapeAttribute(title)}">
          ${preview}
          <span class="gallery-play" aria-hidden="true">▶</span>
        </a>
      `;
  } else if (item.image) {
    visual = `
        <a class="gallery-photo" href="${escapeAttribute(item.image)}" data-gallery-image="${escapeAttribute(item.image)}" data-gallery-title="${escapeAttribute(item.title || `Photo ${index + 1}`)}" aria-label="Open ${escapeAttribute(item.title || `Photo ${index + 1}`)}">
          <img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.title || `Photo ${index + 1}`)}" loading="lazy" />
        </a>
      `;
  }

  return `
    <article class="gallery-card reveal">
      ${visual}
      <div class="gallery-caption">
        <h3>${escapeHtml(item.title || `Photo ${index + 1}`)}</h3>
        <p>${escapeHtml(item.caption || "Add a small caption here.")}</p>
      </div>
    </article>
  `;
}

function renderGallery() {
  galleryGrid.innerHTML = siteData.gallery.length
    ? siteData.gallery.map(galleryTemplate).join("")
    : `<div class="empty-state">No photos yet. Add your first photo from the admin panel.</div>`;
}

function thoughtTemplate(thought) {
  return `
    <article class="thought-card reveal">
      <p>${escapeHtml(thought.text || "Write a small thought here.")}</p>
      <span>${escapeHtml(thought.by || "A thought")}</span>
    </article>
  `;
}

function renderThoughts() {
  const totalThoughts = siteData.thoughts.length;
  const totalPages = Math.max(1, Math.ceil(totalThoughts / THOUGHTS_PER_PAGE));
  thoughtPage = Math.min(thoughtPage, totalPages - 1);

  const start = thoughtPage * THOUGHTS_PER_PAGE;
  const visibleThoughts = siteData.thoughts.slice(start, start + THOUGHTS_PER_PAGE);

  thoughtGrid.innerHTML = visibleThoughts.length
    ? visibleThoughts.map(thoughtTemplate).join("")
    : `<div class="empty-state">No thoughts yet. Add one from the admin panel.</div>`;
  updateThoughtControls(totalThoughts, totalPages, start, visibleThoughts.length);
  observeReveals();
}

function updateThoughtControls(totalThoughts = siteData.thoughts.length, totalPages = 1, start = 0, visibleCount = 0) {
  if (!thoughtPrev || !thoughtNext) return;

  const carousel = thoughtGrid.closest(".thought-carousel");
  if (carousel) carousel.classList.toggle("is-empty", !totalThoughts);

  thoughtPrev.disabled = !totalThoughts || thoughtPage === 0;
  thoughtNext.disabled = !totalThoughts || thoughtPage >= totalPages - 1;

  if (thoughtStatus) {
    thoughtStatus.textContent = totalThoughts
      ? `${start + 1}-${start + visibleCount} of ${totalThoughts}`
      : "";
  }
}

function scrollThoughts(direction) {
  const totalPages = Math.ceil(siteData.thoughts.length / THOUGHTS_PER_PAGE);
  thoughtPage = Math.max(0, Math.min(thoughtPage + direction, totalPages - 1));
  renderThoughts();
}

function letterTemplate(letter) {
  return `
    <article class="letter-card reveal">
      <p>${escapeHtml(letter.text || "Write your line here.")}</p>
      <span>${escapeHtml(letter.by || "A thought")}</span>
    </article>
  `;
}

function renderLetters() {
  letterBoard.innerHTML = siteData.letters.length
    ? siteData.letters.map(letterTemplate).join("")
    : `<div class="empty-state">No letters yet. Add one from the admin panel.</div>`;
}

function renderContentError() {
  const message = `
    <div class="empty-state">
      Content could not load. Open this site through a local server or check content/site.json.
    </div>
  `;

  memoryList.innerHTML = message;
  galleryGrid.innerHTML = message;
  thoughtGrid.innerHTML = message;
  letterBoard.innerHTML = message;
}

function showLightboxImage(src, title) {
  if (!lightboxImage) return;

  lightboxImage.src = src;
  lightboxImage.alt = title || "Memory preview";
  lightboxImage.hidden = false;
  if (lightboxVideo) lightboxVideo.hidden = true;
}

function openMediaPreview(link) {
  if (!mediaLightbox || !lightboxVideo || !lightboxImage) return;

  const title = link.dataset.galleryTitle || "Memory preview";
  const videoSrc = link.dataset.galleryVideo;
  const imageSrc = link.dataset.galleryImage;

  if (mediaTitle) mediaTitle.textContent = title;
  mediaLightbox.hidden = false;
  document.body.classList.add("modal-open");

  lightboxVideo.pause();
  lightboxVideo.hidden = true;
  lightboxImage.hidden = true;

  if (videoSrc) {
    lightboxVideo.oncanplay = null;
    lightboxVideo.onerror = null;

    if (imageSrc) {
      showLightboxImage(imageSrc, title);
    } else {
      lightboxVideo.hidden = false;
    }

    lightboxVideo.src = videoSrc;
    if (imageSrc) {
      lightboxVideo.onerror = () => showLightboxImage(imageSrc, title);
    }
    lightboxVideo.oncanplay = () => {
      if (lightboxImage) lightboxImage.hidden = true;
      lightboxVideo.hidden = false;
      lightboxVideo.play().catch(() => {
        lightboxVideo.controls = true;
      });
    };
    lightboxVideo.load();
    return;
  }

  if (imageSrc) showLightboxImage(imageSrc, title);
}

function closeVideoPreview() {
  if (!mediaLightbox || !lightboxVideo || !lightboxImage) return;

  lightboxVideo.pause();
  lightboxVideo.oncanplay = null;
  lightboxVideo.onerror = null;
  lightboxVideo.removeAttribute("src");
  lightboxVideo.load();
  lightboxVideo.hidden = false;
  lightboxImage.removeAttribute("src");
  lightboxImage.hidden = true;
  mediaLightbox.hidden = true;
  document.body.classList.remove("modal-open");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

let revealObserver;
function observeReveals() {
  const nodes = document.querySelectorAll(".reveal:not(.visible)");
  if (!nodes.length) return;

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }

  nodes.forEach((node) => revealObserver.observe(node));
}

function bindEvents() {
  searchInput.addEventListener("input", renderMemories);
  moodFilter.addEventListener("change", renderMemories);

  galleryGrid.addEventListener("click", (event) => {
    const mediaLink = event.target.closest("[data-gallery-video], [data-gallery-image]");
    if (!mediaLink) return;

    event.preventDefault();
    openMediaPreview(mediaLink);
  });

  if (thoughtPrev && thoughtNext) {
    thoughtPrev.addEventListener("click", () => scrollThoughts(-1));
    thoughtNext.addEventListener("click", () => scrollThoughts(1));
  }

  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  [mediaBackdrop, mediaClose].forEach((button) => {
    if (button) button.addEventListener("click", closeVideoPreview);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeVideoPreview();
  });
}

async function init() {
  bindEvents();

  try {
    await loadSiteData();
  } catch (error) {
    console.error("Could not load site content", error);
    hydrateSiteText();
    hydrateMoodFilter();
    renderContentError();
    observeReveals();
    return;
  }

  hydrateSiteText();
  hydrateMoodFilter();
  renderMemories();
  renderGallery();
  renderThoughts();
  renderLetters();
  observeReveals();
}

init();
