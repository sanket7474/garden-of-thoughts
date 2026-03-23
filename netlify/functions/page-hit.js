exports.handler = async (event) => {
  try {
    const { path } = JSON.parse(event.body);

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: `👀 Page visited: ${path}`
      })
    });

    return {
      statusCode: 200,
      body: "ok"
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "error"
    };
  }
};