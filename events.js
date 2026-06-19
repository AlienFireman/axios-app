"use strict";const{EventEmitter}=require("events");global.__axiosEventBus||(global.__axiosEventBus=new EventEmitter,global.__axiosEventBus.setMaxListeners(50)),module.exports=global.__axiosEventBus;
