# Pushing MAISON·NOIR to GitHub — Step by Step

Quick walkthrough for getting this onto your GitHub. Run these in PowerShell from inside your project folder.

---

## 1. Create the repo on GitHub (no commit yet)

1. Go to https://github.com/new
2. Repository name: `maison-noir`  (or whatever you want — `editorial-storefront` also works well for portfolio)
3. Description: `An editorial fashion storefront — React, Vite, Tailwind, Framer Motion`
4. Public
5. **DO NOT** check "Add a README file", "Add .gitignore", or "Choose a license" — your project already has these
6. Click **Create repository**

GitHub will show you a page with setup commands. Ignore it — use the ones below instead.

---

## 2. Initialize git locally

Make sure you're in the project root (the folder with `package.json`):

```powershell
cd C:\Users\black\QuesTsite\questsite
```

Then:

```powershell
git init
git branch -M main
```

---

## 3. First commit

```powershell
git add .
git commit -m "Initial commit: editorial atelier storefront"
```

If git asks you to set your name/email first, run these one-time setup commands and try again:

```powershell
git config --global user.name "Eric Del Angel"
git config --global user.email "eric.dangel.dev@gmail.com"
```

---

## 4. Connect to your GitHub repo and push

Replace the URL below with the one GitHub showed you (it'll be `https://github.com/blackapple805/maison-noir.git` if you used that name):

```powershell
git remote add origin https://github.com/blackapple805/maison-noir.git
git push -u origin main
```

If git asks you to authenticate, it'll open a browser window — log in with GitHub. After that, future pushes are silent.

---

## 5. Add screenshots (recommended for portfolio impact)

Screenshots are what make a GitHub README stop a recruiter scrolling.

1. With `npm run dev` running, take 4–6 screenshots:
   - Home (dark mode hero)
   - Home (light mode hero — toggle the theme)
   - Collection grid
   - Product detail page
   - Lookbook spread
   - Checkout page
   - Confirmation page

2. Save them in your project as `screenshots/hero-dark.png`, etc.

3. In `README.md`, find the screenshots section and uncomment the lines:
   ```markdown
   ![Hero](./screenshots/hero-dark.png)
   ![Collection](./screenshots/collection.png)
   ```

4. Push the updates:
   ```powershell
   git add screenshots README.md
   git commit -m "Add screenshots"
   git push
   ```

---

## 6. Deploy it live (so you have a real URL to share)

**Vercel** — the easy way:

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Import your `maison-noir` repo
4. Click **Deploy** (Vercel auto-detects Vite, no config needed)
5. In about 60 seconds, you'll have a live URL like `maison-noir-blackapple805.vercel.app`

Every time you `git push`, Vercel auto-redeploys.

---

## 7. After-push checklist

- [ ] Add the live URL to the top of your README (under the title)
- [ ] Pin the repo on your GitHub profile (`github.com/blackapple805` → "Customize your pins")
- [ ] Add it to your resume as a portfolio project with the live URL
- [ ] Update your LinkedIn projects section

---

## Daily git workflow (for future edits)

After you've made changes locally:

```powershell
git add .
git commit -m "Describe what you changed"
git push
```

If you ever pull on a different machine:

```powershell
git pull
```

---

## Common issues

**"fatal: not a git repository"** — You're not in the project folder. `cd` into it.

**"src refspec main does not match any"** — You haven't committed yet. Run `git commit` first.

**"Updates were rejected"** — Someone (or you on another machine) pushed something you don't have locally. Run `git pull --rebase` first, then push.

**`node_modules` got committed by accident** — It's already in `.gitignore` so this shouldn't happen, but if it does: `git rm -r --cached node_modules` then commit and push.
