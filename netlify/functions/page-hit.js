exports.handler = async (event) => {
  try {
    const {
      path,
      device,
      browser,
      referrer,
      userAgent,
      returning
    } = JSON.parse(event.body);

    const url = `https://sanketmaske.dev${path}`;

    // Clean user agent
    function shortenUA(ua) {
      return ua.split(")")[0] + ")";
    }

    const cleanUA = shortenUA(userAgent);

    // Pretty path name
    const prettyName =
      path === "/"
        ? "Home"
        : path
            .replace(/\//g, " ")
            .replace(/-/g, " ")
            .trim()
            .replace(/\b\w/g, (c) => c.toUpperCase());

    const country = event.headers["x-country"] || "Unknown";

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        embeds: [
          {
            author: {
              name: "🌱 Garden of Thoughts"
            },
            title: "👀 Page Visit",
            url: url,
            description: `User visited **${prettyName}**`,
            color: 0x5865f2,

            fields: [
              {
                name: "📍 Path",
                value: path,
                inline: false
              },
              {
                name: "📱 Device",
                value: device,
                inline: true
              },
              {
                name: "🌐 Browser",
                value: browser,
                inline: true
              },
              {
                name: "🌍 Country",
                value: country,
                inline: true
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
              text: "Live traffic"
            },

            timestamp: new Date().toISOString()
          }
        ]
      })
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