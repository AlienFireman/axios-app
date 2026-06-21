#!/usr/bin/env node
"use strict";const{buildTermatoSystemPrompt,resolveManagedBase}=require("../termato-system-prompt.cjs");try{const s=resolveManagedBase(process.cwd());s||process.exit(0);const e=buildTermatoSystemPrompt(s);e&&process.stdout.write(e)}catch{}
