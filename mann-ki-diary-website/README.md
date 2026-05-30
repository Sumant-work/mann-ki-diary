# Mann Ki Diary

A soft personal memories website with an admin panel for stories, photos, thoughts and letters.

## What is inside

- `index.html` - public website
- `style.css` - design and responsive layout
- `script.js` - loads content from JSON and renders the site
- `content/site.json` - all editable website content
- `admin/` - Decap CMS admin panel
- `assets/photos/` - uploaded gallery photos
- `netlify.toml` - Netlify publish settings

## Best free posting flow

Use **Netlify free hosting + Decap CMS + GitHub**.

After setup, open:

```text
https://your-site-name.netlify.app/admin/
```

From there you can add, edit and delete:

- memories and story posts
- photo gallery items with captions
- small thoughts
- letters and lines
- hero, about and footer text

When you publish from the admin panel, Decap CMS saves the update into your GitHub repository. Netlify then rebuilds and updates the live website automatically.

## Netlify setup

1. Create a GitHub repository, for example `mann-ki-diary`.
2. Upload the **contents** of this folder to the repository.
3. In Netlify, create a new site from that GitHub repository.
4. Keep the build command empty.
5. Set publish directory to:

```text
.
```

6. Enable Netlify Identity for the site.
7. Set registration to invite-only.
8. Enable Git Gateway.
9. Invite your own email as the admin user.
10. Open `/admin/`, log in, and start posting.

## Photo tips

- Upload JPG or WebP when possible.
- Keep each image around 300-500 KB for a fast website.
- Avoid private or sensitive photos because the website is public.

## Local preview

Because the site reads `content/site.json`, preview it through a small local server instead of directly opening `index.html`.

From this folder, run:

```text
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

## Useful docs

- Decap CMS: https://decapcms.org/docs/intro/
- File collections: https://decapcms.org/docs/collection-file/
- Netlify Git Gateway: https://docs.netlify.com/security/secure-access-to-sites/git-gateway/
- Netlify Identity pricing: https://docs.netlify.com/manage/security/secure-access-to-sites/identity/plans-and-pricing/
