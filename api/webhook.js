const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  let event;
  try {
    const raw = await readRaw(req);
    event = stripe.webhooks.constructEvent(
      raw,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error("Bad signature:", e.message);
    return res.status(400).send("Bad signature");
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    if (s.payment_status === "paid") {
      const user_id = s.metadata && s.metadata.user_id;
      const product_id = s.metadata && s.metadata.product_id;
      if (user_id && product_id) {
        const { error } = await supabase
          .from("purchases")
          .insert({ user_id, product_id, stripe_session_id: s.id });
        // 23505 = already saved (Stripe retried), that's fine
        if (error && error.code !== "23505") {
          console.error(error);
          return res.status(500).send("Database error");
        }
      }
    }
  }
  return res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
