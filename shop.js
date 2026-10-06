(function(){
  var shelf=document.getElementById("shelf"); if(!shelf) return;
  var A=window.APP;
  if(!A||!A.SUPABASE_URL){shelf.textContent="Store setup error: config.js is missing or not loading.";return;}
  fetch(A.SUPABASE_URL+"/rest/v1/products?select=slug,title,description,price_cents,currency&active=eq.true&order=created_at",{headers:{apikey:A.SUPABASE_KEY}})
  .then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();})
  .then(function(items){
    shelf.textContent="";
    if(!items.length){shelf.textContent="No ebooks available right now.";return;}
    items.forEach(function(it){
      var c=document.createElement("div");c.className="pcard";
      var cv=document.createElement("div");cv.className="pcover";cv.textContent="eBook";
      var sm=document.createElement("small");sm.textContent=it.title;cv.appendChild(sm);
      var b=document.createElement("div");b.className="pbody";
      var h=document.createElement("h3");h.textContent=it.title;
      var d=document.createElement("p");d.textContent=it.description||"";
      var pr=document.createElement("div");pr.className="pprice";
      pr.textContent=new Intl.NumberFormat("en-US",{style:"currency",currency:(it.currency||"usd").toUpperCase()}).format(it.price_cents/100);
      var a=document.createElement("a");a.className="btn";a.textContent="View Details";a.href="product.html?slug="+encodeURIComponent(it.slug);
      b.append(h,d,pr,a);c.append(cv,b);shelf.appendChild(c);
    });
  }).catch(function(e){shelf.textContent="Could not load the store ("+(e&&e.message?e.message:"network or database error")+"). Please refresh the page.";});
})();
