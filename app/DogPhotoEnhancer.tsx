"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function DogPhotoEnhancer(){
  useEffect(()=>{
    if(!supabase)return;
    let formFile:File|null=null;
    let formPreview:string|null=null;
    let enhancing=false;

    async function uploadDogPhoto(dogId:string,file:File){
      if(!supabase)return;
      if(!file.type.startsWith("image/")||file.size>5*1024*1024){alert("Choisis une image de moins de 5 Mo.");return;}
      const {data:{user}}=await supabase.auth.getUser();
      if(!user)return;
      const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
      const path=`dogs/${user.id}/${dogId}-${Date.now()}.${ext||"jpg"}`;
      const {error}=await supabase.storage.from("app-media").upload(path,file,{contentType:file.type,upsert:true});
      if(error){alert(`Impossible d’ajouter la photo : ${error.message}`);return;}
      const url=supabase.storage.from("app-media").getPublicUrl(path).data.publicUrl;
      const {error:updateError}=await supabase.from("dogs").update({photo_url:url,updated_at:new Date().toISOString()}).eq("id",dogId).eq("owner_id",user.id);
      if(updateError){alert(`Impossible d’enregistrer la photo : ${updateError.message}`);return;}
      window.location.reload();
    }

    async function enhance(){
      if(enhancing)return; enhancing=true;
      try{
        const form=document.querySelector<HTMLElement>(".dogs-layout .dog-form");
        if(form&&!form.querySelector(".dog-photo-create")){
          const wrap=document.createElement("div");wrap.className="dog-photo-create";
          wrap.innerHTML=`<b>Photo du chien <small>(facultatif)</small></b><div class="dog-photo-preview"><span>🐕</span></div><label class="dog-photo-pick">Choisir une photo<input type="file" accept="image/jpeg,image/png,image/webp" hidden></label><small class="dog-photo-help">JPG, PNG ou WebP · 5 Mo maximum</small>`;
          const submit=form.querySelector("button");form.insertBefore(wrap,submit);
          const input=wrap.querySelector<HTMLInputElement>('input[type="file"]')!;
          const preview=wrap.querySelector<HTMLElement>(".dog-photo-preview")!;
          input.addEventListener("change",()=>{const file=input.files?.[0];if(!file)return;formFile=file;if(formPreview)URL.revokeObjectURL(formPreview);formPreview=URL.createObjectURL(file);preview.innerHTML=`<img src="${formPreview}" alt="Aperçu de la photo du chien">`;});
          submit?.addEventListener("click",()=>{
            const name=form.querySelector<HTMLInputElement>('input[placeholder="Ex. Nova"]')?.value.trim();
            const file=formFile;
            if(!name||!file)return;
            setTimeout(async()=>{
              const {data:{user}}=await supabase.auth.getUser();if(!user)return;
              const {data}=await supabase.from("dogs").select("id").eq("owner_id",user.id).eq("name",name).order("created_at",{ascending:false}).limit(1).maybeSingle();
              if(data?.id)await uploadDogPhoto(data.id,file);
            },1200);
          });
        }
        const cards=[...document.querySelectorAll<HTMLElement>(".dog-card")];
        if(cards.length){
          const {data:{user}}=await supabase.auth.getUser();
          if(user){
            const {data:dogs}=await supabase.from("dogs").select("id,name,photo_url").eq("owner_id",user.id).order("created_at");
            cards.forEach((card,index)=>{
              if(card.querySelector(".dog-photo-edit"))return;
              const dog=dogs?.[index];if(!dog)return;
              const avatar=card.querySelector<HTMLElement>(".dog-avatar");
              if(avatar&&dog.photo_url)avatar.innerHTML=`<img src="${dog.photo_url}" alt="${dog.name}">`;
              const label=document.createElement("label");label.className="dog-photo-edit";label.textContent=dog.photo_url?"Modifier la photo":"Ajouter une photo";
              const input=document.createElement("input");input.type="file";input.accept="image/jpeg,image/png,image/webp";input.hidden=true;
              input.addEventListener("change",()=>{const f=input.files?.[0];if(f)void uploadDogPhoto(dog.id,f)});
              label.appendChild(input);
              card.querySelector(".dog-actions")?.appendChild(label);
            });
          }
        }
      }finally{enhancing=false;}
    }
    const observer=new MutationObserver(()=>void enhance());observer.observe(document.body,{childList:true,subtree:true});void enhance();
    return()=>{observer.disconnect();if(formPreview)URL.revokeObjectURL(formPreview)};
  },[]);
  return <style jsx global>{`.dog-photo-create{border:1px solid #dbe6d9;background:#f8fbf6;border-radius:14px;padding:14px;margin:14px 0}.dog-photo-create>b{display:block;margin-bottom:10px}.dog-photo-create b small{font-weight:400;color:#788179}.dog-photo-preview{width:92px;height:92px;border-radius:50%;overflow:hidden;background:#e7f3e8;display:grid;place-items:center;font-size:38px;margin-bottom:10px}.dog-photo-preview img,.dog-avatar img{width:100%;height:100%;object-fit:cover}.dog-photo-pick,.dog-photo-edit{display:inline-flex!important;align-items:center;justify-content:center;background:#0a3d12;color:#fff!important;border-radius:9px;padding:9px 12px!important;font-weight:800!important;cursor:pointer;margin:0!important}.dog-photo-help{display:block;color:#788179;margin-top:8px}.dog-photo-edit{font-size:12px}.dog-avatar{overflow:hidden}`}</style>
}
