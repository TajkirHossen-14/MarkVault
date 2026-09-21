# MarkVault: ডাউনলোডের পর আপনার করণীয়

## ১. কী তৈরি হয়েছে

এটি HTML, CSS ও vanilla JavaScript দিয়ে তৈরি local-first bookmark manager। Backend, account, API key বা remote database লাগে না। Dark graphite এবং light cool-ivory theme, mobile menu/bottom tabs, folders, tags, search, bookmarks, favorites, Trash, import/export, sharing ও insights আছে।

আপনার GitHub repository: https://github.com/TajkirHossen-14/MarkVault

Repository URL ওয়েবসাইটে যুক্ত হয়েছে। এই editor-এর পরিবর্তনগুলো ওই external repository-তে সরাসরি push করা হয়েছে—এমন দাবি করা হচ্ছে না। নিচের নিয়মে আপনি source নিয়ে repository-তে merge করবেন।

## ২. সম্পূর্ণ source ডাউনলোড

1. ওয়েবসাইটের Documentation → **Download source**, অথবা `dev/download.html` খুলুন।
2. **Download complete source ZIP** চাপুন। এটি browser-এই ZIP তৈরি করে; কোনো upload/server processing নেই।
3. `MarkVault-source.zip` extract করুন। ভিতরের `MarkVault` folder-টি VS Code/Cursor/আপনার IDE-তে খুলুন।
4. প্রথমে `README.md` ও তার **Testing and Verification** section পড়ুন। IDE AI-কে `IDE-AI-HANDOFF.md` দিন।

**Source ZIP-এ আপনার saved bookmarks নেই।** Bookmarks নেওয়ার জন্য app → Settings → Import & export → JSON ব্যবহার করুন। এই JSON backup আলাদা করে রাখুন।

## ৩. নিজের কম্পিউটারে চালানো

### Node.js দিয়ে (recommended)

Node.js 20 বা তার পরের LTS version ইনস্টল করুন। IDE terminal-এ project root থেকে:

```sh
npm install
npm run dev
```

তারপর খুলুন: `http://127.0.0.1:5173`। App: `http://127.0.0.1:5173/index.html#/app`। Stop করতে terminal-এ Ctrl+C।

`npm install` শুধু development tool esbuild ইনস্টল করে। ওয়েবসাইটের runtime-এ কোনো framework/CDN dependency নেই।

### VS Code Live Server দিয়ে

Live Server extension থাকলে project folder খুলে `index.html`-এ **Open with Live Server** দিতে পারেন। Browser-এ HTTP URL ব্যবহার করুন।

**HTML-এ double-click করে `file://` URL থেকে চালাবেন না।** ES modules, workers, fetch, IndexedDB/security policies এবং service worker সেভাবে নির্ভরযোগ্য কাজ করে না।

### গুরুত্বপূর্ণ origin নিয়ম

`localhost`, `127.0.0.1`, আলাদা port, GitHub Pages এবং custom domain—প্রতিটি আলাদা browser origin। এক জায়গার bookmark অন্য জায়গায় নিজে থেকে আসবে না। পুরোনো origin থেকে JSON export করে নতুন origin-এ import করুন। Dev URL বারবার বদলাবেন না।

## একটিই production HTML file

এখন landing, library, settings, stats—সব `index.html` থেকে চলে। Library: `index.html#/app`, Settings: `index.html#/app/settings`, light Library: `index.html?theme=light#/app`। পুরোনো আলাদা app/light/menu/rail/footer HTML files সরানো হয়েছে; আগের direct link থাকলে নতুন URL ব্যবহার করুন। একই domain/port থাকলে IndexedDB bookmark data অপরিবর্তিত থাকবে। `dev/`-এর test ও download utilities আলাদা রাখা হয়েছে।

## ৪. App ব্যবহার

- **N / New bookmark**: URL, title, note, folder ও comma-separated tags দিয়ে save।
- **Search / /**: title, domain, URL, tags, notes থেকে খুঁজুন।
- **Star**: favorite। Reading state চাইলে edit/detail sheet-এর Mark as read।
- **Checkbox**: একাধিক bookmark select করে favorite/read/share/delete। Desktop-এ Shift-click range selection।
- **Folders**: sidebar + থেকে তৈরি; তিন level পর্যন্ত nesting। Folder delete করলে links All-এ থাকে।
- **Trash**: restore করা যায়; ৩০ দিন পরে app খুললে মেয়াদোত্তীর্ণ records purge হয়। Permanent delete ফেরানো যায় না।
- **Import**: Chrome/Firefox/Safari/Edge HTML, MarkVault JSON, CSV। Preview দেখুন; Confirm না করা পর্যন্ত bookmarks import হয় না। Duplicate URL skip হয়, overwrite হয় না।
- **Share**: URL-এর hash-এ compressed bookmark data থাকে। এটি encryption নয়। Confidential link শেয়ার করবেন না।
- Mobile-এ bottom tabs দিয়ে Library/Search/Add/Insights/Settings; hamburger-এ views, folders, imports ও theme।
- Theme icon বর্তমান theme দেখায়: dark → moon, light → sun। Phone-এ theme control শুধু hamburger/menu-এর ভেতরে থাকবে; top nav-এ নয়।

## ৫. Backup ও privacy

প্রতি সপ্তাহে অথবা বড় import-এর পর JSON export রাখুন। Browser data clear, profile delete, private window বন্ধ বা domain change করলে data হারাতে/অদৃশ্য হতে পারে। Persistent storage একটি সাহায্য, backup-এর বিকল্প নয়। কোনো recovery account নেই।

Favicons ও link previews default-এ off। On করলে যথাক্রমে domain/URL external provider-এর কাছে যাবে। Manual link check saved sites-এ request পাঠায়; HTTP 404/500 নিশ্চিতভাবে জানতে পারে না। তাই status **unreachable**, নিশ্চিত broken নয়।

## ৬. Test চালানো

Dev server চলা অবস্থায় `http://127.0.0.1:5173/dev/harness.html` খুলুন। Tests temporary `mvtest-*` IndexedDB ব্যবহার করে। আপনার personal `markvault` database clear করে না। ফলাফল page ও console-এ দেখা যাবে।

নিজে minimum check করুন:

1. দুই theme-এ desktop ও phone size।
2. Bookmark add/edit → page reload → data আছে কি না।
3. JSON export → অন্য browser profile-এ import।
4. Mobile menu/dialog খুলে close ও Escape/focus behavior।
5. দুই tab খুলে একটিতে save → অন্যটিতে update।
6. Online-এ site একবার load করে DevTools Application-এ service worker **activated** ও Cache Storage দেখুন। তারপর Network → Offline করে reload। Online-এ ফিরিয়ে আনুন।

`README.md`-এর **Testing and Verification** section-এ সত্যিকারের run ও এখনও manual verification প্রয়োজন এমন বিষয় আলাদা দেওয়া আছে। Browser সবসময় bug-free—এমন নিশ্চয়তা কোনো automated test দিতে পারে না।

## ৭. আপনার GitHub repository-তে নেওয়া

আগের repository থাকলে আগে backup/commit রাখুন। Force-push করবেন না।

```sh
git clone https://github.com/TajkirHossen-14/MarkVault.git
cd MarkVault
git checkout -b release/local-first-polish
```

Extract করা source files ওই clone-এর মধ্যে copy/merge করুন। **Clone-এর `.git` folder মুছবেন/replace করবেন না।** `node_modules/` ও `dist/` যেন `.gitignore`-এ থাকে। তারপর:

```sh
npm install
npm run dev
# browser harness এবং manual smoke checks চালান

git status
git add .
git commit -m "Build local-first MarkVault and responsive polish"
git push -u origin release/local-first-polish
```

GitHub-এ Pull Request খুলে diff review করে main branch-এ merge করুন। GitHub login/token IDE/GitHub-এর নিজস্ব secure flow দিয়ে দিন; API key source code-এ লিখবেন না।

## ৮. Publish

### GitHub Pages — build ছাড়া

Repository → Settings → Pages → Deploy from a branch → `main` + `/ (root)` → Save। Pages enabled হলে expected URL: `https://tajkirhossen-14.github.io/MarkVault/`। এই URL এখন live কিনা এখানে verify করা হয়নি। Assets relative হওয়ায় repository subpath কাজ করার জন্য বানানো হয়েছে।

### Netlify

Unbundled project folder upload করুন অথবা GitHub repository connect করুন। Build command ফাঁকা এবং publish directory `.` দিতে পারেন। Optional minified build চাইলে `npm run build`, publish directory `dist`। Hash router হওয়ায় SPA rewrite সাধারণত লাগবে না।

### এই editor থেকে

Publish tab ব্যবহার করুন। Deployment না হওয়া পর্যন্ত live URL-এ editor-এর পরিবর্তন পৌঁছায় না।


## ৯. পরের কাজের priority

প্রথমে latest Chrome/Firefox/Safari ও বাস্তব Android/iPhone-এ manual QA; তারপর checkJs diagnostics পরিষ্কার করা, accessibility/Lighthouse audit, 5,000+ items performance profiling এবং deployment verification। তারপর advanced folder drag-and-drop, improved heatmap tooltips ও প্রয়োজনমতো অতিরিক্ত UI primitives। Cloud sync চাইলে সেটি আলাদা architecture decision—বর্তমান privacy promise না ভেঙে পরিকল্পনা করতে হবে।
