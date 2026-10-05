/* GOZTECH STORES — main.js
   Vanilla JS. No tracking, no third-party embeds. */
(function () {
  "use strict";

  var WA_LINK = "https://wa.link/sm2r35";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Lightbox ----------
     Any element with [data-lightbox="groupname"] opens the lightbox.
     Add more testimonial images later by adding more such links in the HTML. */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector(".lb-img");
    var lbCaption = lb.querySelector(".lb-caption");
    var lbCount = lb.querySelector(".lb-count");
    var lbPrev = lb.querySelector(".lb-prev");
    var lbNext = lb.querySelector(".lb-next");
    var lbClose = lb.querySelector(".lb-close");
    var groups = {};
    var currentGroup = [];
    var currentIndex = 0;
    var lastFocused = null;

    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      var g = el.getAttribute("data-lightbox");
      if (!groups[g]) groups[g] = [];
      groups[g].push(el);
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openLb(g, groups[g].indexOf(el), el);
      });
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", (el.getAttribute("data-caption") || "Image") + " — press Enter to view full size");
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(g, groups[g].indexOf(el), el); }
      });
    });

    function render() {
      var el = currentGroup[currentIndex];
      var img = el.querySelector("img");
      lbImg.src = el.getAttribute("href");
      lbImg.alt = img ? img.alt : "";
      lbCaption.textContent = el.getAttribute("data-caption") || "";
      lbCount.textContent = (currentIndex + 1) + " / " + currentGroup.length;
      var multi = currentGroup.length > 1;
      lbPrev.disabled = !multi;
      lbNext.disabled = !multi;
    }
    function openLb(group, index, trigger) {
      currentGroup = groups[group] || [];
      currentIndex = index;
      lastFocused = trigger || document.activeElement;
      render();
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      lbClose.focus();
    }
    function closeLb() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    function step(d) {
      if (currentGroup.length < 2) return;
      currentIndex = (currentIndex + d + currentGroup.length) % currentGroup.length;
      render();
    }
    lbClose.addEventListener("click", closeLb);
    lbPrev.addEventListener("click", function () { step(-1); });
    lbNext.addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Tab") {
        /* keep focus inside the lightbox */
        var focusables = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.disabled; });
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Cookie notice ----------
     This site sets no non-essential cookies. We only remember your
     dismissal of this notice in your browser's local storage. */
  var banner = document.getElementById("cookie-banner");
  if (banner) {
    var KEY = "goztech_cookie_notice";
    var acknowledged = false;
    try { acknowledged = window.localStorage.getItem(KEY) === "1"; } catch (e) {}
    if (!acknowledged) {
      setTimeout(function () { banner.classList.add("show"); }, 1200);
    }
    function dismiss() {
      banner.classList.remove("show");
      try { window.localStorage.setItem(KEY, "1"); } catch (e) {}
    }
    banner.querySelectorAll("[data-cookie-accept]").forEach(function (b) {
      b.addEventListener("click", dismiss);
    });
  }

  /* ---------- WhatsApp enquiry form ----------
     Collects nothing on this site. It composes a WhatsApp message,
     copies it to the clipboard, and opens the business WhatsApp link. */
  var form = document.getElementById("enquiry-form");
  if (form) {
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var name = form.elements["enq-name"].value.trim();
      var phone = form.elements["enq-phone"].value.trim();
      var interest = form.elements["enq-interest"].value;
      var msg = form.elements["enq-message"].value.trim();

      var lines = ["Hello GOZTECH STORES! I have an enquiry from your website."];
      if (name) lines.push("Name: " + name);
      if (phone) lines.push("Phone: " + phone);
      if (interest) lines.push("I'm interested in: " + interest);
      if (msg) lines.push("Message: " + msg);
      var text = lines.join("\n");

      var done = function () {
        status.textContent = "Your message has been copied. WhatsApp is opening — just paste and send!";
        status.removeAttribute("role");
        window.open(WA_LINK, "_blank", "noopener");
      };
      var fail = function () {
        status.textContent = "Copy failed — please select and copy your message above manually, then continue to WhatsApp.";
        status.setAttribute("role", "alert");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        fail();
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
