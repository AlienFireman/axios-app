"use strict";const{spawn}=require("child_process"),{getClaudeBin}=require("./claude-bin.js");function generateTitle(r,o){const l=o?`Chat title: "${o}"
New message: "${r.slice(0,400)}"

If this message is about a new or different task, reply with a new 1-3 word title. If it continues the same task, reply with the current title unchanged. Reply with ONLY the title, no explanation.`:`Message: "${r.slice(0,400)}"

Give a 1-3 word title for this chat. Reply with ONLY the title. Examples: "Fix login bug", "Dark mode", "Refactor auth"`;return new Promise(e=>{let i="";const t=spawn(getClaudeBin(),["--model","claude-haiku-4-5-20251001","--output-format","json","--dangerously-skip-permissions","--print",l],{env:process.env,stdio:["ignore","pipe","pipe"]}),s=setTimeout(()=>{t.kill(),e(null)},2e4);t.stdout.on("data",n=>{i+=n.toString()}),t.on("close",()=>{clearTimeout(s);try{const n=JSON.parse(i.trim());e((n.result||"").trim().replace(/^["']|["']$/g,"").trim().slice(0,60)||null)}catch{e(i.trim().replace(/^["']|["']$/g,"").trim().slice(0,60)||null)}}),t.on("error",()=>{clearTimeout(s),e(null)})})}module.exports={generateTitle};
