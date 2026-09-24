# Care SEO implementation — 2026-09-23

## Source and deployment context

The repository default branch is `claude/recreate-care-esthetics-site-HGw9c`, starting at `dfc2ba167aa65f27ce5c469ab5b7a1b8fafa97b5`. The public site had substantial changes absent from that branch, including its current typography, page layouts, actual photo gallery, mobile menu positioning, social metadata, and Netlify contact form.

This change reconciles the six public pages, stylesheet, JavaScript, success page, icons, and referenced images with the live site observed on September 23, then applies the SEO work. In particular, it retains the live gallery rather than restoring the older repository's before/after pairings. The repository is not proof of which branch Netlify currently deploys; that setting still needs to be verified in the existing Netlify project.

## Implemented

- One HTTPS, non-www canonical address for each page, with matching social URLs and a 12-page sitemap.
- Forced redirects from `.html` aliases, `/index.html`, and the observed legacy `/pages/services` URL. Removed the broad `/services/*` rewrite that would hide new treatment URLs. Other missing URLs receive a real 404 with useful navigation.
- Six individual Newark treatment pages: Botox/Dysport, dermal/lip fillers, Sculptra, PRF microneedling, facials, and chemical peels. Pages include distinct copy, questions, consultation links, location details, provider links, and related services.
- Contextual links from the homepage, Services hub, shared navigation, and related treatments. Existing service fragment IDs remain intact for old inbound links.
- MedicalBusiness identity, WebSite/WebPage, breadcrumbs, Service, and factual provider Person structured data. No review ratings, medical credentials, clinical-review attribution, or exact map coordinates were invented.
- The unverified conflicting coordinates were omitted from schema; the contact map is preserved pending office pin verification.
- Current branding, office details, provider biographies, and live photos retained. Some broad “all-natural/chemical-free” and guaranteed-result wording narrowed where it overlapped new treatment information.
- 46 images converted to 124 proportional WebP variants, without retouching or cropping. Largest variants total 3,786,184 bytes versus 15,318,088 original bytes (75.3% smaller). The lead provider portrait falls from 3,913,361 to 131,804 bytes; the homepage hero from 465,730 to 113,780 bytes. These are file comparisons, not measured page-load or Core Web Vitals improvements.
- Responsive image selection, intrinsic dimensions, eager/high-priority hero loading, and lazy loading below the fold.
- Dependency-free static build to `dist`, fingerprinted CSS/JS and images, long caching only for fingerprinted assets, and revalidation for other resources. Source code, scripts, and documentation are excluded from deployment.
- Native Netlify form declaration restored in source. Preserves the live `contact` form name, field names, POST action, and honeypot; removes the obsolete simulated-success handler. Native browser validation remains enabled.
- Keyboard-accessible service menu toggle, Escape dismissal, mobile-menu closure for all links, accurate active navigation, gallery filter state, skip links, and reduced-motion support.
- Optional dataLayer hooks for phone clicks, booking clicks, and contact-submit attempts. Hooks do nothing unless a dataLayer already exists. They never include entered form values, service selections, page URLs, or referrers. No tracking provider or analytics ID has been added.
- Preview/branch deploy builds include `noindex, nofollow`. Production content remains indexable except the success and missing-page utilities.

## Verify locally

```sh
npm run build
npm test
npm run preview
```

Local preview is at `http://127.0.0.1:4173`. It serves the static pages and local path rules; it is not a Netlify backend and deliberately returns 405 for POST. It does not prove Netlify Forms delivery or cloud CDN behavior.

Automated validation checks 14 HTML pages, the 12 sitemap URLs, and 716 local references, including fragment targets, distinct title/description fields, canonical/social agreement, JSON-LD parsing, responsive image files/dimensions, the priority hero, actual form markup, and required redirects.

## Remaining operational work

1. In the existing Netlify project, confirm that this repository and the intended production branch are linked. Build command: `node scripts/build.mjs`; publish directory: `dist`; base directory: repository root. Generate a Deploy Preview from the pull request when available.
2. Verify the preview on desktop and mobile, including service navigation, all six treatment pages, gallery filters, and contact-field validation. Local browser execution in this workspace was blocked by the environment, so visual/interactive browser verification has not been claimed complete.
3. Check deployed redirect status codes, canonical destinations, unknown-page 404 behavior, and preview noindex. Confirm the production host is `careestheticsdelaware.com`. Query parameters should remain intact through legacy redirects.
4. Enable/verify Netlify Forms detection and notifications in the project. Submit a clearly labeled staff test after deployment and confirm both stored submission and notification delivery. Do not treat visiting `/thank-you` as proof that a lead was received.
5. Complete a real booking-flow check on Aesthetic Record. A booking click is not a confirmed appointment; confirmed-booking measurement needs the platform's supported integration.
6. Connect the approved analytics configuration and consent controls. Map `care_phone_click`, `care_booking_click`, and `care_contact_submit_attempt` separately; the last is only an attempt. Confirm event delivery before reporting measurement as installed. No patient information should be included in these events.
7. Have the clinical team review the six new treatment pages, particularly product indications, combination-treatment limitations, contraindications, and practice-specific protocols. No clinical-review badge has been added. Confirm current device/product availability before expanding laser or wellness landing pages.
8. Confirm the map pin, current pricing, membership/financing terms, testimonial provenance, and permission for existing patient photos. Existing testimonials and payment offers were not independently substantiated by this code change.
9. Supply the practice's approved privacy policy and link it from the site. A policy has not been invented without knowing the actual data handling arrangements.
10. Correct external business listings, including Birdeye's old Churchmans Road address; verify the Google Business Profile. These accounts are outside this repository.
11. Submit the production sitemap through Search Console and review indexing, legacy-URL reports, organic performance, and location-based ranking data. Redirect additional legacy URLs only when a relevant replacement is known.

## References used

- Netlify configuration: https://docs.netlify.com/build/configure-builds/file-based-configuration/
- Netlify redirects: https://docs.netlify.com/manage/routing/redirects/redirect-options/
- Netlify forms: https://docs.netlify.com/manage/forms/setup/
- Botox Cosmetic patient information: https://www.botoxcosmetic.com/how-it-works/frequently-asked-questions
- Dysport patient information: https://www.dysportusa.com/faqs
- Sculptra patient information: https://www.sculptrausa.com/faqs
- FDA dermal fillers: https://www.fda.gov/consumers/consumer-updates/dermal-filler-dos-and-donts-wrinkles-lips-and-more
- FDA microneedling: https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/microneedling-devices
