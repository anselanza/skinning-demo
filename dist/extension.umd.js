(function(i){typeof define=="function"&&define.amd?define(i):i()})(function(){"use strict";const i=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&c(s)}).observe(document,{childList:!0,subtree:!0});function n(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function c(e){if(e.ep)return;e.ep=!0;const t=n(e);fetch(e.href,t)}};var d="";document.getElementById("startButton").addEventListener("click",async()=>{console.log("clicked!");let[r]=await chrome.tabs.query({active:!0,currentWindow:!0});chrome.scripting.executeScript({target:{tabId:r.id},function:a}),chrome.desktopCapture.chooseDesktopMedia(["tab"],r,async o=>{console.log("started desktopCapture OK",o),o&&o.length,chrome.tabs.sendMessage(r.id,{streamId:o},function(n){})})});function a(){console.log("startCapture"),chrome.runtime.onMessage.addListener(async r=>{console.log("got message!",r);const{streamId:o}=r;try{const n=await navigator.mediaDevices.getUserMedia({video:{mandatory:{chromeMediaSource:"desktop",chromeMediaSourceId:o}}});console.log("got stream OK:",n)}catch(n){console.error("error getting stream:",n)}})}});
