"use strict";const fs=require("fs"),path=require("path"),DATA_DIR=process.env.AXIOS_DATA_DIR||path.join(process.cwd(),"data"),METRICS_FILE=path.join(DATA_DIR,"metrics.jsonl");function ensureDir(){fs.mkdirSync(DATA_DIR,{recursive:!0})}function append(e){ensureDir(),fs.appendFileSync(METRICS_FILE,JSON.stringify(e)+`
`,"utf8")}function readSince(e){try{const r=fs.readFileSync(METRICS_FILE,"utf8").split(`
`).filter(t=>t.trim()).map(t=>{try{return JSON.parse(t)}catch{return null}}).filter(Boolean);return e?r.filter(t=>t.ts>=e):r}catch{return[]}}function readRecent(e){try{return fs.readFileSync(METRICS_FILE,"utf8").split(`
`).filter(r=>r.trim()).slice(-e).map(r=>{try{return JSON.parse(r)}catch{return null}}).filter(Boolean).reverse()}catch{return[]}}module.exports={append,readSince,readRecent};
