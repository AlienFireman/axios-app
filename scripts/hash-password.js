#!/usr/bin/env node
"use strict";const{hashPassword}=require("../app/lib/password.cjs"),pw=process.env.TERMATO_PW??process.argv[2];(typeof pw!="string"||pw.length===0)&&(console.error("usage: TERMATO_PW=<password> node scripts/hash-password.js"),process.exit(1)),process.stdout.write(hashPassword(pw));
