"use strict";const fs=require("fs"),os=require("os"),path=require("path"),INSTALL_ROOT=__dirname,CLAUDE_AXIOS_MD=path.join(INSTALL_ROOT,"CLAUDE.AXIOS.md"),PROJECTS_JSON=path.join(INSTALL_ROOT,"projects.json");function resolveProjectPath(n){if(!n)return null;const t=n.match(/\/\.worktrees\/([^/]+)\//);return t?path.join(process.env.HOME||os.homedir(),t[1]):n}function findSkillFile(n,t,e){if(e>7)return null;try{for(const r of fs.readdirSync(n,{withFileTypes:!0})){if(!r.isDirectory())continue;if(r.name===t){const s=path.join(n,r.name,"SKILL.md");if(fs.existsSync(s))return s}const o=findSkillFile(path.join(n,r.name),t,e+1);if(o)return o}}catch{}return null}function resolveSkillContent(n){const t=path.join(process.env.HOME||os.homedir(),".claude","plugins"),e=findSkillFile(t,n,0);if(!e)return null;try{return fs.readFileSync(e,"utf8")}catch{return null}}function buildAxiosSystemPrompt(n){try{const t=fs.readFileSync(CLAUDE_AXIOS_MD,"utf8"),e=resolveProjectPath(n)||n||process.cwd(),r=n||e,o=path.basename(e);let s=t.replace(/__AXIOS_PROJECT_PATH__/g,r).replace(/__AXIOS_MAIN_PATH__/g,e).replace(/__AXIOS_PROJECT_NAME__/g,o);try{const i=JSON.parse(fs.readFileSync(path.join(e,".axios.json"),"utf8"));if(Array.isArray(i.skills)&&i.skills.length>0){const c=i.skills.map(l=>resolveSkillContent(l)).filter(Boolean);c.length>0&&(s+=`

# Active Project Skills

The following skills are active for this project:

`+c.join(`

---

`))}}catch{}return s}catch{return null}}function resolveManagedBase(n){if(!n)return null;const t=path.resolve(n),e=t.match(/^(.*\/\.worktrees\/[^/]+\/[^/]+)(?:\/|$)/);if(e){const o=resolveProjectPath(t)||t;return isInProjects(o)?e[1]:null}let r=null;for(const o of projectRoots())(t===o||t.startsWith(o+path.sep))&&(!r||o.length>r.length)&&(r=o);return r}function projectRoots(){try{const n=JSON.parse(fs.readFileSync(PROJECTS_JSON,"utf8"));return Array.isArray(n)?n.filter(t=>t&&t.path).map(t=>path.resolve(t.path)):[]}catch{return[]}}function isInProjects(n){const t=path.resolve(n);return projectRoots().some(e=>t===e||t.startsWith(e+path.sep))}module.exports={buildAxiosSystemPrompt,resolveProjectPath,resolveManagedBase};
