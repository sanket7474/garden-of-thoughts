const WHITELIST = [
  
];

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const {
      path,
      device,
      browser,
      referrer,
      userAgent,
      returning,
      deviceId
    } = body;

    // 🔥 Ignore your own devices
    if (WHITELIST.includes(deviceId)) {
      return {
        statusCode: 200,
        body: "ignored"
      };
    }

    const url = `https://sanketmaske.dev${path}`;

    const cleanUA = userAgent.includes(")")
      ? userAgent.split(")")[0] + ")"
      : userAgent;

    const prettyName =
      path === "/"
        ? "Home"
        : path
            .replace(/\//g, " ")
            .replace(/-/g, " ")
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase());

    const country =
      event.headers["x-country"] ||
      event.headers["cf-ipcountry"] ||
      "Unknown";

    const payload = {
      embeds: [
        {
          title: "👀 Page Visit",
          url: url,
          description: `User visited **${prettyName}**`,
          color: 5793266,

          fields: [
            { name: "📍 Path", value: path },
            {
              name: "📊 Info",
              value: `${device} | ${browser} | 🌍 ${country}`
            },
            { name: "🔗 Referrer", value: referrer || "Direct" },
            {
              name: "👤 Visitor",
              value: returning ? "🔁 Returning" : "🆕 New",
              inline: true
            },
            { name: "🧠 User Agent", value: cleanUA }
          ],

          footer: {
            text: "Live traffic"
          },

          timestamp: new Date().toISOString()
        }
      ]
    };

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return { statusCode: 200, body: "ok" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500 };
  }
};