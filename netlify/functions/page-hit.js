exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const path = body.path || "/";
    const device = body.device || "Unknown";
    const browser = body.browser || "Unknown";
    const referrer = body.referrer || "Direct";
    const userAgent = body.userAgent || "Unknown";
    const returning = body.returning;

    const url = `https://sanketmaske.dev${path}`;

    // 🔥 Clean user agent (short version)
    function shortenUA(ua) {
      return ua.includes(")")
        ? ua.split(")")[0] + ")"
        : ua;
    }

    const cleanUA = shortenUA(userAgent);

    // 🔥 Pretty page name
    const prettyName =
      path === "/"
        ? "Home"
        : path
            .replace(/\//g, " ")
            .replace(/-/g, " ")
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase());

    // 🌍 Country (Netlify / Cloudflare header)
    const country =
      event.headers["x-country"] ||
      event.headers["cf-ipcountry"] ||
      "Unknown";

    // 🔥 Final embed payload (clean format)
    const payload = {
      embeds: [
        {
          author: {
            name: "🌱 Garden of Thoughts"
          },
          title: "👀 Page Visit",
          url: url,
          description: `User visited **${prettyName}**`,
          color: 5793266,

          fields: [
            {
              name: "📍 Path",
              value: path,
              inline: false
            },
            {
              name: "📊 Info",
              value: `${device} | ${browser} | 🌍 ${country}`,
              inline: false
            },
            {
              name: "🔗 Referrer",
              value: referrer || "Direct",
              inline: false
            },
            {
              name: "👤 Visitor",
              value: returning ? "🔁 Returning" : "🆕 New",
              inline: true
            },
            {
              name: "🧠 User Agent",
              value: cleanUA,
              inline: false
            }
          ],

          footer: {
            text: "Live traffic • Garden of Thoughts"
          },

          timestamp: new Date().toISOString()
        }
      ]
    };

    console.log("Sending to Discord:", JSON.stringify(payload, null, 2));

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return {
      statusCode: 200,
      body: "ok"
    };
  } catch (err) {
    console.error("Tracking error:", err);
    return {
      statusCode: 500,
      body: "error"
    };
  }
};