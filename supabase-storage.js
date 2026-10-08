/* RahCare - Supabase Storage (প্রাইভেট ডকুমেন্ট আপলোড)
   ব্যবহার (অন্য পেজের module স্ক্রিপ্টে):
     import { uploadPrivateDocument } from "https://raqialamgirabdullah-rgb.github.io/rahcare-pwa/supabase-storage.js";
     const path = await uploadPrivateDocument(file, user.uid);
   ক্লাসিক (non-module) স্ক্রিপ্ট থেকেও window.uploadPrivateDocument দিয়ে চলবে। */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase Initialization (publishable/anon key পাবলিক হওয়ার জন্যই বানানো; নিরাপত্তা RLS দিয়ে)
const SUPABASE_URL = "https://uxtkatcglvmqanazouvi.supabase.co";
const SUPABASE_ANON_KEY = "Sb_publishable_ja97uA-LSNxys_V-E8Pg9w_qc_0E5GX";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Supabase Storage-এ ফাইল আপলোড করার ফাংশন
 * @param {File} fileInput - HTML Input থেকে প্রাপ্ত ফাইল অবজেক্ট
 * @param {string} userUid - লগইন থাকা ইউজারের Firebase Auth UID
 * @returns {Promise<string|undefined>} সফল হলে ফাইলের রেফারেন্স পাথ
 */
export async function uploadPrivateDocument(fileInput, userUid) {
  if (!fileInput || !userUid) {
    console.error("ফাইল অথবা ইউজার আইডি পাওয়া যায়নি।");
    return;
  }

  const fileName = `${Date.now()}_${fileInput.name}`;
  // RLS সিকিউরিটি অনুযায়ী ফাইল অবশ্যই ইউজারের UID দিয়ে তৈরি ফোল্ডারে যেতে হবে
  const filePath = `${userUid}/${fileName}`;

  try {
    const { data, error } = await supabaseClient
      .storage
      .from("user-documents")
      .upload(filePath, fileInput, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) throw error;

    console.log("ফাইল সফলভাবে আপলোড হয়েছে:", data.path);
    return data.path; // ফাইলের রেফারেন্স পাথ রিটার্ন করবে
  } catch (err) {
    console.error("ফাইল আপলোডে ত্রুটি:", err.message);
  }
}

window.supabaseClient = supabaseClient;
window.uploadPrivateDocument = uploadPrivateDocument;
