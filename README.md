# Harbor & Pine Roofing Co. – demo site

Static roofing website (HTML, CSS, vanilla JS). No build step.

- Local preview: `npx http-server . -p 5180`
- Deploy: import this repo in Vercel, Framework Preset **Other**, no build command, output directory `.`

Placeholder content (company name, phone, address, reviews) must be replaced before real use.

## Before going live (SEO checklist)

- Replace the placeholder domain `https://www.example.com` in `index.html` (canonical, Open Graph, JSON-LD), `sitemap.xml` and `robots.txt`.
- Replace the placeholder business details in the `RoofingContractor` JSON-LD block: phone, email, address, opening hours, service area.
- Replace sample content (ratings, testimonials, years, licence number) with real facts. Do not add review or rating markup until real reviews exist.
- Replace the Unsplash photos with your own job photos where possible (also set a real 1200x630 social image for `og:image`).
- Connect the contact and quote forms to your email or CRM (see the TODO notes in `script.js`).
- After deploying, submit `sitemap.xml` in Google Search Console and test the page in PageSpeed Insights.
