import type { Company } from "@/types/company";
import type { MockupContent, MockupTheme } from "@/types/mockup";
import { THEME_CONFIG } from "./mockupAssets";

export function generateStandaloneMockupHtml(
  company: Company,
  content: MockupContent,
  themeKey: MockupTheme = "clean-blue",
): string {
  const theme = THEME_CONFIG[themeKey] || THEME_CONFIG["clean-blue"];
  const name = company.name || "Ihr Betrieb";
  const city = company.city || "Ihrer Region";
  const phone = company.phone || "+49 (0) 123 456789";
  const email = company.email || "info@ihre-domain.de";

  const statsHtml = content.stats && content.stats.length > 0 ? `
  <section class="py-10 bg-brandCardBg border-b border-brandBorder">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        ${content.stats.map(st => `
        <div class="p-4 rounded-xl bg-brandBg/60 border border-brandBorder">
          <span class="block text-2xl sm:text-3xl font-extrabold text-brandPrimary mb-1">${st.value}</span>
          <span class="text-xs sm:text-sm font-semibold text-brandMuted">${st.label}</span>
        </div>
        `).join("")}
      </div>
    </div>
  </section>
  ` : "";

  const servicesHtml = content.services.map(srv => `
    <div class="bg-brandCardBg rounded-2xl overflow-hidden border border-brandBorder shadow-sm hover:shadow-md transition-shadow flex flex-col">
      ${srv.image ? `
      <div class="relative h-48 overflow-hidden bg-slate-100">
        <img src="${srv.image}" alt="${srv.title}" class="w-full h-full object-cover">
        ${srv.tag ? `<span class="absolute top-3 left-3 bg-brandPrimary text-white text-xs font-bold px-3 py-1 rounded-full">${srv.tag}</span>` : ""}
      </div>
      ` : ""}
      <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 class="text-xl font-bold text-brandText mb-2">${srv.title}</h3>
          <p class="text-sm text-brandMuted leading-relaxed">${srv.description}</p>
        </div>
        <button onclick="openModal('${srv.title}')" class="text-sm font-bold text-brandPrimary hover:underline flex items-center gap-1.5 pt-2">
          Jetzt für „${srv.title}“ anfragen →
        </button>
      </div>
    </div>
  `).join("");

  const processHtml = content.processSteps && content.processSteps.length > 0 ? `
  <section id="process" class="py-20 bg-brandCardBg border-y border-brandBorder">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span class="text-xs font-bold uppercase tracking-widest text-brandPrimary">TRANSPARENTER ABLAUF</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-brandText tracking-tight">${content.processTitle || "In 3 einfachen Schritten"}</h2>
        <p class="text-brandMuted text-base sm:text-lg">${content.processSubtitle || ""}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${content.processSteps.map(step => `
        <div class="p-8 rounded-2xl bg-brandBg border border-brandBorder relative">
          <span class="text-4xl font-black text-brandPrimary/25 block mb-4">${step.stepNumber}</span>
          <h3 class="text-lg font-bold text-brandText mb-2">${step.title}</h3>
          <p class="text-sm text-brandMuted leading-relaxed">${step.description}</p>
        </div>
        `).join("")}
      </div>
    </div>
  </section>
  ` : "";

  const faqsHtml = content.faqs && content.faqs.length > 0 ? `
  <section id="faq" class="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16 space-y-3">
      <span class="text-xs font-bold uppercase tracking-widest text-brandPrimary">FAQ</span>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-brandText tracking-tight">${content.faqTitle || "Häufig gestellte Fragen"}</h2>
      <p class="text-brandMuted text-base sm:text-lg">${content.faqSubtitle || ""}</p>
    </div>
    <div class="space-y-4">
      ${content.faqs.map((faq, idx) => `
      <div class="rounded-xl border border-brandBorder bg-brandCardBg overflow-hidden">
        <button onclick="toggleFaq(${idx})" class="w-full p-5 text-left font-bold text-base text-brandText flex items-center justify-between gap-4 hover:bg-brandBg/50 transition-colors">
          <span>${faq.question}</span>
          <span id="faq-icon-${idx}" class="text-brandPrimary text-lg font-extrabold transition-transform">+</span>
        </button>
        <div id="faq-body-${idx}" class="px-5 pb-5 pt-1 text-sm text-brandMuted leading-relaxed hidden">
          ${faq.answer}
        </div>
      </div>
      `).join("")}
    </div>
  </section>
  ` : "";

  return `<!DOCTYPE html>
<html lang="de" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} – ${content.heroKicker || "Offizielle Website"}</title>
  <meta name="description" content="${content.heroDescription || ""}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brandPrimary: "${theme.primary}",
            brandAccent: "${theme.accent}",
            brandBg: "${theme.bg}",
            brandCardBg: "${theme.cardBg}",
            brandText: "${theme.text}",
            brandMuted: "${theme.mutedText}",
            brandBorder: "${theme.border}",
          },
          fontFamily: {
            sans: ["Inter", "sans-serif"],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: "Inter", sans-serif; background-color: ${theme.bg}; color: ${theme.text}; }
  </style>
</head>
<body class="bg-brandBg text-brandText antialiased selection:bg-brandPrimary selection:text-white">

  <!-- Urgency Ticker -->
  <div class="bg-brandPrimary text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
    <span>⚡ Express-Termine & Schnellanfragen verfügbar in ${city}</span>
    <span class="opacity-70">·</span>
    <a href="tel:${phone}" class="underline hover:opacity-90 font-bold">Direkt anrufen: ${phone}</a>
  </div>

  <!-- Header -->
  <header class="sticky top-0 z-40 bg-brandCardBg/90 backdrop-blur-md border-b border-brandBorder shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brandPrimary text-white font-extrabold text-lg flex items-center justify-center shadow-md">
          ${name.charAt(0)}
        </div>
        <div>
          <span class="font-extrabold text-lg tracking-tight block text-brandText">${name}</span>
          <span class="text-xs text-brandMuted block">${company.industry || "Meisterbetrieb"} · ${city}</span>
        </div>
      </div>
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-brandMuted">
        <a href="#services" class="hover:text-brandPrimary transition-colors">Leistungen</a>
        <a href="#process" class="hover:text-brandPrimary transition-colors">Ablauf</a>
        <a href="#about" class="hover:text-brandPrimary transition-colors">Über uns</a>
        <a href="#faq" class="hover:text-brandPrimary transition-colors">FAQ</a>
      </nav>
      <div class="flex items-center gap-4">
        <a href="tel:${phone}" class="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-brandPrimary hover:underline">
          <span>📞</span> ${phone}
        </a>
        <button onclick="openModal()" class="bg-brandPrimary hover:opacity-95 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-transform hover:-translate-y-0.5">
          Termin anfragen
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-brandBorder">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 space-y-6 text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brandPrimary/10 text-brandPrimary border border-brandPrimary/20">
            <span>✦</span>
            <span>${content.heroKicker}</span>
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brandText leading-tight">
            ${content.heroTitle}
          </h1>
          <p class="text-base sm:text-lg text-brandMuted max-w-2xl leading-relaxed">
            ${content.heroDescription}
          </p>
          <div class="pt-4 flex flex-col sm:flex-row gap-4">
            <button onclick="openModal()" class="bg-brandPrimary text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all text-center">
              ${content.heroCta} →
            </button>
            <a href="#services" class="bg-brandCardBg text-brandText border border-brandBorder font-semibold px-6 py-4 rounded-xl hover:bg-brandBg transition-colors text-center">
              ${content.heroSecondaryCta}
            </a>
          </div>
          <div class="pt-6 flex flex-wrap items-center gap-6 text-xs font-semibold text-brandMuted border-t border-brandBorder/60">
            <div class="flex items-center gap-1.5"><span class="text-amber-500 font-bold">★★★★★</span><span>4.9 / 5.0 Google Bewertung</span></div>
            <div class="flex items-center gap-1.5"><span class="text-emerald-500 font-bold">✓</span><span>100% Festpreis-Garantie</span></div>
            <div class="flex items-center gap-1.5"><span class="text-blue-500 font-bold">📍</span><span>Vor Ort in ${city}</span></div>
          </div>
        </div>
        <div class="lg:col-span-5 relative">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-brandCardBg">
            <img src="${content.heroImage}" alt="${name}" class="w-full h-[420px] object-cover">
            <div class="absolute bottom-4 left-4 right-4 bg-brandCardBg/95 backdrop-blur-md p-4 rounded-xl border border-brandBorder shadow-lg flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-brandPrimary text-white flex items-center justify-center font-bold text-lg">★</div>
              <div>
                <strong class="block text-sm text-brandText font-bold">Meisterhafte Qualität in ${city}</strong>
                <span class="text-xs text-brandMuted">Schnell, zuverlässig & persönlich</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Bar -->
  ${statsHtml}

  <!-- Services Section -->
  <section id="services" class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
      <span class="text-xs font-bold uppercase tracking-widest text-brandPrimary">LEISTUNGEN</span>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-brandText tracking-tight">${content.servicesTitle}</h2>
      <p class="text-brandMuted text-base sm:text-lg">${content.servicesSubtitle}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${servicesHtml}
    </div>
  </section>

  <!-- Process -->
  ${processHtml}

  <!-- About Us -->
  <section id="about" class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5">
        <div class="rounded-2xl overflow-hidden shadow-xl border border-brandBorder">
          <img src="${content.aboutImage}" alt="Über uns" class="w-full h-[400px] object-cover">
        </div>
      </div>
      <div class="lg:col-span-7 space-y-6">
        <span class="text-xs font-bold uppercase tracking-widest text-brandPrimary">ÜBER UNS</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-brandText tracking-tight">${content.aboutTitle}</h2>
        <p class="text-brandMuted leading-relaxed">${content.aboutText}</p>
        ${content.aboutPoints && content.aboutPoints.length > 0 ? `
        <ul class="space-y-3 pt-2">
          ${content.aboutPoints.map(pt => `
          <li class="flex items-center gap-3 text-sm font-semibold text-brandText">
            <span class="w-6 h-6 rounded-full bg-brandPrimary/10 text-brandPrimary flex items-center justify-center text-xs font-bold">✓</span>
            <span>${pt}</span>
          </li>
          `).join("")}
        </ul>` : ""}
      </div>
    </div>
  </section>

  <!-- FAQ -->
  ${faqsHtml}

  <!-- CTA -->
  <section class="py-20 bg-brandPrimary text-white text-center">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h2 class="text-3xl sm:text-4xl font-black tracking-tight">${content.ctaTitle}</h2>
      <p class="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">${content.ctaText}</p>
      <div class="pt-4 flex flex-wrap items-center justify-center gap-4">
        <button onclick="openModal()" class="bg-white text-brandPrimary font-extrabold px-8 py-4 rounded-xl shadow-xl hover:bg-slate-100 transition-all">
          ${content.ctaButton}
        </button>
        <a href="tel:${phone}" class="bg-brandPrimary border-2 border-white/40 text-white font-bold px-6 py-4 rounded-xl hover:bg-white/10 transition-colors">
          📞 ${phone}
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-12 bg-brandCardBg border-t border-brandBorder text-xs text-brandMuted">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p>© ${new Date().getFullYear()} ${name}. Alle Rechte vorbehalten.</p>
        <p class="mt-1">${city} · Telefon: ${phone} · E-Mail: ${email}</p>
      </div>
      <div class="flex items-center gap-6">
        <a href="#services" class="hover:underline">Leistungen</a>
        <a href="#about" class="hover:underline">Über uns</a>
        <a href="#faq" class="hover:underline">FAQ</a>
      </div>
    </div>
  </footer>

  <!-- Modal -->
  <div id="bookingModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-brandCardBg rounded-2xl max-w-lg w-full p-8 border border-brandBorder shadow-2xl relative">
      <button onclick="closeModal()" class="absolute top-4 right-4 text-brandMuted hover:text-brandText text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center bg-brandBg">✕</button>
      <div id="formContent">
        <h3 class="text-xl font-bold text-brandText mb-1">Unverbindliche Anfrage</h3>
        <p class="text-xs text-brandMuted mb-6">Wir melden uns innerhalb von 24 Stunden persönlich bei Ihnen zurück.</p>
        <form onsubmit="handleFormSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-brandMuted uppercase mb-1">Gewünschte Leistung</label>
            <input id="serviceInput" type="text" class="w-full px-4 py-2.5 rounded-xl border border-brandBorder bg-brandBg text-brandText text-sm outline-none focus:border-brandPrimary" placeholder="z. B. Beratung, Angebot..." required>
          </div>
          <div>
            <label class="block text-xs font-bold text-brandMuted uppercase mb-1">Ihr Name</label>
            <input type="text" class="w-full px-4 py-2.5 rounded-xl border border-brandBorder bg-brandBg text-brandText text-sm outline-none focus:border-brandPrimary" placeholder="Max Mustermann" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-brandMuted uppercase mb-1">Telefon oder E-Mail</label>
            <input type="text" class="w-full px-4 py-2.5 rounded-xl border border-brandBorder bg-brandBg text-brandText text-sm outline-none focus:border-brandPrimary" placeholder="0170 1234567 oder max@beispiel.de" required>
          </div>
          <button type="submit" class="w-full py-3.5 bg-brandPrimary text-white font-extrabold text-sm rounded-xl shadow-md hover:opacity-95 transition-opacity">
            Anfrage jetzt absenden →
          </button>
        </form>
      </div>
      <div id="successContent" class="hidden text-center py-6 space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-500 text-white text-3xl font-bold flex items-center justify-center mx-auto shadow-lg">✓</div>
        <h3 class="text-xl font-extrabold text-brandText">Vielen Dank für Ihre Anfrage!</h3>
        <p class="text-sm text-brandMuted max-w-xs mx-auto">Wir werden uns in Kürze telefonisch oder per E-Mail bei Ihnen melden.</p>
        <button onclick="closeModal()" class="px-6 py-2.5 bg-brandPrimary text-white font-bold text-xs rounded-xl shadow">Fenster schließen</button>
      </div>
    </div>
  </div>

  <script>
    function toggleFaq(index) {
      const body = document.getElementById("faq-body-" + index);
      const icon = document.getElementById("faq-icon-" + index);
      if (body.classList.contains("hidden")) {
        body.classList.remove("hidden");
        icon.innerText = "−";
      } else {
        body.classList.add("hidden");
        icon.innerText = "+";
      }
    }
    function openModal(serviceName) {
      const modal = document.getElementById("bookingModal");
      const serviceInput = document.getElementById("serviceInput");
      if (serviceName && serviceInput) serviceInput.value = serviceName;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
    function closeModal() {
      const modal = document.getElementById("bookingModal");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    function handleFormSubmit(e) {
      e.preventDefault();
      document.getElementById("formContent").classList.add("hidden");
      document.getElementById("successContent").classList.remove("hidden");
    }
  </script>
</body>
</html>`;
}
