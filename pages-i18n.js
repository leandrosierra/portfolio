/* Persistent EN/FR i18n for the static content pages (about, contact, privacy, terms).
   Each translatable node carries data-i18n="<key>"; the dictionary below holds the
   innerHTML for every key in both served languages. The selector is persistent via
   localStorage("portfolio-lang") — the same key the homepage uses — so the language
   choice follows the visitor across the whole site. No IP redirect, native language
   names, html[lang] kept in sync. */
(function () {
  "use strict";

  var DICT = {
    en: {
      "nav.about": "About",
      "nav.contact": "Contact",
      "nav.privacy": "Privacy",
      "foot.products": "Products",
      "foot.about": "About",
      "foot.contact": "Contact",
      "foot.privacy": "Privacy",
      "foot.terms": "Terms",
      "foot.copy": "© 2026 Leandro Sierra",

      /* ---- about ---- */
      "about.title": "About this portfolio",
      "about.lead": "Leandro Sierra is an independent product developer building and operating live internet software — AI tooling, EU regulatory-readiness products and consumer web apps. This site is the public index of those products.",
      "about.h_find": "What you'll find here",
      "about.p_find": "The homepage links to a catalogue of independent web products, each running on its own subdomain of <strong>leandro-sierra.com</strong>. They fall into a few recurring families:",
      "about.li_reg": "<strong>Regulatory-readiness tools</strong> — practical self-assessment kits for EU and international rules (Data Act, CRA, GPSR, EAA accessibility, battery passport, AI Act and others): a diagnosis, a prioritised fix list and ready-to-adapt document templates.",
      "about.li_ai": "<strong>AI tooling</strong> — utilities for teams shipping AI features: cost guardrails for agent workloads, QA and observability for deployed agents, documentation audits for AI readability, and provenance trails for AI-generated code.",
      "about.li_consumer": "<strong>Consumer and operations apps</strong> — focused single-purpose web apps that solve one concrete task well, without sign-up friction.",
      "about.h_built": "How the products are built",
      "about.p_built": "Every product follows the same opinionated path so the catalogue stays consistent and trustworthy:",
      "about.li_onejob": "<strong>One job per product.</strong> Each app does a single thing and states plainly what it does and does not cover.",
      "about.li_content": "<strong>Real, original content.</strong> Checklists, guides and templates are written for the specific regulation or task — not generic filler.",
      "about.li_privacy": "<strong>Privacy-first analytics.</strong> Traffic is measured with cookieless analytics; on the products that carry advertising, it loads only after explicit consent.",
      "about.li_a11y": "<strong>Accessibility and performance.</strong> Pages are built to be fast, keyboard-navigable and readable on any device, in both light and dark themes.",
      "about.li_money": "<strong>Honest monetisation.</strong> This index is free and ad-free. The individual products are funded through clearly-labelled advertising and, for some, optional paid features — never dark patterns.",
      "about.h_domain": "Why a single domain",
      "about.p_domain": "Hosting every product under one root domain keeps a clear, accountable home for the work: one place to learn who is behind a product, how to get in touch, and how data is handled. The same privacy policy, contact route and editorial standards apply across every subdomain.",
      "about.h_editorial": "Editorial standards",
      "about.p_editorial": "Content is reviewed for accuracy and kept current as rules and best practices change. Regulatory products summarise official sources and link to them; they are practical aids, not legal advice. Where a product cannot yet verify something, it says so rather than guessing.",
      "about.p_foot": "For questions, corrections or partnership enquiries, see the <a href=\"/contact.html\">contact page</a>.",

      /* ---- contact ---- */
      "contact.title": "Contact",
      "contact.lead": "Questions, corrections, bug reports or partnership enquiries about any product on this site are welcome.",
      "contact.card_h": "Email",
      "contact.card_p": "The fastest way to reach me is by email:",
      "contact.card_meta": "I read every message and usually reply within a few business days.",
      "contact.h_include": "What to include",
      "contact.p_include": "To get a useful answer quickly, please mention:",
      "contact.li_url": "The <strong>product name or URL</strong> you are writing about (for example <code>dataactready.leandro-sierra.com</code>).",
      "contact.li_bug": "What you expected to happen and what actually happened, if it is a bug.",
      "contact.li_correction": "For content corrections, the page and the specific point you believe is inaccurate, ideally with a source.",
      "contact.h_takedown": "Corrections &amp; takedowns",
      "contact.p_takedown": "The regulatory and informational content on these products is kept as accurate as possible, but mistakes happen and rules change. If you spot an error, or you are a rights holder requesting a takedown, email the address above with the relevant URL and details. Verified issues are corrected promptly.",
      "contact.h_press": "Business &amp; press",
      "contact.p_press": "For partnerships, advertising, or press enquiries, use the same email and include \"partnership\" or \"press\" in the subject line.",
      "contact.p_foot": "This site is operated by Leandro Sierra as an independent developer. See the <a href=\"/about.html\">about page</a> for background and the <a href=\"/privacy.html\">privacy policy</a> for how data is handled.",

      /* ---- privacy ---- */
      "privacy.title": "Privacy Policy",
      "privacy.lead": "This policy explains what data <strong>leandro-sierra.com</strong> and its product subdomains collect, how it is used, and the choices you have. It applies to the homepage and to every product hosted on a <code>*.leandro-sierra.com</code> subdomain.",
      "privacy.updated": "Last updated: 14 June 2026.",
      "privacy.h_who": "Who is responsible",
      "privacy.p_who": "These sites are operated by Leandro Sierra, an independent developer (the \"operator\"). For any privacy question or request, contact <a href=\"mailto:contact@leandro-sierra.com\">contact&#64;leandro-sierra.com</a>.",
      "privacy.h_collect": "What we collect",
      "privacy.li_analytics": "<strong>Usage analytics.</strong> We measure aggregate traffic (pages viewed, referrer, approximate region, device type) using <strong>GoatCounter</strong>, a privacy-friendly, cookieless analytics tool. This data is aggregated and does not identify you.",
      "privacy.li_provide": "<strong>Information you provide.</strong> If you email us or submit a form on a product, we receive what you send (for example your email address and message) and use it only to respond.",
      "privacy.li_logs": "<strong>Technical logs.</strong> Our servers keep standard request logs (IP address, timestamp, user agent) for security and reliability. These are kept for a limited period and not used to profile you.",
      "privacy.h_cookies": "Cookies and advertising",
      "privacy.p_cookies1": "This portfolio site (<strong>leandro-sierra.com</strong>) sets <strong>no advertising or tracking cookies</strong> and shows <strong>no advertising</strong>. The only analytics used here is GoatCounter, which is cookieless. Because no non-essential cookies are set on this site, it shows no cookie consent banner.",
      "privacy.p_cookies2": "Some of the individual products hosted on <code>*.leandro-sierra.com</code> subdomains may display advertising to fund the service. Where a product shows ads, that happens on the product itself, is governed by the notice shown on that product, and:",
      "privacy.li_ad_vendors": "third-party vendors, including Google, may use cookies to serve ads based on a user's prior visits to that product and other websites;",
      "privacy.li_ad_consent": "on products that carry ads, advertising is loaded only after explicit consent, and you can change or withdraw that consent on the product at any time;",
      "privacy.li_ad_optout": "you can opt out of personalised advertising across the web via <a href=\"https://www.google.com/settings/ads\" rel=\"noopener\" target=\"_blank\">Google Ads Settings</a> and <a href=\"https://www.aboutads.info/choices/\" rel=\"noopener\" target=\"_blank\">aboutads.info/choices</a>.",
      "privacy.h_use": "How we use data",
      "privacy.p_use": "We use the limited data above to operate and improve the products, understand which content is useful, respond to your messages, and keep the services secure. On the products that carry advertising, and only where you have consented on that product, advertising data may also be processed.",
      "privacy.h_basis": "Legal basis (EEA/UK)",
      "privacy.p_basis": "Where the GDPR or UK GDPR applies, our legal bases are: your <strong>consent</strong> (for advertising and any non-essential cookies), and our <strong>legitimate interests</strong> (cookieless analytics, security logging) balanced against your rights.",
      "privacy.h_rights": "Your rights",
      "privacy.p_rights": "Depending on where you live, you may have the right to access, correct, delete or restrict processing of your personal data, and to withdraw consent at any time. To exercise any right, email <a href=\"mailto:contact@leandro-sierra.com\">contact&#64;leandro-sierra.com</a>. You also have the right to lodge a complaint with your local data protection authority.",
      "privacy.h_sharing": "Data sharing",
      "privacy.p_sharing": "We do not sell your personal data. Data is shared only with the service providers needed to run the sites (hosting, the analytics provider, and Google for advertising where applicable), each acting under their own terms.",
      "privacy.h_children": "Children",
      "privacy.p_children": "These services are not directed to children under 16 and we do not knowingly collect their personal data.",
      "privacy.h_changes": "Changes",
      "privacy.p_changes": "We may update this policy as the services or applicable law change. The \"last updated\" date above reflects the current version.",

      /* ---- terms ---- */
      "terms.title": "Terms &amp; Legal Notice",
      "terms.lead": "These terms govern your use of <strong>leandro-sierra.com</strong> and the products hosted on its subdomains. By using the sites you agree to them.",
      "terms.updated": "Last updated: 14 June 2026.",
      "terms.h_identity": "Site identity",
      "terms.p_identity": "These sites are published and operated by Leandro Sierra, an independent developer. Contact: <a href=\"mailto:contact@leandro-sierra.com\">contact&#64;leandro-sierra.com</a>. Hosting is provided by third-party infrastructure providers.",
      "terms.h_use": "Acceptable use",
      "terms.p_use": "You may use the products for their intended purpose. You agree not to:",
      "terms.li_disrupt": "attempt to disrupt, overload, or gain unauthorised access to the services;",
      "terms.li_scrape": "scrape or republish content at scale without permission;",
      "terms.li_law": "use the services to break any applicable law.",
      "terms.h_info": "Informational content &amp; no legal advice",
      "terms.p_info": "Many products summarise regulations and provide checklists, guides and document templates. This material is <strong>informational only and is not legal, financial or professional advice</strong>. Regulations change and your situation may differ; verify against official sources and consult a qualified professional before relying on it. The operator is not liable for decisions made on the basis of this content.",
      "terms.h_avail": "Availability &amp; changes",
      "terms.p_avail": "The services are provided \"as is\" and \"as available\". We may modify, suspend or discontinue any product at any time. We aim for accuracy and uptime but make no guarantee that content is complete, current or error-free.",
      "terms.h_ip": "Intellectual property",
      "terms.p_ip": "The text, design and original templates on these sites are the property of the operator unless stated otherwise. Official regulatory texts referenced or quoted remain the property of their respective authorities. You may use the templates for your own compliance work; you may not resell them as a standalone product.",
      "terms.h_ads": "Advertising",
      "terms.p_ads": "Some products are funded by advertising. Ads are clearly distinguishable from editorial content. The presence of an ad is not an endorsement of the advertiser by the operator.",
      "terms.h_liability": "Liability",
      "terms.p_liability": "To the maximum extent permitted by law, the operator is not liable for any indirect or consequential loss arising from use of the services. Nothing in these terms limits liability that cannot be limited by law.",
      "terms.h_law": "Governing law",
      "terms.p_law": "These terms are governed by French law, without prejudice to mandatory consumer protections in your country of residence."
    },

    fr: {
      "nav.about": "À propos",
      "nav.contact": "Contact",
      "nav.privacy": "Confidentialité",
      "foot.products": "Produits",
      "foot.about": "À propos",
      "foot.contact": "Contact",
      "foot.privacy": "Confidentialité",
      "foot.terms": "Mentions légales",
      "foot.copy": "© 2026 Leandro Sierra",

      /* ---- about ---- */
      "about.title": "À propos de ce portfolio",
      "about.lead": "Leandro Sierra est un développeur produit indépendant qui conçoit et exploite des logiciels web en ligne — outils IA, produits de conformité réglementaire UE et apps web grand public. Ce site est l'index public de ces produits.",
      "about.h_find": "Ce que vous trouverez ici",
      "about.p_find": "La page d'accueil renvoie vers un catalogue de produits web indépendants, chacun tournant sur son propre sous-domaine de <strong>leandro-sierra.com</strong>. Ils se répartissent en quelques familles récurrentes :",
      "about.li_reg": "<strong>Outils de conformité réglementaire</strong> — kits d'auto-évaluation pratiques pour les règles UE et internationales (Data Act, CRA, GPSR, accessibilité EAA, passeport batterie, AI Act et autres) : un diagnostic, une liste de correctifs priorisée et des modèles de documents prêts à adapter.",
      "about.li_ai": "<strong>Outils IA</strong> — utilitaires pour les équipes qui livrent des fonctionnalités IA : garde-fous de coût pour les agents, QA et observabilité des agents déployés, audits de documentation pour la lisibilité IA et traçabilité du code généré par IA.",
      "about.li_consumer": "<strong>Apps grand public et opérationnelles</strong> — apps web mono-objectif qui résolvent bien une tâche concrète, sans friction d'inscription.",
      "about.h_built": "Comment les produits sont construits",
      "about.p_built": "Chaque produit suit la même démarche assumée pour que le catalogue reste cohérent et fiable :",
      "about.li_onejob": "<strong>Un seul rôle par produit.</strong> Chaque app fait une seule chose et dit clairement ce qu'elle couvre et ne couvre pas.",
      "about.li_content": "<strong>Du contenu réel et original.</strong> Checklists, guides et modèles sont écrits pour la réglementation ou la tâche précise — pas du remplissage générique.",
      "about.li_privacy": "<strong>Analytics respectueux de la vie privée.</strong> Le trafic est mesuré sans cookies ; sur les produits qui affichent de la publicité, elle ne se charge qu'après consentement explicite.",
      "about.li_a11y": "<strong>Accessibilité et performance.</strong> Les pages sont rapides, navigables au clavier et lisibles sur tout appareil, en thèmes clair et sombre.",
      "about.li_money": "<strong>Monétisation honnête.</strong> Cet index est gratuit et sans publicité. Les produits individuels sont financés par de la publicité clairement identifiée et, pour certains, des options payantes — jamais de dark patterns.",
      "about.h_domain": "Pourquoi un domaine unique",
      "about.p_domain": "Héberger chaque produit sous un même domaine racine donne un foyer clair et responsable au travail : un seul endroit pour savoir qui est derrière un produit, comment me contacter et comment les données sont traitées. La même politique de confidentialité, la même voie de contact et les mêmes standards éditoriaux s'appliquent à chaque sous-domaine.",
      "about.h_editorial": "Standards éditoriaux",
      "about.p_editorial": "Le contenu est relu pour son exactitude et tenu à jour à mesure que les règles et bonnes pratiques évoluent. Les produits réglementaires résument les sources officielles et y renvoient ; ce sont des aides pratiques, pas un conseil juridique. Quand un produit ne peut pas encore vérifier une information, il le dit plutôt que de deviner.",
      "about.p_foot": "Pour toute question, correction ou demande de partenariat, voir la <a href=\"/contact.html\">page contact</a>.",

      /* ---- contact ---- */
      "contact.title": "Contact",
      "contact.lead": "Questions, corrections, signalements de bugs ou demandes de partenariat sur n'importe quel produit de ce site sont les bienvenus.",
      "contact.card_h": "E-mail",
      "contact.card_p": "Le plus rapide pour me joindre est l'e-mail :",
      "contact.card_meta": "Je lis chaque message et réponds généralement sous quelques jours ouvrés.",
      "contact.h_include": "Quoi indiquer",
      "contact.p_include": "Pour une réponse utile rapidement, merci de préciser :",
      "contact.li_url": "Le <strong>nom du produit ou son URL</strong> concerné (par exemple <code>dataactready.leandro-sierra.com</code>).",
      "contact.li_bug": "Ce que vous attendiez et ce qui s'est réellement passé, s'il s'agit d'un bug.",
      "contact.li_correction": "Pour une correction de contenu, la page et le point précis que vous estimez inexact, idéalement avec une source.",
      "contact.h_takedown": "Corrections &amp; retraits",
      "contact.p_takedown": "Le contenu réglementaire et informatif de ces produits est tenu aussi exact que possible, mais des erreurs arrivent et les règles changent. Si vous repérez une erreur, ou si vous êtes ayant droit demandant un retrait, écrivez à l'adresse ci-dessus avec l'URL et les détails. Les problèmes vérifiés sont corrigés rapidement.",
      "contact.h_press": "Business &amp; presse",
      "contact.p_press": "Pour les partenariats, la publicité ou la presse, utilisez la même adresse et indiquez « partnership » ou « press » en objet.",
      "contact.p_foot": "Ce site est exploité par Leandro Sierra en tant que développeur indépendant. Voir la <a href=\"/about.html\">page à propos</a> pour le contexte et la <a href=\"/privacy.html\">politique de confidentialité</a> pour le traitement des données.",

      /* ---- privacy ---- */
      "privacy.title": "Politique de confidentialité",
      "privacy.lead": "Cette politique explique quelles données <strong>leandro-sierra.com</strong> et ses sous-domaines produits collectent, comment elles sont utilisées et les choix dont vous disposez. Elle s'applique à la page d'accueil et à chaque produit hébergé sur un sous-domaine <code>*.leandro-sierra.com</code>.",
      "privacy.updated": "Dernière mise à jour : 14 juin 2026.",
      "privacy.h_who": "Responsable",
      "privacy.p_who": "Ces sites sont exploités par Leandro Sierra, développeur indépendant (l'« opérateur »). Pour toute question ou demande relative à la vie privée, contactez <a href=\"mailto:contact@leandro-sierra.com\">contact&#64;leandro-sierra.com</a>.",
      "privacy.h_collect": "Ce que nous collectons",
      "privacy.li_analytics": "<strong>Analytics d'usage.</strong> Nous mesurons le trafic agrégé (pages vues, référent, région approximative, type d'appareil) avec <strong>GoatCounter</strong>, un outil d'analytics respectueux de la vie privée et sans cookies. Ces données sont agrégées et ne vous identifient pas.",
      "privacy.li_provide": "<strong>Informations que vous fournissez.</strong> Si vous nous écrivez ou soumettez un formulaire sur un produit, nous recevons ce que vous envoyez (par exemple votre adresse e-mail et votre message) et l'utilisons uniquement pour répondre.",
      "privacy.li_logs": "<strong>Journaux techniques.</strong> Nos serveurs conservent des journaux de requêtes standard (adresse IP, horodatage, user agent) pour la sécurité et la fiabilité. Ils sont conservés une durée limitée et ne servent pas à vous profiler.",
      "privacy.h_cookies": "Cookies et publicité",
      "privacy.p_cookies1": "Ce site portfolio (<strong>leandro-sierra.com</strong>) ne dépose <strong>aucun cookie publicitaire ou de suivi</strong> et n'affiche <strong>aucune publicité</strong>. Le seul analytics utilisé ici est GoatCounter, sans cookies. Comme aucun cookie non essentiel n'est déposé sur ce site, il n'affiche pas de bannière de consentement.",
      "privacy.p_cookies2": "Certains produits hébergés sur les sous-domaines <code>*.leandro-sierra.com</code> peuvent afficher de la publicité pour financer le service. Lorsqu'un produit affiche des publicités, cela se passe sur le produit lui-même, est régi par l'avis affiché sur ce produit, et :",
      "privacy.li_ad_vendors": "des fournisseurs tiers, dont Google, peuvent utiliser des cookies pour diffuser des publicités selon les visites précédentes de l'utilisateur sur ce produit et d'autres sites ;",
      "privacy.li_ad_consent": "sur les produits avec publicité, celle-ci ne se charge qu'après consentement explicite, et vous pouvez modifier ou retirer ce consentement sur le produit à tout moment ;",
      "privacy.li_ad_optout": "vous pouvez refuser la publicité personnalisée sur le web via <a href=\"https://www.google.com/settings/ads\" rel=\"noopener\" target=\"_blank\">les paramètres Google Ads</a> et <a href=\"https://www.aboutads.info/choices/\" rel=\"noopener\" target=\"_blank\">aboutads.info/choices</a>.",
      "privacy.h_use": "Comment nous utilisons les données",
      "privacy.p_use": "Nous utilisons les données limitées ci-dessus pour exploiter et améliorer les produits, comprendre quels contenus sont utiles, répondre à vos messages et sécuriser les services. Sur les produits qui affichent de la publicité, et uniquement avec votre consentement sur ce produit, des données publicitaires peuvent aussi être traitées.",
      "privacy.h_basis": "Base légale (EEE/UK)",
      "privacy.p_basis": "Lorsque le RGPD ou le UK GDPR s'applique, nos bases légales sont : votre <strong>consentement</strong> (pour la publicité et tout cookie non essentiel) et nos <strong>intérêts légitimes</strong> (analytics sans cookies, journalisation de sécurité) mis en balance avec vos droits.",
      "privacy.h_rights": "Vos droits",
      "privacy.p_rights": "Selon votre lieu de résidence, vous pouvez avoir le droit d'accéder, corriger, supprimer ou limiter le traitement de vos données personnelles, et de retirer votre consentement à tout moment. Pour exercer un droit, écrivez à <a href=\"mailto:contact@leandro-sierra.com\">contact&#64;leandro-sierra.com</a>. Vous avez aussi le droit d'introduire une réclamation auprès de votre autorité locale de protection des données.",
      "privacy.h_sharing": "Partage des données",
      "privacy.p_sharing": "Nous ne vendons pas vos données personnelles. Les données ne sont partagées qu'avec les prestataires nécessaires au fonctionnement des sites (hébergement, fournisseur d'analytics et Google pour la publicité le cas échéant), chacun agissant selon ses propres conditions.",
      "privacy.h_children": "Mineurs",
      "privacy.p_children": "Ces services ne s'adressent pas aux enfants de moins de 16 ans et nous ne collectons pas sciemment leurs données personnelles.",
      "privacy.h_changes": "Modifications",
      "privacy.p_changes": "Nous pouvons mettre à jour cette politique au fil de l'évolution des services ou de la loi applicable. La date de « dernière mise à jour » ci-dessus reflète la version en cours.",

      /* ---- terms ---- */
      "terms.title": "Mentions légales &amp; conditions",
      "terms.lead": "Ces conditions régissent votre utilisation de <strong>leandro-sierra.com</strong> et des produits hébergés sur ses sous-domaines. En utilisant les sites, vous les acceptez.",
      "terms.updated": "Dernière mise à jour : 14 juin 2026.",
      "terms.h_identity": "Identité du site",
      "terms.p_identity": "Ces sites sont publiés et exploités par Leandro Sierra, développeur indépendant. Contact : <a href=\"mailto:contact@leandro-sierra.com\">contact&#64;leandro-sierra.com</a>. L'hébergement est assuré par des prestataires d'infrastructure tiers.",
      "terms.h_use": "Usage acceptable",
      "terms.p_use": "Vous pouvez utiliser les produits dans le cadre prévu. Vous vous engagez à ne pas :",
      "terms.li_disrupt": "tenter de perturber, surcharger ou accéder sans autorisation aux services ;",
      "terms.li_scrape": "extraire ou republier le contenu à grande échelle sans permission ;",
      "terms.li_law": "utiliser les services pour enfreindre une loi applicable.",
      "terms.h_info": "Contenu informatif &amp; absence de conseil juridique",
      "terms.p_info": "De nombreux produits résument des réglementations et fournissent checklists, guides et modèles de documents. Ce contenu est <strong>purement informatif et ne constitue pas un conseil juridique, financier ou professionnel</strong>. Les réglementations évoluent et votre situation peut différer ; vérifiez auprès des sources officielles et consultez un professionnel qualifié avant de vous y fier. L'opérateur n'est pas responsable des décisions prises sur la base de ce contenu.",
      "terms.h_avail": "Disponibilité &amp; modifications",
      "terms.p_avail": "Les services sont fournis « en l'état » et « selon disponibilité ». Nous pouvons modifier, suspendre ou interrompre tout produit à tout moment. Nous visons l'exactitude et la disponibilité mais ne garantissons pas que le contenu soit complet, à jour ou exempt d'erreurs.",
      "terms.h_ip": "Propriété intellectuelle",
      "terms.p_ip": "Les textes, le design et les modèles originaux de ces sites sont la propriété de l'opérateur sauf mention contraire. Les textes réglementaires officiels référencés ou cités restent la propriété de leurs autorités respectives. Vous pouvez utiliser les modèles pour votre propre travail de conformité ; vous ne pouvez pas les revendre comme produit autonome.",
      "terms.h_ads": "Publicité",
      "terms.p_ads": "Certains produits sont financés par la publicité. Les publicités sont clairement distinctes du contenu éditorial. La présence d'une publicité ne constitue pas une recommandation de l'annonceur par l'opérateur.",
      "terms.h_liability": "Responsabilité",
      "terms.p_liability": "Dans la mesure maximale permise par la loi, l'opérateur n'est pas responsable des pertes indirectes ou consécutives résultant de l'utilisation des services. Rien dans ces conditions ne limite une responsabilité qui ne peut l'être par la loi.",
      "terms.h_law": "Droit applicable",
      "terms.p_law": "Ces conditions sont régies par le droit français, sans préjudice des protections impératives des consommateurs de votre pays de résidence."
    }
  };

  /* document <title> per page+lang, keyed by data-page on <body>. */
  var TITLES = {
    about: { en: "About — Leandro Sierra", fr: "À propos — Leandro Sierra" },
    contact: { en: "Contact — Leandro Sierra", fr: "Contact — Leandro Sierra" },
    privacy: { en: "Privacy Policy — Leandro Sierra", fr: "Politique de confidentialité — Leandro Sierra" },
    terms: { en: "Terms & Legal Notice — Leandro Sierra", fr: "Mentions légales & conditions — Leandro Sierra" }
  };

  function currentLang() {
    var l = localStorage.getItem("portfolio-lang");
    return l === "fr" ? "fr" : "en";
  }

  function apply(lang) {
    var dict = DICT[lang] || DICT.en;
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        el.innerHTML = dict[key];
      }
    });
    var page = document.body.getAttribute("data-page");
    if (page && TITLES[page] && TITLES[page][lang]) {
      document.title = TITLES[page][lang];
    }
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function init() {
    apply(currentLang());
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () {
        var lang = b.getAttribute("data-lang") === "fr" ? "fr" : "en";
        localStorage.setItem("portfolio-lang", lang);
        apply(lang);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
