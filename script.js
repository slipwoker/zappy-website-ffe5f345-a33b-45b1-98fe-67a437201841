document.addEventListener('DOMContentLoaded', function () {

  // ─── 1. Smooth Scroll for Anchor Links ───────────────────────────────────────
  document.body.addEventListener('click', function (e) {
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;

    const hash = target.getAttribute('href');
    if (!hash || hash === '#') return;

    const destination = document.querySelector(hash);
    if (!destination) return;

    e.preventDefault();

    const navbarEl = document.querySelector('.navbar, nav, header');
    const navbarHeight = navbarEl ? navbarEl.offsetHeight : 0;
    const elementTop = destination.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementTop - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (history.pushState) {
      history.pushState(null, null, hash);
    }
  });


  // ─── 2. Navbar Scroll Effect ─────────────────────────────────────────────────
  const navbar = document.querySelector('.navbar, nav, header');

  if (navbar) {
    const SCROLL_THRESHOLD = 50;

    function handleNavbarScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    let navbarTicking = false;
    window.addEventListener('scroll', function () {
      if (!navbarTicking) {
        window.requestAnimationFrame(function () {
          handleNavbarScroll();
          navbarTicking = false;
        });
        navbarTicking = true;
      }
    }, { passive: true });

    handleNavbarScroll();
  }


  // ─── 3. Contact Form Validation ───────────────────────────────────────────────
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {

    function getFieldLabel(field) {
      const id = field.id;
      if (id) {
        const label = document.querySelector('label[for="' + id + '"]');
        if (label) return label.textContent.trim().replace(/:$/, '');
      }
      return field.name || field.placeholder || 'This field';
    }

    function showError(field, message) {
      clearError(field);
      field.classList.add('field-error');
      field.setAttribute('aria-invalid', 'true');

      const errorEl = document.createElement('span');
      errorEl.className = 'form-error-message';
      errorEl.setAttribute('role', 'alert');
      errorEl.textContent = message;

      const errorId = (field.id || field.name || Math.random().toString(36).slice(2)) + '-error';
      errorEl.id = errorId;
      field.setAttribute('aria-describedby', errorId);

      field.parentNode.insertBefore(errorEl, field.nextSibling);
    }

    function clearError(field) {
      field.classList.remove('field-error');
      field.removeAttribute('aria-invalid');

      const errorId = field.getAttribute('aria-describedby');
      if (errorId) {
        const existingError = document.getElementById(errorId);
        if (existingError && existingError.classList.contains('form-error-message')) {
          existingError.remove();
        }
        field.removeAttribute('aria-describedby');
      }
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function isValidPhone(value) {
      return /^[\d\s\+\-\(\)]{7,20}$/.test(value);
    }

    function validateField(field) {
      const value = field.value.trim();
      const type = field.type ? field.type.toLowerCase() : 'text';
      const label = getFieldLabel(field);
      const isRequired = field.required || field.hasAttribute('required');

      if (isRequired && value === '') {
        showError(field, label + ' is required.');
        return false;
      }

      if (value !== '') {
        if (type === 'email' && !isValidEmail(value)) {
          showError(field, 'Please enter a valid email address.');
          return false;
        }

        if (type === 'tel' && !isValidPhone(value)) {
          showError(field, 'Please enter a valid phone number.');
          return false;
        }

        if (field.minLength && field.minLength > 0 && value.length < field.minLength) {
          showError(field, label + ' must be at least ' + field.minLength + ' characters.');
          return false;
        }

        if (field.maxLength && field.maxLength > 0 && value.length > field.maxLength) {
          showError(field, label + ' must not exceed ' + field.maxLength + ' characters.');
          return false;
        }
      }

      clearError(field);
      return true;
    }

    // Live validation on blur
    contactForm.addEventListener('blur', function (e) {
      const field = e.target.closest('input, textarea, select');
      if (!field || field.type === 'submit' || field.type === 'button' || field.type === 'reset') return;
      validateField(field);
    }, true);

    // Clear error on input
    contactForm.addEventListener('input', function (e) {
      const field = e.target.closest('input, textarea, select');
      if (!field) return;
      if (field.classList.contains('field-error')) {
        clearError(field);
      }
    });

    // Submit validation
    contactForm.addEventListener('submit', function (e) {
      const fields = contactForm.querySelectorAll('input, textarea, select');
      let isValid = true;
      let firstInvalidField = null;

      fields.forEach(function (field) {
        if (field.type === 'submit' || field.type === 'button' || field.type === 'reset' || field.disabled) return;
        const fieldValid = validateField(field);
        if (!fieldValid && !firstInvalidField) {
          firstInvalidField = field;
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();
        if (firstInvalidField) {
          firstInvalidField.focus();
          firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }


  // ─── 4. Scroll Animations (Fade-in on Scroll) ────────────────────────────────
  const ANIMATION_CLASS = 'fade-in-visible';
  const OBSERVE_SELECTOR = '.fade-in, .animate-on-scroll, [data-animate]';

  function applyScrollAnimations() {
    const animatableElements = document.querySelectorAll(OBSERVE_SELECTOR);
    if (!animatableElements.length) return;

    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.12
      };

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.getAttribute('data-delay');
            if (delay) {
              setTimeout(function () {
                el.classList.add(ANIMATION_CLASS);
              }, parseInt(delay, 10));
            } else {
              el.classList.add(ANIMATION_CLASS);
            }
            observer.unobserve(el);
          }
        });
      }, observerOptions);

      animatableElements.forEach(function (el) {
        observer.observe(el);
      });

    } else {
      // Fallback: show all elements immediately
      animatableElements.forEach(function (el) {
        el.classList.add(ANIMATION_CLASS);
      });
    }
  }

  applyScrollAnimations();

});

/* Cookie Consent */

// Helper function to check cookie consent
function hasConsentFor(category) {
  if (typeof window.CookieConsent === 'undefined') {
    return false; // Default to no consent if cookie consent not loaded
  }
  
  return window.CookieConsent.validConsent(category);
}

// Helper function to execute code only with consent
function withConsent(category, callback) {
  if (hasConsentFor(category)) {
    callback();
  } else {
    console.log(`[WARNING] Skipping ${category} code - no user consent`);
  }
}

// Cookie Consent Initialization (multi-language) /* __ccConfigCustomBannerV1 */

(function() {
  'use strict';
  
  var initAttempts = 0;
  var maxAttempts = 50;
  
  function initCookieConsent() {
    initAttempts++;
    
    if (typeof window.CookieConsent === 'undefined') {
      if (initAttempts < maxAttempts) {
        setTimeout(initCookieConsent, 100);
      }
      return;
    }

    if (window.__zappyCookieConsentInitialized) {
      return;
    }
    window.__zappyCookieConsentInitialized = true;

    var cc = window.CookieConsent;
    
    try {
      var __ccConfig = {
  "autoShow": false,
  "mode": "opt-in",
  "revision": 0,
  "categories": {
    "necessary": {
      "enabled": true,
      "readOnly": true
    },
    "analytics": {
      "enabled": false,
      "readOnly": false,
      "autoClear": {
        "cookies": [
          {
            "name": "_ga"
          },
          {
            "name": "_ga_*"
          },
          {
            "name": "_gid"
          },
          {
            "name": "_gat"
          }
        ]
      }
    },
    "marketing": {
      "enabled": false,
      "readOnly": false,
      "autoClear": {
        "cookies": [
          {
            "name": "_fbp"
          },
          {
            "name": "_fbc"
          },
          {
            "name": "fr"
          }
        ]
      }
    }
  },
  "language": {
    "default": "he",
    "translations": {
      "en": {
        "consentModal": {
          "description": "We use cookies to improve your experience and analyze site usage.",
          "acceptAllBtn": "Accept",
          "showPreferencesBtn": "Customize"
        },
        "preferencesModal": {
          "title": "Cookie Preferences",
          "acceptAllBtn": "Accept",
          "acceptNecessaryBtn": "Accept Necessary",
          "savePreferencesBtn": "Save Preferences",
          "closeIconLabel": "Close",
          "sections": [
            {
              "title": "Essential Cookies",
              "description": "These cookies are necessary for the website to function and cannot be disabled.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Analytics Cookies",
              "description": "These cookies help us understand how visitors interact with our website.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Marketing Cookies",
              "description": "These cookies are used to deliver personalized advertisements.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "es": {
        "consentModal": {
          "description": "Usamos cookies para mejorar tu experiencia y analizar el uso del sitio.",
          "acceptAllBtn": "Aceptar",
          "showPreferencesBtn": "Personalizar"
        },
        "preferencesModal": {
          "title": "Preferencias de Cookies",
          "acceptAllBtn": "Aceptar",
          "acceptNecessaryBtn": "Solo Necesarias",
          "savePreferencesBtn": "Guardar Preferencias",
          "closeIconLabel": "Cerrar",
          "sections": [
            {
              "title": "Cookies Esenciales",
              "description": "Estas cookies son necesarias para que el sitio web funcione y no se pueden desactivar.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Cookies de Análisis",
              "description": "Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Cookies de Marketing",
              "description": "Estas cookies se utilizan para entregar anuncios personalizados.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "fr": {
        "consentModal": {
          "description": "Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation du site.",
          "acceptAllBtn": "Accepter",
          "showPreferencesBtn": "Personnaliser"
        },
        "preferencesModal": {
          "title": "Préférences des Cookies",
          "acceptAllBtn": "Accepter",
          "acceptNecessaryBtn": "Accepter les Nécessaires",
          "savePreferencesBtn": "Enregistrer les Préférences",
          "closeIconLabel": "Fermer",
          "sections": [
            {
              "title": "Cookies Essentiels",
              "description": "Ces cookies sont nécessaires au fonctionnement du site web et ne peuvent pas être désactivés.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Cookies Analytiques",
              "description": "Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Cookies Marketing",
              "description": "Ces cookies sont utilisés pour diffuser des publicités personnalisées.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "de": {
        "consentModal": {
          "description": "Wir verwenden Cookies, um Ihr Erlebnis zu verbessern und die Nutzung der Website zu analysieren.",
          "acceptAllBtn": "Akzeptieren",
          "showPreferencesBtn": "Anpassen"
        },
        "preferencesModal": {
          "title": "Cookie-Einstellungen",
          "acceptAllBtn": "Akzeptieren",
          "acceptNecessaryBtn": "Nur Notwendige",
          "savePreferencesBtn": "Einstellungen speichern",
          "closeIconLabel": "Schließen",
          "sections": [
            {
              "title": "Notwendige Cookies",
              "description": "Diese Cookies sind für die Funktion der Website erforderlich und können nicht deaktiviert werden.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Analyse-Cookies",
              "description": "Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Marketing-Cookies",
              "description": "Diese Cookies werden verwendet, um personalisierte Werbung zu liefern.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "it": {
        "consentModal": {
          "description": "Utilizziamo i cookie per migliorare la tua esperienza e analizzare l'utilizzo del sito.",
          "acceptAllBtn": "Accetta",
          "showPreferencesBtn": "Personalizza"
        },
        "preferencesModal": {
          "title": "Preferenze Cookie",
          "acceptAllBtn": "Accetta",
          "acceptNecessaryBtn": "Solo Necessari",
          "savePreferencesBtn": "Salva Preferenze",
          "closeIconLabel": "Chiudi",
          "sections": [
            {
              "title": "Cookie Essenziali",
              "description": "Questi cookie sono necessari per il funzionamento del sito web e non possono essere disattivati.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Cookie Analitici",
              "description": "Questi cookie ci aiutano a capire come i visitatori interagiscono con il nostro sito web.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Cookie di Marketing",
              "description": "Questi cookie vengono utilizzati per fornire pubblicità personalizzate.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "pt": {
        "consentModal": {
          "description": "Usamos cookies para melhorar sua experiência e analisar o uso do site.",
          "acceptAllBtn": "Aceitar",
          "showPreferencesBtn": "Personalizar"
        },
        "preferencesModal": {
          "title": "Preferências de Cookies",
          "acceptAllBtn": "Aceitar",
          "acceptNecessaryBtn": "Apenas Necessários",
          "savePreferencesBtn": "Salvar Preferências",
          "closeIconLabel": "Fechar",
          "sections": [
            {
              "title": "Cookies Essenciais",
              "description": "Estes cookies são necessários para o funcionamento do site e não podem ser desativados.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Cookies Analíticos",
              "description": "Estes cookies nos ajudam a entender como os visitantes interagem com nosso site.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Cookies de Marketing",
              "description": "Estes cookies são usados para exibir anúncios personalizados.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "nl": {
        "consentModal": {
          "description": "Wij gebruiken cookies om uw ervaring te verbeteren en het sitegebruik te analyseren.",
          "acceptAllBtn": "Accepteren",
          "showPreferencesBtn": "Aanpassen"
        },
        "preferencesModal": {
          "title": "Cookie-voorkeuren",
          "acceptAllBtn": "Accepteren",
          "acceptNecessaryBtn": "Alleen noodzakelijke",
          "savePreferencesBtn": "Voorkeuren opslaan",
          "closeIconLabel": "Sluiten",
          "sections": [
            {
              "title": "Noodzakelijke Cookies",
              "description": "Deze cookies zijn nodig voor het functioneren van de website en kunnen niet worden uitgeschakeld.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Analytische Cookies",
              "description": "Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Marketing Cookies",
              "description": "Deze cookies worden gebruikt om gepersonaliseerde advertenties te tonen.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "he": {
        "consentModal": {
          "description": "אנחנו משתמשים בעוגיות כדי לשפר את החוויה שלך ולנתח שימוש באתר.",
          "acceptAllBtn": "אישור",
          "showPreferencesBtn": "התאמה אישית"
        },
        "preferencesModal": {
          "title": "העדפות עוגיות",
          "acceptAllBtn": "אישור",
          "acceptNecessaryBtn": "רק הכרחי",
          "savePreferencesBtn": "שמור העדפות",
          "closeIconLabel": "סגור",
          "sections": [
            {
              "title": "עוגיות חיוניות",
              "description": "עוגיות אלה הכרחיות לתפקוד האתר ולא ניתן להשבית אותן.",
              "linkedCategory": "necessary"
            },
            {
              "title": "עוגיות ניתוח",
              "description": "עוגיות אלה עוזרות לנו להבין איך המבקרים מתקשרים עם האתר שלנו.",
              "linkedCategory": "analytics"
            },
            {
              "title": "עוגיות שיווקיות",
              "description": "עוגיות אלה משמשות להצגת פרסומות מותאמות אישית.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "ar": {
        "consentModal": {
          "description": "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام الموقع.",
          "acceptAllBtn": "قبول",
          "showPreferencesBtn": "تخصيص"
        },
        "preferencesModal": {
          "title": "تفضيلات ملفات تعريف الارتباط",
          "acceptAllBtn": "قبول",
          "acceptNecessaryBtn": "الضرورية فقط",
          "savePreferencesBtn": "حفظ التفضيلات",
          "closeIconLabel": "إغلاق",
          "sections": [
            {
              "title": "ملفات تعريف الارتباط الأساسية",
              "description": "هذه الملفات ضرورية لعمل الموقع ولا يمكن تعطيلها.",
              "linkedCategory": "necessary"
            },
            {
              "title": "ملفات تعريف الارتباط التحليلية",
              "description": "تساعدنا هذه الملفات في فهم كيفية تفاعل الزوار مع موقعنا.",
              "linkedCategory": "analytics"
            },
            {
              "title": "ملفات تعريف الارتباط التسويقية",
              "description": "تُستخدم هذه الملفات لعرض إعلانات مخصصة.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "tr": {
        "consentModal": {
          "description": "Deneyiminizi geliştirmek ve site kullanımını analiz etmek için çerezler kullanırız.",
          "acceptAllBtn": "Kabul Et",
          "showPreferencesBtn": "Özelleştir"
        },
        "preferencesModal": {
          "title": "Çerez Tercihleri",
          "acceptAllBtn": "Kabul Et",
          "acceptNecessaryBtn": "Sadece Gerekli",
          "savePreferencesBtn": "Tercihleri Kaydet",
          "closeIconLabel": "Kapat",
          "sections": [
            {
              "title": "Zorunlu Çerezler",
              "description": "Bu çerezler web sitesinin çalışması için gereklidir ve devre dışı bırakılamaz.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Analiz Çerezleri",
              "description": "Bu çerezler, ziyaretçilerin web sitemizle nasıl etkileşime girdiğini anlamamıza yardımcı olur.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Pazarlama Çerezleri",
              "description": "Bu çerezler kişiselleştirilmiş reklamlar sunmak için kullanılır.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "ru": {
        "consentModal": {
          "description": "Мы используем файлы cookie для улучшения вашего опыта и анализа использования сайта.",
          "acceptAllBtn": "Принять",
          "showPreferencesBtn": "Настроить"
        },
        "preferencesModal": {
          "title": "Настройки cookie",
          "acceptAllBtn": "Принять",
          "acceptNecessaryBtn": "Только необходимые",
          "savePreferencesBtn": "Сохранить настройки",
          "closeIconLabel": "Закрыть",
          "sections": [
            {
              "title": "Необходимые cookie",
              "description": "Эти файлы cookie необходимы для работы сайта и не могут быть отключены.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Аналитические cookie",
              "description": "Эти файлы cookie помогают нам понять, как посетители взаимодействуют с нашим сайтом.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Маркетинговые cookie",
              "description": "Эти файлы cookie используются для показа персонализированной рекламы.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "zh": {
        "consentModal": {
          "description": "我们使用 Cookie 来改善您的体验并分析网站使用情况。",
          "acceptAllBtn": "接受",
          "showPreferencesBtn": "自定义"
        },
        "preferencesModal": {
          "title": "Cookie 偏好设置",
          "acceptAllBtn": "接受",
          "acceptNecessaryBtn": "仅接受必要",
          "savePreferencesBtn": "保存偏好",
          "closeIconLabel": "关闭",
          "sections": [
            {
              "title": "必要 Cookie",
              "description": "这些 Cookie 是网站正常运行所必需的，无法禁用。",
              "linkedCategory": "necessary"
            },
            {
              "title": "分析 Cookie",
              "description": "这些 Cookie 帮助我们了解访问者如何与我们的网站互动。",
              "linkedCategory": "analytics"
            },
            {
              "title": "营销 Cookie",
              "description": "这些 Cookie 用于投放个性化广告。",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "ja": {
        "consentModal": {
          "description": "お客様の体験向上とサイト利用状況の分析のためにCookieを使用しています。",
          "acceptAllBtn": "許可する",
          "showPreferencesBtn": "カスタマイズ"
        },
        "preferencesModal": {
          "title": "Cookie設定",
          "acceptAllBtn": "許可する",
          "acceptNecessaryBtn": "必要なもののみ",
          "savePreferencesBtn": "設定を保存",
          "closeIconLabel": "閉じる",
          "sections": [
            {
              "title": "必要なCookie",
              "description": "これらのCookieはウェブサイトの機能に必要であり、無効にすることはできません。",
              "linkedCategory": "necessary"
            },
            {
              "title": "分析Cookie",
              "description": "これらのCookieは、訪問者がウェブサイトとどのように対話するかを理解するのに役立ちます。",
              "linkedCategory": "analytics"
            },
            {
              "title": "マーケティングCookie",
              "description": "これらのCookieはパーソナライズされた広告を配信するために使用されます。",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "ko": {
        "consentModal": {
          "description": "경험 향상과 사이트 사용 분석을 위해 쿠키를 사용합니다.",
          "acceptAllBtn": "수락",
          "showPreferencesBtn": "사용자 지정"
        },
        "preferencesModal": {
          "title": "쿠키 설정",
          "acceptAllBtn": "수락",
          "acceptNecessaryBtn": "필수만 수락",
          "savePreferencesBtn": "설정 저장",
          "closeIconLabel": "닫기",
          "sections": [
            {
              "title": "필수 쿠키",
              "description": "이 쿠키는 웹사이트 작동에 필요하며 비활성화할 수 없습니다.",
              "linkedCategory": "necessary"
            },
            {
              "title": "분석 쿠키",
              "description": "이 쿠키는 방문자가 웹사이트와 어떻게 상호작용하는지 이해하는 데 도움이 됩니다.",
              "linkedCategory": "analytics"
            },
            {
              "title": "마케팅 쿠키",
              "description": "이 쿠키는 맞춤형 광고를 제공하는 데 사용됩니다.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "pl": {
        "consentModal": {
          "description": "Używamy plików cookie, aby poprawić Twoje wrażenia i analizować korzystanie z witryny.",
          "acceptAllBtn": "Akceptuję",
          "showPreferencesBtn": "Dostosuj"
        },
        "preferencesModal": {
          "title": "Preferencje cookie",
          "acceptAllBtn": "Akceptuję",
          "acceptNecessaryBtn": "Tylko niezbędne",
          "savePreferencesBtn": "Zapisz preferencje",
          "closeIconLabel": "Zamknij",
          "sections": [
            {
              "title": "Niezbędne pliki cookie",
              "description": "Te pliki cookie są niezbędne do działania strony i nie można ich wyłączyć.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Analityczne pliki cookie",
              "description": "Te pliki cookie pomagają nam zrozumieć, w jaki sposób odwiedzający korzystają z naszej strony.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Marketingowe pliki cookie",
              "description": "Te pliki cookie służą do wyświetlania spersonalizowanych reklam.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "uk": {
        "consentModal": {
          "description": "Ми використовуємо файли cookie для покращення вашого досвіду та аналізу використання сайту.",
          "acceptAllBtn": "Прийняти",
          "showPreferencesBtn": "Налаштувати"
        },
        "preferencesModal": {
          "title": "Налаштування cookie",
          "acceptAllBtn": "Прийняти",
          "acceptNecessaryBtn": "Лише необхідні",
          "savePreferencesBtn": "Зберегти налаштування",
          "closeIconLabel": "Закрити",
          "sections": [
            {
              "title": "Необхідні cookie",
              "description": "Ці файли cookie необхідні для роботи сайту і не можуть бути вимкнені.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Аналітичні cookie",
              "description": "Ці файли cookie допомагають нам зрозуміти, як відвідувачі взаємодіють з нашим сайтом.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Маркетингові cookie",
              "description": "Ці файли cookie використовуються для показу персоналізованої реклами.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "ro": {
        "consentModal": {
          "description": "Folosim cookie-uri pentru a vă îmbunătăți experiența și a analiza utilizarea site-ului.",
          "acceptAllBtn": "Acceptă",
          "showPreferencesBtn": "Personalizează"
        },
        "preferencesModal": {
          "title": "Preferințe cookie",
          "acceptAllBtn": "Acceptă",
          "acceptNecessaryBtn": "Doar necesare",
          "savePreferencesBtn": "Salvează preferințele",
          "closeIconLabel": "Închide",
          "sections": [
            {
              "title": "Cookie-uri esențiale",
              "description": "Aceste cookie-uri sunt necesare pentru funcționarea site-ului și nu pot fi dezactivate.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Cookie-uri analitice",
              "description": "Aceste cookie-uri ne ajută să înțelegem cum interacționează vizitatorii cu site-ul nostru.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Cookie-uri de marketing",
              "description": "Aceste cookie-uri sunt folosite pentru a afișa reclame personalizate.",
              "linkedCategory": "marketing"
            }
          ]
        }
      },
      "bg": {
        "consentModal": {
          "description": "Използваме бисквитки, за да подобрим изживяването ви и да анализираме използването на сайта.",
          "acceptAllBtn": "Приемам",
          "showPreferencesBtn": "Персонализиране"
        },
        "preferencesModal": {
          "title": "Настройки за бисквитки",
          "acceptAllBtn": "Приемам",
          "acceptNecessaryBtn": "Само необходимите",
          "savePreferencesBtn": "Запазване на предпочитанията",
          "closeIconLabel": "Затвори",
          "sections": [
            {
              "title": "Необходими бисквитки",
              "description": "Тези бисквитки са необходими за функционирането на уебсайта и не могат да бъдат деактивирани.",
              "linkedCategory": "necessary"
            },
            {
              "title": "Аналитични бисквитки",
              "description": "Тези бисквитки ни помагат да разберем как посетителите взаимодействат с нашия уебсайт.",
              "linkedCategory": "analytics"
            },
            {
              "title": "Маркетингови бисквитки",
              "description": "Тези бисквитки се използват за показване на персонализирани реклами.",
              "linkedCategory": "marketing"
            }
          ]
        }
      }
    }
  },
  "guiOptions": {
    "consentModal": {
      "layout": "bar inline",
      "position": "bottom",
      "equalWeightButtons": false,
      "flipButtons": false
    },
    "preferencesModal": {
      "layout": "box",
      "equalWeightButtons": false,
      "flipButtons": false
    }
  }
};
      var __ccCloseLabels = {"en":"Close","es":"Cerrar","fr":"Fermer","de":"Schließen","it":"Chiudi","pt":"Fechar","nl":"Sluiten","he":"סגור","ar":"إغلاق","tr":"Kapat","ru":"Закрыть","zh":"关闭","ja":"閉じる","ko":"닫기","pl":"Zamknij","uk":"Закрити","ro":"Închide","bg":"Затвори"};

      // Detect the current page language and override the build-time default.
      // Published multi-language sites set <html lang="…"> per URL prefix;
      // preview pages may store the active language on zappyI18n.
      var pageLang = (document.documentElement.getAttribute('lang') || '').split('-')[0].toLowerCase();
      if (!pageLang && typeof zappyI18n !== 'undefined' && zappyI18n.language) {
        pageLang = String(zappyI18n.language).split('-')[0].toLowerCase();
      }
      if (pageLang && __ccConfig.language.translations[pageLang]) {
        __ccConfig.language.default = pageLang;
      }

      function getActiveLanguage() {
        var lang = (document.documentElement.getAttribute('lang') || '').split('-')[0].toLowerCase();
        if (!lang && typeof zappyI18n !== 'undefined' && zappyI18n.language) {
          lang = String(zappyI18n.language).split('-')[0].toLowerCase();
        }
        if (!lang || !__ccConfig.language.translations[lang]) {
          lang = __ccConfig.language.default || 'en';
        }
        return __ccConfig.language.translations[lang] ? lang : 'en';
      }

      function getConsentText() {
        var lang = getActiveLanguage();
        var translations = __ccConfig.language.translations || {};
        var current = translations[lang] || translations.en || {};
        var consent = current.consentModal || {};
        var labels = __ccCloseLabels || {};
        return {
          description: consent.description || '',
          accept: consent.acceptAllBtn || 'Accept',
          customize: consent.showPreferencesBtn || 'Customize',
          close: labels[lang] || labels.en || 'Close'
        };
      }

      function removeCustomBanner() {
        var banner = document.getElementById('zappy-cookie-banner');
        if (banner && banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
        document.documentElement.classList.remove('zappy-cookie-banner-visible');
      }

      function updateCustomBannerText() {
        var banner = document.getElementById('zappy-cookie-banner');
        if (!banner) return;
        var text = getConsentText();
        var desc = banner.querySelector('[data-zappy-cookie-description]');
        var accept = banner.querySelector('[data-zappy-cookie-accept]');
        var customize = banner.querySelector('[data-zappy-cookie-customize]');
        var close = banner.querySelector('[data-zappy-cookie-close]');
        banner.setAttribute('aria-label', text.description || text.close);
        if (desc) desc.textContent = text.description;
        if (accept) accept.textContent = text.accept;
        if (customize) customize.textContent = text.customize;
        if (close) close.setAttribute('aria-label', text.close);
      }

      // Google Consent Mode v2 integration
      function updateGoogleConsentMode() {
        if (typeof gtag !== 'function') {
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){dataLayer.push(arguments);};
        }
        
        var analyticsAccepted = cc.acceptedCategory('analytics');
        var marketingAccepted = cc.acceptedCategory('marketing');
        
        gtag('consent', 'update', {
          'analytics_storage': analyticsAccepted ? 'granted' : 'denied',
          'ad_storage': marketingAccepted ? 'granted' : 'denied',
          'ad_user_data': marketingAccepted ? 'granted' : 'denied',
          'ad_personalization': marketingAccepted ? 'granted' : 'denied'
        });
      }

      function acceptAndClose(categories) {
        try { cc.acceptCategory(categories); } catch (_) {}
        removeCustomBanner();
        updateGoogleConsentMode();
      }

      function renderCustomBanner() {
        try {
          if (typeof cc.validConsent === 'function' && cc.validConsent()) {
            removeCustomBanner();
            return;
          }
          if (!document.body) {
            setTimeout(renderCustomBanner, 50);
            return;
          }
          var existing = document.getElementById('zappy-cookie-banner');
          if (existing) {
            updateCustomBannerText();
            return;
          }

          var text = getConsentText();
          var banner = document.createElement('div');
          banner.id = 'zappy-cookie-banner';
          banner.className = 'zappy-cookie-banner';
          banner.setAttribute('role', 'region');
          banner.setAttribute('aria-label', text.description || text.close);

          var inner = document.createElement('div');
          inner.className = 'zappy-cookie-banner__inner';

          var description = document.createElement('p');
          description.className = 'zappy-cookie-banner__text';
          description.setAttribute('data-zappy-cookie-description', 'true');
          description.textContent = text.description;

          var actions = document.createElement('div');
          actions.className = 'zappy-cookie-banner__actions';

          var customizeBtn = document.createElement('button');
          customizeBtn.type = 'button';
          customizeBtn.className = 'zappy-cookie-banner__button zappy-cookie-banner__button--customize';
          customizeBtn.setAttribute('data-zappy-cookie-customize', 'true');
          customizeBtn.textContent = text.customize;
          customizeBtn.addEventListener('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            try { cc.showPreferences(); } catch (_) {}
          });

          var acceptBtn = document.createElement('button');
          acceptBtn.type = 'button';
          acceptBtn.className = 'zappy-cookie-banner__button zappy-cookie-banner__button--accept';
          acceptBtn.setAttribute('data-zappy-cookie-accept', 'true');
          acceptBtn.textContent = text.accept;
          acceptBtn.addEventListener('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            acceptAndClose('all');
          });

          var closeBtn = document.createElement('button');
          closeBtn.type = 'button';
          closeBtn.className = 'zappy-cookie-banner__close';
          closeBtn.setAttribute('data-zappy-cookie-close', 'true');
          closeBtn.setAttribute('aria-label', text.close);
          closeBtn.textContent = '\u00D7';
          closeBtn.addEventListener('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            acceptAndClose([]);
          });

          actions.appendChild(customizeBtn);
          actions.appendChild(acceptBtn);
          inner.appendChild(description);
          inner.appendChild(actions);
          inner.appendChild(closeBtn);
          banner.appendChild(inner);
          document.body.appendChild(banner);
          document.documentElement.classList.add('zappy-cookie-banner-visible');
        } catch (_) {
          // Defensive — never let the custom banner break the page.
        }
      }

      function handleConsentResolved() {
        removeCustomBanner();
        updateGoogleConsentMode();
      }

      __ccConfig.onFirstConsent = handleConsentResolved;
      __ccConfig.onConsent = handleConsentResolved;
      __ccConfig.onChange = handleConsentResolved;

      var runResult = cc.run(__ccConfig);
      var afterRun = function() {
        updateGoogleConsentMode();
        if (!cc.validConsent || !cc.validConsent()) {
          renderCustomBanner();
        }
      };
      if (runResult && typeof runResult.then === 'function') {
        runResult.then(afterRun).catch(afterRun);
      } else {
        setTimeout(afterRun, 0);
      }

      // Keep cookie consent in sync when the user switches language without
      // a full navigation (preview / embedded-resources path).
      if (typeof zappyI18n !== 'undefined' && typeof zappyI18n.onLanguageChange === 'function') {
        zappyI18n.onLanguageChange(function(newLang) {
          try {
            if (__ccConfig.language.translations[newLang]) {
              __ccConfig.language.default = newLang;
              cc.setLanguage(newLang, true);
              updateCustomBannerText();
            }
          } catch (_) {}
        });
      }
    } catch (error) {
      window.__zappyCookieConsentInitialized = false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
    setTimeout(initCookieConsent, 1000);
  } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initCookieConsent();
  } else {
    setTimeout(initCookieConsent, 500);
  }
  
  if (typeof window !== 'undefined') {
    if (window.addEventListener) {
      window.addEventListener('load', initCookieConsent, { once: true });
    }
  }
})();

/* Accessibility Features */

/* Mickidum Accessibility Toolbar Initialization - Zappy Style */

window.onload = function() {
    
    try {
        // Detect current page language and direction from <html> element
        // so the toolbar matches the active language on multi-language sites.
        var htmlEl = document.documentElement;
        var pageLang = (htmlEl.getAttribute('lang') || 'he').toLowerCase().split('-')[0];
        var pageDir = (htmlEl.getAttribute('dir') || '').toLowerCase();
        var rtlLangs = ['he', 'ar', 'fa', 'ur', 'yi', 'iw'];
        var isPageRTL = pageDir === 'rtl' || rtlLangs.indexOf(pageLang) !== -1;
        var buttonSide = isPageRTL ? 'left' : 'right';

        var langMap = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-PT', nl: 'nl-NL', he: 'he-IL', ar: 'ar-SA' };
        var forceLang = langMap[pageLang] || 'he-IL';

        var iconPos = { bottom: { size: 50, units: 'px' }, type: 'fixed' };
        iconPos[buttonSide] = { size: 20, units: 'px' };

        window.micAccessTool = new MicAccessTool({
            buttonPosition: buttonSide,
            forceLang: forceLang,
            icon: {
                position: iconPos,
                backgroundColor: 'transparent',
                color: 'transparent',
                img: 'accessible',
                circular: false
            },
            menu: {
                dimensions: {
                    width: { size: 300, units: 'px' },
                    height: { size: 'auto', units: 'px' }
                }
            }
        });
        
    } catch (error) {
    }
    
    // Keyboard shortcut handler: ALT+A (Option+A on Mac) to toggle accessibility menu
    document.addEventListener('keydown', function(event) {
        var isAltOrOption = event.altKey;
        var isAKey = event.code === 'KeyA' || event.keyCode === 65 || event.which === 65 || 
                      (event.key && (event.key.toLowerCase() === 'a' || event.key === 'å' || event.key === 'Å'));
        
        if (isAltOrOption && isAKey) {
            event.preventDefault();
            event.stopPropagation();
            var accessButton = document.getElementById('mic-access-tool-general-button');
            if (accessButton) {
                accessButton.click();
            }
        }
    }, true);
};


// Zappy Contact Form API Integration (Fallback)
(function() {
    if (window.zappyContactFormLoaded) {
        console.log('📧 Zappy contact form already loaded');
        return;
    }
    window.zappyContactFormLoaded = true;

    function zappyNotify(message, type) {
        var existing = document.querySelectorAll('.zappy-notification');
        existing.forEach(function(el) { el.remove(); });
        var el = document.createElement('div');
        el.className = 'zappy-notification';
        var bg = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1';
        var fg = type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460';
        var border = type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb';
        var icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        el.style.cssText = 'position:fixed;top:20px;right:20px;max-width:400px;padding:16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.4;animation:slideInRight .3s ease-out;background:' + bg + ';color:' + fg + ';border:1px solid ' + border;
        el.innerHTML = '<span style="margin-right:8px">' + icon + '</span>' + message + '<button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:18px;cursor:pointer;float:right;opacity:.7;padding:0 0 0 12px">&times;</button>';
        if (!document.getElementById('zappy-notify-anim')) {
            var s = document.createElement('style');
            s.id = 'zappy-notify-anim';
            s.textContent = '@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
            document.head.appendChild(s);
        }
        document.body.appendChild(el);
        setTimeout(function() { if (el.parentElement) el.remove(); }, type === 'error' ? 8000 : 5000);
    }

    function initContactFormIntegration() {
        console.log('📧 Zappy: Initializing contact form API integration...');

        // Exclude newsletter popup form (data-zappy-newsletter / #znl-form /
        // forms inside .znl-overlay) — they have their own submit handler that
        // posts to /api/newsletter/public/.../subscribe and must not be hijacked
        // by the contact-form integration.
        function isNewsletterPopupForm(f) {
            if (!f) return false;
            if (f.hasAttribute && f.hasAttribute('data-zappy-newsletter')) return true;
            if (f.id === 'znl-form' || (f.classList && f.classList.contains('znl-form'))) return true;
            if (f.closest && f.closest('.znl-overlay, [data-zappy-newsletter]')) return true;
            return false;
        }
        function pickContactForm() {
            var candidates = [
                document.querySelector('.contact-form'),
                document.querySelector('form[action*="contact"]'),
                document.querySelector('form#contact'),
                document.querySelector('form#contactForm'),
                document.getElementById('contactForm'),
                document.querySelector('section.contact form'),
                document.querySelector('section#contact form')
            ];
            for (var i = 0; i < candidates.length; i++) {
                if (candidates[i] && !isNewsletterPopupForm(candidates[i])) return candidates[i];
            }
            // Last-resort fallback: first <form> that isn't a newsletter popup form.
            var all = document.querySelectorAll('form');
            for (var j = 0; j < all.length; j++) {
                if (!isNewsletterPopupForm(all[j])) return all[j];
            }
            return null;
        }
        var contactForm = pickContactForm();

        if (!contactForm) {
            console.log('⚠️ Zappy: No contact form found on page');
            return;
        }
        
        console.log('✅ Zappy: Contact form found:', contactForm.className || contactForm.id || 'unnamed form');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate privacy consent checkbox if present (required for GDPR)
        var privacyCheckbox = this.querySelector('.privacy-consent-checkbox');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            zappyNotify('Please accept the Terms & Conditions and Privacy Policy to continue', 'error');
            privacyCheckbox.focus();
            return;
        }

        // Collect form data with multi-value support (checkboxes, multi-selects)
        var formData = new FormData(this);
        var data = {};
        for (var pair of formData.entries()) {
            if (data[pair[0]] !== undefined) {
                if (Array.isArray(data[pair[0]])) data[pair[0]].push(pair[1]);
                else data[pair[0]] = [data[pair[0]], pair[1]];
            } else {
                data[pair[0]] = pair[1];
            }
        }

        // Smart field mapping
        var _coreNameFields = ['name','firstName','first_name','fname','lastName','last_name','lname'];
        var _coreEmailFields = ['email','emailAddress','mail','e-mail'];
        var _corePhoneFields = ['phone','tel','telephone','mobile','cellphone'];
        var _coreMsgFields = ['message','msg','comments','comment','description','details','notes','body','text','inquiry'];
        var _coreSubjectFields = ['subject','topic','regarding','re'];
        var _allCoreFields = [].concat(_coreNameFields, _coreEmailFields, _corePhoneFields, _coreMsgFields, _coreSubjectFields);

        var resolvedName = (data.name || '').trim()
            || [data.firstName || data.first_name || data.fname || '', data.lastName || data.last_name || data.lname || ''].filter(Boolean).join(' ').trim()
            || (data.email || data.emailAddress || data.mail || '').trim()
            || 'Anonymous';
        var resolvedEmail = (data.email || data.emailAddress || data.mail || data['e-mail'] || '').trim();
        var resolvedPhone = data.phone || data.tel || data.telephone || data.mobile || data.cellphone || null;
        var resolvedSubject = data.subject || data.topic || data.regarding || data.re || 'Contact Form Submission';
        var resolvedMessage = (data.message || data.msg || data.comments || data.comment || data.description || data.details || data.body || data.text || data.inquiry || '').trim();
        if (!resolvedMessage) {
            var extraEntries = Object.entries(data).filter(function(e) { return _allCoreFields.indexOf(e[0]) === -1; });
            if (extraEntries.length > 0) {
                resolvedMessage = extraEntries.map(function(e) {
                    var label = e[0].replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
                    var val = Array.isArray(e[1]) ? e[1].join(', ') : e[1];
                    return label + ': ' + val;
                }).join('\n');
            } else {
                resolvedMessage = 'Form submission from ' + window.location.pathname;
            }
        }

        var extraFields = {};
        for (var k of Object.keys(data)) {
            if (_allCoreFields.indexOf(k) === -1 && data[k] !== '' && data[k] !== null && data[k] !== undefined) {
                extraFields[k] = data[k];
            }
        }

        // Loading state
        var submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
        var originalText = submitBtn ? (submitBtn.value || submitBtn.textContent) : '';
        if (submitBtn) {
            if (submitBtn.tagName === 'INPUT') submitBtn.value = 'Sending...';
            else submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }

        var currentPagePath = window.location.pathname;
        if (window.ZAPPY_CONFIG && window.ZAPPY_CONFIG.currentPagePath) {
            currentPagePath = window.ZAPPY_CONFIG.currentPagePath;
        } else {
            try {
                var p = new URLSearchParams(window.location.search).get('page');
                if (p) currentPagePath = p;
            } catch (ignored) {}
        }

        var theForm = this;
        try {
            console.log('📧 Zappy: Sending contact form to backend API...');
            var apiBase = (window.ZAPPY_API_BASE || 'https://api.zappy5.com').replace(/\/$/, '');
            var payload = {
                websiteId: 'ffe5f345-a33b-45b1-98fe-67a437201841',
                name: resolvedName,
                email: resolvedEmail,
                subject: resolvedSubject,
                message: resolvedMessage,
                phone: resolvedPhone,
                currentPagePath: currentPagePath
            };
            if (Object.keys(extraFields).length > 0) {
                payload.extraFields = extraFields;
            }
            var response = await fetch(apiBase + '/api/email/contact-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            var result = await response.json();
            
            if (result.success) {
                console.log('✅ Zappy: Contact form data sent successfully to backend');

                // Thank-you page redirect
                if (result.thankYouPagePath && result.ticketNumber) {
                    var ticketParam = 'ticket=' + encodeURIComponent(result.ticketNumber);
                    var isPreview = window.location.pathname.indexOf('/preview') !== -1;
                    var thankYouUrl;
                    if (isPreview && window.ZAPPY_CONFIG) {
                        var wid = window.ZAPPY_CONFIG.websiteId || 'ffe5f345-a33b-45b1-98fe-67a437201841';
                        var pt = window.location.pathname.indexOf('fullscreen') !== -1 ? 'preview-fullscreen' : 'preview';
                        thankYouUrl = window.location.origin + '/api/website/' + pt + '/' + wid + '?page=' + encodeURIComponent(result.thankYouPagePath) + '&' + ticketParam;
                        if (window.ZAPPY_CONFIG.authToken) thankYouUrl += '&auth_token=' + encodeURIComponent(window.ZAPPY_CONFIG.authToken);
                    } else {
                        thankYouUrl = result.thankYouPagePath + '?' + ticketParam;
                    }
                    window.location.href = thankYouUrl;
                    return;
                }

                var _siteLang = document.documentElement.lang || '';
                var _isHeSite = _siteLang === 'he' || (_siteLang !== 'ar' && document.documentElement.dir === 'rtl');
                var _isArSite = _siteLang === 'ar';
                var _successFallback = _isHeSite ? 'ההודעה שלך נשלחה בהצלחה! נחזור אליך בהקדם.' : _isArSite ? 'تم إرسال رسالتك بنجاح! سنرد عليك قريبًا.' : 'Thank you for your message! We\'ll get back to you soon.';
                zappyNotify(result.message || _successFallback, 'success');
                theForm.reset();
            } else {
                console.log('⚠️ Zappy: Backend returned error:', result.error);
                var _isHeSiteErr = _siteLang === 'he' || (_siteLang !== 'ar' && document.documentElement.dir === 'rtl');
                var _isArSiteErr = _siteLang === 'ar';
                var _errFallback = _isHeSiteErr ? 'שליחת ההודעה נכשלה. אנא נסו שוב.' : _isArSiteErr ? 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'Failed to send message. Please try again.';
                zappyNotify(result.error || _errFallback, 'error');
            }
        } catch (error) {
            console.error('❌ Zappy: Failed to send to backend API:', error);
            var _isHeSiteNet = _siteLang === 'he' || (_siteLang !== 'ar' && document.documentElement.dir === 'rtl');
            var _isArSiteNet = _siteLang === 'ar';
            var _netFallback = _isHeSiteNet ? 'לא ניתן לשלוח הודעה כרגע. אנא נסו שוב מאוחר יותר.' : _isArSiteNet ? 'لا يمكن إرسال الرسالة الآن. يرجى المحاولة مرة أخرى لاحقًا.' : 'Unable to send message right now. Please try again later.';
            zappyNotify(_netFallback, 'error');
        } finally {
            if (submitBtn) {
                if (submitBtn.tagName === 'INPUT') submitBtn.value = originalText;
                else submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
        }, true);

        console.log('✅ Zappy: Contact form API integration initialized');
    } // End of initContactFormIntegration
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactFormIntegration);
    } else {
        initContactFormIntegration();
    }
})();


/* ZAPPY_PUBLISHED_LIGHTBOX_RUNTIME */
(function(){
  try {
    if (window.__zappyPublishedLightboxInit) return;
    window.__zappyPublishedLightboxInit = true;

    function safeText(s){ try { return String(s || '').replace(/"/g,'&quot;'); } catch(e){ return ''; } }

    function ensureOverlayForToggle(toggle){
      try {
        if (!toggle || !toggle.id) return;
        if (toggle.id.indexOf('zappy-lightbox-toggle-') !== 0) return;
        var elementId = toggle.id.replace('zappy-lightbox-toggle-','');
        var label = document.querySelector('label.zappy-lightbox-trigger[for="' + toggle.id + '"]');
        if (!label) return;

        // If toggle is inside the label (corrupted), move it before the label so the for attribute works consistently.
        try {
          if (label.contains(toggle) && label.parentNode) {
            label.parentNode.insertBefore(toggle, label);
          }
        } catch (e0) {}

        var lightboxId = 'zappy-lightbox-' + elementId;
        var lb = document.getElementById(lightboxId);
        if (lb && lb.parentNode !== document.body) {
          try { document.body.appendChild(lb); } catch (eMove) {}
        }

        if (!lb) {
          var img = null;
          try { img = label.querySelector('img'); } catch (eImg0) {}
          if (!img) {
            try { img = document.querySelector('img[data-element-id="' + elementId + '"]'); } catch (eImg1) {}
          }
          if (!img) return;

          lb = document.createElement('div');
          lb.id = lightboxId;
          lb.className = 'zappy-lightbox';
          lb.setAttribute('data-zappy-image-lightbox','true');
          lb.style.display = 'none';
          lb.innerHTML =
            '<label class="zappy-lightbox-backdrop" for="' + toggle.id + '" aria-label="Close"></label>' +
            '<div class="zappy-lightbox-content">' +
              '<label class="zappy-lightbox-close" for="' + toggle.id + '" aria-label="Close">×</label>' +
              '<img class="zappy-lightbox-image" src="' + safeText(img.currentSrc || img.src || img.getAttribute('src')) + '" alt="' + safeText(img.getAttribute('alt') || 'Image') + '">' +
            '</div>';
          document.body.appendChild(lb);
        }

        // Keep overlay image in sync at open time (in case src changed / responsive currentSrc)
        function syncOverlayImage(){
          try {
            var imgCur = label.querySelector('img');
            var imgLb = lb.querySelector('img');
            if (imgCur && imgLb) {
              imgLb.src = imgCur.currentSrc || imgCur.src || imgLb.src;
              imgLb.alt = imgCur.alt || imgLb.alt;
            }
          } catch (eSync) {}
        }

        if (!toggle.__zappyLbBound) {
          toggle.addEventListener('change', function(){
            if (toggle.checked) syncOverlayImage();
            lb.style.display = toggle.checked ? 'flex' : 'none';
          });
          toggle.__zappyLbBound = true;
        }

        if (!lb.__zappyLbBound) {
          lb.addEventListener('click', function(ev){
            try {
              var t = ev.target;
              if (!t) return;
              if (t.classList && (t.classList.contains('zappy-lightbox-backdrop') || t.classList.contains('zappy-lightbox-close'))) {
                ev.preventDefault();
                toggle.checked = false;
                lb.style.display = 'none';
              }
            } catch (e2) {}
          });
          lb.__zappyLbBound = true;
        }

        if (!label.__zappyLbClick) {
          label.addEventListener('click', function(ev){
            try {
              if (document.body && document.body.classList && document.body.classList.contains('zappy-edit-mode')) return;
              if (ev && ev.target && ev.target.closest && ev.target.closest('a[href],button,input,select,textarea')) return;
              ev.preventDefault();
              ev.stopPropagation();
              toggle.checked = true;
              syncOverlayImage();
              lb.style.display = 'flex';
            } catch (e3) {}
          }, true);
          label.__zappyLbClick = true;
        }
      } catch (e) {}
    }

    function ensureLightboxCss(){
      try {
        var head = document.head || document.querySelector('head');
        if (!head || head.querySelector('style[data-zappy-image-lightbox="true"]')) return;
        var s = document.createElement('style');
        s.setAttribute('data-zappy-image-lightbox','true');
        s.textContent =
          '.zappy-lightbox{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;z-index:9999;padding:24px;}'+
          '.zappy-lightbox-content{position:relative;max-width:min(1100px,92vw);max-height:92vh;}'+
          '.zappy-lightbox-content img{max-width:92vw;max-height:92vh;display:block;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.45);}'+
          '.zappy-lightbox-close{position:absolute;top:-14px;right:-14px;width:32px;height:32px;border-radius:999px;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;}'+
          '.zappy-lightbox-backdrop{position:absolute;inset:0;display:block;cursor:pointer;}'+
          'input.zappy-lightbox-toggle{position:absolute;opacity:0;pointer-events:none;}'+
          'label.zappy-lightbox-trigger{display:contents;}'+
          'label.zappy-lightbox-trigger{cursor:zoom-in;}'+
          'label.zappy-lightbox-trigger [data-zappy-zoom-wrapper="true"],'+
          'label.zappy-lightbox-trigger img{cursor:zoom-in !important;}'+
          'input.zappy-lightbox-toggle:checked + label.zappy-lightbox-trigger + .zappy-lightbox{display:flex;}';
        head.appendChild(s);
      } catch(e){}
    }

    function initZappyPublishedLightboxes(){
      try {
        ensureLightboxCss();
        // Repair orphaned labels (label has for=toggleId but input is missing)
        var orphanLabels = document.querySelectorAll('label.zappy-lightbox-trigger[for^="zappy-lightbox-toggle-"]');
        for (var i=0;i<orphanLabels.length;i++){
          var lbl = orphanLabels[i];
          var forId = lbl && lbl.getAttribute ? lbl.getAttribute('for') : null;
          if (!forId) continue;
          if (!document.getElementById(forId)) {
            var t = document.createElement('input');
            t.type = 'checkbox';
            t.id = forId;
            t.className = 'zappy-lightbox-toggle';
            t.setAttribute('data-zappy-image-lightbox','true');
            if (lbl.parentNode) lbl.parentNode.insertBefore(t, lbl);
          }
        }

        var toggles = document.querySelectorAll('input.zappy-lightbox-toggle[id^="zappy-lightbox-toggle-"]');
        for (var j=0;j<toggles.length;j++){
          ensureOverlayForToggle(toggles[j]);
        }

        // Close on ESC if any lightbox is open
        if (!document.__zappyLbEscBound) {
          document.addEventListener('keydown', function(ev){
            try {
              if (!ev || ev.key !== 'Escape') return;
              var openLb = document.querySelector('.zappy-lightbox[style*="display: flex"]');
              if (openLb) {
                var openToggle = null;
                try {
                  var id = openLb.id || '';
                  if (id.indexOf('zappy-lightbox-') === 0) {
                    openToggle = document.getElementById('zappy-lightbox-toggle-' + id.replace('zappy-lightbox-',''));
                  }
                } catch (e4) {}
                if (openToggle) openToggle.checked = false;
                openLb.style.display = 'none';
              }
            } catch (e5) {}
          });
          document.__zappyLbEscBound = true;
        }
      } catch (eInit) {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initZappyPublishedLightboxes, { once: true });
    } else {
      initZappyPublishedLightboxes();
    }
  } catch (eOuter) {}
})();
/* END ZAPPY_PUBLISHED_LIGHTBOX_RUNTIME */


/* ZAPPY_PUBLISHED_ZOOM_WRAPPER_RUNTIME */
(function(){
  try {
    if (window.__zappyPublishedZoomInit) return;
    window.__zappyPublishedZoomInit = true;

    function isHeroBgWrapper(wrapper) {
      var img = wrapper.querySelector('img');
      if (img && (img.getAttribute('data-hero-bg') === 'true' || img.getAttribute('data-hero-background') === 'true')) return true;
      var pos = (wrapper.style.position || '').replace(/\s*!important\s*/g, '').trim();
      var w = (wrapper.style.width || '').replace(/\s*!important\s*/g, '').trim();
      var h = (wrapper.style.height || '').replace(/\s*!important\s*/g, '').trim();
      if (pos === 'absolute' && w === '100%' && h === '100%') return true;
      return false;
    }

    // SYNC: These helpers must match sharedZoomCropMath.js
    function parseObjPos(op) {
      var x = 50, y = 50;
      try {
        if (typeof op === 'string') {
          var m = op.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
          if (m) { x = parseFloat(m[1]); y = parseFloat(m[2]); }
        }
      } catch (e) {}
      if (!isFinite(x)) x = 50; if (!isFinite(y)) y = 50;
      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    }

    function coverPercents(imgA, contA) {
      if (!isFinite(imgA) || imgA <= 0 || !isFinite(contA) || contA <= 0)
        return { w: 100, h: 100 };
      if (imgA >= contA) return { w: (imgA / contA) * 100, h: 100 };
      return { w: 100, h: (contA / imgA) * 100 };
    }

    // FULL-BLEED FIRST-CHILD MEDIA: when the wrapper's parent (the image-wrap)
    // is the first visible child of a padded card, apply negative margins on all
    // sides equal to the card's padding so the image extends edge-to-edge of the
    // card. Without this, every padded card leaves a visible padding "frame"
    // around the image which users perceive as the image not filling the card.
    // Applies on BOTH desktop and mobile — this is a layout concern, not a
    // viewport-specific one. Skipped for hero backgrounds and full-width wrappers.
    function applyFirstChildBleed(wrapper) {
      try {
        if (!wrapper || isHeroBgWrapper(wrapper)) return;
        var widthMode = wrapper.getAttribute('data-zappy-zoom-wrapper-width-mode');
        if (widthMode === 'full') return;
        // Bleed only recognized image-slot wrappers that are direct children
        // of padded card-like containers. This still handles editor-injected
        // wrappers (card -> image-wrap -> zappy-inserted-element -> wrapper)
        // but avoids bleeding media into full section/layout containers.
        var slotForBleed = null;
        var slotNode = wrapper.parentElement;
        for (var slotWalk = 0; slotWalk < 4 && slotNode && slotNode !== document.body; slotWalk++) {
          var slotNodeClass = (slotNode.className || '').toString().toLowerCase();
          if (/(image-wrap|image-tile|image-slot|card-image|card-media|media-wrap|portrait-wrap)/.test(slotNodeClass)) {
            slotForBleed = slotNode;
            break;
          }
          var slotNodeCS = window.getComputedStyle(slotNode);
          var slotNodeRawClass = (slotNode.className || '').toString();
          var slotThinAnchor = slotNode.tagName === 'A' && slotNodeCS.display === 'contents';
          var slotUnclassedDiv = slotNode.tagName === 'DIV' && !slotNodeRawClass.trim();
          var slotInserted = / zappy-inserted-element |^zappy-inserted-element | zappy-inserted-element$|^zappy-inserted-element$/.test(' ' + slotNodeRawClass + ' ');
          if (!(slotThinAnchor || slotUnclassedDiv || slotInserted)) break;
          slotNode = slotNode.parentElement;
        }
        var directInsertedForBleed = null;
        if (!slotForBleed && wrapper.parentElement) {
          var directParentClass = (wrapper.parentElement.className || '').toString();
          var directParentIsInserted = / zappy-inserted-element |^zappy-inserted-element | zappy-inserted-element$|^zappy-inserted-element$/.test(' ' + directParentClass + ' ');
          var directCard = wrapper.parentElement.parentElement;
          var directCardClass = (directCard && directCard.className || '').toString().toLowerCase();
          if (directParentIsInserted && /(card|tile|article|post|news|mention|press|journey|philosophy|feature|service)/.test(directCardClass)) {
            directInsertedForBleed = wrapper.parentElement;
          }
        }
        var bleedTarget = slotForBleed || directInsertedForBleed;
        var card = bleedTarget && bleedTarget.parentElement;
        var cardClass = (card && card.className || '').toString().toLowerCase();
        var isCardLike = /(card|tile|article|post|news|mention|press|journey|philosophy|feature|service)/.test(cardClass);
        if (!bleedTarget || !card || card === document.body || !isCardLike) return;
        var firstVisibleChild = null;
        for (var ci = 0; ci < card.children.length; ci++) {
          var ch = card.children[ci];
          var chCS = window.getComputedStyle(ch);
          if (chCS.display !== 'none' && chCS.visibility !== 'hidden') {
            firstVisibleChild = ch;
            break;
          }
        }
        if (firstVisibleChild !== bleedTarget) return;
        var cardCS = window.getComputedStyle(card);
        var padT = parseFloat(cardCS.paddingTop) || 0;
        var padL = parseFloat(cardCS.paddingLeft) || 0;
        var padR = parseFloat(cardCS.paddingRight) || 0;
        if (padL <= 0 && padR <= 0 && padT <= 0) return;
        bleedTarget.style.setProperty('margin-left', '-' + padL + 'px', 'important');
        bleedTarget.style.setProperty('margin-right', '-' + padR + 'px', 'important');
        bleedTarget.style.setProperty('margin-top', '-' + padT + 'px', 'important');
        bleedTarget.style.setProperty('width', 'calc(100% + ' + (padL + padR) + 'px)', 'important');
        bleedTarget.style.setProperty('max-width', 'calc(100% + ' + (padL + padR) + 'px)', 'important');
        bleedTarget.style.setProperty('height', 'auto', 'important');
        bleedTarget.style.setProperty('min-height', '0', 'important');
        bleedTarget.style.setProperty('max-height', 'none', 'important');
        bleedTarget.setAttribute('data-zappy-mobile-bleed', '1');
        wrapper.style.setProperty('width', '100%', 'important');
        wrapper.style.setProperty('max-width', '100%', 'important');
        var bleedSW = parseFloat(wrapper.getAttribute('data-zappy-zoom-wrapper-width')) || 0;
        var bleedSH = parseFloat(wrapper.getAttribute('data-zappy-zoom-wrapper-height')) || 0;
        if (bleedSW > 0 && bleedSH > 0) {
          wrapper.style.setProperty('aspect-ratio', bleedSW + '/' + bleedSH, 'important');
          wrapper.style.setProperty('height', 'auto', 'important');
        }
      } catch (_e) {}
    }

    // FILL CARD-SLOT CONTAINER: stretch the wrapper to fill its parent when
    // the parent is a designed image-slot container (class includes
    // image-wrap / image-tile / image-slot / card-image / card-media /
    // portrait-wrap) AND the wrapper is materially narrower than the parent.
    // This handles the case where the saved desktop pixel width (e.g. 383px)
    // is smaller than the rendered card slot at certain viewports / card
    // variants (e.g. journey-card--short which is 790px wide while the saved
    // image is 383px), leaving large empty gaps on the sides.
    // Logos, footer brand marks, and intentionally smaller media are not
    // matched because their parents do not carry image-slot class names.
    // Skipped for hero backgrounds and full-width wrappers.
    function applyCardSlotFill(wrapper, img) {
      try {
        if (!wrapper || isHeroBgWrapper(wrapper)) return;
        var widthMode = wrapper.getAttribute('data-zappy-zoom-wrapper-width-mode');
        if (widthMode === 'full') return;
        // Walk UP through editor-injected / "thin" wrappers to find the real
        // visual image-slot container. We tolerate at most 3 levels of:
        //   - <a style="display:contents">           (editor link wrap)
        //   - <div class="zappy-inserted-element">  (editor inserted media)
        //   - <div> with no class                    (anonymous inline wrap)
        var node = wrapper.parentElement;
        var slotEl = null;
        for (var walk = 0; walk < 3 && node && node !== document.body; walk++) {
          var nodeClass = (node.className || '').toString().toLowerCase();
          if (/(image-wrap|image-tile|image-slot|card-image|card-media|media-wrap|portrait-wrap)/.test(nodeClass)) {
            slotEl = node;
            break;
          }
          var nodeCS = window.getComputedStyle(node);
          var nodeRawClass = (node.className || '').toString();
          var isThinAnchor = node.tagName === 'A' && nodeCS.display === 'contents';
          var isUnclassedDiv = node.tagName === 'DIV' && !nodeRawClass.trim();
          var isInsertedEl = / zappy-inserted-element |^zappy-inserted-element | zappy-inserted-element$|^zappy-inserted-element$/.test(' ' + nodeRawClass + ' ');
          if (!(isThinAnchor || isUnclassedDiv || isInsertedEl)) break;
          node = node.parentElement;
        }
        if (!slotEl) {
          // No image-slot found. Check if the walk stopped at a card-like
          // container and the saved width fills most of the card — this handles
          // user-replaced images where the original image-wrap is empty and the
          // new image is in a zappy-inserted-element sibling.
          if (node && node !== document.body && !wrapper.getAttribute('data-zappy-card-slot-fill')) {
            var caClass = (node.className || '').toString().toLowerCase();
            var caIsCard = /(card|tile|article|post|news|mention|press|journey|philosophy|feature|service)/.test(caClass);
            if (caIsCard) {
              var caSavedW = parseFloat(wrapper.getAttribute('data-zappy-zoom-wrapper-width')) || 0;
              var caSavedH = parseFloat(wrapper.getAttribute('data-zappy-zoom-wrapper-height')) || 0;
              var caRect = node.getBoundingClientRect();
              if (caSavedW > 0 && caRect.width > 0 && caSavedW >= caRect.width * 0.8) {
                wrapper.style.setProperty('width', '100%', 'important');
                wrapper.style.setProperty('max-width', '100%', 'important');
                if (caSavedH > 0) {
                  wrapper.style.setProperty('aspect-ratio', caSavedW + '/' + caSavedH, 'important');
                  wrapper.style.setProperty('height', 'auto', 'important');
                }
                wrapper.setAttribute('data-zappy-card-slot-fill', '1');
                var caInt = wrapper.parentElement;
                for (var cai = 0; cai < 3 && caInt && caInt !== node; cai++) {
                  var caiRaw = (caInt.className || '').toString();
                  if (/ zappy-inserted-element |^zappy-inserted-element | zappy-inserted-element$|^zappy-inserted-element$/.test(' ' + caiRaw + ' ')) {
                    var caHasBleed = caInt.getAttribute('data-zappy-mobile-bleed');
                    if (!caHasBleed) {
                      caInt.style.setProperty('width', '100%', 'important');
                      caInt.style.setProperty('max-width', '100%', 'important');
                    }
                    caInt.style.setProperty('height', 'auto', 'important');
                    caInt.style.setProperty('min-height', '0', 'important');
                    caInt.style.setProperty('max-height', 'none', 'important');
                    var caIsFirst = true;
                    var caPrev = caInt.previousElementSibling;
                    while (caPrev) {
                      if (caPrev.getBoundingClientRect().height > 1) { caIsFirst = false; break; }
                      caPrev = caPrev.previousElementSibling;
                    }
                    if (caIsFirst) {
                      if (!caHasBleed) {
                        caInt.style.setProperty('margin-top', '0', 'important');
                      }
                      caInt.style.setProperty('border-radius', 'var(--radius-card, 20px) var(--radius-card, 20px) 0 0', 'important');
                      caInt.style.setProperty('overflow', 'hidden', 'important');
                    }
                  }
                  caInt = caInt.parentElement;
                }
              }
            }
          }
          return;
        }
        var slotRect = slotEl.getBoundingClientRect();
        var wrapRect = wrapper.getBoundingClientRect();
        var slotCS = window.getComputedStyle(slotEl);
        var slotWidthGap = slotRect.width - wrapRect.width;
        var slotHeightGap = wrapRect.height - slotRect.height;
        if (slotWidthGap <= 4 && !(slotHeightGap > 4 && slotRect.height > 0 && slotCS.overflow !== 'visible')) return;
        var swStr = wrapper.getAttribute('data-zappy-zoom-wrapper-width');
        var shStr = wrapper.getAttribute('data-zappy-zoom-wrapper-height');
        var swNum = parseFloat(swStr) || 0;
        var shNum = parseFloat(shStr) || 0;
        wrapper.style.setProperty('width', '100%', 'important');
        wrapper.style.setProperty('max-width', '100%', 'important');
        if (slotHeightGap > 4 && slotRect.height > 0 && slotCS.overflow !== 'visible') {
          wrapper.style.setProperty('height', '100%', 'important');
          wrapper.style.setProperty('aspect-ratio', 'auto', 'important');
          wrapper.style.setProperty('padding-bottom', '0', 'important');
          // Recompute image crop after changing the wrapper from stale saved
          // portrait dimensions to the real clipped slot height. Otherwise the
          // image may keep horizontal-overflow-only sizing, making vertical
          // object-position ineffective.
          if (img) {
            var finalRect = wrapper.getBoundingClientRect();
            var nW = img.naturalWidth || 0;
            var nH = img.naturalHeight || 0;
            if (finalRect && finalRect.width > 0 && finalRect.height > 0 && nW > 0 && nH > 0) {
              var finalCover = coverPercents(nW / nH, finalRect.width / finalRect.height);
              var zAttr = parseFloat(img.getAttribute('data-zappy-mobile-zoom') || img.getAttribute('data-zappy-zoom') || '1');
              var finalZoom = (isFinite(zAttr) && zAttr > 0) ? zAttr : 1;
              var finalW = 100;
              var finalH = 100;
              if (finalZoom >= 1) {
                finalW = finalCover.w * finalZoom;
                finalH = finalCover.h * finalZoom;
              } else {
                var finalT = (finalZoom - 0.5) / 0.5;
                if (!isFinite(finalT)) finalT = 0;
                finalT = Math.max(0, Math.min(1, finalT));
                finalW = 100 + finalT * (finalCover.w - 100);
                finalH = 100 + finalT * (finalCover.h - 100);
              }
              var finalPos = parseObjPos(img.getAttribute('data-zappy-mobile-object-position') || img.getAttribute('data-zappy-object-position') || img.style.objectPosition || '50% 50%');
              img.style.setProperty('position', 'absolute', 'important');
              img.style.setProperty('left', ((100 - finalW) * (finalPos.x / 100)) + '%', 'important');
              img.style.setProperty('top', ((100 - finalH) * (finalPos.y / 100)) + '%', 'important');
              img.style.setProperty('width', finalW + '%', 'important');
              img.style.setProperty('height', finalH + '%', 'important');
              img.style.setProperty('max-width', 'none', 'important');
              img.style.setProperty('max-height', 'none', 'important');
              img.style.setProperty('display', 'block', 'important');
              img.style.setProperty('object-fit', finalZoom < 1 ? 'fill' : 'cover', 'important');
              img.style.setProperty('margin', '0', 'important');
            }
          }
        } else if (swNum > 0 && shNum > 0) {
          wrapper.style.setProperty('aspect-ratio', swNum + '/' + shNum, 'important');
          wrapper.style.setProperty('height', 'auto', 'important');
        }
        wrapper.setAttribute('data-zappy-card-slot-fill', '1');
        // Also stretch any intermediate .zappy-inserted-element ancestors up
        // to the slot, so an editor-inserted media wrapper with a saved
        // desktop pixel width doesn't constrain the wrapper we just stretched
        // to 100%.
        var intermediate = wrapper.parentElement;
        for (var iw = 0; iw < 3 && intermediate && intermediate !== slotEl; iw++) {
          var iwRawClass = (intermediate.className || '').toString();
          var iwIsInserted = / zappy-inserted-element |^zappy-inserted-element | zappy-inserted-element$|^zappy-inserted-element$/.test(' ' + iwRawClass + ' ');
          if (iwIsInserted) {
            intermediate.style.setProperty('width', '100%', 'important');
            intermediate.style.setProperty('max-width', '100%', 'important');
            intermediate.style.setProperty('height', 'auto', 'important');
            intermediate.style.setProperty('min-height', '0', 'important');
            intermediate.style.setProperty('max-height', 'none', 'important');
            intermediate.setAttribute('data-zappy-inserted-stretched', '1');
          }
          intermediate = intermediate.parentElement;
        }
      } catch (_fillErr) {}
    }

    function applyZoom(wrapper, img) {
      var zoom = parseFloat(img.getAttribute('data-zappy-zoom')) || 1;
      if (!(zoom > 0)) zoom = 1;

      var widthMode = wrapper.getAttribute('data-zappy-zoom-wrapper-width-mode');
      if (widthMode === 'full') return;
      if (isHeroBgWrapper(wrapper)) return;

      var isMobile = window.innerWidth <= 768;
      if (isMobile) {
        var mSrc = img.getAttribute('data-zappy-mobile-src');
        var mPos = img.getAttribute('data-zappy-mobile-object-position');
        var mZoomStr = img.getAttribute('data-zappy-mobile-zoom');
        var mZoom = parseFloat(mZoomStr);
        if (mSrc) img.src = mSrc;

        wrapper.style.setProperty('width', '100%', 'important');
        wrapper.style.setProperty('max-width', '100%', 'important');
        wrapper.style.setProperty('overflow', 'hidden', 'important');
        wrapper.style.setProperty('position', 'relative', 'important');

        var _sW = parseFloat(wrapper.getAttribute('data-zappy-zoom-wrapper-width')) || 0;
        var _sH = parseFloat(wrapper.getAttribute('data-zappy-zoom-wrapper-height')) || 0;
        var hasMobileOverrides = mPos || (isFinite(mZoom) && mZoom > 0);

        if (hasMobileOverrides && _sW > 0 && _sH > 0) {
          wrapper.style.setProperty('padding-bottom', '0', 'important');
          wrapper.style.setProperty('aspect-ratio', _sW + '/' + _sH, 'important');
          wrapper.style.setProperty('height', 'auto', 'important');

          function applyMobileZoomCrop(_img, _wrapper, _effPos, _effZoom) {
            var rect = _wrapper.getBoundingClientRect();
            if (!rect || !rect.width || !rect.height) return;
            var nW = _img.naturalWidth || 0, nH = _img.naturalHeight || 0;
            if (!(nW > 0 && nH > 0)) return;
            var imgA = nW / nH;
            var contA = rect.width / rect.height;
            var cover = coverPercents(imgA, contA);
            var wP = 100, hP = 100;
            if (_effZoom >= 1) { wP = cover.w * _effZoom; hP = cover.h * _effZoom; }
            else { var t2 = (_effZoom - 0.5) / 0.5; if (!isFinite(t2)) t2 = 0; t2 = Math.max(0, Math.min(1, t2)); wP = 100 + t2 * (cover.w - 100); hP = 100 + t2 * (cover.h - 100); }
            var p2 = parseObjPos(_effPos);
            var lP = (100 - wP) * (p2.x / 100);
            var tP = (100 - hP) * (p2.y / 100);
            _img.style.setProperty('position', 'absolute', 'important');
            _img.style.setProperty('left', lP + '%', 'important');
            _img.style.setProperty('top', tP + '%', 'important');
            _img.style.setProperty('width', wP + '%', 'important');
            _img.style.setProperty('height', hP + '%', 'important');
            _img.style.setProperty('max-width', 'none', 'important');
            _img.style.setProperty('max-height', 'none', 'important');
            _img.style.setProperty('display', 'block', 'important');
            _img.style.setProperty('object-fit', _effZoom < 1 ? 'fill' : 'cover', 'important');
            _img.style.setProperty('margin', '0', 'important');
          }

          var effZoom = (isFinite(mZoom) && mZoom > 0) ? mZoom : zoom;
          var effPos = mPos || img.getAttribute('data-zappy-object-position') || img.style.objectPosition || '50% 50%';
          applyMobileZoomCrop(img, wrapper, effPos, effZoom);
          if (!(img.complete && img.naturalWidth > 0)) {
            img.addEventListener('load', function _onLoad() {
              img.removeEventListener('load', _onLoad);
              try { applyMobileZoomCrop(img, wrapper, effPos, effZoom); } catch(e) {}
            });
          }
        } else if (_sW > 0 && _sH > 0) {
          // No mobile overrides but the wrapper has a saved desktop aspect ratio.
          // Preserve that crop frame at mobile width and use object-fit:cover with the
          // saved object-position. This keeps the visual layout consistent with desktop
          // (same crop, just narrower) without applying the percentage-offset math that
          // produced "image overflows wrapper" rendering on the previous build.
          var _savedObjPos = img.getAttribute('data-zappy-object-position') ||
                             img.style.objectPosition || '50% 50%';
          wrapper.style.setProperty('aspect-ratio', _sW + '/' + _sH, 'important');
          wrapper.style.setProperty('padding-bottom', '0', 'important');
          wrapper.style.setProperty('height', 'auto', 'important');
          img.style.setProperty('position', 'absolute', 'important');
          img.style.setProperty('top', '0', 'important');
          img.style.setProperty('left', '0', 'important');
          img.style.setProperty('width', '100%', 'important');
          img.style.setProperty('height', '100%', 'important');
          img.style.setProperty('max-width', '100%', 'important');
          img.style.setProperty('max-height', 'none', 'important');
          img.style.setProperty('display', 'block', 'important');
          img.style.setProperty('object-fit', 'cover', 'important');
          img.style.setProperty('object-position', _savedObjPos, 'important');
          img.style.removeProperty('right');
          img.style.removeProperty('bottom');
          img.style.setProperty('margin', '0', 'important');
        } else {
          // Legacy wrappers without saved dimensions — natural-aspect responsive image.
          wrapper.style.setProperty('aspect-ratio', 'auto', 'important');
          wrapper.style.setProperty('padding-bottom', '0', 'important');
          wrapper.style.setProperty('height', 'auto', 'important');
          img.style.setProperty('position', 'relative', 'important');
          img.style.setProperty('width', '100%', 'important');
          img.style.setProperty('height', 'auto', 'important');
          img.style.setProperty('max-width', '100%', 'important');
          img.style.setProperty('max-height', '300px', 'important');
          img.style.setProperty('display', 'block', 'important');
          img.style.setProperty('object-fit', 'cover', 'important');
          img.style.removeProperty('left');
          img.style.removeProperty('top');
          img.style.setProperty('margin', '0', 'important');
        }

        applyFirstChildBleed(wrapper);
        applyCardSlotFill(wrapper, img);
        return;
      }

      // Desktop zoom === 1: image fills the wrapper exactly — no crop math
      // needed. Always set 100%/100% to override any stale inline styles
      // that may have been baked in with incorrect values.
      if (zoom === 1) {
        wrapper.style.setProperty('overflow', 'hidden', 'important');
        wrapper.style.setProperty('position', 'relative', 'important');
        img.style.setProperty('position', 'absolute', 'important');
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', '100%', 'important');
        img.style.setProperty('left', '0%', 'important');
        img.style.setProperty('top', '0%', 'important');
        img.style.setProperty('max-width', 'none', 'important');
        img.style.setProperty('max-height', 'none', 'important');
        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.setProperty('display', 'block', 'important');
        img.style.setProperty('margin', '0', 'important');
        applyFirstChildBleed(wrapper);
        applyCardSlotFill(wrapper, img);
        return;
      }

      // Desktop zoom > 1: if the image already has zoom styles saved from
      // the editor (position:absolute + percentage-based width), trust
      // them.  Sites published before the zoom-out fix had wrong values
      // baked in for zoom < 1 (used cover*zoom instead of the
      // interpolation formula), so those must always be recalculated.
      var existingPos = (img.style.position || '').replace(/s*!importants*/g, '').trim();
      var existingW = (img.style.width || '').replace(/s*!importants*/g, '').trim();
      if (existingPos === 'absolute' && existingW.indexOf('%') !== -1 && zoom > 1) {
        wrapper.style.setProperty('overflow', 'hidden', 'important');
        wrapper.style.setProperty('position', 'relative', 'important');
        applyFirstChildBleed(wrapper);
        applyCardSlotFill(wrapper, img);
        return;
      }

      // Image lacks saved zoom styles — calculate from scratch
      var rect = wrapper.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;

      var nW = img.naturalWidth || 0, nH = img.naturalHeight || 0;
      if (!(nW > 0 && nH > 0)) return;

      var imgA = nW / nH;
      var contA = rect.width / rect.height;
      var cover = coverPercents(imgA, contA);

      var wPct = 100, hPct = 100;
      if (zoom >= 1) {
        wPct = cover.w * zoom;
        hPct = cover.h * zoom;
      } else {
        var t = (zoom - 0.5) / 0.5;
        if (!isFinite(t)) t = 0;
        t = Math.max(0, Math.min(1, t));
        wPct = 100 + t * (cover.w - 100);
        hPct = 100 + t * (cover.h - 100);
      }

      var op = img.getAttribute('data-zappy-object-position') || img.style.objectPosition || window.getComputedStyle(img).objectPosition || '50% 50%';
      var pos = parseObjPos(op);
      var leftPct = (100 - wPct) * (pos.x / 100);
      var topPct = (100 - hPct) * (pos.y / 100);

      img.style.setProperty('position', 'absolute', 'important');
      img.style.setProperty('left', leftPct + '%', 'important');
      img.style.setProperty('top', topPct + '%', 'important');
      img.style.setProperty('width', wPct + '%', 'important');
      img.style.setProperty('height', hPct + '%', 'important');
      img.style.setProperty('max-width', 'none', 'important');
      img.style.setProperty('max-height', 'none', 'important');
      img.style.setProperty('display', 'block', 'important');
      img.style.setProperty('object-fit', zoom < 1 ? 'fill' : 'cover', 'important');
      img.style.setProperty('margin', '0', 'important');
      applyFirstChildBleed(wrapper);
      applyCardSlotFill(wrapper, img);
    }

    function fixOrphanedZoomImages() {
      if (window.innerWidth > 768) return;
      var zoomImgs = document.querySelectorAll('img[data-zappy-zoom]');
      for (var j = 0; j < zoomImgs.length; j++) {
        var img = zoomImgs[j];
        if (img.closest && img.closest('[data-zappy-zoom-wrapper="true"]')) continue;
        img.style.setProperty('position', 'relative', 'important');
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', 'auto', 'important');
        img.style.setProperty('max-width', '100%', 'important');
        img.style.setProperty('max-height', '300px', 'important');
        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.removeProperty('left');
        img.style.removeProperty('top');
      }
    }

    function restoreWrapperDimensions(wrapper) {
      var widthMode = wrapper.getAttribute('data-zappy-zoom-wrapper-width-mode') || 'px';
      if (widthMode === 'full' || widthMode === 'grid-responsive') return;
      if (isHeroBgWrapper(wrapper)) return;

      var storedW = wrapper.getAttribute('data-zappy-zoom-wrapper-width');
      var storedH = wrapper.getAttribute('data-zappy-zoom-wrapper-height');
      if (!storedW && !storedH) return;

      if (widthMode === 'px' && storedW) {
        var curW = (wrapper.style.width || '').replace(/s*!importants*/g, '').trim();
        var storedWNorm = storedW.replace(/s*!importants*/g, '').trim();
        if (!curW || curW === '100%' || curW.indexOf('%') !== -1 || curW !== storedWNorm) {
          wrapper.style.setProperty('width', storedW, 'important');
          wrapper.style.setProperty('max-width', '100%', 'important');
        }
      }
      if (storedH) {
        var curH = (wrapper.style.height || '').replace(/s*!importants*/g, '').trim();
        var storedHNorm = storedH.replace(/s*!importants*/g, '').trim();
        if (!curH || curH === 'auto' || curH === '100%' || curH.indexOf('%') !== -1 || curH !== storedHNorm) {
          wrapper.style.setProperty('height', storedH, 'important');
        }
      }
      wrapper.style.setProperty('overflow', 'hidden', 'important');
      wrapper.style.setProperty('position', 'relative', 'important');
    }

    function fixHeroBgWrapperStyles(wrapper) {
      if (!isHeroBgWrapper(wrapper)) return;
      wrapper.style.setProperty('position', 'absolute', 'important');
      wrapper.style.setProperty('top', '0', 'important');
      wrapper.style.setProperty('left', '0', 'important');
      wrapper.style.setProperty('width', '100%', 'important');
      wrapper.style.setProperty('height', '100%', 'important');
      wrapper.style.setProperty('max-width', 'none', 'important');
      wrapper.style.setProperty('overflow', 'hidden', 'important');
      wrapper.setAttribute('data-zappy-zoom-wrapper-width-mode', 'full');
      var img = wrapper.querySelector('img');
      if (img) {
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', '100%', 'important');
        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.setProperty('position', 'relative', 'important');
        img.style.setProperty('top', '0', 'important');
        img.style.setProperty('left', '0', 'important');
        img.style.setProperty('max-width', 'none', 'important');
        img.style.setProperty('max-height', 'none', 'important');
        img.style.setProperty('display', 'block', 'important');
        if (window.innerWidth <= 768) {
          var mSrc = img.getAttribute('data-zappy-mobile-src');
          var mPos = img.getAttribute('data-zappy-mobile-object-position');
          var mZoom = parseFloat(img.getAttribute('data-zappy-mobile-zoom'));
          if (mSrc) img.src = mSrc;
          if (mPos) img.style.setProperty('object-position', mPos, 'important');
          if (mZoom > 1) {
            img.style.setProperty('transform', 'scale(' + mZoom + ')', 'important');
            img.style.setProperty('transform-origin', mPos || '50% 50%', 'important');
          }
        }
      }
    }

    function initZoomWrappers() {
      var wrappers = document.querySelectorAll('[data-zappy-zoom-wrapper="true"]');
      for (var i = 0; i < wrappers.length; i++) {
        (function(wrapper) {
          var img = wrapper.querySelector('img');
          if (!img) return;
          if (wrapper.closest && wrapper.closest('.zappy-carousel-js-init, .zappy-carousel-active')) return;
          fixHeroBgWrapperStyles(wrapper);
          if (window.innerWidth > 768) restoreWrapperDimensions(wrapper);
          if (img.complete && img.naturalWidth > 0) {
            setTimeout(function() { applyZoom(wrapper, img); }, 0);
          } else {
            img.addEventListener('load', function onLoad() {
              img.removeEventListener('load', onLoad);
              applyZoom(wrapper, img);
            }, { once: true });
          }
        })(wrappers[i]);
      }
      fixOrphanedZoomImages();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initZoomWrappers, { once: true });
    } else {
      setTimeout(initZoomWrappers, 50);
    }
  } catch (eOuter) {}
})();
/* END ZAPPY_PUBLISHED_ZOOM_WRAPPER_RUNTIME */


/* ZAPPY_MOBILE_MENU_TOGGLE */
(function(){
  try {
    if (window.__zappyMobileMenuToggleInit) return;
    window.__zappyMobileMenuToggleInit = true;

    function initMobileToggle() {
      var toggle = document.querySelector('.mobile-toggle, #mobileToggle');
      var navMenu = document.querySelector('#navMenu, .nav-menu, .navbar-menu');
      if (!toggle || !navMenu) return;

      // Skip if this toggle already has a click handler from the site's own JS
      if (toggle.__zappyMobileToggleBound) return;
      toggle.__zappyMobileToggleBound = true;

      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var hamburgerIcon = toggle.querySelector('.hamburger-icon');
        var closeIcon = toggle.querySelector('.close-icon');
        var isOpen = navMenu.classList.contains('active') || navMenu.style.display === 'block';

        if (isOpen) {
          navMenu.classList.remove('active');
          navMenu.style.display = '';
          if (hamburgerIcon) hamburgerIcon.style.setProperty('display', 'block', 'important');
          if (closeIcon) closeIcon.style.setProperty('display', 'none', 'important');
          document.body.style.overflow = '';
        } else {
          navMenu.classList.add('active');
          navMenu.style.display = 'block';
          if (hamburgerIcon) hamburgerIcon.style.setProperty('display', 'none', 'important');
          if (closeIcon) closeIcon.style.setProperty('display', 'block', 'important');
          document.body.style.overflow = 'hidden';
        }
      }, true);

      // Close on clicking outside
      document.addEventListener('click', function(e) {
        if (!navMenu.classList.contains('active')) return;
        if (toggle.contains(e.target) || navMenu.contains(e.target)) return;
        navMenu.classList.remove('active');
        navMenu.style.display = '';
        var hi = toggle.querySelector('.hamburger-icon');
        var ci = toggle.querySelector('.close-icon');
        if (hi) hi.style.setProperty('display', 'block', 'important');
        if (ci) ci.style.setProperty('display', 'none', 'important');
        document.body.style.overflow = '';
      });

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          navMenu.style.display = '';
          var hi = toggle.querySelector('.hamburger-icon');
          var ci = toggle.querySelector('.close-icon');
          if (hi) hi.style.setProperty('display', 'block', 'important');
          if (ci) ci.style.setProperty('display', 'none', 'important');
          document.body.style.overflow = '';
        }
      });

      // Close when clicking a nav link (navigating)
      navMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          navMenu.classList.remove('active');
          navMenu.style.display = '';
          var hi = toggle.querySelector('.hamburger-icon');
          var ci = toggle.querySelector('.close-icon');
          if (hi) hi.style.setProperty('display', 'block', 'important');
          if (ci) ci.style.setProperty('display', 'none', 'important');
          document.body.style.overflow = '';
        });
      });
    }

    function initPhoneButton() {
      var phoneBtn = document.querySelector('.phone-header-btn');
      if (!phoneBtn || phoneBtn.__zappyPhoneBound) return;
      phoneBtn.__zappyPhoneBound = true;

      phoneBtn.addEventListener('click', function() {
        var phoneNumber = phoneBtn.getAttribute('data-phone') || null;

        if (!phoneNumber) {
          var telLinks = document.querySelectorAll('a[href^="tel:"]');
          if (telLinks.length > 0) {
            phoneNumber = telLinks[0].getAttribute('href').replace('tel:', '');
          }
        }

        if (!phoneNumber) {
          var allLinks = document.querySelectorAll('a[href]');
          for (var i = 0; i < allLinks.length; i++) {
            var h = allLinks[i].getAttribute('href') || '';
            var cleaned = h.replace(/[-\s()]/g, '');
            if (/^(\+?\d{9,15}|0\d{8,9})$/.test(cleaned)) {
              phoneNumber = cleaned;
              break;
            }
          }
        }

        if (phoneNumber && phoneNumber.indexOf('[') === -1) {
          window.location.href = 'tel:' + phoneNumber;
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { initMobileToggle(); initPhoneButton(); }, { once: true });
    } else {
      initMobileToggle();
      initPhoneButton();
    }
  } catch (e) {}
})();
/* END ZAPPY_MOBILE_MENU_TOGGLE */


/* ZAPPY_FAQ_ACCORDION_TOGGLE */
(function(){
  try {
    if (window.__zappyFaqToggleInit) return;
    window.__zappyFaqToggleInit = true;

    var answerSel = '[class*="faq-answer"], [class*="faq-content"], [class*="faq-body"], [class*="faq-item__answer"], .accordion-content, .accordion-body';

    function initFaqToggle() {
      var items = document.querySelectorAll('[class*="faq-item"], .accordion-item');
      if (!items.length) return;

      items.forEach(function(item) {
        if (item.closest(answerSel)) return;
        var question = item.querySelector(
          '[class*="faq-question"], [class*="faq-header"], [class*="faq-item__question"], [class*="faq-item__btn"], [class*="faq-btn"], .accordion-header, .accordion-toggle'
        );
        if (!question) return;
        if (question.__zappyFaqBound) return;
        if (question.hasAttribute('onclick')) question.removeAttribute('onclick');
        question.__zappyFaqBound = true;
        question.style.cursor = 'pointer';

        question.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          var parent = item.parentElement;
          if (parent) {
            var siblings = parent.querySelectorAll('[class*="faq-item"], .accordion-item');
            siblings.forEach(function(sib) {
              if (sib !== item && sib.classList.contains('active')) {
                sib.classList.remove('active');
                var sibQ = sib.querySelector('[class*="faq-question"], [class*="faq-header"], [class*="faq-item__question"], [class*="faq-item__btn"], [class*="faq-btn"], .accordion-header');
                if (sibQ) sibQ.setAttribute('aria-expanded', 'false');
                var sibA = sib.querySelector(answerSel);
                if (sibA) {
                  sibA.style.maxHeight = '0';
                  sibA.style.overflow = 'hidden';
                  sibA.style.opacity = '0';
                  sibA.style.paddingTop = '0';
                  sibA.style.paddingBottom = '0';
                }
              }
            });
          }

          var isActive = item.classList.toggle('active');
          question.setAttribute('aria-expanded', isActive ? 'true' : 'false');

          var answer = item.querySelector(answerSel);
          if (answer) {
            if (isActive) {
              answer.style.display = '';
              answer.style.paddingTop = '';
              answer.style.paddingBottom = '';
              var inners = answer.querySelectorAll(answerSel);
              inners.forEach(function(inn) {
                inn.style.maxHeight = '';
                inn.style.overflow = '';
                inn.style.opacity = '';
                inn.style.paddingTop = '';
                inn.style.paddingBottom = '';
              });
              answer.style.transition = 'none';
              answer.style.maxHeight = 'none';
              answer.style.opacity = '0';
              var realH = answer.scrollHeight;
              answer.style.maxHeight = '0';
              answer.offsetHeight;
              answer.style.transition = 'max-height 0.35s ease, opacity 0.25s ease, padding 0.25s ease';
              answer.style.maxHeight = realH + 'px';
              answer.style.overflow = 'hidden';
              answer.style.opacity = '1';
            } else {
              answer.style.transition = 'max-height 0.35s ease, opacity 0.25s ease, padding 0.25s ease';
              answer.style.maxHeight = '0';
              answer.style.overflow = 'hidden';
              answer.style.opacity = '0';
              answer.style.paddingTop = '0';
              answer.style.paddingBottom = '0';
            }
          }

          var chevron = question.querySelector('[class*="chevron"], [class*="icon"], svg');
          if (chevron) {
            chevron.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
            chevron.style.transition = 'transform 0.3s ease';
          }
        });
      });

      items.forEach(function(item) {
        if (item.classList.contains('active')) return;
        if (item.closest(answerSel)) return;
        var answer = item.querySelector(answerSel);
        if (answer) {
          answer.style.maxHeight = '0';
          answer.style.overflow = 'hidden';
          answer.style.opacity = '0';
          answer.style.paddingTop = '0';
          answer.style.paddingBottom = '0';
          answer.style.transition = 'max-height 0.35s ease, opacity 0.25s ease, padding 0.25s ease';
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFaqToggle, { once: true });
    } else {
      initFaqToggle();
    }
  } catch (e) {}
})();
/* END ZAPPY_FAQ_ACCORDION_TOGGLE */


/* ZAPPY_RUNTIME_CONTRAST_FIX */
(function(){
  try {
    if (window.__zappyContrastFixInit) return;
    window.__zappyContrastFixInit = true;

    function getLum(r,g,b){
      var a=[r,g,b].map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
      return a[0]*0.2126+a[1]*0.7152+a[2]*0.0722;
    }
    function contrast(c1,c2){
      var l1=getLum(c1.r,c1.g,c1.b),l2=getLum(c2.r,c2.g,c2.b);
      var hi=Math.max(l1,l2),lo=Math.min(l1,l2);
      return (hi+0.05)/(lo+0.05);
    }
    function parseRGB(c){
      if(!c)return null;var m=c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m?{r:+m[1],g:+m[2],b:+m[3]}:null;
    }
    function effectiveBg(el){
      var e=el;
      while(e){
        var cs=window.getComputedStyle(e);
        var bi=cs.backgroundImage;
        if(bi&&bi!=='none'){
          if(bi.indexOf('url(')>=0) return null;
          var isRgba=bi.match(/rgba\(/);
          if(!isRgba){
            var gm=bi.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)/);
            if(gm) return 'rgb('+gm[1]+','+gm[2]+','+gm[3]+')';
          }
        }
        var bg=cs.backgroundColor;
        if(bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'){
          var am=bg.match(/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*([\d.]+)/);
          if(!am||parseFloat(am[1])>=0.6) return bg;
        }
        e=e.parentElement;
      }
      return 'rgb(255,255,255)';
    }

    function resolveVar(val){
      if(!val||val.indexOf('var(')===-1)return val;
      var m=val.match(/var\(--([^,)]+)/);
      if(!m)return val;
      return getComputedStyle(document.documentElement).getPropertyValue('--'+m[1]).trim()||val;
    }
    function isDecorativeAccentText(el){
      if(!el||!el.matches)return false;
      // First: accent / handwritten / script labels — historical contract.
      if(el.matches('.font-accent,.hero-logotype,.hero-logotype-line,[class*="script"],[class*="accent-line"],[class*="subheadline"]'))return true;
      if(el.closest('.font-accent,.hero-logotype,.hero-logotype-line,[class*="script"],[class*="accent-line"],[class*="subheadline"]'))return true;
      // Poster-style hero/display words. The post-gen V2 faithful guards
      // intentionally paint these in brand colors; the runtime contrast
      // pass MUST NOT repaint them or PIZZA briefly flashes red then turns
      // black. Mirrors the preview-side selector list in 02-navigation.js.
      // Selectors cover legacy hero-word-* / hero-pizza-*, BEM *pizza-word
      // / *anywhere-word, the regenerated BEM *headline-pizza /
      // *headline-move / *headline-on-the shapes, AND a final catch-all
      // for any descendant of h1/h2.display-{xl,1,2} so future class-name
      // drift does not re-introduce the red-to-black flash.
      if(el.matches('.display-xl,.display-1,.display-2,[class*="hero-word"],[class*="hero-pizza"],[class*="hero-anywhere"],[class*="pizza-word"],[class*="anywhere-word"],[class*="headline-pizza"],[class*="headline-anywhere"],[class*="headline-on-the"],[class*="headline-move"],[class*="logotype"],[class*="wordmark"]'))return true;
      if(el.closest('[class*="hero-word"],[class*="hero-pizza"],[class*="hero-anywhere"],[class*="pizza-word"],[class*="anywhere-word"],[class*="headline-pizza"],[class*="headline-anywhere"],[class*="headline-on-the"],[class*="headline-move"],[class*="logotype"],[class*="wordmark"]'))return true;
      if(el.closest('h1.display-xl,h2.display-xl,h1.display-1,h2.display-1,h1.display-2,h2.display-2'))return true;
      return false;
    }

    function fixContrast(){
      var root=getComputedStyle(document.documentElement);
      var dark=root.getPropertyValue('--text-dark').trim()||root.getPropertyValue('--text').trim()||'#1a1a1a';
      var light=root.getPropertyValue('--text-light').trim()||root.getPropertyValue('--background').trim()||'#ffffff';
      var darkRGB=parseRGB(dark);
      if(!darkRGB){
        var d=document.createElement('div');d.style.color=dark;document.body.appendChild(d);
        darkRGB=parseRGB(getComputedStyle(d).color);d.remove();
      }
      var lightRGB=parseRGB(light);
      if(!lightRGB){
        var d2=document.createElement('div');d2.style.color=light;document.body.appendChild(d2);
        lightRGB=parseRGB(getComputedStyle(d2).color);d2.remove();
      }
      if(!darkRGB)darkRGB={r:26,g:26,b:26};
      if(!lightRGB)lightRGB={r:255,g:255,b:255};

      var mainEl=document.querySelector('main')||document.body;
      var els=mainEl.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,li,label,td,th,dt,dd,figcaption');
      var fixed=0;
      for(var i=0;i<els.length;i++){
        var el=els[i];
        if(el.closest('nav,header,.zappy-header,footer,.zappy-footer'))continue;
        if(isDecorativeAccentText(el))continue;
        var txt=el.textContent?el.textContent.trim():'';
        if(!txt)continue;
        var r=el.getBoundingClientRect();
        if(r.width===0||r.height===0)continue;
        var cs=getComputedStyle(el);
        var col=resolveVar(cs.color);
        var bg=effectiveBg(el);
        var cRGB=parseRGB(col),bRGB=parseRGB(bg);
        if(!cRGB||!bRGB)continue;
        var ratio=contrast(cRGB,bRGB);
        if(ratio<4.5){
          var darkC=contrast(darkRGB,bRGB);
          var lightC=contrast(lightRGB,bRGB);
          var best=darkC>=lightC?dark:light;
          var bestRatio=Math.max(darkC,lightC);
          if(bestRatio<4.5){
            var blackC=contrast({r:0,g:0,b:0},bRGB);
            var whiteC=contrast({r:255,g:255,b:255},bRGB);
            best=blackC>=whiteC?'#000000':'#ffffff';
          }
          el.style.setProperty('color',best,'important');
          fixed++;
        }
      }
      if(fixed>0)console.log('[Contrast Fix] Fixed '+fixed+' low-contrast elements');
    }

    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',fixContrast,{once:true});
    } else {
      fixContrast();
    }
  }catch(e){}
})();
/* END ZAPPY_RUNTIME_CONTRAST_FIX */

// ZAPPY_CARD_IMAGE_BLEED
(function(){
  function run(){
    var cards=document.querySelectorAll('article,[class*="card"],[class*="tile"]');
    cards.forEach(function(card){
      var cs=window.getComputedStyle(card);
      var padL=parseFloat(cs.paddingLeft)||0;
      var padR=parseFloat(cs.paddingRight)||0;
      var padT=parseFloat(cs.paddingTop)||0;
      if(padL<8&&padR<8)return;
      var fv=null;
      for(var i=0;i<card.children.length;i++){
        var ch=card.children[i];
        var chCs=window.getComputedStyle(ch);
        if(chCs.display!=='none'&&chCs.visibility!=='hidden'&&ch.getBoundingClientRect().height>0){fv=ch;break;}
      }
      if(!fv)return;
      if(fv.getAttribute('data-zappy-mobile-bleed'))return;
      if(fv.querySelector('[data-zappy-zoom-wrapper]'))return;
      var img=fv.querySelector('img');
      if(!img)return;
      var ir=img.getBoundingClientRect();
      var cw=card.clientWidth-padL-padR;
      if(cw<=0||ir.width<cw*0.8)return;
      fv.style.setProperty('margin-left','-'+padL+'px','important');
      fv.style.setProperty('margin-right','-'+padR+'px','important');
      if(padT>0)fv.style.setProperty('margin-top','-'+padT+'px','important');
      fv.style.setProperty('width','calc(100% + '+(padL+padR)+'px)','important');
      fv.style.setProperty('max-width','calc(100% + '+(padL+padR)+'px)','important');
      fv.setAttribute('data-zappy-mobile-bleed','1');
      if(window.getComputedStyle(img).objectFit==='contain'){img.style.setProperty('object-fit','cover','important');}
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(run,200);});}
  else{setTimeout(run,200);}
})();


/* ZAPPY_NAV_SCROLL_PADDING */
(function(){
  try {
    if (window.__zappyNavScrollPaddingInit) return;
    window.__zappyNavScrollPaddingInit = true;
    function updateScrollPadding() {
      var nav = document.querySelector('nav.navbar') || document.querySelector('nav') || document.querySelector('header');
      if (!nav) return;
      var s = window.getComputedStyle(nav);
      if (s.position !== 'fixed' && s.position !== 'sticky') return;
      var h = nav.offsetHeight;
      if (h > 0) document.documentElement.style.scrollPaddingTop = h + 'px';
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateScrollPadding, { once: true });
    } else {
      updateScrollPadding();
    }
    window.addEventListener('resize', updateScrollPadding, { passive: true });
  } catch (e) {}
})();
/* END ZAPPY_NAV_SCROLL_PADDING */


/* ZAPPY_CONTACT_FORM_PREVENT_DEFAULT */
(function(){
  try {
    var _kw=['contact','booking','inquiry','enquiry','register','signup','sign-up','order','request','apply'];
    function isContactForm(form) {
      var cls=(form.className||'').toLowerCase();
      var id=(form.id||'').toLowerCase();
      var act=(form.getAttribute('action')||'').toLowerCase();
      if(_kw.some(function(k){return cls.indexOf(k)!==-1||id.indexOf(k)!==-1||act.indexOf(k)!==-1;})) return true;
      var sec=form.closest&&form.closest('section');
      if(sec){
        var sc=(sec.className||'').toLowerCase();
        var si=(sec.id||'').toLowerCase();
        if(_kw.some(function(k){return sc.indexOf(k)!==-1||si.indexOf(k)!==-1;})) return true;
        if(sc.indexOf('form-section')!==-1||sc.indexOf('form_section')!==-1) return true;
      }
      if(window.zappyContactFormLoaded){
        var inputs=form.querySelectorAll('input,textarea,select');
        var hasEmail=false,hasPassword=false,visibleCount=0;
        for(var i=0;i<inputs.length;i++){
          var inp=inputs[i];
          var t=(inp.type||'').toLowerCase();
          var n=(inp.name||'').toLowerCase();
          if(t==='hidden'||t==='submit'||t==='button'||t==='reset') continue;
          visibleCount++;
          if(t==='email'||n.indexOf('email')!==-1||n.indexOf('mail')!==-1) hasEmail=true;
          if(t==='password') hasPassword=true;
        }
        if(hasEmail&&visibleCount>=2&&!hasPassword) return true;
      }
      return false;
    }

    function showFormFeedback(form, msg, type) {
      var old = form.querySelector('.zappy-form-feedback');
      if (old) old.remove();

      var bg = type==='success'?'#d4edda':type==='error'?'#f8d7da':'#d1ecf1';
      var fg = type==='success'?'#155724':type==='error'?'#721c24':'#0c5460';
      var bd = type==='success'?'#c3e6cb':type==='error'?'#f5c6cb':'#bee5eb';
      var ic = type==='success'?'\u2705':type==='error'?'\u274C':'\u2139\uFE0F';

      var el = document.createElement('div');
      el.className = 'zappy-form-feedback';
      el.setAttribute('role', 'alert');
      el.style.cssText = 'padding:14px 18px;border-radius:8px;margin:12px 0 0;font-size:14px;line-height:1.5;background:'+bg+';color:'+fg+';border:1px solid '+bd+';text-align:center;font-family:inherit;';
      el.innerHTML = '<span style="margin-inline-end:6px">'+ic+'</span>'+msg;

      if (type === 'success') {
        form.reset();
        var formChildren = form.children;
        for (var i = 0; i < formChildren.length; i++) {
          if (formChildren[i] !== el) formChildren[i].style.display = 'none';
        }
        form.appendChild(el);
        el.style.cssText += 'padding:32px 24px;font-size:16px;';
      } else {
        var btn = form.querySelector('button[type="submit"],input[type="submit"]');
        if (btn) btn.parentNode.insertBefore(el, btn.nextSibling);
        else form.appendChild(el);
        setTimeout(function(){ if(el.parentElement) el.remove(); }, 8000);
      }
    }

    var _coreNameFields=['name','firstName','first_name','fname','lastName','last_name','lname'];
    var _coreEmailFields=['email','emailAddress','mail','e-mail'];
    var _corePhoneFields=['phone','tel','telephone','mobile','cellphone'];
    var _coreMsgFields=['message','msg','comments','comment','description','details','notes','body','text','inquiry'];
    var _coreSubjectFields=['subject','topic','regarding','re'];
    var _allCoreFields=[].concat(_coreNameFields,_coreEmailFields,_corePhoneFields,_coreMsgFields,_coreSubjectFields);

    document.addEventListener('submit', function(e) {
      var form = e.target;
      if (!form || form.tagName !== 'FORM' || !isContactForm(form)) return;
      e.preventDefault();
      e.stopPropagation();

      var origSubmit = form.submit;
      form.submit = function(){ };

      if (form.__zappySubmitting) return;
      form.__zappySubmitting = true;

      var oldFeedback = form.querySelector('.zappy-form-feedback');
      if (oldFeedback) oldFeedback.remove();

      var btn = form.querySelector('button[type="submit"],input[type="submit"]');
      var origText = btn ? (btn.value || btn.textContent) : '';
      if (btn) {
        if (btn.tagName === 'INPUT') btn.value = 'Sending...';
        else btn.textContent = 'Sending...';
        btn.disabled = true;
      }

      var fd = new FormData(form);
      var data = {};
      for(var pair of fd.entries()){
        if(data[pair[0]]!==undefined){
          if(Array.isArray(data[pair[0]])) data[pair[0]].push(pair[1]);
          else data[pair[0]]=[data[pair[0]],pair[1]];
        } else data[pair[0]]=pair[1];
      }

      var resolvedName=(data.name||'').trim()
        ||[data.firstName||data.first_name||data.fname||'',data.lastName||data.last_name||data.lname||''].filter(Boolean).join(' ').trim()
        ||(data.email||data.emailAddress||data.mail||'').trim()
        ||'Anonymous';
      var resolvedEmail=(data.email||data.emailAddress||data.mail||data['e-mail']||'').trim();
      var resolvedPhone=data.phone||data.tel||data.telephone||data.mobile||data.cellphone||null;
      var resolvedSubject=data.subject||data.topic||data.regarding||data.re||'Contact Form Submission';
      var resolvedMsg=(data.message||data.msg||data.comments||data.comment||data.description||data.details||data.notes||data.body||data.text||data.inquiry||'').trim();
      if(!resolvedMsg){
        var _extra=Object.entries(data).filter(function(e){return _allCoreFields.indexOf(e[0])===-1;});
        if(_extra.length>0) resolvedMsg=_extra.map(function(e){var l=e[0].replace(/([A-Z])/g,' $1').replace(/[_-]/g,' ').trim();var v=Array.isArray(e[1])?e[1].join(', '):e[1];return l+': '+v;}).join('\n');
        else resolvedMsg='Form submission from '+window.location.pathname;
      }

      var extraFields={};
      Object.keys(data).forEach(function(k){if(_allCoreFields.indexOf(k)===-1&&data[k]!==''&&data[k]!=null) extraFields[k]=data[k];});

      var currentPath = window.location.pathname;
      try { var pg=new URLSearchParams(window.location.search).get('page'); if(pg) currentPath=pg; } catch(x){}

      var wid = 'ffe5f345-a33b-45b1-98fe-67a437201841';

      var apiBase = (window.ZAPPY_API_BASE || 'https://api.zappy5.com').replace(/\/$/,'');
      apiBase = apiBase + '/api/email/contact-form';

      var payload={
        websiteId: wid,
        name: resolvedName,
        email: resolvedEmail,
        subject: resolvedSubject,
        message: resolvedMsg,
        phone: resolvedPhone,
        currentPagePath: currentPath
      };
      if(Object.keys(extraFields).length>0) payload.extraFields=extraFields;

      fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(r){ return r.json(); }).then(function(result){
        if (result.success) {
          if (result.thankYouPagePath && result.ticketNumber) {
            window.location.href = result.thankYouPagePath + '?ticket=' + encodeURIComponent(result.ticketNumber);
            return;
          }
          showFormFeedback(form, result.message || 'Thank you! We will get back to you soon.', 'success');
        } else {
          showFormFeedback(form, result.error || 'Failed to send. Please try again.', 'error');
        }
      }).catch(function(){
        showFormFeedback(form, 'Unable to send message right now. Please try again later.', 'error');
      }).finally(function(){
        form.__zappySubmitting = false;
        form.submit = origSubmit;
        if (btn) {
          if (btn.tagName === 'INPUT') btn.value = origText;
          else btn.textContent = origText;
          btn.disabled = false;
        }
      });
    }, true);
  } catch (e) {}
})();
/* END ZAPPY_CONTACT_FORM_PREVENT_DEFAULT */


/* ZAPPY_PUBLISHED_GRID_CENTERING */
(function(){
  try {
    if (window.__zappyGridCenteringInit) return;
    window.__zappyGridCenteringInit = true;

    function centerPartialGridRows() {
      var grids = document.querySelectorAll('[data-zappy-explicit-columns="true"], [data-zappy-auto-grid="true"]');
      for (var g = 0; g < grids.length; g++) {
        try {
          var container = grids[g];

          // Clear previous centering so we can recalculate (e.g. after i18n direction change)
          if (container.getAttribute('data-zappy-grid-centered') === 'true') {
            var prevItems = Array.from(container.children);
            for (var p = 0; p < prevItems.length; p++) {
              if (prevItems[p].getAttribute && prevItems[p].getAttribute('data-zappy-gc') === '1') {
                prevItems[p].style.transform = prevItems[p].getAttribute('data-zappy-gc-orig') || '';
                prevItems[p].removeAttribute('data-zappy-gc');
                prevItems[p].removeAttribute('data-zappy-gc-orig');
              }
            }
            container.removeAttribute('data-zappy-grid-centered');
          }

          var items = [];
          for (var c = 0; c < container.children.length; c++) {
            var ch = container.children[c];
            if (!ch || !ch.tagName) continue;
            var tag = ch.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style') continue;
            if (ch.getAttribute('aria-hidden') === 'true') continue;
            if (ch.getAttribute('data-zappy-internal') === 'true') continue;
            var pos = window.getComputedStyle(ch).position;
            if (pos === 'absolute' || pos === 'fixed') continue;
            items.push(ch);
          }
          var totalItems = items.length;
          if (totalItems === 0) continue;

          var cs = window.getComputedStyle(container);
          if (cs.display !== 'grid') continue;
          var gta = (cs.gridTemplateAreas || '').trim();
          if (gta && gta !== 'none') continue;
          var gtc = (cs.gridTemplateColumns || '').trim();
          if (!gtc || gtc === 'none') continue;
          var colWidths = gtc.split(' ').filter(function(v) { return v && parseFloat(v) > 0; });
          var colCount = colWidths.length;
          if (colCount <= 1) continue;

          var itemsInLastRow = totalItems % colCount;
          if (itemsInLastRow === 0) continue;

          var colWidth = parseFloat(colWidths[0]) || 0;
          var gap = parseFloat(cs.columnGap);
          if (isNaN(gap)) gap = parseFloat(cs.gap) || 0;

          var missingCols = colCount - itemsInLastRow;
          var offset = missingCols * (colWidth + gap) / 2;

          // Detect RTL — use the computed direction which already accounts for
          // CSS cascade, html[dir], and inheritance. Do NOT walk up checking inline
          // styles because multi-language sites may have stale direction:rtl on
          // parent elements from the primary language while serving an LTR page.
          var dir = cs.direction || 'ltr';
          var translateValue = dir === 'rtl' ? -offset : offset;

          var startIndex = totalItems - itemsInLastRow;
          var savedTransitions = [];
          for (var i = startIndex; i < totalItems; i++) {
            var item = items[i];
            savedTransitions.push(item.style.transition);
            item.style.transition = 'none';
            var existingTransform = item.style.transform || '';
            item.setAttribute('data-zappy-gc-orig', existingTransform);
            var newTransform = existingTransform
              ? existingTransform + ' translateX(' + translateValue + 'px)'
              : 'translateX(' + translateValue + 'px)';
            item.style.transform = newTransform;
            item.setAttribute('data-zappy-gc', '1');
          }

          void container.offsetHeight;

          for (var j = startIndex; j < totalItems; j++) {
            items[j].style.transition = savedTransitions[j - startIndex];
          }

          container.setAttribute('data-zappy-grid-centered', 'true');
        } catch(e) {}
      }
    }

    if (document.readyState === 'complete') {
      centerPartialGridRows();
    } else {
      window.addEventListener('load', centerPartialGridRows);
    }

    // Re-center when i18n script changes the page direction
    try {
      var dirObs = new MutationObserver(function() { centerPartialGridRows(); });
      dirObs.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    } catch(e) {}
  } catch(e) {}
})();


/* ZAPPY_CONTENT_ALIGNMENT_RUNTIME */
(function(){
  try {
    if (window.__zappyContentAlignInit) return;
    window.__zappyContentAlignInit = true;

    var vShiftMap = { top: -0.5, upper: -0.25, center: 0, lower: 0.25, bottom: 0.5 };
    var hShiftMap = { left: -0.5, 'mid-left': -0.25, center: 0, 'mid-right': 0.25, right: 0.5 };

    function restoreContentAlignments() {
      var sections = document.querySelectorAll('[data-zappy-content-align]');
      for (var i = 0; i < sections.length; i++) {
        try { applyAlignment(sections[i]); } catch(e) {}
      }
    }

    function applyAlignment(section) {
      var target = section.querySelector('[data-zappy-align-target]');
      if (!target) return;

      var align = section.getAttribute('data-zappy-content-align') || 'center-center';
      var idx = align.indexOf('-');
      if (idx === -1) return;
      var vAlign = align.substring(0, idx) || 'center';
      var hAlign = align.substring(idx + 1) || 'center';

      if (!section.id) {
        section.id = 'zappy-section-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
      }
      var sel = '#' + section.id;

      var old = section.querySelector('style[data-zappy-align-style]');
      if (old) old.remove();

      var ts = window.getComputedStyle(target);
      var isFlex = (ts.display === 'flex' || ts.display === 'inline-flex');
      var isColumn = (ts.flexDirection === 'column' || ts.flexDirection === 'column-reverse');

      var sectionRect = section.getBoundingClientRect();
      var sW = sectionRect.width || section.offsetWidth || 0;
      var sH = sectionRect.height || section.offsetHeight || 0;

      var orig = target.style.cssText;
      target.style.setProperty('width', 'fit-content', 'important');
      target.style.setProperty('height', 'auto', 'important');
      target.style.setProperty('min-height', '0', 'important');
      target.style.setProperty('max-height', 'none', 'important');
      target.style.setProperty('align-self', 'flex-start', 'important');
      target.style.setProperty('flex', 'none', 'important');
      var tRect = target.getBoundingClientRect();
      var tW = tRect.width || 0;
      var tH = tRect.height || 0;
      target.style.cssText = orig;

      var freeH = Math.max(0, sW - tW);
      var freeV = Math.max(0, sH - tH);
      var hPx = Math.round((hShiftMap[hAlign] || 0) * freeH);
      var vPx = Math.round((vShiftMap[vAlign] || 0) * freeV);

      var t = [];
      t.push('margin:auto!important');
      if (hPx !== 0 || vPx !== 0) {
        t.push('transform:translate(' + hPx + 'px,' + vPx + 'px)!important');
      }
      if (isFlex) {
        t.push('align-items:center!important');
        t.push('justify-content:center!important');
      } else {
        t.push('display:flex!important');
        t.push('flex-direction:column!important');
        t.push('align-items:center!important');
      }

      var c = ['justify-content:center!important'];
      if (!isFlex && hAlign !== 'center') {
        c.push('min-width:33.33%!important');
        c.push('text-align:start!important');
      }

      var css = '';
      if (hPx !== 0 || vPx !== 0) css += sel + '{overflow:hidden!important}';
      css += sel + '>[data-zappy-align-target]{' + t.join(';') + '}';
      css += sel + '>[data-zappy-align-target]>*{' + c.join(';') + '}';
      css += '@media(max-width:768px){' +
        sel + '>[data-zappy-align-target]{align-items:center!important;margin-left:auto!important;margin-right:auto!important;' +
        (vPx !== 0 ? 'transform:translateY(' + vPx + 'px)!important' : 'transform:none!important') +
        '}' + sel + '>[data-zappy-align-target]>*{margin-left:auto!important;margin-right:auto!important}}';

      var s = document.createElement('style');
      s.setAttribute('data-zappy-align-style', 'true');
      s.textContent = css;
      section.insertBefore(s, section.firstChild);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', restoreContentAlignments);
    } else {
      restoreContentAlignments();
    }

    var _timer = null;
    window.addEventListener('resize', function() {
      clearTimeout(_timer);
      _timer = setTimeout(restoreContentAlignments, 200);
    });
    window.addEventListener('orientationchange', function() {
      clearTimeout(_timer);
      _timer = setTimeout(restoreContentAlignments, 200);
    });
  } catch(e) {}
})();


/* ZAPPY_SECTION_ID_FROM_CLASS */
(function(){
  function assignIds(){
    document.querySelectorAll('section').forEach(function(s){
      if(s.id)return;
      var cls=(s.className||'').split(/\s+/)[0];
      if(cls && !document.getElementById(cls)){s.id=cls;}
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',assignIds,{once:true});}
  else{assignIds();}
})();
/* END ZAPPY_SECTION_ID_FROM_CLASS */


/* ZAPPY_EMPTY_SUBMENU_HIDDEN */
(function(){
  function markEmpty(){
    document.querySelectorAll('.sub-menu, .dropdown-menu').forEach(function(ul){
      var hasVisible=false;
      for(var i=0;i<ul.children.length;i++){
        if(window.getComputedStyle(ul.children[i]).display!=='none'){hasVisible=true;break;}
      }
      ul.classList.toggle('zappy-empty-submenu',!hasVisible);
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',markEmpty,{once:true});}
  else{markEmpty();}
})();
/* END ZAPPY_EMPTY_SUBMENU_HIDDEN */


/* ZAPPY_INTERNAL_LINKS_NO_NEW_TAB */
(function(){
  try {
    function fixLinks(){
      var docRe=/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|rtf|odt|ods|odp)(\?|$)/i;
      document.querySelectorAll('a[target="_blank"]').forEach(function(a){
        var h=a.getAttribute('href');
        if(!h)return;
        if(h.indexOf('://')!==-1||h.indexOf('mailto:')===0||h.indexOf('tel:')===0)return;
        if(docRe.test(h))return;
        a.removeAttribute('target');
        a.removeAttribute('rel');
      });
    }
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fixLinks)}
    else{fixLinks()}
  }catch(e){}
})();


/* ZAPPY_IOS_VIEWPORT_GAP_FIX */
(function(){
  try {
    if (window.__zappyIosViewportGapInit) return;
    window.__zappyIosViewportGapInit = true;

    function update() {
      try {
        var visual = window.innerWidth;
        var layout = document.documentElement.clientWidth;
        var gap = Math.max(0, (visual || 0) - (layout || 0));
        document.documentElement.style.setProperty('--ios-viewport-gap', gap + 'px');

        // Also publish the navbar bottom so the mobile dropdown menu CSS can
        // anchor `top` below announcement bars + fixed navbar. This is needed because
        // older v2 patches set `top: 100% !important` on .nav-menu, which
        // with position:fixed resolves against the viewport (=height of
        // screen) instead of the navbar. --zappy-navbar-bottom gives the
        // v3 CSS something concrete to override that with.
        var nav = document.querySelector('nav.navbar, .navbar, header nav, header.navbar');
        if (nav) {
          var rect = nav.getBoundingClientRect();
          var bottom = Math.round(rect.bottom);
          if (bottom > 0) {
            document.documentElement.style.setProperty('--zappy-navbar-bottom', bottom + 'px');
          }
        }
      } catch (e) {}
    }

    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update);
    }
    document.addEventListener('DOMContentLoaded', update);
    window.addEventListener('load', update);
    // Re-measure after the navbar layout settles (fonts, images, logo load).
    setTimeout(update, 250);
    setTimeout(update, 1000);
  } catch (e) {}
})();


/* ZAPPY_STOREFRONT_RUNTIME_V1 — appended from preview-scripts/00-config.js for preview/live parity */
;(function() {
  'use strict';
  // ===== DESKTOP NAVBAR FIX =====
  // Clear mobile-only positioning inline styles on desktop viewport
  // This fixes sites generated with old code that applied these styles unconditionally
  function clearMobileNavbarStyles() {
    if (window.innerWidth > 768) {
      var mobileToggle = document.querySelector('.mobile-toggle');
      var phoneBtn = document.querySelector('.phone-header-btn');
      
      if (mobileToggle) {
        mobileToggle.style.removeProperty('position');
        mobileToggle.style.removeProperty('top');
        mobileToggle.style.removeProperty('transform');
        mobileToggle.style.removeProperty('z-index');
        mobileToggle.style.removeProperty('left');
        mobileToggle.style.removeProperty('right');
      }
      
      if (phoneBtn) {
        phoneBtn.style.removeProperty('position');
        phoneBtn.style.removeProperty('top');
        phoneBtn.style.removeProperty('transform');
        phoneBtn.style.removeProperty('z-index');
        phoneBtn.style.removeProperty('left');
        phoneBtn.style.removeProperty('right');
      }
      
      console.log('📦 [00-config] Cleared mobile navbar inline styles on desktop');
    }
  }
  
  // Run on load and resize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearMobileNavbarStyles);
  } else {
    clearMobileNavbarStyles();
  }
  window.addEventListener('load', clearMobileNavbarStyles);
  window.addEventListener('resize', clearMobileNavbarStyles);

  // ===== LAYOUT SECTION NORMALIZATION =====
  // Ensure layout sections create a block formatting context so that child
  // element margins (e.g. <h2> default margin-top) don't collapse outside
  // the section. Without this, sections render differently in edit mode
  // (where .zappy-removable adds position:relative) vs view mode.
  (function() {
    var layoutNormStyle = document.createElement('style');
    layoutNormStyle.id = 'zappy-layout-norm';
    layoutNormStyle.textContent = 'section.layout-section { overflow: hidden; }';
    document.head.appendChild(layoutNormStyle);
  })();

  // ===== GRID CELL MULTI-CHILD FIX =====
  // Grid cells (inserted elements inside horizontal grids) that contain multiple
  // child inserted elements must use flex-direction: column so children stack
  // vertically. This can be lost if inline styles are overwritten during editing.
  (function() {
    function fixGridCellFlexDirection() {
      try {
        var cells = document.querySelectorAll('.zappy-inserted-element');
        for (var i = 0; i < cells.length; i++) {
          var cell = cells[i];
          var style = cell.getAttribute('style') || '';
          if (style.indexOf('display: flex') === -1 && style.indexOf('display:flex') === -1) continue;
          if (style.indexOf('flex-direction') !== -1) continue;
          var childInserted = cell.querySelector('.zappy-inserted-element');
          if (!childInserted) continue;
          cell.style.flexDirection = 'column';
          cell.style.alignItems = 'center';
        }
      } catch (e) {}
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fixGridCellFlexDirection);
    } else {
      fixGridCellFlexDirection();
    }
  })();

  // ===== E-COMMERCE VARIANT SELECTION FIX =====
  // Inject CSS for variant option states:
  //   .disabled        = non-existent combination OR out-of-stock → gray + text strikethrough, always clickable
  //   .out-of-stock    = same visual as disabled, used for stock-specific logic
  // This ensures existing sites get the correct styling without regeneration.
  (function() {
    // 1) Inject CSS immediately (uses separate ID so fixVariantSelection doesn't remove it)
    if (!document.getElementById('zappy-variant-visual-css')) {
      var s = document.createElement('style');
      s.id = 'zappy-variant-visual-css';
      s.textContent =
        /* Text variant options: gray + text strikethrough */
        '.variant-option.disabled { opacity: 0.4 !important; cursor: pointer !important; text-decoration: line-through !important; }' +
        '.variant-option.disabled::after, .variant-option.disabled::before { content: none !important; }' +
        /* Color swatches: only opacity, no strikethrough */
        '.variant-option.color-swatch.disabled { text-decoration: none !important; }' +
        /* Out-of-stock: same treatment */
        '.variant-option.out-of-stock { opacity: 0.4 !important; cursor: pointer !important; text-decoration: line-through !important; }' +
        '.variant-option.out-of-stock::after, .variant-option.out-of-stock::before { content: none !important; }' +
        '.variant-option.color-swatch.out-of-stock { text-decoration: none !important; }';
      document.head.appendChild(s);
    }

    // 2) Override initVariantSelection early to prevent the page's default selection behavior.
    // The page's initVariantSelection calls .click() on first options, auto-selecting defaults.
    // We replace it with a version that only does setup (CSS, sorting, handlers) but skips auto-select.
    var _initOverridden = false;
    function _overrideInitVariantSelection() {
      if (_initOverridden) return;
      if (typeof window.initVariantSelection === 'function') {
        _initOverridden = true;
      }
      window.initVariantSelection = function(product, t) {
        // Store product data for our fix
        if (product && product.variants && product.variants.length > 0) {
          _variantProduct = product;
          var trans = t || {};
          // Ensure pleaseSelect is available (for sites generated before this key was added)
          if (!trans.pleaseSelect) {
            var isRTL = document.documentElement.getAttribute('dir') === 'rtl' || document.body.getAttribute('dir') === 'rtl';
            trans.pleaseSelect = isRTL ? 'נא לבחור' : 'Please select';
          }
          _variantTranslations = trans;
          // Re-trigger fixVariantSelection here. Our scheduled setTimeout(..., 100) and
          // setTimeout(..., 2000) may have already fired before the product API resolved
          // (slow DB / large payloads), in which case both calls bailed at the
          // `if (!product || !product.variants...) return;` guard and never repaired
          // truncated data-value attributes nor auto-selected single-option groups.
          // Running it again now (deferred so DOM mutations from the page's own init
          // settle first) ensures the fix executes exactly once for late-arriving data.
          setTimeout(function() { try { fixVariantSelection(); } catch (e) {} }, 0);
        }
        // Do NOT call the original (which would auto-select defaults and inject conflicting CSS).
        // Our fixVariantSelection handles all setup.
      };
    }
    _overrideInitVariantSelection();
    
    // 3) Document-level click delegation for variant options.
    // Uses capture phase on document so it fires before any element-level handlers
    // and works regardless of when variant buttons are created/recreated.
    var selectedAttributes = {};
    var _variantProduct = null;
    var _variantTranslations = {};
    
    function _getVariants() {
      if (!_variantProduct) return [];
      return (_variantProduct.variants || []).filter(function(v) { return v.is_active !== false; });
    }
    
    function _getAttributeKeys() {
      var keys = [], seen = {};
      document.querySelectorAll('.variant-option').forEach(function(btn) {
        var k = btn.getAttribute('data-attr');
        if (k && !seen[k]) { seen[k] = true; keys.push(k); }
      });
      return keys;
    }
    
    function _comboExists(selections) {
      return _getVariants().some(function(v) {
        if (!v.attributes) return false;
        for (var k in selections) {
          if (!selections.hasOwnProperty(k)) continue;
          if (v.attributes[k] !== selections[k]) return false;
        }
        return true;
      });
    }
    
    function _findMatching(selections) {
      return _getVariants().filter(function(v) {
        if (!v.attributes) return false;
        for (var k in selections) {
          if (!selections.hasOwnProperty(k)) continue;
          if (v.attributes[k] !== selections[k]) return false;
        }
        return true;
      });
    }
    
    function _isOOS(v) {
      if (!v) return true;
      if (v.stock_status === 'out_of_stock') return true;
      var i = v.inventory_quantity != null ? v.inventory_quantity : v.inventoryQuantity;
      if (i != null && i !== '') {
        var n = parseFloat(i);
        if (isFinite(n)) return n <= 0;
      }
      var s = v.stock_quantity;
      if (s != null && s !== '') {
        var m = parseFloat(s);
        if (isFinite(m)) return m <= 0;
      }
      return false;
    }
    
    function _updateVisuals() {
      var variants = _getVariants();
      if (variants.length === 0) return;
      document.querySelectorAll('.variant-option').forEach(function(btn) {
        var ak = btn.getAttribute('data-attr');
        var av = btn.getAttribute('data-value');
        var test = {};
        for (var k in selectedAttributes) {
          if (selectedAttributes.hasOwnProperty(k) && k !== ak) test[k] = selectedAttributes[k];
        }
        test[ak] = av;
        var matching = _findMatching(test);
        btn.classList.remove('disabled', 'out-of-stock');
        btn.disabled = false;
        if (matching.length === 0) {
          btn.classList.add('disabled');
          btn.disabled = true;
        } else if (matching.every(function(v) { return _isOOS(v); })) {
          btn.classList.add('disabled');
          btn.classList.add('out-of-stock');
          btn.disabled = true;
        }
      });
    }
    
    function _updateProductDisplay() {
      var t = _variantTranslations;
      var product = _variantProduct;
      if (!product) return;
      var keys = _getAttributeKeys();
      var allSelected = keys.every(function(k) { return selectedAttributes.hasOwnProperty(k); });
      var stockDisplay = document.getElementById('product-stock-display');
      var priceDisplay = document.getElementById('product-price-display');
      var addBtn = document.getElementById('add-to-cart-btn');
      keys.forEach(function(k) {
        var sp = document.querySelector('.variant-group[data-group="' + k + '"] .variant-selected-value');
        if (sp) {
          var selBtn = document.querySelector('.variant-option[data-attr="' + k + '"].selected');
          sp.textContent = (selBtn && selBtn.getAttribute('data-display-value')) || selectedAttributes[k] || '';
        }
      });
      var mainImage = document.getElementById('product-main-image');
      if (mainImage && !window._originalMainImageSrc) {
        window._originalMainImageSrc = mainImage.src;
      }
      if (allSelected) {
        var matching = _findMatching(selectedAttributes);
        if (matching.length > 0) {
          var v = matching[0];
          // Set window.selectedVariant so the page's addProductToCart can use it
          window.selectedVariant = v;
          if (_isOOS(v)) {
            if (stockDisplay) {
              stockDisplay.className = 'product-stock out-of-stock';
              stockDisplay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' + (t.outOfStock || 'Out of Stock');
            }
            if (addBtn) { addBtn.disabled = true; addBtn.style.opacity = '0.5'; addBtn.style.cursor = 'not-allowed'; }
          } else {
            if (stockDisplay) {
              stockDisplay.className = 'product-stock in-stock';
              stockDisplay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' + (t.inStock || 'In Stock');
            }
            if (addBtn) { addBtn.disabled = false; addBtn.style.opacity = ''; addBtn.style.cursor = ''; }
          }
          // Always update price when a variant is matched
          if (priceDisplay) {
            var currency = product.currency || t.currency || '₪';
            var baseP = window.productBasePrice || parseFloat(product.price) || 0;
            var origP = window.productOriginalPrice || parseFloat(product.compare_at_price || product.original_price || 0);
            var hasSale = window.productHasSalePrice;
            var finalPrice = (v.price != null) ? parseFloat(v.price) : baseP;
            var html = currency + finalPrice.toFixed(2);
            if (v.price != null) {
              if (origP && origP > finalPrice) {
                html += ' <span class="original-price">' + currency + origP.toFixed(2) + '</span>';
              }
            } else if (hasSale && origP > finalPrice) {
              html += ' <span class="original-price">' + currency + origP.toFixed(2) + '</span>';
            }
            priceDisplay.innerHTML = html;
          }
          // Update price-per-unit if the function exists
          if (typeof updatePricePerUnitDisplay === 'function') {
            var effPrice = (v.price != null) ? parseFloat(v.price) : (window.productBasePrice || parseFloat(product.price) || 0);
            updatePricePerUnitDisplay(effPrice, product, t);
          }
          // Update SKU: prefer variant SKU, fall back to base product SKU.
          // Resolve the label through getEcomText so it follows the active
          // storefront language — `t.sku || 'SKU'` alone returns Hebrew
          // ("מק״ט") on every English page because the static `t` dictionary
          // baked at server-render time is the merchant's source language
          // (Hebrew, in the artori-design case) and a Hebrew string is
          // truthy, so the English fallback is never reached.
          var skuDisplay = document.getElementById('product-sku-display');
          if (skuDisplay) {
            var skuLabel = (typeof getEcomText === 'function') ? getEcomText('sku', t.sku || 'SKU') : (t.sku || 'SKU');
            if (v.sku) {
              skuDisplay.textContent = skuLabel + ': ' + v.sku;
            } else if (product.sku) {
              skuDisplay.textContent = skuLabel + ': ' + product.sku;
            }
          }
          // Update main image if variant has a specific image
          if (mainImage && v.image) {
            var variantImgSrc = v.image;
            if (window.resolveProductImageUrl) {
              variantImgSrc = window.resolveProductImageUrl(v.image);
            }
            mainImage.src = variantImgSrc;
          } else if (mainImage && window._originalMainImageSrc) {
            mainImage.src = window._originalMainImageSrc;
          }
        }
      } else {
        window.selectedVariant = null;
        // Reset SKU to base product SKU
        var skuDisplay2 = document.getElementById('product-sku-display');
        if (skuDisplay2 && product.sku) {
          var skuLabel2 = (typeof getEcomText === 'function') ? getEcomText('sku', t.sku || 'SKU') : (t.sku || 'SKU');
          skuDisplay2.textContent = skuLabel2 + ': ' + product.sku;
        }
        if (stockDisplay) {
          stockDisplay.className = 'product-stock in-stock';
          stockDisplay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' + (t.inStock || 'In Stock');
        }
        if (addBtn) { addBtn.disabled = false; addBtn.style.opacity = ''; addBtn.style.cursor = ''; }
        // Reset price to initial state (Starting at / base price)
        if (priceDisplay) {
          var currency = product.currency || t.currency || '₪';
          var baseP = window.productBasePrice || parseFloat(product.price) || 0;
          var origP = window.productOriginalPrice || parseFloat(product.compare_at_price || product.original_price || 0);
          var hasSale = window.productHasSalePrice;
          var hasRange = window.productHasVariantPriceRange;
          var minP = window.productVariantMinPrice;
          if (hasRange && minP != null && isFinite(minP)) {
            var startLabel = (typeof getEcomText === 'function') ? getEcomText('startingAt', t.startingAt || 'Starting at') : (t.startingAt || 'Starting at');
            priceDisplay.textContent = startLabel + ' ' + currency + minP.toFixed(2);
          } else if (hasSale && origP > baseP) {
            priceDisplay.innerHTML = currency + baseP.toFixed(2) + ' <span class="original-price">' + currency + origP.toFixed(2) + '</span>';
          } else {
            priceDisplay.textContent = currency + baseP.toFixed(2);
          }
        }
        // Reset price-per-unit
        if (typeof updatePricePerUnitDisplay === 'function') {
          var hasRange = window.productHasVariantPriceRange;
          var minP = window.productVariantMinPrice;
          var baseP = window.productBasePrice || parseFloat(product.price) || 0;
          var resetPrice = (hasRange && minP != null && isFinite(minP)) ? minP : baseP;
          updatePricePerUnitDisplay(resetPrice, product, t);
        }
        // Restore original image when no variant is fully selected
        if (mainImage && window._originalMainImageSrc) {
          mainImage.src = window._originalMainImageSrc;
        }
      }
    }
    
    // Document-level capture handler - fires BEFORE any element-level handlers
    document.addEventListener('click', function(e) {
      var btn = e.target.closest ? e.target.closest('.variant-option') : null;
      if (!btn) return;
      if (!_variantProduct || _getVariants().length === 0) return;
      
      e.preventDefault();
      e.stopImmediatePropagation();
      
      var ak = btn.getAttribute('data-attr');
      var av = btn.getAttribute('data-value');
      if (!ak || !av) return;
      if (btn.disabled || btn.classList.contains('disabled')) return;
      
      // If already selected, do nothing (no manual deselect)
      if (selectedAttributes[ak] === av) {
        return;
      }
      // Select new option in this group
      document.querySelectorAll('.variant-option[data-attr="' + ak + '"]').forEach(function(b) { b.classList.remove('selected'); });
      selectedAttributes[ak] = av;
      btn.classList.add('selected');
      // Non-existent combo check: if the new selection creates an impossible combo, clear all others
      if (Object.keys(selectedAttributes).length > 1) {
        if (!_comboExists(selectedAttributes)) {
          document.querySelectorAll('.variant-option').forEach(function(b) { b.classList.remove('selected'); });
          selectedAttributes = {};
          selectedAttributes[ak] = av;
          btn.classList.add('selected');
        }
      }
      
      _updateVisuals();
      _updateProductDisplay();
    }, true); // capture phase
    
    // Document-level add-to-cart interceptor (capture phase)
    // This fires before any element-level onclick or inline onclick handlers,
    // preventing the page's original alert()-based validation.
    document.addEventListener('click', function(e) {
      var addBtn = e.target.closest ? e.target.closest('.add-to-cart-btn, .add-to-cart, #add-to-cart-btn, [onclick*="addProductToCart"]') : null;
      if (!addBtn) return;
      if (!_variantProduct || _getVariants().length === 0) return;
      
      var t = _variantTranslations || {};
      var keys = _getAttributeKeys();
      
      // Sequential validation: check each variant group in order
      for (var i = 0; i < keys.length; i++) {
        if (!selectedAttributes.hasOwnProperty(keys[i])) {
          e.preventDefault();
          e.stopImmediatePropagation();
          var grp = document.querySelector('.variant-group[data-group="' + keys[i] + '"]');
          var lbl = grp ? grp.querySelector('.variant-group-label') : null;
          var name = lbl ? lbl.textContent.replace(/[:\s]+$/, '').trim() : keys[i];
          var sd = document.getElementById('product-stock-display');
          if (sd) {
            sd.className = 'product-stock out-of-stock';
            sd.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
              (t.pleaseSelect || 'Please select') + ' ' + name;
          }
          if (grp) {
            grp.style.transition = 'background 0.3s';
            grp.style.background = 'rgba(255,0,0,0.05)';
            grp.style.borderRadius = '8px';
            setTimeout(function() { grp.style.background = ''; }, 2000);
          }
          return;
        }
      }
      
      // All selected: check if combo is out of stock
      var matching = _findMatching(selectedAttributes);
      if (matching.length > 0 && matching.every(function(v) { return _isOOS(v); })) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      // Valid selection - let the click through to the original handler
    }, true); // capture phase
    
    // Post-load init: sort options, clear selections, override addProductToCart
    function fixVariantSelection() {
      // Re-assert initVariantSelection override in case it was redefined
      _overrideInitVariantSelection();
      
      var product = _variantProduct || window.currentProduct;
      var t = _variantTranslations || window.productTranslations || {};
      if (!product || !product.variants || product.variants.length === 0) return;
      if (document.querySelectorAll('.variant-option').length === 0) return;
      if (window._zappyVariantFixed) return;
      window._zappyVariantFixed = true;
      
      _variantProduct = product;
      // Ensure pleaseSelect translation exists (for sites generated before this key was added)
      if (!t.pleaseSelect) {
        var isRTL = document.documentElement.getAttribute('dir') === 'rtl' || document.body.getAttribute('dir') === 'rtl';
        t.pleaseSelect = isRTL ? 'נא לבחור' : 'Please select';
      }
      _variantTranslations = t;
      
      // Remove old dynamic CSS injected by the original initVariantSelection
      var oldStyle = document.getElementById('zappy-variant-state-css');
      if (oldStyle) oldStyle.remove();
      document.querySelectorAll('.variant-option').forEach(function(btn) {
        btn.style.display = '';
        btn.disabled = false;
      });

      // Repair variant button attributes that were truncated by the browser
      // when the (pre-fix) renderProductDetail in older website.content.js
      // serialized values containing " (e.g. Hebrew sizes like '19  מ"מ',
      // US sizes 5'10") into data-value/data-display-value without HTML
      // escaping. We rebuild data-value, data-display-value, and the visible
      // text from _variantProduct.variants[*].attributes — the unbroken
      // source of truth from the API. Pairs buttons to values by index after
      // applying the same sort that fixVariantSelection uses below, so the
      // mapping survives even when buttons render in a different order than
      // the variants array.
      function _repairVariantButtons() {
        if (!_variantProduct || !_variantProduct.variants) return;
        var vs = _getVariants();
        if (vs.length === 0) return;
        var _so = {'xxxs':0,'xxs':1,'xs':2,'s':3,'m':4,'l':5,'xl':6,'xxl':7,'2xl':7,'xxxl':8,'3xl':8,'4xl':9,'5xl':10};
        function _cmp(a, b) {
          var sa = _so[String(a).toLowerCase()], sb = _so[String(b).toLowerCase()];
          var na = sa === undefined ? parseFloat(a) : NaN;
          var nb = sb === undefined ? parseFloat(b) : NaN;
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          if (sa !== undefined && sb !== undefined) return sa - sb;
          var ca = !isNaN(na) ? 0 : sa !== undefined ? 1 : 2;
          var cb = !isNaN(nb) ? 0 : sb !== undefined ? 1 : 2;
          if (ca !== cb) return ca - cb;
          return String(a).localeCompare(String(b));
        }
        document.querySelectorAll('.variant-group').forEach(function(grp) {
          var ak = grp.getAttribute('data-group');
          if (!ak || ak === 'variant') return;
          var btns = Array.prototype.slice.call(grp.querySelectorAll('.variant-option'));
          if (btns.length === 0) return;
          var seen = {}, vals = [];
          vs.forEach(function(v) {
            if (v.attributes && Object.prototype.hasOwnProperty.call(v.attributes, ak)) {
              var val = v.attributes[ak];
              if (val != null && !seen[val]) { seen[val] = true; vals.push(val); }
            }
          });
          if (vals.length === 0 || vals.length !== btns.length) return;
          vals.sort(_cmp);
          btns.forEach(function(btn, i) {
            var correct = String(vals[i]);
            var current = btn.getAttribute('data-value') || '';
            if (current === correct) return;
            btn.setAttribute('data-value', correct);
            btn.setAttribute('data-display-value', correct);
            if (!btn.classList.contains('color-swatch')) { btn.textContent = correct; }
            if (btn.title) { btn.title = correct; }
          });
        });
      }
      _repairVariantButtons();

      // Sort variant options (numeric, then known sizes, then alphabetical)
      var _sizeOrder = {'xxxs':0,'xxs':1,'xs':2,'s':3,'m':4,'l':5,'xl':6,'xxl':7,'2xl':7,'xxxl':8,'3xl':8,'4xl':9,'5xl':10};
      document.querySelectorAll('.variant-options').forEach(function(container) {
        var btns = Array.from(container.querySelectorAll('.variant-option'));
        if (btns.length < 2) return;
        btns.sort(function(a, b) {
          var va = a.getAttribute('data-value') || '', vb = b.getAttribute('data-value') || '';
          var sa = _sizeOrder[va.toLowerCase()], sb = _sizeOrder[vb.toLowerCase()];
          var na = sa === undefined ? parseFloat(va) : NaN;
          var nb = sb === undefined ? parseFloat(vb) : NaN;
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          if (sa !== undefined && sb !== undefined) return sa - sb;
          var ca = !isNaN(na) ? 0 : sa !== undefined ? 1 : 2;
          var cb = !isNaN(nb) ? 0 : sb !== undefined ? 1 : 2;
          if (ca !== cb) return ca - cb;
          return va.localeCompare(vb);
        });
        btns.forEach(function(b) { container.appendChild(b); });
      });
      
      // Also override addProductToCart as a safety net
      var origAddToCart = window.addProductToCart;
      window.addProductToCart = function() {
        var keys = _getAttributeKeys();
        for (var i = 0; i < keys.length; i++) {
          if (!selectedAttributes.hasOwnProperty(keys[i])) {
            var grp = document.querySelector('.variant-group[data-group="' + keys[i] + '"]');
            var lbl = grp ? grp.querySelector('.variant-group-label') : null;
            var name = lbl ? lbl.textContent.replace(/[:\s]+$/, '').trim() : keys[i];
            var sd = document.getElementById('product-stock-display');
            if (sd) {
              sd.className = 'product-stock out-of-stock';
              sd.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
                (t.pleaseSelect || 'Please select') + ' ' + name;
            }
            if (grp) {
              grp.style.transition = 'background 0.3s';
              grp.style.background = 'rgba(255,0,0,0.05)';
              grp.style.borderRadius = '8px';
              setTimeout(function() { grp.style.background = ''; }, 2000);
            }
            return;
          }
        }
        var matching = _findMatching(selectedAttributes);
        if (matching.length > 0 && matching.every(function(v) { return _isOOS(v); })) return;
        if (origAddToCart) origAddToCart.apply(this, arguments);
      };
      
      // Clear all, update visuals
      selectedAttributes = {};
      document.querySelectorAll('.variant-option').forEach(function(b) {
        b.classList.remove('selected', 'disabled', 'out-of-stock');
        b.disabled = false;
      });

      // Auto-select any variant group that only has one possible value, so a
      // shopper choosing the remaining options gets a fully-matched variant
      // (image/SKU/price update) instead of being silently blocked because a
      // single-option dimension was left implicitly unselected.
      function _autoSelectSingles() {
        document.querySelectorAll('.variant-group').forEach(function(grp) {
          var ak = grp.getAttribute('data-group');
          if (!ak || ak === 'variant') return;
          if (grp.querySelector('.variant-option.selected')) return;
          var btns = Array.prototype.slice.call(grp.querySelectorAll('.variant-option')).filter(function(b) {
            return b.getAttribute('data-attr')
              && b.getAttribute('data-value')
              && !b.classList.contains('disabled')
              && !b.classList.contains('out-of-stock');
          });
          if (btns.length !== 1) return;
          var btn = btns[0];
          var av = btn.getAttribute('data-value');
          btn.classList.add('selected');
          selectedAttributes[ak] = av;
          var sp = grp.querySelector('.variant-selected-value');
          if (sp) sp.textContent = btn.getAttribute('data-display-value') || av;
        });
      }

      _autoSelectSingles();
      _updateVisuals();
      // Re-run after availability has been recomputed: a multi-option group may
      // have collapsed to a single non-disabled choice once cross-group stock
      // constraints were applied.
      _autoSelectSingles();
      _updateProductDisplay();
    }
    
    function tryFix() { setTimeout(fixVariantSelection, 100); }
    if (document.readyState === 'complete') {
      tryFix();
    } else {
      window.addEventListener('load', tryFix);
    }
    setTimeout(fixVariantSelection, 2000);
  })();

  // ===== CHECKOUT TERMS CHECKBOX FIX =====
  // Ensure the terms checkbox label is properly styled on all sites (including those generated
  // before these styles were added). Injects missing CSS for proper flex layout and spacing.
  (function() {
    if (document.getElementById('zappy-terms-checkbox-css')) return;
    var s = document.createElement('style');
    s.id = 'zappy-terms-checkbox-css';
    s.textContent =
      '.terms-checkbox-wrapper { margin: 16px 0; padding: 12px; background: var(--surface-color, var(--surface, #f9fafb)); border-radius: 8px; }' +
      '.terms-checkbox-label { display: flex !important; align-items: center !important; gap: 10px !important; cursor: pointer; font-size: 14px; color: var(--text-color, var(--text, #374151)); }' +
      '.terms-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary-color, var(--primary, #ff0083)); flex-shrink: 0; }' +
      '.terms-link { color: var(--primary-color, var(--primary, #ff0083)); text-decoration: underline; font-weight: 500; }';
    document.head.appendChild(s);
  })();

  // ===== CART COLOR SWATCH PATCH =====
  // Replace color text in cart items with a color circle swatch.
  // Observes the cart drawer for changes and converts color attribute text to circles.
  (function() {
    function patchCartColorSwatches(container) {
      if (!container) return;
      var attrs = container.querySelectorAll('.cart-item-attr');
      attrs.forEach(function(span) {
        if (span.querySelector('.cart-item-color-swatch')) return; // already patched
        var labelEl = span.querySelector('.cart-item-attr-label');
        if (!labelEl) return;
        var labelText = (labelEl.textContent || '').replace(/[:\s]+$/, '').toLowerCase();
        // Match color-related labels in multiple languages
        var colorLabels = ['color', 'colour', 'צבע', 'لون', 'farbe', 'couleur', 'color', 'colore'];
        if (colorLabels.indexOf(labelText) === -1) return;
        // The color value is the text after the label
        var fullText = span.textContent || '';
        var labelFull = labelEl.textContent || '';
        var colorValue = fullText.replace(labelFull, '').trim();
        if (!colorValue) return;
        var bgColor = colorValue;
        if (!/^#[0-9A-Fa-f]{3,6}$/.test(colorValue)) {
          var lc = colorValue.toLowerCase();
          var _clr = {'dark grey':'#555','dark gray':'#555','light grey':'#d3d3d3','light gray':'#d3d3d3','light blue':'lightblue','dark blue':'darkblue','light green':'lightgreen','dark green':'darkgreen','dark red':'darkred','light pink':'lightpink','dark orange':'darkorange','sky blue':'skyblue','royal blue':'royalblue','navy blue':'navy','forest green':'forestgreen','olive green':'olivedrab','hot pink':'hotpink','deep pink':'deeppink','dark violet':'darkviolet','slate grey':'slategrey','slate gray':'slategray','dim grey':'dimgrey','dim gray':'dimgray','off white':'#f5f5f0','burgundy':'#800020','charcoal':'#36454f','champagne':'#f7e7ce','sand':'#c2b280','taupe':'#483c32','wine':'#722f37','rust':'#b7410e','sage':'#bcb88a','mint':'#98ff98','peach':'#ffcba4','cream':'#fffdd0','mauve':'#e0b0ff'};
          bgColor = _clr[lc] || lc;
        }
        var swatch = document.createElement('span');
        swatch.className = 'cart-item-color-swatch';
        swatch.title = colorValue;
        swatch.style.cssText = 'display:inline-block;width:14px;height:14px;border-radius:50%;background-color:' + bgColor + ';border:1px solid rgba(0,0,0,0.15);vertical-align:middle;margin-inline-start:4px;';
        // Remove the text value, keep only label + swatch
        span.textContent = '';
        span.appendChild(labelEl.cloneNode(true));
        span.appendChild(document.createTextNode(' '));
        span.appendChild(swatch);
      });
    }

    // Observe the cart drawer for content changes
    function observeCartDrawer() {
      var drawer = document.getElementById('cart-drawer') || document.getElementById('cart-drawer-items');
      if (!drawer) return;
      patchCartColorSwatches(drawer);
      var observer = new MutationObserver(function() { patchCartColorSwatches(drawer); });
      observer.observe(drawer, { childList: true, subtree: true });
    }

    // Try on load and also watch for the drawer being added to DOM
    if (document.readyState === 'complete') {
      setTimeout(observeCartDrawer, 200);
    } else {
      window.addEventListener('load', function() { setTimeout(observeCartDrawer, 200); });
    }
    // Safety net: also observe body for the drawer being dynamically added
    var bodyObserver = new MutationObserver(function() {
      var d = document.getElementById('cart-drawer');
      if (d) { observeCartDrawer(); bodyObserver.disconnect(); }
    });
    if (document.body) {
      bodyObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        bodyObserver.observe(document.body, { childList: true, subtree: true });
      });
    }
  })();

  // ===== CART FORMATTED PRICE TOTAL PATCH =====
  // Older generated storefront scripts used parseFloat directly, which returns NaN for
  // persisted cart prices such as "₪55.00". Keep existing preview carts accurate until
  // the site is refreshed with the generated-code fix.
  (function() {
    function parseCartPrice(value) {
      if (value === null || value === undefined || value === '') return NaN;
      if (typeof value === 'number') return isFinite(value) ? value : NaN;
      var normalized = String(value).replace(/[^\d.,-]/g, '').replace(/,/g, '');
      var parsed = parseFloat(normalized);
      return isFinite(parsed) ? parsed : NaN;
    }

    function getItemPrice(item) {
      if (!item) return 0;
      if (item.selectedVariant && item.selectedVariant.price !== null && item.selectedVariant.price !== undefined && item.selectedVariant.price !== '') {
        var variantPrice = parseCartPrice(item.selectedVariant.price);
        if (isFinite(variantPrice)) return variantPrice;
      }
      var displayPrice = parseCartPrice(item.displayPrice);
      if (isFinite(displayPrice)) return displayPrice;
      var regularPrice = parseCartPrice(item.price);
      var salePrice = parseCartPrice(item.sale_price);
      if (isFinite(salePrice) && isFinite(regularPrice) && salePrice < regularPrice) return salePrice;
      return isFinite(regularPrice) ? regularPrice : 0;
    }

    function getLineTotal(item) {
      var price = getItemPrice(item);
      var quantity = parseFloat(item && item.quantity) || 1;
      var step = parseFloat((item && (item.quantityStep || item.quantity_step))) || 1;
      var unit = (item && (item.quantityUnit || item.quantity_unit)) || 'piece';
      return unit === 'piece' ? price * quantity : price * (quantity / step);
    }

    function getCartItems() {
      var websiteId = window.ZAPPY_WEBSITE_ID || (window.CONFIG && window.CONFIG.websiteId);
      if (!websiteId) return [];
      try {
        return JSON.parse(localStorage.getItem('zappy_cart_' + websiteId) || '[]');
      } catch (e) {
        return [];
      }
    }

    function getCartTotalTarget(drawer, currency) {
      if (!drawer) return null;
      var totalEl = document.getElementById('cart-drawer-total');
      if (totalEl) return totalEl;
      var legacyTotal = drawer.querySelector('.cart-drawer-total');
      if (!legacyTotal) return null;
      var existingText = legacyTotal.textContent || '';
      var labelMatch = existingText.match(/^([^:]+):/);
      var label = labelMatch ? labelMatch[1].trim() : (window.zappyI18n && window.zappyI18n.t ? window.zappyI18n.t('ecom_total') : 'Total');
      if (!label || label === 'ecom_total') label = existingText.indexOf('סה') !== -1 ? 'סה"כ' : 'Total';
      legacyTotal.innerHTML = '<span>' + label + ':</span><span id="cart-drawer-total">' + (currency || '₪') + '0</span>';
      return document.getElementById('cart-drawer-total');
    }

    function patchCartTotals() {
      var drawer = document.getElementById('cart-drawer');
      if (!drawer) return;
      var items = getCartItems();
      if (!items.length) return;
      var currency = (window.ZAPPY_CURRENCY_SYMBOL || '').trim();
      var totalEl = getCartTotalTarget(drawer, currency);
      if (!currency && totalEl) {
        var match = (totalEl.textContent || '').match(/^[^\d\s-]+/);
        currency = match ? match[0] : '₪';
      }
      var total = 0;
      var priceEls = drawer.querySelectorAll('.cart-item-price, .cart-drawer-item-price');
      items.forEach(function(item, index) {
        var lineTotal = getLineTotal(item);
        total += lineTotal;
        if (priceEls[index]) {
          var nextText = currency + lineTotal.toFixed(2);
          if (priceEls[index].textContent !== nextText) {
            priceEls[index].textContent = nextText;
          }
        }
      });
      if (totalEl) {
        var nextTotal = currency + total.toFixed(2);
        if (totalEl.textContent !== nextTotal) totalEl.textContent = nextTotal;
      }
    }

    function observeCartTotals() {
      patchCartTotals();
      var drawer = document.getElementById('cart-drawer') || document.body;
      if (!drawer) return;
      var scheduled = false;
      var observer = new MutationObserver(function() {
        if (scheduled) return;
        scheduled = true;
        setTimeout(function() {
          scheduled = false;
          patchCartTotals();
        }, 0);
      });
      observer.observe(drawer, { childList: true, subtree: true, characterData: true });
    }

    if (document.readyState === 'complete') {
      setTimeout(observeCartTotals, 250);
    } else {
      window.addEventListener('load', function() { setTimeout(observeCartTotals, 250); });
    }
  })();

  // ===== PRODUCT DETAIL RUNTIME I18N PATCH =====
  // Existing preview product pages can keep source-language labels for stock and
  // variant groups after switching languages. Keep those labels tied to runtime lang.
  (function() {
    var TEXT = {
      en: {
        inStock: 'In Stock',
        outOfStock: 'Out of Stock',
        color: 'Color',
        size: 'Size',
        material: 'Material',
        style: 'Style',
        weight: 'Weight',
        capacity: 'Capacity',
        length: 'Length'
      },
      he: {
        inStock: 'במלאי',
        outOfStock: 'אזל מהמלאי',
        color: 'צבע',
        size: 'מידה',
        material: 'חומר',
        style: 'סגנון',
        weight: 'משקל',
        capacity: 'קיבולת',
        length: 'אורך'
      }
    };

    function getLang() {
      if (window.zappyI18n && typeof window.zappyI18n.getCurrentLanguage === 'function') {
        var runtimeLang = String(window.zappyI18n.getCurrentLanguage() || '').split('-')[0].toLowerCase();
        if (runtimeLang) return runtimeLang;
      }
      var htmlLang = String(document.documentElement.lang || '').split('-')[0].toLowerCase();
      if (htmlLang) return htmlLang;
      try {
        var storedLang = String(localStorage.getItem('zappy_lang') || localStorage.getItem('zappy-language') || localStorage.getItem('selectedLanguage') || '').split('-')[0].toLowerCase();
        if (storedLang) return storedLang;
      } catch (e) {}
      return 'en';
    }

    function getText(key) {
      var lang = getLang();
      if (TEXT[lang] && TEXT[lang][key]) return TEXT[lang][key];
      if (window.zappyI18n && typeof window.zappyI18n.t === 'function') {
        var translated = window.zappyI18n.t('ecom_' + key);
        if (translated && translated !== 'ecom_' + key) return translated;
      }
      return (TEXT.en && TEXT.en[key]) || key;
    }

    function getVariantValueTranslation(attr, sourceValue) {
      var product = window.currentProduct;
      var variants = product && Array.isArray(product.variants) ? product.variants : [];
      var lang = getLang();
      for (var i = 0; i < variants.length; i++) {
        var variant = variants[i];
        var attrs = variant && (variant.attributes_source || variant.attributes || {});
        if (String(attrs[attr]) !== String(sourceValue)) continue;
        var translatedAttrs = variant.attributes_translations && variant.attributes_translations[lang];
        if (translatedAttrs && translatedAttrs[attr]) return translatedAttrs[attr];
        var displayAttrs = variant.attributes_display || {};
        if (displayAttrs[attr]) return displayAttrs[attr];
      }
      return sourceValue;
    }

    function patchProductDetailI18n() {
      if (typeof window.getVariantAttributeLabels === 'function' && !window.getVariantAttributeLabels.__zappyRuntimeI18nWrapped) {
        var originalGetVariantAttributeLabels = window.getVariantAttributeLabels;
        window.getVariantAttributeLabels = function(source, t) {
          var labels = originalGetVariantAttributeLabels(source, t) || {};
          ['color', 'size', 'material', 'style', 'weight', 'capacity', 'length'].forEach(function(key) {
            labels[key] = getText(key);
          });
          return labels;
        };
        window.getVariantAttributeLabels.__zappyRuntimeI18nWrapped = true;
      }

      document.querySelectorAll('.variant-group').forEach(function(group) {
        var attr = group.getAttribute('data-group');
        if (!attr) return;
        var key = String(attr).toLowerCase();
        var labelText = getText(key);
        var label = group.querySelector('.variant-group-label');
        if (label) {
          var selected = label.querySelector('.variant-selected-value');
          var selectedText = selected ? selected.textContent : '';
          if ((label.textContent || '').trim() !== (labelText + ': ' + selectedText).trim()) {
            label.textContent = labelText + ': ';
            if (selected) label.appendChild(selected);
          }
        }
        group.querySelectorAll('.variant-option').forEach(function(option) {
          var value = option.getAttribute('data-value');
          var translatedValue = getVariantValueTranslation(attr, value);
          if (option.getAttribute('data-display-value') !== translatedValue) option.setAttribute('data-display-value', translatedValue);
          if (option.getAttribute('title') !== translatedValue) option.setAttribute('title', translatedValue);
          if (!option.classList.contains('color-swatch') && option.textContent !== translatedValue) option.textContent = translatedValue;
        });
      });

      var stock = document.getElementById('product-stock-display');
      if (stock) {
        var inStock = stock.classList.contains('in-stock') && !stock.classList.contains('out-of-stock');
        var svg = stock.querySelector('svg');
        var nextText = inStock ? getText('inStock') : getText('outOfStock');
        if ((stock.textContent || '').trim() !== nextText) {
          stock.textContent = '';
          if (svg) stock.appendChild(svg);
          stock.appendChild(document.createTextNode(nextText));
        }
      }
    }

    function schedulePatch() {
      setTimeout(patchProductDetailI18n, 100);
      setTimeout(patchProductDetailI18n, 500);
    }

    if (document.readyState === 'complete') {
      schedulePatch();
    } else {
      window.addEventListener('load', schedulePatch);
    }
    if (window.zappyI18n && typeof window.zappyI18n.onLanguageChange === 'function') {
      window.zappyI18n.onLanguageChange(schedulePatch);
    }
    var observer = new MutationObserver(function() { schedulePatch(); });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  })();

  // ===== CHECKOUT RUNTIME I18N PATCH =====
  // Existing generated checkout pages may have Hebrew UI fragments baked into dynamic
  // totals and shipping rows. Patch them from the active runtime language in preview.
  (function() {
    var TEXT = {
      en: {
        agreeToTerms: 'I agree to the',
        termsAndConditions: 'Terms of Use',
        subtotal: 'Subtotal',
        vatIncluded: 'Including VAT',
        shipping: 'Shipping',
        discount: 'Discount',
        totalToPay: 'Total to Pay',
        days: 'days',
        free: 'Free'
      },
      he: {
        agreeToTerms: 'אני מסכים/ה ל',
        termsAndConditions: 'תנאי השימוש',
        subtotal: 'סכום ביניים',
        vatIncluded: 'כולל מע"מ',
        shipping: 'משלוח',
        discount: 'הנחה',
        totalToPay: 'סה"כ לתשלום',
        days: 'ימים',
        free: 'חינם'
      }
    };

    function getLang() {
      if (window.zappyI18n && typeof window.zappyI18n.getCurrentLanguage === 'function') {
        var runtimeLang = String(window.zappyI18n.getCurrentLanguage() || '').split('-')[0].toLowerCase();
        if (runtimeLang) return runtimeLang;
      }
      var htmlLang = String(document.documentElement.lang || '').split('-')[0].toLowerCase();
      if (htmlLang) return htmlLang;
      try {
        var storedLang = String(localStorage.getItem('zappy_lang') || '').split('-')[0].toLowerCase();
        if (storedLang) return storedLang;
      } catch (e) {}
      return 'en';
    }

    function getText(key) {
      var lang = getLang();
      return (TEXT[lang] && TEXT[lang][key]) || (TEXT.en && TEXT.en[key]) || '';
    }

    function setLabelForValue(valueSelector, key) {
      var valueEl = document.querySelector(valueSelector);
      if (!valueEl || !valueEl.parentElement) return;
      var labelEl = valueEl.parentElement.querySelector('span:first-child');
      if (labelEl && labelEl !== valueEl) {
        var nextLabel = getText(key) + ':';
        if (labelEl.textContent !== nextLabel) labelEl.textContent = nextLabel;
      }
    }

    function ensureCheckoutTotalsStructure() {
      var rows = document.querySelectorAll('.order-totals-row');
      if (!rows.length) return;
      var specs = [
        { key: 'subtotal', id: 'subtotal', fallback: '₪0' },
        { key: 'vatIncluded', id: 'vat-amount', fallback: '₪0' },
        { key: 'shipping', id: 'shipping-cost', fallback: '₪0' },
        { key: 'discount', id: 'discount', fallback: '₪0' },
        { key: 'totalToPay', id: 'order-total', fallback: '₪0' }
      ];
      specs.forEach(function(spec, index) {
        var row = rows[index];
        if (!row || row.querySelector('#' + spec.id)) return;
        var text = row.textContent || '';
        var valueMatch = text.match(/-?\s*[₪$€£]\s*\d[\d,.]*/);
        var value = valueMatch ? valueMatch[0].replace(/\s+/g, '') : spec.fallback;
        row.innerHTML = '<span data-ecom-label="' + spec.key + '">' + getText(spec.key) + ':</span><span id="' + spec.id + '">' + value + '</span>';
      });
    }

    function parseMoney(value) {
      var normalized = String(value || '').replace(/[^\d.,-]/g, '').replace(/,/g, '');
      var parsed = parseFloat(normalized);
      return isFinite(parsed) ? parsed : 0;
    }

    function normalizeCheckoutValues() {
      var discountEl = document.getElementById('discount');
      var discountRow = document.getElementById('discount-row') || (discountEl && discountEl.closest('.discount-row, .order-totals-row'));
      if (discountEl && Math.abs(parseMoney(discountEl.textContent)) < 0.005) {
        var zeroDiscountText = (window.ZAPPY_CURRENCY_SYMBOL || '₪') + '0';
        if (discountEl.textContent !== zeroDiscountText) discountEl.textContent = zeroDiscountText;
        if (discountRow && discountRow.style.display !== 'none') discountRow.style.display = 'none';
      }
      var shippingCost = document.getElementById('shipping-cost');
      if (shippingCost && /^(חינם|FREE)$/i.test((shippingCost.textContent || '').trim())) {
        var freeText = getText('free');
        if (shippingCost.textContent !== freeText) shippingCost.textContent = freeText;
      }
    }

    function transliterateKnownAddress(value) {
      if (!value) return '';
      return String(value)
        .replace(/הוד השרון/g, 'Hod Hasharon')
        .replace(/הרדוף/g, 'Harduf');
    }

    function formatPickupAddress(method) {
      var address = method && method.pickup_address;
      if (!address || !address.street) return '';
      var lang = getLang();
      if (address.translations && address.translations[lang]) {
        address = Object.assign({}, address, address.translations[lang]);
      }
      var street = address.street;
      var city = address.city;
      if (lang === 'en') {
        street = transliterateKnownAddress(street);
        city = transliterateKnownAddress(city);
      }
      return [street, city].filter(Boolean).join(', ');
    }

    function patchCheckoutStaticText() {
      ensureCheckoutTotalsStructure();
      var agree = document.querySelector('[data-i18n="ecom_agreeToTerms"]') || document.querySelector('.terms-checkbox-label > span > span:first-child');
      if (agree && agree.textContent !== getText('agreeToTerms')) agree.textContent = getText('agreeToTerms');
      var terms = document.querySelector('[data-i18n="ecom_termsAndConditions"]') || document.querySelector('.terms-checkbox-label .terms-link');
      if (terms && terms.textContent !== getText('termsAndConditions')) terms.textContent = getText('termsAndConditions');
      setLabelForValue('#subtotal', 'subtotal');
      setLabelForValue('#vat-amount', 'vatIncluded');
      setLabelForValue('#shipping-cost', 'shipping');
      setLabelForValue('#discount', 'discount');
      setLabelForValue('#order-total', 'totalToPay');
      var shippingCost = document.getElementById('shipping-cost');
      if (shippingCost && /^(חינם|FREE)$/i.test((shippingCost.textContent || '').trim())) {
        shippingCost.textContent = getText('free');
      }
      normalizeCheckoutValues();
    }

    var shippingPatchInFlight = false;
    async function patchShippingMethods() {
      var container = document.getElementById('shipping-methods');
      var websiteId = window.ZAPPY_WEBSITE_ID || (window.CONFIG && window.CONFIG.websiteId);
      if (!container || !websiteId || shippingPatchInFlight) return;
      shippingPatchInFlight = true;
      try {
        var lang = getLang();
        var apiBase = window.ZAPPY_API_BASE || '';
        var res = await fetch(apiBase + '/api/ecommerce/storefront/shipping?websiteId=' + encodeURIComponent(websiteId) + '&lang=' + encodeURIComponent(lang));
        var data = await res.json();
        var methods = data && data.data ? data.data : [];
        methods.forEach(function(method) {
          var block = container.querySelector('.shipping-method-block[data-method-id="' + method.id + '"]');
          if (!block) return;
          var nameEl = block.querySelector('.shipping-name');
          if (nameEl && method.name) nameEl.textContent = method.name;
          var descEl = block.querySelector('.shipping-desc');
          var daysText = method.estimated_days ? String(method.estimated_days) + ' ' + getText('days') : '';
          var description = method.description || '';
          var descText = description && daysText ? description + ' (' + daysText + ')' : (description || daysText);
          if (descEl) {
            descEl.textContent = descText;
          } else if (descText) {
            var info = block.querySelector('.shipping-info');
            if (info) {
              var created = document.createElement('div');
              created.className = 'shipping-desc';
              created.textContent = descText;
              info.appendChild(created);
            }
          }
          var priceEl = block.querySelector('.shipping-price.free');
          if (priceEl) priceEl.textContent = getText('free');
          var addressEl = block.querySelector('.shipping-address');
          var addressText = formatPickupAddress(method);
          if (addressEl && addressText) addressEl.textContent = addressText;
        });
      } catch (e) {
        // Non-blocking compatibility patch.
      } finally {
        shippingPatchInFlight = false;
      }
    }

    function patchCheckoutI18n() {
      patchCheckoutStaticText();
      patchShippingMethods();
      normalizeCheckoutValues();
    }

    var style = document.createElement('style');
    style.id = 'zappy-checkout-runtime-i18n-css';
    style.textContent = '.checkout-order-details .order-totals-row{display:flex!important;justify-content:space-between!important;align-items:baseline!important;gap:12px!important}.checkout-order-details .order-totals-row span:first-child{flex:1 1 auto;min-width:0}.checkout-order-details .order-totals-row span:last-child{flex:0 0 auto;text-align:end}';
    if (!document.getElementById(style.id)) document.head.appendChild(style);

    if (document.readyState === 'complete') {
      setTimeout(patchCheckoutI18n, 300);
    } else {
      window.addEventListener('load', function() { setTimeout(patchCheckoutI18n, 300); });
    }
    setTimeout(patchCheckoutI18n, 1500);
    setTimeout(patchCheckoutI18n, 3500);
    var scheduled = false;
    var observer = new MutationObserver(function() {
      if (scheduled) return;
      scheduled = true;
      setTimeout(function() {
        scheduled = false;
        patchCheckoutStaticText();
      }, 50);
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (window.zappyI18n && typeof window.zappyI18n.onLanguageChange === 'function') {
      window.zappyI18n.onLanguageChange(function() { setTimeout(patchCheckoutI18n, 300); });
    }
  })();

})();


/* ZAPPY_ECOM_LANGUAGE_ROUTING_RUNTIME_V16 */
(function() {
  if (window.__zappyEcomLanguageRoutingRuntime >= 16) return;
  window.__zappyEcomLanguageRoutingRuntime = 16;

  // Routing strategy: use path-based language URLs for ALL storefront pages
  // (including dynamic /product/:slug and /category/:slug). The publish
  // pipeline pre-renders /<lang>/product/:slug/index.html with the correct
  // navbar / catalog / lang-switcher baked in, and render.yaml rewrites
  // /<lang>/product/* → that file. The script.js loaded inside is
  // language-aware (reads the active language from the URL prefix) so dynamic
  // labels (Add to Cart, In Stock, etc.) render in the right language too.
  // This eliminates the source-language flash entirely — no runtime
  // translation needed.

  function getPathLang() {
    return (window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/i) || [])[1];
  }

  function getQueryLang() {
    try {
      return new URLSearchParams(window.location.search).get('lang');
    } catch (e) {
      return null;
    }
  }

  function getBakedDefaultLang() {
    try {
      if (typeof window.__zappyDefaultLang === 'string' && window.__zappyDefaultLang) return window.__zappyDefaultLang.toLowerCase();
      if (typeof zappyAdditionalDefaultLanguage === 'string' && zappyAdditionalDefaultLanguage) return zappyAdditionalDefaultLanguage.toLowerCase();
      if (typeof zappyEcomDefaultLanguage === 'string' && zappyEcomDefaultLanguage) return zappyEcomDefaultLanguage.toLowerCase();
    } catch (e) {}
    var htmlLang = document.documentElement.getAttribute('lang');
    return htmlLang ? htmlLang.split('-')[0].toLowerCase() : 'he';
  }

  // Seed the runtime language so any code that reads localStorage / html lang
  // ends up agreeing with the URL the user actually loaded. URLs are the
  // source of truth here:
  //   /<lang>/...   → that prefix language
  //   ?lang=<x>     → that query language (legacy / preview)
  //   /            (no prefix) → site's baked-in default language
  // Without the no-prefix branch, visiting the default-language root with a
  // stale localStorage from an earlier session (e.g. user toggled to English
  // last week) keeps the dynamic catalog/featured/category fetches in the
  // stale language, which is the "catalog menu stays in English on the
  // Hebrew page" bug.
  (function seedLanguageFromUrl() {
    var urlLang = getQueryLang() || getPathLang() || getBakedDefaultLang();
    if (!urlLang) return;
    urlLang = String(urlLang).split('-')[0].toLowerCase();
    try {
      localStorage.setItem('zappy_lang', urlLang);
      localStorage.setItem('zappy-language', urlLang);
      localStorage.setItem('selectedLanguage', urlLang);
      localStorage.setItem('language', urlLang);
    } catch (e) {}
    document.documentElement.setAttribute('lang', urlLang);
    document.documentElement.setAttribute('dir', urlLang === 'he' || urlLang === 'ar' || urlLang === 'iw' ? 'rtl' : 'ltr');
  })();

  // Backward-compat soft redirect: any in-flight bookmarks / external links of
  // the form /product/<slug>?lang=en (issued by older builds) get rewritten
  // immediately to the path-based equivalent /en/product/<slug>. Done before
  // the rest of the runtime so the user lands on the correct pre-rendered HTML
  // instead of seeing the source-language navbar flash. Skipped when we are
  // already on a language-prefixed path (no redirect loop).
  (function softRedirectQueryLangToPath() {
    var queryLang = getQueryLang();
    if (!queryLang) return;
    var pathLang = getPathLang();
    if (pathLang) return;
    var path = window.location.pathname || '';
    if (!/^\/(product|category)(?:\/|$)/i.test(path)) return;
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete('lang');
      var nextPath = '/' + queryLang.toLowerCase() + path;
      var nextHref = url.origin + nextPath + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash;
      window.location.replace(nextHref);
    } catch (e) {}
  })();

  function getLang() {
    try {
      if (window.zappyI18n && typeof window.zappyI18n.getCurrentLanguage === 'function') {
        var i18nLang = window.zappyI18n.getCurrentLanguage();
        if (i18nLang) return String(i18nLang).split('-')[0].toLowerCase();
      }
      if (window.zappyI18n && window.zappyI18n.language) {
        return String(window.zappyI18n.language).split('-')[0].toLowerCase();
      }
    } catch (e) {}
    var queryLang = getQueryLang();
    if (queryLang) return queryLang.toLowerCase();
    var pathLang = getPathLang();
    if (pathLang) return pathLang.toLowerCase();
    var htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang) return htmlLang.split('-')[0].toLowerCase();
    try {
      var stored = localStorage.getItem('zappy_lang') || localStorage.getItem('zappy-language') || localStorage.getItem('selectedLanguage') || localStorage.getItem('language');
      if (stored) return String(stored).split('-')[0].toLowerCase();
    } catch (e) {}
    return '';
  }

  function getDefaultLang() {
    // The default language is whatever owns the path-prefix-free routes. We
    // pin to 'he' here for the legacy Hebrew-source sites; future-proof by
    // overriding via window.__zappyDefaultLang from the generated bundle.
    return window.__zappyDefaultLang || 'he';
  }

  function buildPath(path) {
    if (!path || /^https?:\/\//i.test(path) || path.charAt(0) === '#') return path;
    var normalized = path.charAt(0) === '/' ? path : '/' + path;
    var lang = getLang();
    var defaultLang = getDefaultLang();
    if (!lang || lang === defaultLang) return normalized.replace(/^\/[a-z]{2}(?=\/)/i, '');
    // Always use path-based language prefix — including dynamic
    // /product/:slug + /category/:slug, which the publish pipeline serves via
    // pre-rendered /<lang>/<base>/:slug/index.html. No more ?lang= query.
    var withoutLang = normalized.replace(/^\/[a-z]{2}(?=\/)/i, '');
    var prefix = '/' + lang;
    return withoutLang === prefix || withoutLang.indexOf(prefix + '/') === 0 ? withoutLang : prefix + withoutLang;
  }

  function isStorefrontPath(href) {
    return /^\/(?:[a-z]{2}\/)?(?:product|category|products)(?:\/|\?|#|$)/i.test(href || '');
  }

  function patchLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('a[href]').forEach(function(anchor) {
      var href = anchor.getAttribute('href');
      if (!isStorefrontPath(href)) return;
      var next = buildPath(href);
      if (href !== next) anchor.setAttribute('href', next);
    });
  }

  function ensureProductsChevron() {
    var trigger = document.querySelector('.zappy-products-dropdown > a');
    if (!trigger) return;
    trigger.setAttribute('href', buildPath('/products'));
    if (trigger.querySelector('svg.dropdown-arrow')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'dropdown-arrow');
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 9l6 6 6-6');
    svg.appendChild(path);
    trigger.appendChild(document.createTextNode(' '));
    trigger.appendChild(svg);
  }

  // On mobile the inline chevron (rendered inside the <a>) is unusable: tapping
  // it just navigates to /products instead of expanding the submenu, and it sits
  // hugged to the link text instead of on the far side of the row. The
  // generation pipelines for e-commerce per-language pages do not inject the
  // shared initMobileSubmenuToggles helper, so we own that here. Below 768px
  // we materialise a dedicated <button class="mobile-submenu-toggle"> as a
  // sibling of the link; existing styles.css already styles its chevron and
  // expands .sub-menu.mobile-expanded, and our V5 ensureRuntimeCssInjected
  // pins the button to the far edge of the row (right in LTR, left in RTL).
  // Above 768px we tear it back down so the desktop hover dropdown is intact.
  function ensureMobileSubmenuToggles() {
    var isMobile = window.matchMedia ? window.matchMedia('(max-width: 768px)').matches : window.innerWidth <= 768;

    if (!isMobile) {
      document.querySelectorAll('.mobile-submenu-toggle[data-zappy-runtime="ecom-routing"]').forEach(function(btn) {
        btn.remove();
      });
      document.querySelectorAll('.sub-menu.mobile-expanded').forEach(function(menu) {
        menu.classList.remove('mobile-expanded');
      });
      document.querySelectorAll('.zappy-products-dropdown > a > svg.dropdown-arrow[data-zappy-mobile-hidden="1"]').forEach(function(arrow) {
        arrow.style.display = '';
        arrow.removeAttribute('data-zappy-mobile-hidden');
      });
      return;
    }

    var dropdowns = document.querySelectorAll('.zappy-products-dropdown, .menu-item-has-children, .nav-menu li:has(> .sub-menu), nav li:has(> .sub-menu)');
    dropdowns.forEach(function(li) {
      if (!li || !li.querySelector) return;
      var submenu = li.querySelector(':scope > .sub-menu');
      var trigger = li.querySelector(':scope > a') || li.querySelector(':scope > .menu-group-title');
      if (!submenu || !trigger) return;

      // Hide the inline SVG chevron on mobile so we don't render two chevrons.
      var inlineArrow = trigger.querySelector('svg.dropdown-arrow');
      if (inlineArrow && !inlineArrow.hasAttribute('data-zappy-mobile-hidden')) {
        inlineArrow.style.display = 'none';
        inlineArrow.setAttribute('data-zappy-mobile-hidden', '1');
      }

      var btn = li.querySelector(':scope > .mobile-submenu-toggle');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mobile-submenu-toggle';
        btn.setAttribute('aria-label', 'Toggle submenu');
        trigger.insertAdjacentElement('afterend', btn);
      }
      btn.setAttribute('aria-expanded', submenu.classList.contains('mobile-expanded') ? 'true' : 'false');
      btn.setAttribute('data-zappy-runtime', 'ecom-routing');

      if (btn.getAttribute('data-zappy-runtime-bound') === '1') return;
      btn.setAttribute('data-zappy-runtime-bound', '1');

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

        // Close any other open submenus so only one is open at a time.
        document.querySelectorAll('.sub-menu.mobile-expanded').forEach(function(other) {
          if (other === submenu) return;
          other.classList.remove('mobile-expanded');
          var otherBtn = other.parentElement && other.parentElement.querySelector(':scope > .mobile-submenu-toggle');
          if (otherBtn) {
            otherBtn.classList.remove('expanded');
            otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        var willOpen = !submenu.classList.contains('mobile-expanded');
        submenu.classList.toggle('mobile-expanded', willOpen);
        btn.classList.toggle('expanded', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        normalizeMobileSubmenuLayout();
      }, true);
    });
    normalizeMobileSubmenuLayout();
  }

  function setImportant(el, prop, value) {
    if (!el || !el.style || !el.style.setProperty) return;
    el.style.setProperty(prop, value, 'important');
  }

  function normalizeMobileSubmenuLayout() {
    var isMobile = window.matchMedia ? window.matchMedia('(max-width: 768px)').matches : window.innerWidth <= 768;
    if (!isMobile) return;
    var isRtl = (document.documentElement.getAttribute('dir') || document.body.getAttribute('dir')) === 'rtl';
    document.querySelectorAll('.nav-menu li:has(> .sub-menu), nav li:has(> .sub-menu), .navbar li:has(> .sub-menu)').forEach(function(li) {
      var submenu = li.querySelector(':scope > .sub-menu');
      var trigger = li.querySelector(':scope > a') || li.querySelector(':scope > .menu-group-title');
      var btn = li.querySelector(':scope > .mobile-submenu-toggle');
      if (!submenu || !trigger || !btn) return;

      // Keep the layout direction LTR even on RTL pages. Flexbox otherwise
      // places the full-width submenu from the right edge and clips it outside
      // the mobile drawer; text direction is restored on the children below.
      setImportant(li, 'direction', 'ltr');
      setImportant(li, 'display', 'flex');
      setImportant(li, 'flex-wrap', 'wrap');
      setImportant(li, 'align-items', 'flex-start');
      setImportant(li, 'width', '100%');
      setImportant(li, 'max-width', '100%');
      setImportant(li, 'min-width', '0');
      setImportant(li, 'overflow', 'visible');
      setImportant(li, 'box-sizing', 'border-box');

      setImportant(trigger, 'display', 'block');
      setImportant(trigger, 'direction', isRtl ? 'rtl' : 'ltr');
      setImportant(trigger, 'flex', '1 1 0');
      setImportant(trigger, 'min-width', '0');
      setImportant(trigger, 'max-width', 'calc(100% - 48px)');
      setImportant(trigger, 'width', 'auto');
      setImportant(trigger, 'box-sizing', 'border-box');
      setImportant(trigger, 'white-space', 'normal');
      setImportant(trigger, 'overflow-wrap', 'anywhere');
      setImportant(trigger, 'padding-inline', '8px');
      setImportant(trigger, 'text-align', isRtl ? 'right' : 'left');
      setImportant(trigger, 'order', isRtl ? '2' : '1');

      setImportant(btn, 'display', 'flex');
      setImportant(btn, 'position', 'static');
      setImportant(btn, 'flex', '0 0 48px');
      setImportant(btn, 'width', '48px');
      setImportant(btn, 'height', '44px');
      setImportant(btn, 'min-height', '44px');
      setImportant(btn, 'align-items', 'center');
      setImportant(btn, 'justify-content', 'center');
      setImportant(btn, 'margin', '0');
      setImportant(btn, 'padding', '0');
      setImportant(btn, 'background', 'transparent');
      setImportant(btn, 'border', 'none');
      setImportant(btn, 'order', isRtl ? '1' : '2');

      setImportant(submenu, 'order', '3');
      setImportant(submenu, 'direction', isRtl ? 'rtl' : 'ltr');
      setImportant(submenu, 'text-align', isRtl ? 'right' : 'left');
      setImportant(submenu, 'flex', '0 0 100%');
      setImportant(submenu, 'width', '100%');
      setImportant(submenu, 'min-width', '0');
      setImportant(submenu, 'max-width', '100%');
      setImportant(submenu, 'box-sizing', 'border-box');
      setImportant(submenu, 'margin', '0');
      setImportant(submenu, 'transform', 'none');
      setImportant(submenu, 'left', 'auto');
      setImportant(submenu, 'right', 'auto');
      setImportant(submenu, 'inset-inline-start', 'auto');
      setImportant(submenu, 'inset-inline-end', 'auto');
      if (submenu.classList.contains('mobile-expanded')) {
        setImportant(submenu, 'padding', '8px 0');
      }

      submenu.querySelectorAll('a, .menu-group-title').forEach(function(item) {
        var parentItem = item.closest && item.closest('li');
        setImportant(item, 'display', 'block');
        setImportant(item, 'direction', isRtl ? 'rtl' : 'ltr');
        setImportant(item, 'width', '100%');
        setImportant(item, 'min-width', '0');
        setImportant(item, 'max-width', '100%');
        setImportant(item, 'box-sizing', 'border-box');
        setImportant(item, 'white-space', 'normal');
        setImportant(item, 'overflow-wrap', 'anywhere');
        setImportant(item, 'padding', '10px 8px');
        setImportant(item, 'text-align', isRtl ? 'right' : 'left');
        if (parentItem && parentItem.classList && parentItem.classList.contains('zappy-nav-parent')) {
          setImportant(item, 'font-weight', '700');
        }
        if (parentItem && parentItem.classList && parentItem.classList.contains('zappy-nav-child')) {
          setImportant(item, 'padding-left', isRtl ? '16px' : '36px');
          setImportant(item, 'padding-right', isRtl ? '36px' : '16px');
          setImportant(item, 'font-size', '0.94em');
          setImportant(item, 'opacity', '0.85');
        }
      });
    });
  }

  function scheduleMobileSubmenuRefresh() {
    [0, 60, 160, 320, 700, 1200, 2200].forEach(function(delay) {
      setTimeout(function() {
        ensureMobileSubmenuToggles();
        normalizeMobileSubmenuLayout();
      }, delay);
    });
  }

  function installMobileMenuRefreshHooks() {
    if (window.__zappyMobileSubmenuRefreshHooksInstalled) return;
    window.__zappyMobileSubmenuRefreshHooksInstalled = true;

    document.addEventListener('click', function(e) {
      var target = e.target && e.target.closest && e.target.closest(
        '.mobile-toggle,.menu-toggle,.hamburger,.navbar-toggle,.mobile-submenu-toggle,[aria-label="תפריט"],[aria-label="Menu"],[aria-label="menu"]'
      );
      if (target) scheduleMobileSubmenuRefresh();
    }, true);

    if (!window.MutationObserver) return;
    var observeNav = function() {
      var nav = document.getElementById('navMenu') || document.querySelector('.nav-menu');
      if (!nav || nav.getAttribute('data-zappy-mobile-submenu-observed') === '1') return;
      nav.setAttribute('data-zappy-mobile-submenu-observed', '1');
      var handleMutations = function(mutations) {
        var shouldRefresh = mutations.some(function(mutation) {
          if (mutation.type === 'attributes') return mutation.attributeName === 'class' || mutation.attributeName === 'style';
          return Array.prototype.some.call(mutation.addedNodes || [], function(node) {
            return node.nodeType === 1 && (
              node.classList && node.classList.contains('mobile-submenu-toggle')
              || node.querySelector && node.querySelector('.mobile-submenu-toggle')
            );
          });
        });
        if (shouldRefresh) scheduleMobileSubmenuRefresh();
      };
      var navObserver = new MutationObserver(handleMutations);
      navObserver.observe(nav, { attributes: true, attributeFilter: ['class', 'style'], childList: true });
      var childObserver = new MutationObserver(handleMutations);
      childObserver.observe(nav, { childList: true, subtree: true });
    };
    observeNav();
    setTimeout(observeNav, 500);
  }

  var __zappyMobileSubmenuResizeTimer = null;
  window.addEventListener('resize', function() {
    if (__zappyMobileSubmenuResizeTimer) clearTimeout(__zappyMobileSubmenuResizeTimer);
    __zappyMobileSubmenuResizeTimer = setTimeout(ensureMobileSubmenuToggles, 200);
  }, { passive: true });

  function patchCatalogDirection() {
    var catalog = document.getElementById('zappy-catalog-menu');
    if (!catalog) return;
    var dir = document.documentElement.getAttribute('dir') || (getLang() === 'he' ? 'rtl' : 'ltr');
    catalog.classList.toggle('rtl', dir === 'rtl');
    catalog.classList.toggle('ltr', dir !== 'rtl');
    catalog.setAttribute('dir', dir);
    catalog.querySelectorAll('.catalog-menu-item, .sub-menu').forEach(function(el) {
      el.setAttribute('dir', dir);
    });
  }

  // Inject the small CSS rules we need at runtime. Doing this from JS instead of
  // a separate CSS ensure step makes us robust to clean-css comment stripping +
  // declaration merging that was eating the standalone CSS injection.
  function ensureRuntimeCssInjected() {
    var existing = document.getElementById('zappy-ecom-routing-runtime-css');
    if (existing && existing.getAttribute('data-v') === '16') return;
    if (existing) existing.remove();
    var style = document.createElement('style');
    style.id = 'zappy-ecom-routing-runtime-css';
    style.setAttribute('data-zappy-runtime', 'ecom-routing');
    style.setAttribute('data-v', '16');
    style.textContent =
      '@media (min-width: 769px){' +
        'html[dir="ltr"] .nav-container > .nav-brand,body[dir="ltr"] .nav-container > .nav-brand{order:-1!important}' +
        'html[dir="ltr"] .nav-container > .nav-menu,body[dir="ltr"] .nav-container > .nav-menu{order:1!important;margin-inline-start:0!important;margin-inline-end:24px!important;flex:0 1 auto!important}' +
        'html[dir="ltr"] .nav-container > .lang-switcher,body[dir="ltr"] .nav-container > .lang-switcher,html[dir="ltr"] .nav-container > .nav-ecommerce-icons,body[dir="ltr"] .nav-container > .nav-ecommerce-icons{order:2!important}' +
        'html[dir="ltr"] .nav-container > .nav-ecommerce-icons.nav-icons-left,body[dir="ltr"] .nav-container > .nav-ecommerce-icons.nav-icons-left{margin-inline-start:auto!important}' +
        'html[dir="ltr"] .zappy-products-dropdown > a .dropdown-arrow,body[dir="ltr"] .zappy-products-dropdown > a .dropdown-arrow{display:inline-block!important;flex:0 0 auto!important;margin-inline-start:6px!important}' +
        'html[dir="ltr"] .zappy-catalog-menu,html[dir="ltr"] .zappy-catalog-menu .catalog-menu-container,html[dir="ltr"] .zappy-catalog-menu .catalog-menu-categories{direction:ltr!important}' +
        'html[dir="ltr"] .zappy-catalog-menu .catalog-menu-container{align-items:flex-start!important}' +
        'html[dir="ltr"] .zappy-catalog-menu .catalog-menu-categories{display:flex!important;align-items:flex-start!important;align-content:flex-start!important;row-gap:4px!important;column-gap:2px!important}' +
        'html[dir="ltr"] .zappy-catalog-menu .catalog-menu-item{padding-inline:10px!important}' +
        'html[dir="ltr"] .zappy-catalog-menu .catalog-menu-all{margin-top:0!important;align-self:flex-start!important}' +
        '.nav-menu .zappy-products-dropdown>.sub-menu,#navMenu .zappy-products-dropdown>.sub-menu{left:50%!important;right:auto!important;transform:translateX(-50%) translateY(8px)!important}' +
        '.nav-menu .zappy-products-dropdown:hover>.sub-menu,#navMenu .zappy-products-dropdown:hover>.sub-menu,.nav-menu .zappy-products-dropdown:focus-within>.sub-menu,#navMenu .zappy-products-dropdown:focus-within>.sub-menu{transform:translateX(-50%) translateY(0)!important}' +
      '}' +
      '@media (max-width:768px){' +
        '.nav-menu li:has(.sub-menu),.navbar li:has(.sub-menu),nav li:has(.sub-menu){direction:ltr!important;display:flex!important;flex-wrap:wrap!important;align-items:flex-start!important;max-width:100%!important;width:100%!important;overflow:visible!important;box-sizing:border-box!important}' +
        '.nav-menu li:has(.sub-menu)>a,.navbar li:has(.sub-menu)>a,nav li:has(.sub-menu)>a,li:has(.sub-menu)>.menu-group-title{display:block!important;flex:1 1 0!important;order:1!important;width:auto!important;min-width:0!important;max-width:calc(100% - 48px)!important;padding-inline:8px!important;box-sizing:border-box!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.35!important;text-align:left!important;direction:ltr!important}' +
        'html[dir="rtl"] .nav-menu li:has(.sub-menu)>a,body[dir="rtl"] .nav-menu li:has(.sub-menu)>a,html[dir="rtl"] .navbar li:has(.sub-menu)>a,body[dir="rtl"] .navbar li:has(.sub-menu)>a,html[dir="rtl"] nav li:has(.sub-menu)>a,body[dir="rtl"] nav li:has(.sub-menu)>a,html[dir="rtl"] li:has(.sub-menu)>.menu-group-title,body[dir="rtl"] li:has(.sub-menu)>.menu-group-title{direction:rtl!important;text-align:right!important;order:2!important}' +
        '.nav-menu li:has(.sub-menu)>.mobile-submenu-toggle,.navbar li:has(.sub-menu)>.mobile-submenu-toggle,nav li:has(.sub-menu)>.mobile-submenu-toggle{display:flex!important;position:static!important;flex:0 0 48px!important;order:2!important;width:48px!important;height:44px!important;min-height:44px!important;align-items:center!important;justify-content:center!important;z-index:5!important;pointer-events:auto!important;margin:0!important;padding:0!important;background:transparent!important;border:none!important}' +
        'html[dir="rtl"] .nav-menu li:has(.sub-menu)>.mobile-submenu-toggle,body[dir="rtl"] .nav-menu li:has(.sub-menu)>.mobile-submenu-toggle,html[dir="rtl"] .navbar li:has(.sub-menu)>.mobile-submenu-toggle,body[dir="rtl"] .navbar li:has(.sub-menu)>.mobile-submenu-toggle,html[dir="rtl"] nav li:has(.sub-menu)>.mobile-submenu-toggle,body[dir="rtl"] nav li:has(.sub-menu)>.mobile-submenu-toggle{order:1!important}' +
        '.nav-menu li:has(.sub-menu)>.sub-menu,.navbar li:has(.sub-menu)>.sub-menu,nav li:has(.sub-menu)>.sub-menu{order:3!important;flex:0 0 100%!important;width:100%!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;margin:0!important;transform:none!important;left:auto!important;right:auto!important;inset-inline-start:auto!important;inset-inline-end:auto!important}' +
        '.nav-menu .sub-menu.mobile-expanded,.navbar .sub-menu.mobile-expanded,nav .sub-menu.mobile-expanded{padding:8px 0!important}' +
        '.sub-menu a,.sub-menu .menu-group-title{display:block!important;width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;padding:10px 8px!important}' +
        '.zappy-products-dropdown>.sub-menu .zappy-nav-parent>a,.zappy-products-dropdown>.sub-menu .zappy-nav-parent>.menu-group-title{font-weight:700!important}' +
        '.zappy-products-dropdown>.sub-menu .zappy-nav-child>a,.zappy-products-dropdown>.sub-menu .zappy-nav-child>.menu-group-title{padding-left:36px!important;padding-right:16px!important;font-size:.94em!important;opacity:.85!important}' +
        'html[dir="rtl"] .zappy-products-dropdown>.sub-menu .zappy-nav-child>a,body[dir="rtl"] .zappy-products-dropdown>.sub-menu .zappy-nav-child>a,html[dir="rtl"] .zappy-products-dropdown>.sub-menu .zappy-nav-child>.menu-group-title,body[dir="rtl"] .zappy-products-dropdown>.sub-menu .zappy-nav-child>.menu-group-title{padding-left:16px!important;padding-right:36px!important}' +
      '}';
    (document.head || document.documentElement).appendChild(style);
  }

  function patch() {
    ensureRuntimeCssInjected();
    installMobileMenuRefreshHooks();
    patchLinks(document);
    ensureProductsChevron();
    ensureMobileSubmenuToggles();
    patchCatalogDirection();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch);
  } else {
    patch();
  }
  window.addEventListener('popstate', function() { setTimeout(patch, 0); });
  window.addEventListener('zappy:languageChanged', function() { setTimeout(patch, 0); });
  window.addEventListener('languageChanged', function() { setTimeout(patch, 0); });
  new MutationObserver(function(mutations) {
    var shouldPatch = mutations.some(function(mutation) {
      return Array.prototype.some.call(mutation.addedNodes || [], function(node) {
        return node.nodeType === 1 && (
          (node.matches && node.matches('a[href], .zappy-products-dropdown, #zappy-catalog-menu')) ||
          (node.querySelector && node.querySelector('a[href], .zappy-products-dropdown, #zappy-catalog-menu'))
        );
      });
    });
    if (shouldPatch) setTimeout(patch, 0);
  }).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(patch, 250);
  setTimeout(patch, 1500);
})();

/* ZAPPY_MOBILE_NAV_ICON_ALIGNMENT_RUNTIME */
/* ZAPPY_MOBILE_NAV_ICON_ALIGNMENT_RUNTIME_V2 */
(function(){
  try {
    function injectMobileNavIconAlignmentFix() {
      if (document.getElementById('zappy-mobile-nav-icon-alignment-fix')) return;
      var style = document.createElement('style');
      style.id = 'zappy-mobile-nav-icon-alignment-fix';
      style.textContent = "\n\n/* ZAPPY_MOBILE_NAV_ICON_ALIGNMENT_FIX */\n/* ZAPPY_MOBILE_NAV_ICON_ALIGNMENT_FIX_V2 */\n/* The mobile hamburger / phone buttons are absolutely positioned. Keep the\n   navbar itself as a non-collapsing containing block so auto-margin centering\n   stays aligned even when generated mobile CSS moves every nav child out of flow. */\n@media (max-width: 768px) {\n  .navbar,\n  nav.navbar {\n    min-height: 70px !important;\n  }\n\n  .navbar > .mobile-toggle,\n  nav.navbar > .mobile-toggle,\n  .navbar .mobile-toggle,\n  nav.navbar .mobile-toggle,\n  #mobileToggle,\n  .navbar > .phone-header-btn,\n  nav.navbar > .phone-header-btn,\n  .navbar .phone-header-btn,\n  nav.navbar .phone-header-btn {\n    position: absolute !important;\n    top: 0 !important;\n    bottom: 0 !important;\n    transform: none !important;\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n    align-self: center !important;\n    align-items: center !important;\n    justify-content: center !important;\n    line-height: 0 !important;\n  }\n\n  .navbar > .mobile-toggle,\n  nav.navbar > .mobile-toggle,\n  .navbar .mobile-toggle,\n  nav.navbar .mobile-toggle,\n  #mobileToggle {\n    display: flex !important;\n  }\n\n  html:not([data-zappy-site-type=\"ecommerce\"]) .navbar > .phone-header-btn,\n  html:not([data-zappy-site-type=\"ecommerce\"]) nav.navbar > .phone-header-btn,\n  html:not([data-zappy-site-type=\"ecommerce\"]) .navbar .phone-header-btn,\n  html:not([data-zappy-site-type=\"ecommerce\"]) nav.navbar .phone-header-btn {\n    display: flex !important;\n  }\n\n  html[data-zappy-site-type=\"ecommerce\"] .phone-header-btn,\n  body[data-zappy-site-type=\"ecommerce\"] .phone-header-btn,\n  html[data-zappy-site-type=\"ecommerce\"] header .phone-header-btn,\n  html[data-zappy-site-type=\"ecommerce\"] nav .phone-header-btn {\n    display: none !important;\n    visibility: hidden !important;\n    width: 0 !important;\n    height: 0 !important;\n    min-width: 0 !important;\n    overflow: hidden !important;\n  }\n}\n";
      document.head.appendChild(style);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectMobileNavIconAlignmentFix);
    } else {
      injectMobileNavIconAlignmentFix();
    }
    window.addEventListener('load', injectMobileNavIconAlignmentFix);
    setTimeout(injectMobileNavIconAlignmentFix, 250);
    setTimeout(injectMobileNavIconAlignmentFix, 1000);
  } catch (e) {}
})();
