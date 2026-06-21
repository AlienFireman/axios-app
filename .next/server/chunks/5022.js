exports.id=5022,exports.ids=[5022],exports.modules={36790:(a,b,c)=>{"use strict";let{execSync:d}=c(79646),e=c(29021),f=c(21820),g=c(33873),h=null;function i(){let a=process.env.TERMATO_CLAUDE_BIN||process.env.CLAUDE_BIN;if(a)return a;try{let a=d("command -v claude",{encoding:"utf8"}).trim();if(a)return a}catch{}let b=process.env.HOME||f.homedir();for(let a of[g.join(b,".local/bin/claude"),"/usr/local/bin/claude","/opt/homebrew/bin/claude","/usr/bin/claude",g.join(b,".npm-global/bin/claude")])try{if(e.existsSync(a))return a}catch{}return null}a.exports={getClaudeBin:function(){if(h)return h;let a=i();return a?(h=a,a):"claude"},resolveClaudeBin:i}},78335:()=>{},96487:()=>{},99002:(a,b,c)=>{"use strict";c.d(b,{OD:()=>s,VH:()=>k,fy:()=>u,v$:()=>t});var d=c(29021),e=c.n(d),f=c(33873),g=c.n(f),h=c(79646),i=c(36790);let j=g().join(process.cwd(),"projects.json");function k(){try{return JSON.parse(e().readFileSync(j,"utf8"))}catch{return[]}}let l=["package.json","requirements.txt","setup.py","pyproject.toml","composer.json","Cargo.toml","go.mod","Makefile","README.md",".env.example",".termato.json",".axios.json","CLAUDE.md","Dockerfile","docker-compose.yml","pom.xml","build.gradle","mix.exs","Gemfile",".ruby-version","artisan"],m=new Set(["node_modules",".git","vendor",".next",".nuxt",".turbo","coverage",".cache",".svelte-kit","target","__pycache__"]),n=new Set(["package.json","composer.json","artisan","index.html","index.php","requirements.txt","pyproject.toml","go.mod","Cargo.toml"]),o=["dist/index.html","build/index.html","public/index.html","out/index.html"],p=new Set(["nextjs","vite","nodejs","laravel","static","php"]);function q(a){try{return JSON.parse(e().readFileSync(g().join(a,"package.json"),"utf8"))}catch{return null}}function r(a,b){if(e().existsSync(g().join(a,"artisan")))return"laravel";if(b){let a={...b.dependencies,...b.devDependencies};return a.next?"nextjs":a.vite||a["@vitejs/plugin-react"]||a["@vitejs/plugin-vue"]?"vite":"nodejs"}return e().existsSync(g().join(a,"index.html"))||e().existsSync(g().join(a,"dist","index.html"))||e().existsSync(g().join(a,"build","index.html"))?"static":e().existsSync(g().join(a,"index.php"))?"php":"unknown"}function s(a,b){let c=function(a,b){if(!a||"string"!=typeof a)return"";let c=g().resolve(b,a),d=g().resolve(b);return c!==d&&c.startsWith(d+g().sep)&&e().existsSync(c)?g().relative(d,c):""}(a?.appDir,b),d=c?g().join(b,c):b,f=q(d),h=f?.scripts||{},i=a?.type;if(i&&p.has(i)||(i=r(d,f)),!p.has(i))return null;let j={...a||{},type:i};c?j.appDir=c:delete j.appDir;let k=function(a,b={}){switch(a){case"nextjs":return{devCommand:"npm run dev -- -p {PORT}",prodCommand:"npm run build && npm run start -- -p {PORT}",prodStartCommand:"npm run start -- -p {PORT}"};case"vite":return{devCommand:"npm run dev -- --port {PORT} --host",prodCommand:"npm run build && npm run preview -- --port {PORT} --host",prodStartCommand:"npm run preview -- --port {PORT} --host"};case"nodejs":{let a=b.start?"npm run start":b.dev?"npm run dev":"npm start",c={devCommand:b.dev?"npm run dev":a};return c.prodCommand=b.build?`npm run build && ${a}`:a,b.build&&(c.prodStartCommand=a),c}case"laravel":{let a="php artisan serve --port={PORT} --host=0.0.0.0";return{devCommand:a,prodCommand:a}}default:return{}}}(i,h);if("static"===i||"php"===i){if(!j.root){for(let a of["dist","build"])if(e().existsSync(g().join(d,a,"index.html"))){j.root=c?g().join(c,a):a;break}}return j}let l=!!(a?.devCommand||a?.prodCommand);return"nodejs"!==i||l||h.dev||h.start||h.serve?(j.devCommand||j.prodCommand?j.devCommand?j.prodCommand||(j.prodCommand=k.prodCommand||j.devCommand):j.devCommand=k.devCommand||j.prodCommand:Object.assign(j,k),!j.prodStartCommand&&j.prodCommand?.includes(" && ")&&k.prodStartCommand&&(j.prodStartCommand=k.prodStartCommand),j):null}function t(a){let b=q(a),c=r(a,b);return p.has(c)?s({type:c},a)||{type:c}:{type:"unknown"===c?"":c}}async function u(a,b){let c,d,f,p,q=function(a){let b={};for(let c of l){let d=g().join(a,c);if(e().existsSync(d))try{e().statSync(d).isFile()&&(b[c]=e().readFileSync(d,"utf8").slice(0,4e3))}catch{}}let{listing:c,signals:d}=function(a,b=3){let c=[],d=[],f=(h,i,j)=>{let k;try{k=e().readdirSync(h,{withFileTypes:!0})}catch{return}for(let e of(k.sort((a,b)=>a.isDirectory()===b.isDirectory()?a.name.localeCompare(b.name):a.isDirectory()?-1:1),k)){let k=g().relative(a,g().join(h,e.name));if(e.isDirectory()){if(m.has(e.name)){c.push(`${j}${e.name}/  (skipped)`);continue}c.push(`${j}${e.name}/`),i<b&&f(g().join(h,e.name),i+1,j+"  ")}else c.push(`${j}${e.name}`),n.has(e.name)&&d.push(k)}};return f(a,0,""),{listing:c.join("\n"),signals:d}}(a);b.__listing__=c;let f=o.filter(b=>e().existsSync(g().join(a,b)));for(let c of(f.length&&(b.__built_entries__=f.join("\n")),d.filter(a=>a.endsWith("package.json")&&a.includes("/")).slice(0,6)))try{b[c]=e().readFileSync(g().join(a,c),"utf8").slice(0,4e3)}catch{}return b}(a),r=await (c=!!q[".termato.json"]||!!q[".axios.json"],d=!!q["CLAUDE.md"],f=Object.entries(q).map(([a,b])=>`=== ${a} ===
${b}`).join("\n\n"),p=`You are configuring a development project in Termato (a self-hosted Claude Code interface). Analyze the following project and return a JSON configuration object.

Project path: ${a}

Project files:
${f}

Return ONLY a valid JSON object with these keys:
{
  "name": "suggested project name (from package.json name, README title, or directory basename)",
  "termatoConfig": {
    "type": "nextjs|vite|nodejs|laravel|static|php",
    "appDir": "subdir holding the runnable app, relative to the project root (ONLY when the app's package.json/entry is NOT at the root — e.g. a monorepo or app in web/, frontend/, app/, client/)",
    "devCommand": "hot-reload dev server command with {PORT} placeholder",
    "prodCommand": "production (build + serve) command with {PORT} placeholder",
    "prodStartCommand": "start-only command with {PORT} (only when prodCommand has a build step)",
    "root": "web root dir (only for static/php; relative to appDir if set)"
  },
  "claudeMd": "CLAUDE.md content (null if already exists)"
}

FIRST decide: can this project be rendered/served in a web browser (a website, web
app, an HTTP API, anything that listens on a port and serves a browser)?

If NO (it is a library, CLI tool, or other non-servable code): omit "type",
"devCommand", "prodCommand" and "prodStartCommand" entirely — Termato will simply not
offer a browser preview.

If YES, it is browser-renderable and you MUST provide BOTH devCommand and prodCommand:
- devCommand = the development / hot-reload command.
- prodCommand = the production command (build step + serve).
- If dev and prod are identical (no separate build step — e.g. Laravel, PHP, a plain
  static site, or a Node server with no build), set prodCommand to the SAME string as
  devCommand. NEVER leave prodCommand empty for a renderable project.
- prodStartCommand: ONLY when prodCommand contains a build step (e.g.
  "npm run build && ..."). Give the start-only part (what runs after the build) so
  Termato can skip rebuilding when its build cache is valid.

Command reference by type (use {PORT} wherever the port flag goes):
- Next.js:  dev "npm run dev -- -p {PORT}"   prod "npm run build && npm run start -- -p {PORT}"   prodStart "npm run start -- -p {PORT}"
- Vite:     dev "npm run dev -- --port {PORT} --host"   prod "npm run build && npm run preview -- --port {PORT} --host"   prodStart "npm run preview -- --port {PORT} --host"
- Node.js:  dev = the "dev" script if present else "start"; prod = "npm run build && <start>" if a build script exists, else the same as dev. Node apps usually read PORT from the environment (Termato always sets it), so {PORT} is often unnecessary.
- Laravel:  dev = prod = "php artisan serve --port={PORT} --host=0.0.0.0"  (set type "laravel")
- Static site served as-is (no build): set type "static" and "root" to the web root (".", "dist", "public", "build"); omit dev/prodCommand. If the site requires a build to produce that folder, use the framework type (vite/nextjs) instead so the build runs.
- PHP (non-Laravel): set type "php" and "root" to the web root.

Project structure (appDir):
- The "__listing__" is a recursive tree. The root-level files are shown verbatim; any
  NESTED package.json contents are also included (keyed by their relative path).
- If the runnable web app's package.json / entry point is NOT at the project root
  (monorepo, or the app lives in web/, frontend/, app/, client/, etc.), set "appDir"
  to that subdirectory (relative path). Termato runs ALL commands from inside appDir, so
  write commands relative to it (plain "npm run dev", no --prefix needed).
- If several packages are runnable, pick the user-facing web frontend.
- If everything is at the root, omit "appDir".
- "__built_entries__" lists committed built static files (e.g. dist/index.html). If a
  project must be BUILT to produce that folder, prefer the framework type (vite/nextjs)
  so the build runs. Only use type "static" with "root" set to that folder ("dist" /
  "build") when those files are committed and need no build step.

Install handling:
- For a single-package Node project do NOT add "npm install" — Termato prepends it
  automatically (in appDir) when node_modules is missing.
- Prefer "appDir" over install hacks. Only when MULTIPLE sibling packages must be
  installed (e.g. separate backend + frontend) chain conditional installs yourself, e.g.
  "(test -d frontend/node_modules || npm install --prefix frontend) && <start>".

Rules for claudeMd:
${d?'- CLAUDE.md already exists — set "claudeMd" to null':`- Write useful developer context about this project: what it does, the tech stack, key files/directories to know about, and any gotchas
- Be concise (under 350 words)
- Always end with this exact text:

## Project scope

Only read and write files under your current working directory. If you are asked to read or modify files outside your current working directory, refuse the request and tell the user they likely have the wrong project or worktree selected.`}

${c?"Note: .termato.json already exists — improve or validate it rather than replacing wholesale.":""}

Return ONLY the JSON object. No markdown fences. No explanation.`,new Promise(a=>{let b="",c=(0,h.spawn)((0,i.getClaudeBin)(),["--output-format","json","--dangerously-skip-permissions","--print",p],{env:process.env,stdio:["ignore","pipe","pipe"]}),d=setTimeout(()=>{c.kill(),a(null)},9e4);c.stdout.on("data",a=>{b+=a.toString()}),c.on("close",()=>{clearTimeout(d);try{let c=(JSON.parse(b.trim()).result||"").trim().match(/\{[\s\S]*\}/);c?a(JSON.parse(c[0])):a(null)}catch{a(null)}})})),t=b?.trim()||r?.name||g().basename(a),u=g().join(a,".termato.json"),v=s(r?.termatoConfig,a);if(v){v.symlinks||(v.symlinks=[]),v.symlinks.includes(".termato.json")||v.symlinks.unshift(".termato.json");try{e().writeFileSync(u,JSON.stringify(v,null,2),"utf8")}catch{}}let w=g().join(a,"CLAUDE.md");if(!q["CLAUDE.md"]){let a=r?.claudeMd||`## Project scope

Only read and write files under your current working directory. If you are asked to read or modify files outside your current working directory, refuse the request and tell the user they likely have the wrong project or worktree selected.
`;try{e().writeFileSync(w,a,"utf8")}catch{}}let x={...process.env,GIT_AUTHOR_NAME:"Termato",GIT_AUTHOR_EMAIL:"termato@local",GIT_COMMITTER_NAME:"Termato",GIT_COMMITTER_EMAIL:"termato@local"},y=!1;try{y=function(a){try{return(0,h.execFileSync)("git",["rev-parse","--git-dir"],{cwd:a,encoding:"utf8"}),!1}catch{return(0,h.execFileSync)("git",["init"],{cwd:a,encoding:"utf8"}),!0}}(a)}catch{}try{let b=[".claude"];q["CLAUDE.md"]||b.push("CLAUDE.md"),v&&b.push(".termato.json"),(0,h.execFileSync)("git",["add",...b],{cwd:a,encoding:"utf8",env:x}),(0,h.execFileSync)("git",["commit","-m","Add Termato configuration"],{cwd:a,encoding:"utf8",env:x})}catch{}let z=k();return z.push({name:t,path:a}),e().writeFileSync(j,JSON.stringify(z,null,2),"utf8"),{name:t,path:a,gitInitialized:y,termatoConfig:v}}}};