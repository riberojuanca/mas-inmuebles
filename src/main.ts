import "./style.css";
import { CONFIG } from "./config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function $<T extends Element>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`No se encontró #${id}`);
  return el as T;
}

// ---------- Overlays a pantalla completa (historia / visor de fotos) ----------
// Bloquea el scroll de fondo (evita el "rebote" de iOS que deja ver la página
// detrás) y oculta la navbar mientras cualquiera de los dos esté abierto.

let savedScrollY = 0;

function lockBodyScroll(): void {
  savedScrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
}

function unlockBodyScroll(): void {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  window.scrollTo(0, savedScrollY);
}

function setNavbarVisible(visible: boolean): void {
  const navbar = document.querySelector<HTMLElement>(".navbar");
  if (navbar) navbar.style.display = visible ? "" : "none";

  const fab = document.getElementById("whatsappFab");
  if (fab) fab.style.display = visible ? "" : "none";
}

// ---------- Grilla + visor de fotos ----------

// Todo lo que pongas en src/assets/images/ aparece acá solo, ordenado por nombre de archivo,
// salvo los números listados en CONFIG.hiddenPhotos.
const imageModules = import.meta.glob<{ default: string }>("./assets/images/*.{jpg,jpeg,png,webp}", {
  eager: true,
});
const images = Object.keys(imageModules)
  .sort()
  .filter((path) => {
    const n = parseInt(path.replace(/^.*\//, ""), 10);
    return !CONFIG.hiddenPhotos.includes(n);
  })
  .map((path) => imageModules[path].default);

function setupGallery(): void {
  const grid = $<HTMLDivElement>("galleryGrid");
  const lightbox = $<HTMLDivElement>("lightbox");
  const frame = $<HTMLDivElement>("lightboxFrame");
  const lightboxImg = $<HTMLImageElement>("lightboxImg");
  const counter = $<HTMLDivElement>("lightboxCounter");
  const closeBtn = $<HTMLButtonElement>("lightboxClose");
  const prevBtn = $<HTMLButtonElement>("lightboxPrev");
  const nextBtn = $<HTMLButtonElement>("lightboxNext");

  const total = images.length;
  let current = 0;

  images.forEach((src, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Ver foto ${i + 1}`);

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Foto ${i + 1}`;
    img.loading = i < 6 ? "eager" : "lazy";

    btn.appendChild(img);
    btn.addEventListener("click", () => openLightbox(i));
    grid.appendChild(btn);
  });

  // Ajusta el marco al aspect-ratio real de cada foto para que el botón de
  // WhatsApp (hijo del marco) quede casi del mismo ancho que la foto.
  lightboxImg.addEventListener("load", () => {
    if (lightboxImg.naturalWidth && lightboxImg.naturalHeight) {
      frame.style.aspectRatio = `${lightboxImg.naturalWidth} / ${lightboxImg.naturalHeight}`;
    }
  });

  function render(): void {
    lightboxImg.src = images[current];
    lightboxImg.alt = `Foto ${current + 1}`;
    counter.textContent = `${current + 1} / ${total}`;
  }

  function openLightbox(index: number): void {
    current = index;
    render();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    lockBodyScroll();
    setNavbarVisible(false);
  }

  function closeLightbox(): void {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    unlockBodyScroll();
    setNavbarVisible(true);
  }

  function showPrev(): void {
    current = (current - 1 + total) % total;
    render();
  }

  function showNext(): void {
    current = (current + 1) % total;
    render();
  }

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", showPrev);
  nextBtn.addEventListener("click", showNext);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showPrev();
    else if (e.key === "ArrowRight") showNext();
  });

  // Deslizar para cambiar de foto en mobile (ahí no hay flechas)
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  });
  lightbox.addEventListener("touchend", (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) showNext();
    else showPrev();
  });
}

// ---------- Historia (video) ----------

function setupStory(): void {
  const bubble = $<HTMLButtonElement>("storyBubble");
  const logoImg = $<HTMLImageElement>("storyLogo");
  const avatarImg = $<HTMLImageElement>("storyAvatarImg");
  const overlay = $<HTMLDivElement>("storyOverlay");
  const frame = $<HTMLDivElement>("storyFrame");
  const closeBtn = $<HTMLButtonElement>("storyClose");
  const video = $<HTMLVideoElement>("storyVideo");
  const progressFill = $<HTMLDivElement>("storyProgressFill");

  logoImg.src = CONFIG.logo;
  avatarImg.src = CONFIG.logo;

  // Ajusta el marco al aspect-ratio real del video para que la barra de
  // progreso y el avatar queden alineados a su ancho, no al del viewport.
  video.addEventListener("loadedmetadata", () => {
    if (video.videoWidth && video.videoHeight) {
      frame.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    }
  });

  const VIEWED_KEY = "story_viewed";
  if (localStorage.getItem(VIEWED_KEY) === "1") {
    bubble.classList.add("viewed");
  }

  function openStory(): void {
    video.src = CONFIG.storyVideo;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    progressFill.style.width = "0%";
    video.currentTime = 0;
    void video.play();
    lockBodyScroll();
    setNavbarVisible(false);

    bubble.classList.add("viewed");
    localStorage.setItem(VIEWED_KEY, "1");
  }

  function closeStory(): void {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    video.pause();
    video.removeAttribute("src");
    video.load();
    unlockBodyScroll();
    setNavbarVisible(true);
  }

  bubble.addEventListener("click", openStory);
  closeBtn.addEventListener("click", closeStory);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeStory();
  });

  video.addEventListener("timeupdate", () => {
    if (!video.duration) return;
    progressFill.style.width = `${(video.currentTime / video.duration) * 100}%`;
  });
  video.addEventListener("ended", closeStory);

  // Ícono de play/pausa que aparece un instante al tocar el video, como feedback.
  const tapIndicator = $<HTMLDivElement>("storyTapIndicator");
  const iconPlay = $<SVGElement>("storyIconPlay");
  const iconPause = $<SVGElement>("storyIconPause");
  let tapTimeout: number | undefined;

  function flashTapIcon(nowPlaying: boolean): void {
    iconPlay.classList.toggle("hidden", nowPlaying);
    iconPause.classList.toggle("hidden", !nowPlaying);
    tapIndicator.classList.add("show");
    window.clearTimeout(tapTimeout);
    tapTimeout = window.setTimeout(() => tapIndicator.classList.remove("show"), 600);
  }

  // Tocar el video = pausa/reanuda (como mantener presionado en Instagram)
  video.addEventListener("click", () => {
    if (video.paused) {
      void video.play();
      flashTapIcon(true);
    } else {
      video.pause();
      flashTapIcon(false);
    }
  });

  // Botón de sonido on/off
  const muteBtn = $<HTMLButtonElement>("storyMute");
  const iconVolumeOn = $<SVGElement>("storyIconVolumeOn");
  const iconVolumeOff = $<SVGElement>("storyIconVolumeOff");

  function updateMuteIcon(): void {
    iconVolumeOn.classList.toggle("hidden", video.muted);
    iconVolumeOff.classList.toggle("hidden", !video.muted);
  }

  muteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    updateMuteIcon();
  });

  updateMuteIcon();
}

// ---------- CTA WhatsApp ----------

function setupWhatsApp(): void {
  function goToWhatsApp(): void {
    if (CONFIG.googleAdsConversionId && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: CONFIG.googleAdsConversionId,
      });
    }

    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
      CONFIG.whatsappMessage
    )}`;
    window.open(url, "_blank");
  }

  $<HTMLButtonElement>("whatsappBtn").addEventListener("click", goToWhatsApp);
  $<HTMLButtonElement>("lightboxWhatsappBtn").addEventListener("click", goToWhatsApp);
  $<HTMLButtonElement>("storyWhatsappBtn").addEventListener("click", goToWhatsApp);
  $<HTMLButtonElement>("whatsappFab").addEventListener("click", goToWhatsApp);
}

function setupTitle(): void {
  $<HTMLHeadingElement>("propertyTitle").textContent = CONFIG.propertyTitle;
  $<HTMLParagraphElement>("propertyPrice").textContent = CONFIG.propertyPrice;
  $<HTMLSpanElement>("navbarTitleName").textContent = CONFIG.propertyTitleShort;
  $<HTMLSpanElement>("navbarTitlePrice").textContent = CONFIG.propertyPrice;

  const description = $<HTMLDivElement>("propertyDescription");
  CONFIG.propertyDescription.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    description.appendChild(p);
  });

  $<HTMLSpanElement>("propertyLocation").textContent = CONFIG.propertyLocation;
  $<HTMLSpanElement>("contactPhone").textContent = CONFIG.contactPhone;

  // Muestra el título/precio en el medio de la navbar una vez que el título
  // grande sale de la vista al hacer scroll.
  const navbar = document.querySelector<HTMLElement>(".navbar");
  const titleEl = $<HTMLHeadingElement>("propertyTitle");
  if (navbar) {
    const observer = new IntersectionObserver(
      ([entry]) => navbar.classList.toggle("scrolled", !entry.isIntersecting),
      { rootMargin: "-70px 0px 0px 0px" }
    );
    observer.observe(titleEl);
  }
}

setupTitle();
setupGallery();
setupStory();
setupWhatsApp();
