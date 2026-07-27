// Rah Care - Basic Service Worker
// এটা শুধু ব্রাউজারকে বলে যে সাইটটা PWA (installable app) হিসেবে গণ্য করা যায়।

const CACHE_NAME = "rahcare-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // সাধারণ pass-through fetch (কোনো জোরপূর্বক ক্যাশিং নেই, তাই Blogger এর
  // লাইভ কন্টেন্ট আপডেট হতে সমস্যা হবে না)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
