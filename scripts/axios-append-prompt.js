#!/usr/bin/env node
"use strict";const{buildAxiosSystemPrompt,resolveManagedBase}=require("../axios-system-prompt.cjs");try{const s=resolveManagedBase(process.cwd());s||process.exit(0);const e=buildAxiosSystemPrompt(s);e&&process.stdout.write(e)}catch{}
