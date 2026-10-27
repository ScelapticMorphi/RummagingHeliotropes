# 99's Tailoring & Alterations — website

Five static HTML pages. No build step, no framework, no database. Every file
here is the file that gets served.

```
index.html          Home              →  yoursite.com/
services/           Services & Pricing →  yoursite.com/services/
about/              About              →  yoursite.com/about/
contact/            Contact & Hours    →  yoursite.com/contact/
book/               Book an Appointment→  yoursite.com/book/
sitemap.xml         List of pages, for Google
robots.txt          Points crawlers at the sitemap
favicon.svg/.png    Browser tab icon
assets/
  styles.css        All styling — shared by every page
  site.js           Contact form, mobile menu, Calendly, optional live reviews
  fonts/            The three typefaces, served from this site
  logo-navy.svg     The mark, navy, ringed by a cream halo
  logo-cream.svg    The mark, cream, ringed by a navy halo
  img/              Photographs + the social share image
```

Each page is an `index.html` inside its own folder. That's what makes addresses
read `/contact/` rather than `/contact.html`, and it works the same on GitHub
Pages, Hostinger, or any other static host — no server configuration needed.

Everything shared lives in `assets/`, so a visitor downloads the stylesheet,
the script and the logo once and every page after that loads from cache.

---

## Deploying

### Option A — GitHub, with automatic deploys (recommended)

Set this up once and every future change goes live by pushing to GitHub.

1. **Create the repository.** On github.com, click **New repository**, name it
   something like `99standa-website`, leave it **Public** (simplest — Hostinger
   connects to public repos without SSH keys), and create it.

2. **Upload these files.** Easiest without touching a terminal: on the new repo
   page click **uploading an existing file**, then drag in *the contents of this
   folder* — `index.html`, the `services`, `about`, `contact` and `book`
   folders, `sitemap.xml`, `robots.txt`, the favicons, and the whole `assets`
   folder. Commit.

   > Important: upload the **contents**, not the folder itself. `index.html`
   > must sit at the top level of the repository, alongside the `assets`,
   > `services`, `about`, `contact` and `book` folders.
   >
   > **Replacing an earlier upload?** Delete the old `services.html`,
   > `about.html`, `contact.html` and `book.html` from the repository first,
   > or you'll have both versions live at once.

3. **Connect Hostinger.** In hPanel, open your website → **Advanced → Git** →
   **Connect with GitHub**. Authorise the Hostinger GitHub App and grant it
   access to this repository.

4. **Configure and deploy.** Pick the repository, set the branch to `main`, and
   leave the deploy directory as the root (`public_html`). Click **Deploy**.
   Progress streams live in the dashboard.

5. **Done.** Every push to `main` now deploys automatically. There's also a
   **Redeploy** button if you ever want to pull again by hand.

> Deploying **overwrites** whatever is already in `public_html`. If a site is
> live there now, download a copy from File Manager first.

### Option B — straight upload, no GitHub

In hPanel open **File Manager**, go into `public_html`, delete whatever is
already there, and upload the contents of this folder. Same rule: `index.html`
at the top level, `assets` as a folder beside it.

Faster to do once, but every future change is another manual upload with no
history and no way to undo. Option A is worth the extra fifteen minutes.

---

## After it's live — five minutes, worth doing

1. **Check the share card.** Paste `https://www.99standa.com/` into
   [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/).
   It should show the photo of the seam being trimmed. If it doesn't, confirm
   `assets/img/og-image.jpg` loads in a browser.

2. **Tell Google the site exists.** Add the site in
   [Google Search Console](https://search.google.com/search-console), verify
   ownership, then submit `https://www.99standa.com/sitemap.xml` under
   **Sitemaps**. This is what gets the five pages indexed separately — the
   pricing page is the one most likely to bring in searches.

3. **Link it from your Google Business Profile.** Point the website field at
   `https://www.99standa.com/`. The structured data on the home page tells
   Google the address, hours and prices match the listing.

4. **Test the contact form.** Send yourself a message from `/contact/` and
   confirm it arrives at contact@99standa.com. It goes through Web3Forms using
   the access key in `contact/index.html`.

---

## Changing things later

Everything you'd realistically want to edit is plain text.

**Prices** — `services/index.html`. Each line looks like this; change the
name or the number and nothing else:

```html
<li class="flex justify-between items-end">
  <span ...>Shorten Sleeve</span>
  <div ...></div>
  <span ...>$50</span>
</li>
```

**Hours or address** — they appear in three places: the footer of every page,
the Contact page, and the structured data block near the top of `index.html`.
Update all three so Google doesn't see a contradiction.

**Reviews and rating** — in `index.html`, not the script. Search for
`review-card` and you'll find the ten of them written out as plain HTML; copy
one, change the name and text, and it appears. The `4.9` and `300+` are a few
lines above, in the block with the Google logo. Keep those matching what your
listing actually shows — the button beside them takes visitors straight there.

Three show on the page. **Show more** opens the rest in an overlay that blurs
the page behind it. Any card marked `data-extra` is one of the ones held back;
delete that word and it shows on the page as well. Order matters — the first
three cards in the file are the three visitors see first. All ten stay in the
HTML either way, so Google reads them all.

**The business name** — it appears in the header and footer of every page, and
it is not plain text:

```html
<span class="brand-name ..."><span class="num">99</span>&rsquo;s Tailoring &amp; Alterations</span>
```

The `<span class="num">` around the two numerals is what makes them Cormorant
Garamond instead of EB Garamond, sized to sit level with the letters. `&rsquo;`
is the curly apostrophe. If you retype the name by hand, keep both.

**Booking link** — `book/index.html`, the `data-url` on the Calendly widget.

**The logo, used off this site** — hand out `assets/logo-navy.svg` or
`assets/logo-cream.svg` rather than a plain copy of the mark. Each one carries a
soft halo in the opposite colour, baked into the file itself, so the shape still
reads when it lands somewhere you don't control the background — a Calendly
brand upload, a Google listing, someone's slide deck. On our own pages the halo
is invisible, because there it sits on a background of its own colour; that is
the point of it. Pick the navy file for light backgrounds, the cream file for
dark ones, and either will survive the other.

`favicon.svg` does the same thing and switches with the browser theme: navy on a
light tab bar, cream on a dark one, haloed in whichever colour it is not.

**Photographs** — drop replacements into `assets/img/` using the same
filenames. Keep them under about 300 KB each so pages stay quick.

---

## Notes

- The site needs no server-side anything. It will run on any static host.
- Typefaces are served from `assets/fonts/`, not from Google. One less
  third-party dependency, one less round trip, and the type can't silently
  fall back to something else.
- Two outside services are used: Calendly (booking) and Web3Forms (contact
  form). Both fail gracefully — if Calendly is blocked the page offers a phone
  number instead.
- Each page carries only the icons it actually draws, and `styles.css` is
  compiled from these five files, so there is no unused CSS shipped.
- Nothing here tracks visitors. There are no cookies and no analytics. If you
  ever want visitor numbers, that's a separate decision.
