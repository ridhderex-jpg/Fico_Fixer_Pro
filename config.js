window.APP = {
  SUPABASE_URL: "https://bzpgpdrdzwtipcsputxm.supabase.co",
  SUPABASE_KEY: "sb_publishable_rSL__j_d6pSU8B4fiWwucA_5T5PKRSW",
  CHECKOUT_ENABLED: false // set to true once Stripe checkout is connected
};
window.APP.cover = function(it){
  var cv=document.createElement("div");cv.className="pcover";
  if(it.cover_path){
    cv.className+=" img";
    var im=document.createElement("img");im.alt=it.title;im.loading="lazy";
    im.src=APP.SUPABASE_URL+"/storage/v1/object/public/covers/"+encodeURIComponent(it.cover_path);
    cv.appendChild(im);
  }else{
    cv.textContent="eBook";var sm=document.createElement("small");sm.textContent=it.title;cv.appendChild(sm);
  }
  return cv;
};
