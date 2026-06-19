"use strict";const{spawn}=require("child_process"),{getClaudeBin}=require("./claude-bin.js");function generateTitle(r,s){const l=s?`Chat title: "${s}"
New message: "${r.slice(0,400)}"

If this message is about a new or different task, reply with a new 1-3 word title. If it continues the same task, reply with the current title unchanged. Reply with ONLY the title, no explanation.`:`Message: "${r.slice(0,400)}"

Give a 1-3 word title for this chat. Reply with ONLY the title. Examples: "Fix login bug", "Dark mode", "Refactor auth"`;return new Promise(t=>{let i="";const e=spawn(getClaudeBin(),["--output-format","json","--dangerously-skip-permissions","--print",l],{env:process.env,stdio:["ignore","pipe","pipe"]}),o=setTimeout(()=>{e.kill(),t(null)},2e4);e.stdout.on("data",n=>{i+=n.toString()}),e.on("close",()=>{clearTimeout(o);try{const n=JSON.parse(i.trim());t((n.result||"").trim().replace(/^["']|["']$/g,"").trim().slice(0,60)||null)}catch{t(i.trim().replace(/^["']|["']$/g,"").trim().slice(0,60)||null)}}),e.on("error",()=>{clearTimeout(o),t(null)})})}module.exports={generateTitle};
