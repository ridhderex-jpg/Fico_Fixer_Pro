const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const ALLOWED_SITES = [
  "https://ficofixer.vercel.app",
  "https://fico-fixer.com",
  "https://www.fico-fixer.com",
];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const SITE = ALLOWED_SITES.includes(req.headers.origin)
      ? req.headers.origin
      : ALLOWED_SITES[0];

    // 1. Who is the buyer?
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const { data: ud, error: ue } = await supabase.auth.getUser(token);
    if (ue || !ud.user) return res.status(401).json({ error: "Please log in first." });
    const user = ud.user;

    // 2. Which ebook? (price comes from your table)
    const slug = req.body && req.body.slug;
    const { data: p } = await supabase
      .from("products")
      .select("id,slug,title,price_cents,currency")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (!p) return res.status(404).json({ error: "Product not found." });

    // 3. Already bought?
    const { data: owned } = await supabase
      .from("purchases").select("id")
      .eq("user_id", user.id).eq("product_id", p.id).limit(1);
    if (owned && owned.length) {
      return res.status(409).json({ error: "You already own this ebook. Find it in My Account." });
    }

    // 4. Create the Stripe payment page
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: (p.currency || "usd").toLowerCase(),
          unit_amount: p.price_cents,
          product_data: { name: p.title },
        },
      }],
      metadata: { user_id: user.id, product_id: p.id },
      success_url: SITE + "/account.html?paid=1",
      cancel_url: SITE + "/product.html?slug=" + encodeURIComponent(p.slug),
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Could not start checkout." });
  }
};
