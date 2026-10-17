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
/* ---- Account menu: shows "My Account" when logged in ---- */
(function(){
  function run(){
    try{
      var KEY="sb-bzpgpdrdzwtipcsputxm-auth-token";
      var SB="https://bzpgpdrdzwtipcsputxm.supabase.co";
      var ANON="sb_publishable_rSL__j_d6pSU8B4fiWwucA_5T5PKRSW";
      var raw=localStorage.getItem(KEY); if(!raw) return;
      var s=JSON.parse(raw); if(!s||!s.user) return;
      var link=document.querySelector('nav a[href="account.html"]'); if(!link) return;

      var css=document.createElement("style");
      css.textContent=".fx-acct{position:relative;display:inline-block}"
        +".fx-menu{display:none;position:absolute;right:0;top:calc(100% + 12px);min-width:220px;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);padding:8px;z-index:99999;text-align:left}"
        +".fx-menu.open{display:block}"
        +".fx-em{padding:8px 12px;font-size:12px;color:#5b7690;border-bottom:1px solid #e3eef5;margin-bottom:6px;word-break:break-all}"
        +".fx-menu a,.fx-menu button{display:block;width:100%;padding:10px 12px;border:0;background:none;border-radius:8px;color:#06264a !important;font:bold 14px Arial,Helvetica,sans-serif;text-align:left;text-decoration:none;cursor:pointer}"
        +".fx-menu a:hover,.fx-menu button:hover{background:#eff8fc}";
      document.head.appendChild(css);

      var wrap=document.createElement("span"); wrap.className="fx-acct";
      link.parentNode.insertBefore(wrap,link); wrap.appendChild(link);
      link.textContent="My Account ▾";

      var menu=document.createElement("div"); menu.className="fx-menu";
      var em=document.createElement("div"); em.className="fx-em"; em.textContent=s.user.email||""; menu.appendChild(em);

      var a1=document.createElement("a"); a1.href="account.html"; a1.textContent="My Account"; menu.appendChild(a1);
      var a2=document.createElement("a"); a2.href="account.html#buys"; a2.textContent="My Purchases"; menu.appendChild(a2);
      var out=document.createElement("button"); out.type="button"; out.textContent="Log out"; menu.appendChild(out);
      wrap.appendChild(menu);

      link.addEventListener("click",function(e){ e.preventDefault(); menu.classList.toggle("open"); });
      document.addEventListener("click",function(e){ if(!wrap.contains(e.target)) menu.classList.remove("open"); });

      out.onclick=function(){
        var done=function(){ try{localStorage.removeItem(KEY);}catch(e){} location.href="index.html"; };
        fetch(SB+"/auth/v1/logout",{method:"POST",headers:{apikey:ANON,Authorization:"Bearer "+s.access_token}}).then(done,done);
      };
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run); else run();
})();
